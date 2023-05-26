import { execSync } from 'child_process'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import replace from '@rollup/plugin-replace'
import { run } from 'vite-plugin-run'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import { appName } from './package.json'
import fonts from './fonts.json'

const resources = ['rime.data', 'rime.js', 'rime.wasm']
const fontMap: { [key: string]: string } = {}

for (const font of fonts) {
  resources.push(font.file)
  fontMap[font.file] = font.version
}

const workbox: VitePWAOptions["workbox"] = {
  maximumFileSizeToCacheInBytes: 13631488,
  globPatterns: [
    '**/*.{js,css,html}',
    'apple-touch-icon.png',
    ...resources
  ]
}

if (process.env.LIBRESERVICE_CDN) {
  workbox.manifestTransforms = [
    manifest => ({
      manifest: manifest.map(entry => resources.includes(entry.url) ? {
        url: (
          entry.url in fontMap ?
          `https://cdn.jsdelivr.net/npm/@libreservice/font-collection@${fontMap[entry.url]}/dist/`:
          process.env.LIBRESERVICE_CDN
        ) + entry.url,
        revision: entry.revision,
        size: entry.size
      } : entry),
      warnings: []
    })
  ]
}

const plugins = [
  replace({
    __LIBRESERVICE_CDN__: process.env.LIBRESERVICE_CDN || '',
    __COMMIT__: execSync('git rev-parse HEAD').toString().trim(),
    __BUILD_DATE__: new Date().toLocaleString()
  }),
  VitePWA({
    registerType: 'autoUpdate',
    workbox,
    manifest: {
      name: appName,
      short_name: appName,
      icons: [
        {
          src: 'LibreService.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        }
      ]
    }
  }),
  vue()
]

if (process.env.NODE_ENV !== 'production') {
  const watchFiles = [
    'worker.ts',
    'schema-files.json',
    'schema-name.json',
    'schema-target.json',
    'dependency-map.json',
    'target-files.json',
    'target-version.json'
  ]
  plugins.push(run({
    input: [
      {
        name: 'Transpile worker',
        run: ['pnpm run worker'],
        condition: file => watchFiles.some(name => file.includes(name))
      }
    ],
    silent: false
  }))
}

export default defineConfig({
  base: '',
  plugins,
  server: {
    watch: {
      ignored: ['**/boost/**', '**/build/**', '**/dist/**', '**/librime/**', '**/scripts/**', '**/wasm/**'],
    },
  }
})
