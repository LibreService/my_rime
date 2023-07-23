import { useMessage } from 'naive-ui'
import yaml from 'js-yaml'
import { Recipe } from '@libreservice/micro-plum'
import { FS } from './workerAPI'

const RIME_PATH = '/rime'
const DEFAULT_CUSTOM = `${RIME_PATH}/default.custom.yaml`
const POSTFIX = '.schema.yaml'
const schemaPattern = /^[-_a-zA-Z0-9]+$/

const prerequisites = ['rime/rime-essay', 'rime/rime-prelude', 'rime/rime-emoji']

let message: ReturnType<typeof useMessage>

function setMessage (_message: typeof message) {
  message = _message
}

async function ensureDir (path: string) {
  let i = 1
  while (i = path.indexOf('/', i) + 1, i > 0) { // eslint-disable-line no-sequences
    const dir = path.slice(0, i)
    try {
      await FS.lstat(dir)
    } catch {
      await FS.mkdir(dir)
    }
  }
}

async function install (target: string, options?: { schemaIds?: string[], source?: 'GitHub' | 'jsDelivr' }) {
  const recipe = new Recipe(target, {
    source: options?.source,
    schemaIds: options?.schemaIds,
    onDownloadFailure (url: string, reason: number | string) {
      message.error(`Fail to download ${url.slice(url.lastIndexOf('/') + 1)}: ${reason}`)
    }
  })
  const manifest = await recipe.load()
  for (const { file, content } of manifest) {
    if (content) {
      const path = `${RIME_PATH}/${file}`
      await ensureDir(path)
      await FS.writeFile(path, content)
    }
  }
  return recipe
}

async function getAvailableSchemas () {
  const schemas: string[] = []
  const files = await FS.readdir(RIME_PATH)
  for (const file of files) {
    if (!file.endsWith(POSTFIX)) {
      continue
    }
    const schema = file.slice(0, -POSTFIX.length)
    if (!schemaPattern.test(schema)) {
      continue
    }
    schemas.push(schema)
  }
  return schemas
}

function customizeDefault (schemaIds: string[]) {
  return FS.writeFile(DEFAULT_CUSTOM, yaml.dump({
    patch: {
      schema_list: schemaIds.map(schema => ({ schema }))
    }
  }))
}

export {
  RIME_PATH,
  DEFAULT_CUSTOM,
  schemaPattern,
  prerequisites,
  setMessage,
  install,
  getAvailableSchemas,
  customizeDefault
}
