import { expose } from '@libreservice/my-worker'

importScripts('/rime.js')

const readyPromise = new Promise(resolve => {
  Module.onRuntimeInitialized = () => {
    Module.ccall('init', 'null', [], [])
    resolve(null)
  }
})

expose({
  setOption (option: RIME_OPTION, value: boolean): void {
    return Module.ccall('set_option', 'null', ['string', 'number'], [option, value])
  },
  process (input: string): string {
    return Module.ccall('process', 'string', ['string'], [input])
  }
}, readyPromise)
