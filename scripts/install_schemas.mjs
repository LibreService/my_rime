import { spawnSync } from 'child_process'
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { cwd, chdir } from 'process'

const root = cwd()
const RIME_DIR = 'build/librime_native/bin'
const defaultPath = `${RIME_DIR}/default.yaml`

const schemas = JSON.parse(readFileSync('schemas.json'))
const schemaFiles = {} // maps schema_id to a list of files with hash, and optionally a root schema_id
const ids = []
const rootMap = {}

for (const schema of schemas) {
  ids.push(schema.id)
  schemaFiles[schema.id] = []
  if (schema.dependency) {
    rootMap[schema.id] = schema.dependency
  }
  if (schema.family) {
    for (const { id } of schema.family) {
      ids.push(id)
      schemaFiles[id] = []
      rootMap[id] = schema.id
    }
  }
  spawnSync('plum/rime-install', [schema.target], {
    env: {
      rime_dir: RIME_DIR
    }
  })
}

const patch = ids.map(id => `  - schema: ${id}`).join('\n') + '\n'
const defaultContent = readFileSync(defaultPath, 'utf-8')
const updatedContent = defaultContent.replace(/( {2}- schema: \S+\n)+/, patch)
writeFileSync(defaultPath, updatedContent)

chdir(RIME_DIR)
spawnSync('./rime_console', [], {
  input: ''
})

const fileNames = readdirSync('build')
for (const fileName of fileNames) {
  const id = fileName.split('.')[0]
  if (id in schemaFiles) {
    const md5 = spawnSync('md5sum', [`build/${fileName}`], {
      encoding: 'utf-8'
    }).stdout.slice(0, 32)
    schemaFiles[id].push({ name: fileName, md5 })
    if (id in rootMap && !schemaFiles[id].includes(rootMap[id])) {
      schemaFiles[id].push(rootMap[id])
    }
  }
}
chdir(root)
writeFileSync('schema-files.json', JSON.stringify(schemaFiles))
