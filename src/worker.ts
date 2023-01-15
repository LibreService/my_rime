import { expose, loadWasm } from '@libreservice/my-worker'

const readyPromise = loadWasm('rime.js', {
  url: '__LIBRESERVICE_CDN__',
  init () {
    Module.ccall('init', 'null', [], [])
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
