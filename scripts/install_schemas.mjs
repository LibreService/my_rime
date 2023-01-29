import { spawnSync } from 'child_process'
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { cwd, chdir } from 'process'

const root = cwd()
const RIME_DIR = 'build/librime_native/bin'
const defaultPath = `${RIME_DIR}/default.yaml`

const schemas = JSON.parse(readFileSync('schemas.json'))
const schemaFiles = {}
const ids = []

for (const schema of schemas) {
  ids.push(schema.id)
  schemaFiles[schema.id] = []
  spawnSync('plum/rime-install', [schema.target], {
    env: {
      rime_dir: RIME_DIR
    }
  })
}

const patch = ids.map(id => `  - schema: ${id}`).join('\n') + '\n'
const defaultContent = readFileSync(defaultPath, 'utf-8')
const updatedContent = defaultContent.replace(/(  - schema: \S+\n)+/, patch)
writeFileSync(defaultPath, updatedContent)

chdir(RIME_DIR)
spawnSync('./rime_console', [], {
  input: ''
})

const fileNames = readdirSync('build')
for (const fileName of fileNames) {
  const id = fileName.split('.')[0]
  if (id in schemaFiles) {
    schemaFiles[id].push(fileName)
  }
}
chdir(root)
writeFileSync('schema-files.json', JSON.stringify(schemaFiles))
