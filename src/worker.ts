import { expose, loadWasm } from '@libreservice/my-worker'
import { openDB } from 'idb'
import schemaFiles from '../schema-files.json'

const HASH = 'hash'
const CONTENT = 'content'

const dbPromise = openDB('ime', 1, {
  upgrade (db) {
    db.createObjectStore(HASH)
    db.createObjectStore(CONTENT)
  }
})

async function setIME (ime: string) {
  const fetched: string[] = []
  function getFiles (key: string) {
    if (fetched.includes(key)) {
      return []
    }
    fetched.push(key)
    const files: {
      name: string
      md5: string
    }[] = []
    for (const item of (schemaFiles as {[key: string]: ({ name: string, md5: string } | string)[]})[key]) {
      if (typeof item === 'string') { // root schema_id
        files.push(...getFiles(item))
      } else {
        files.push(item)
      }
    }
    return files
  }
  const files = getFiles(ime)
  const db = await dbPromise.catch(() => undefined) // not available in Firefox Private Browsing
  await Promise.all(files.map(async ({ name, md5 }) => {
    const path = `build/${name}`
    try {
      Module.FS.lookupPath(path)
    } catch (e) { // not exists
      const storedHash: string | undefined = await db?.get(HASH, name)
      let ab: ArrayBuffer
      if (storedHash === md5) {
        ab = await db!.get(CONTENT, name)
      } else {
        const response = await fetch('__LIBRESERVICE_CDN__' + `ime/${name}`)
        if (!response.ok) {
          throw new Error(`Fail to download ${name}`)
        }
        ab = await response.arrayBuffer()
        await db?.put(CONTENT, ab, name)
        await db?.put(HASH, md5, name)
      }
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
})

expose({
  setIME,
  setOption (option: string, value: boolean): void {
    return Module.ccall('set_option', 'null', ['string', 'number'], [option, value])
  },
  process (input: string): string {
    return Module.ccall('process', 'string', ['string'], [input])
  }
}, readyPromise)
