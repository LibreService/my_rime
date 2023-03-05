import { execSync } from 'child_process'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import replace from '@rollup/plugin-replace'
import { run } from 'vite-plugin-run'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'

const resources = ['rime.data', 'rime.js', 'rime.wasm', 'HanaMinB.woff2']

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
        url: process.env.LIBRESERVICE_CDN + entry.url,
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
      name: 'My RIME',
      short_name: 'My RIME',
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
  const watchFiles = ['worker.ts', 'schema-files.json', 'schema-target.json', 'dependency-map.json', 'target-files.json']
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
