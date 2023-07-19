import { expose, control, loadWasm, fsOperate } from '@libreservice/my-worker'
import { LazyCache } from '@libreservice/lazy-cache'
import schemaName from '../schema-name.json'
import schemaFiles from '../schema-files.json'
import schemaTarget from '../schema-target.json'
import dependencyMap from '../dependency-map.json'
import targetFiles from '../target-files.json'
import targetVersion from '../target-version.json'

const RIME_USER = '/rime'
const RIME_SHARED = '/usr/share/rime-data'

function getURL (target: string, name: string) {
  if ('__RIME_CDN__') { // eslint-disable-line no-constant-condition
    return '__RIME_CDN__' + `${target}@${(targetVersion as {[key: string]: string})[target]}/${name}`
  }
  return `ime/${target}/${name}`
}

const lazyCache = new LazyCache('ime')

async function fetchPrebuilt (schemaId: string) {
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
  await Promise.all(files.map(async ({ name, target, md5 }) => {
    const path = `${RIME_SHARED}/build/${name}`
    try {
      Module.FS.lookupPath(path)
    } catch (e) { // not exists
      const ab = await lazyCache.get(name, md5, getURL(target, name))
      Module.FS.writeFile(path, new Uint8Array(ab))
    }
  }))
}

async function setIME (schemaId: string) {
  if (!deployed) {
    await fetchPrebuilt(schemaId)
  }
  Module.ccall('set_ime', 'null', ['string'], [schemaId])
  return syncUserDirectory('write')
}

function syncUserDirectory (direction: 'read' | 'write') {
  let resolve: (_: any) => void
  let reject: (err: any) => void
  const promise = new Promise<void>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })
  Module.FS.syncfs(direction === 'read', (err: any) => {
    if (err) {
      reject(err)
    }
    resolve(null)
  })
  return promise
}

const readyPromise = loadWasm('rime.js', {
  url: '__LIBRESERVICE_CDN__',
  async init () {
    Module.FS.mkdir(RIME_USER)
    Module.FS.mount(IDBFS, {}, RIME_USER)
    await syncUserDirectory('read')
    Module.ccall('init', 'null', [], [])
    for (const [schema, name] of Object.entries(schemaName)) {
      Module.ccall('set_schema_name', 'null', ['string', 'string'], [schema, name])
    }
  },
  Module: {
    // Customize for glog
    printErr (message: string) {
      const match = message.match(/[EWID]\S+ \S+ \S+ (.*)/)
      if (match) {
        ({
          E: console.error,
          W: console.warn,
          I: console.info,
          D: console.debug
        })[message[0] as 'E' | 'W' | 'I' | 'D'](match[1])
      } else {
        console.error(message)
      }
    }
  }
})

let deployed = false
const deployStatus = control('deployStatus')
// @ts-ignore
globalThis._deployStatus = (status: 'start' | 'failure' | 'success', schemas: string) => { // called from api.cpp
  if (status === 'success') {
    deployed = true
  }
  deployStatus(status, schemas)
}

function rmStar (path: string) {
  for (const file of Module.FS.readdir(path)) {
    if (file === '.' || file === '..') {
      continue
    }
    const subPath = `${path}/${file}`
    const { mode } = Module.FS.lstat(subPath)
    if (Module.FS.isDir(mode)) {
      rmStar(subPath)
      Module.FS.rmdir(subPath)
    } else {
      Module.FS.unlink(subPath)
    }
  }
}

async function resetUserDirectory () {
  rmStar(RIME_USER)
  await syncUserDirectory('write')
  deployed = false
  Module.ccall('reset', 'null', [], [])
}

expose({
  fsOperate,
  resetUserDirectory,
  setIME,
  setOption (option: string, value: boolean): void {
    return Module.ccall('set_option', 'null', ['string', 'number'], [option, value])
  },
  deploy (): void {
    return Module.ccall('deploy', 'null', [], [])
  },
  async process (input: string): Promise<RIME_RESULT> {
    const result = JSON.parse(Module.ccall('process', 'string', ['string'], [input]))
    if ('committed' in result) {
      await syncUserDirectory('write') // record frequency
    }
    return result
  },
  selectCandidateOnCurrentPage (index: number): string {
    return Module.ccall('select_candidate_on_current_page', 'string', ['number'], [index])
  }
}, readyPromise)
