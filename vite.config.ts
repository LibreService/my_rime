import { execSync } from 'child_process'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import replace from '@rollup/plugin-replace'
import { run } from 'vite-plugin-run'

const plugins = [
  replace({
    __COMMIT__: execSync('git rev-parse HEAD').toString().trim(),
    __BUILD_DATE__: new Date().toLocaleString()
  }),
  vue()
]

if (process.env.NODE_ENV !== 'production') {
  plugins.push(run([
    {
      name: 'Transpile worker',
      run: ['pnpm run worker'],
      condition: file => file.includes('worker.ts')
    }
  ]))
}

export default defineConfig({
  plugins,
  server: {
    watch: {
      ignored: ['**/boost/**', '**/build/**', '**/librime/**', '**/scripts/**', '**/wasm/**'],
    },
  }
})
