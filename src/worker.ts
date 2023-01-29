import { expose, loadWasm } from '@libreservice/my-worker'
import schemaFiles from '../schema-files.json'

async function setIME (ime: string) {
  const fileNames = (schemaFiles as {[key: string]: string[]})[ime]
  await Promise.all(fileNames.map(async fileName => {
    const path = `build/${fileName}`
    try {
      Module.FS.lookupPath(path)
    } catch (e) { // not exists
      const response = await fetch('__LIBRESERVICE_CDN__' + `ime/${fileName}`)
      if (!response.ok) {
        throw new Error(`Fail to download ${fileName}`)
      }
      const ab = await response.arrayBuffer()
      Module.FS.writeFile(path, new Uint8Array(ab))
    }
  }))
  Module.ccall('set_ime', 'null', ['string'], [ime])
}

const readyPromise = loadWasm('rime.js', {
  url: '__LIBRESERVICE_CDN__',
  init () {
    Module.ccall('init', 'null', [], [])
    Module.FS.mkdir('build')
  }
}).then(() => setIME('luna_pinyin'))

expose({
  setIME,
  setOption (option: RIME_OPTION, value: boolean): void {
    return Module.ccall('set_option', 'null', ['string', 'number'], [option, value])
  },
  process (input: string): string {
    return Module.ccall('process', 'string', ['string'], [input])
  }
}, readyPromise)
