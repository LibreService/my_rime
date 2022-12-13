import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const sourceMap = process.env.NODE_ENV !== 'production'

export default {
  input: 'src/worker.ts',
  output: {
    dir: 'public',
    sourcemap: sourceMap,
    format: 'iife'
  },
  plugins: [
    nodeResolve(),
    typescript({
      compilerOptions: {
        sourceMap
      }
    })
  ]
}
