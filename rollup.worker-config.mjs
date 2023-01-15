import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'

const sourceMap = process.env.NODE_ENV !== 'production'

export default {
  input: 'src/worker.ts',
  output: {
    dir: 'public',
    sourcemap: sourceMap,
    format: 'iife'
  },
  plugins: [
    replace({
      __LIBRESERVICE_CDN__: process.env.LIBRESERVICE_CDN || ''
    }),
    nodeResolve(),
    typescript({
      compilerOptions: {
        sourceMap
      }
    })
  ]
}
