import { expose, control, loadWasm, fsOperate } from '@libreservice/my-worker'
import { openDB } from 'idb'
import schemaFiles from '../schema-files.json'
import schemaTarget from '../schema-target.json'
import dependencyMap from '../dependency-map.json'
import targetFiles from '../target-files.json'

const HASH = 'hash'
const CONTENT = 'content'
const prefix = '__RIME_CDN__' || ('__LIBRESERVICE_CDN__' + 'ime/')

const dbPromise = openDB('ime', 1, {
  upgrade (db) {
    db.createObjectStore(HASH)
    db.createObjectStore(CONTENT)
  }
})

async function setIME (schemaId: string) {
  const fetched: string[] = []
  function getFiles (key: string) {
    if (fetched.includes(key)) {
      return []
    }
    fetched.push(key)
    const files: {
      name: string
      md5: string
      target: string
    }[] = []

    for (const dependency of (dependencyMap as {[key: string]: string[] | undefined})[key] || []) {
      files.push(...getFiles(dependency))
    }
    const { dict, prism } = (schemaFiles as {[key: string]: { dict?: string, prism?: string }})[key]
    const dictionary = dict || key
    const tableBin = `${dictionary}.table.bin`
    const reverseBin = `${dictionary}.reverse.bin`
    const prismBin = `${prism || dictionary}.prism.bin`
    const schemaYaml = `${key}.schema.yaml`
    const target = (schemaTarget as {[key: string]: string})[key]
    for (const fileName of [tableBin, reverseBin, prismBin, schemaYaml]) {
      for (const { name, md5 } of (targetFiles as { [key: string]: { name: string, md5: string }[]})[target]) {
        if (fileName === name) {
          files.push({ name, md5, target })
          break
        }
      }
    }
    return files
  }
  const files = getFiles(schemaId)
  const db = await dbPromise.catch(() => undefined) // not available in Firefox Private Browsing
  await Promise.all(files.map(async ({ name, target, md5 }) => {
    const path = `build/${name}`
    try {
      Module.FS.lookupPath(path)
    } catch (e) { // not exists
      const storedHash: string | undefined = await db?.get(HASH, name)
      let ab: ArrayBuffer
      if (storedHash === md5) {
        ab = await db!.get(CONTENT, name)
      } else {
        const response = await fetch(`${prefix}${target}/${name}`)
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
  Module.ccall('set_ime', 'null', ['string'], [schemaId])
}

const readyPromise = loadWasm('rime.js', {
  url: '__LIBRESERVICE_CDN__',
  init () {
    Module.ccall('init', 'null', [], [])
    Module.FS.chdir('rime')
  }
})

// @ts-ignore
globalThis._deployStatus = control('deployStatus') // called from api.cpp

expose({
  fsOperate,
  setIME,
  setOption (option: string, value: boolean): void {
    return Module.ccall('set_option', 'null', ['string', 'number'], [option, value])
  },
  deploy (): void {
    return Module.ccall('deploy', 'null', [], [])
  },
  process (input: string): string {
    return Module.ccall('process', 'string', ['string'], [input])
  }
}, readyPromise)
