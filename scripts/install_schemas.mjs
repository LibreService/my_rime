import { spawnSync } from 'child_process'
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync } from 'fs'
import { cwd, chdir, exit } from 'process'
import yaml from 'js-yaml'
import { ensure } from './util.mjs'

const root = cwd()
const { version } = JSON.parse(readFileSync('package.json'))
const RIME_DIR = 'build/librime_native/bin'
const defaultPath = `${RIME_DIR}/default.yaml`

const schemas = JSON.parse(readFileSync('schemas.json'))
const schemaFiles = {} // maps schema_id to a list of files with hash, and optionally a root schema_id
const schemaTarget = {} // maps schema_id to target
const targetFiles = {} // maps target to files
const targetLicense = {}
const ids = []
const rootMap = {}

function install (arg) {
  ensure(spawnSync('plum/rime-install', [arg], {
    stdio: 'inherit',
    env: {
      ...process.env,
      rime_dir: RIME_DIR
    }
  }))
}

const openccConfigs = ['t2s.json']
function loadOpenCC (config) {
  if (!openccConfigs.includes(config)) {
    openccConfigs.push(config)
  }
}

function collectOpenCC (schemaId) {
  const content = yaml.load(readFileSync(`${RIME_DIR}/${schemaId}.schema.yaml`, { encoding: 'utf-8' }))
  for (const value of Object.values(content)) {
    if (value && typeof value === 'object' && 'opencc_config' in value) {
      loadOpenCC(value.opencc_config)
    }
  }
}

for (const schema of schemas) {
  install(schema.target)
  ids.push(schema.id)
  collectOpenCC(schema.id)
  schemaFiles[schema.id] = []
  schemaTarget[schema.id] = schema.target
  targetFiles[schema.target] = []
  targetLicense[schema.target] = schema.license
  if (schema.dependencies) {
    rootMap[schema.id] = schema.dependencies
  }
  if (schema.family) {
    for (const { id } of schema.family) {
      ids.push(id)
      collectOpenCC(id)
      schemaFiles[id] = []
      schemaTarget[id] = schema.target
      rootMap[id] = [schema.id]
    }
  }
  if (schema.emoji) {
    loadOpenCC('emoji.json')
    install(`emoji:customize:schema=${schema.id}`)
  }
}

// check schemas.json integrity
for (const [schemaId, dependencies] of Object.entries(rootMap)) {
  for (const id of dependencies) {
    if (!(id in schemaFiles)) {
      console.error(`Integrity check fails. Dependency '${id}' of '${schemaId}' should be defined in schemas.json.`)
      exit(1)
    }
  }
}

const patch = ids.map(id => `  - schema: ${id}`).join('\n') + '\n'
const defaultContent = readFileSync(defaultPath, 'utf-8')
const updatedContent = defaultContent.replace(/( {2}- schema: \S+\n)+/, patch)
writeFileSync(defaultPath, updatedContent)

chdir(RIME_DIR)
ensure(spawnSync('./rime_console', [], {
  stdio: ['ignore', 'inherit', 'inherit'],
  input: ''
}))

const fileNames = readdirSync('build')
for (const fileName of fileNames) {
  const id = fileName.split('.')[0]
  if (id in schemaFiles) {
    targetFiles[schemaTarget[id]].push(fileName)
    const md5 = ensure(spawnSync('md5sum', [`build/${fileName}`], {
      encoding: 'utf-8'
    })).stdout.slice(0, 32)
    schemaFiles[id].push({ name: fileName, md5 })
    for (const schemaId of rootMap[id] || []) {
      if (!schemaFiles[id].includes(schemaId)) {
        schemaFiles[id].push(schemaId)
      }
    }
  }
}

chdir(root)

for (const [target, fileNames] of Object.entries(targetFiles)) {
  const packageDir = `public/ime/${target}`
  mkdirSync(packageDir, { recursive: true })
  const packageJson = {
    name: `@rime-contrib/${target}`,
    version,
    files: fileNames,
    license: targetLicense[target]
  }
  writeFileSync(`${packageDir}/package.json`, JSON.stringify(packageJson))
  for (const fileName of fileNames) {
    copyFileSync(`${RIME_DIR}/build/${fileName}`, `${packageDir}/${fileName}`)
  }
}

let oldSchemaFiles
try {
  oldSchemaFiles = JSON.parse(readFileSync('schema-files.json', 'utf-8'))
} catch (e) {
  oldSchemaFiles = {}
}

const updatedTargets = []
for (const schemaId of Object.keys(schemaFiles)) {
  const target = schemaTarget[schemaId]
  if (!updatedTargets.includes(target) && JSON.stringify(oldSchemaFiles[schemaId]) !== JSON.stringify(schemaFiles[schemaId])) {
    updatedTargets.push(target)
  }
}
if (updatedTargets.length) {
  console.log('Updated targets:')
  for (const updatedTarget of updatedTargets) {
    console.log(updatedTarget)
  }
  writeFileSync('schema-files.json', JSON.stringify(schemaFiles))
  writeFileSync('schema-target.json', JSON.stringify(schemaTarget))
} else {
  console.log('All targets are already up to date.')
}

let oldOpenccConfigs
try {
  oldOpenccConfigs = readFileSync('opencc-configs.json', 'utf-8')
} catch (e) {
  oldOpenccConfigs = ''
}

const sortedOpenccConfig = JSON.stringify(openccConfigs.sort())
if (oldOpenccConfigs !== sortedOpenccConfig) {
  writeFileSync('opencc-configs.json', sortedOpenccConfig)
  console.log("opencc-configs.json is updated. You need to run 'pnpm run wasm' again.")
}
