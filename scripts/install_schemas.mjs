import { spawnSync } from 'child_process'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from 'fs'
import { cwd, chdir, exit } from 'process'
import yaml from 'js-yaml'
import { ensure } from './util.mjs'

const root = cwd()
const { version } = JSON.parse(readFileSync('package.json'))
const RIME_DIR = 'build/librime_native/bin'
const defaultPath = `${RIME_DIR}/default.yaml`

// input file
const schemas = JSON.parse(readFileSync('schemas.json'))

// output files
const schemaFiles = {} // maps schema to dict and prism
const schemaTarget = {} // maps schema to target
const dependencyMap = {} // maps schema to dependent schemas
const openccConfigs = ['t2s.json']

// temp data structures
const targetSchemas = {} // maps target to a list of schemas
const targetFiles = {} // maps target to files with hash
const targetLicense = {}
const ids = []

function install (target) {
  ensure(spawnSync('plum/rime-install', [target], {
    stdio: 'inherit',
    env: {
      ...process.env,
      rime_dir: RIME_DIR
    }
  }))
}

function loadOpenCC (config) {
  if (!openccConfigs.includes(config)) {
    openccConfigs.push(config)
  }
}

function isOfficialIME (target) {
  return !target.includes('/')
}

function parseYaml (schemaId) {
  const content = yaml.load(readFileSync(`${RIME_DIR}/build/${schemaId}.schema.yaml`, { encoding: 'utf-8' }))
  for (const [key, value] of Object.entries(content)) {
    if (key === 'translator') {
      const { dictionary, prism } = value
      schemaFiles[schemaId] = {}
      // By default, dictionary equals to schemaId, and prism equals to dictionary (not schemaId, see luna_pinyin_fluency)
      if (dictionary !== schemaId) {
        schemaFiles[schemaId].dict = dictionary
      }
      if (prism && prism !== dictionary) {
        schemaFiles[schemaId].prism = prism
      }
    }
    if (value && typeof value === 'object' && 'opencc_config' in value) {
      loadOpenCC(value.opencc_config)
    }
  }
}

['prelude', 'essay', 'emoji'].forEach(install)

for (const schema of schemas) {
  const { target } = schema
  if (!(target in targetSchemas)) {
    targetSchemas[target] = []
    targetFiles[target] = []
    targetLicense[target] = schema.license
    install(target)
  }
  ids.push(schema.id)
  schemaTarget[schema.id] = target
  targetSchemas[target].push(schema.id)
  if (schema.dependencies) {
    dependencyMap[schema.id] = schema.dependencies
  }
  if (schema.family) {
    for (const { id, disabled } of schema.family) {
      ids.push(id)
      schemaTarget[id] = target
      targetSchemas[target].push(id)
      if (!disabled) {
        dependencyMap[id] = schema.dependencies
      }
    }
  }
  if (schema.emoji) {
    loadOpenCC('emoji.json')
    install(`emoji:customize:schema=${schema.id}`)
  }
}

// check schemas.json integrity
for (const [schemaId, dependencies] of Object.entries(dependencyMap)) {
  for (const id of dependencies) {
    if (!ids.includes(id)) {
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

chdir(root)
ids.forEach(parseYaml)

for (const [target, schemaIds] of Object.entries(targetSchemas)) {
  // find all files that belongs to a target('s npm package)
  // wtf https://github.com/rime/plum/blob/6f502ff6fa87789847fa18200415318e705bffa4/scripts/resolver.sh#L22
  const repoDir = `plum/package/${isOfficialIME(target) ? 'rime/' : ''}${target}`.replace('rime-', '')
  const fileNames = []
  for (const schemaId of schemaIds) {
    fileNames.push(`${schemaId}.schema.yaml`)
    const { dict, prism } = schemaFiles[schemaId]
    const dictionary = dict || schemaId
    const dictYaml = `${dictionary}.dict.yaml`
    const tableBin = `${dictionary}.table.bin`
    const reverseBin = `${dictionary}.reverse.bin`
    const prismBin = `${prism || dictionary}.prism.bin`
    if (!fileNames.includes(tableBin) && existsSync(`${repoDir}/${dictYaml}`)) {
      fileNames.push(tableBin, reverseBin)
    }
    if (!fileNames.includes(prismBin)) {
      fileNames.push(prismBin)
    }
  }
  fileNames.sort()

  // make npm package and calculate hash
  const packageDir = `public/ime/${target}`
  mkdirSync(packageDir, { recursive: true })
  const packageJson = {
    name: `@${isOfficialIME(target) ? 'rime-contrib' : ''}/${target}`,
    version,
    files: fileNames,
    license: targetLicense[target]
  }
  writeFileSync(`${packageDir}/package.json`, JSON.stringify(packageJson))
  for (const fileName of fileNames) {
    const fullPath = `${RIME_DIR}/build/${fileName}`
    copyFileSync(fullPath, `${packageDir}/${fileName}`)

    const md5 = ensure(spawnSync('md5sum', [fullPath], {
      encoding: 'utf-8'
    })).stdout.slice(0, 32)
    targetFiles[target].push({ name: fileName, md5 })
  }
}

let oldTargetFiles
try {
  oldTargetFiles = JSON.parse(readFileSync('target-files.json', 'utf-8'))
} catch (e) {
  oldTargetFiles = {}
}

const updatedTargets = []
for (const [target, files] of Object.entries(targetFiles)) {
  if (JSON.stringify(files) !== JSON.stringify(oldTargetFiles[target])) {
    updatedTargets.push(target)
  }
}

if (updatedTargets.length) {
  console.log('Updated targets:')
  for (const target of updatedTargets) {
    console.log(target)
  }
  writeFileSync('target-files.json', JSON.stringify(targetFiles))
} else {
  console.log('All targets are already up to date.')
}

writeFileSync('schema-files.json', JSON.stringify(schemaFiles))
writeFileSync('schema-target.json', JSON.stringify(schemaTarget))
writeFileSync('dependency-map.json', JSON.stringify(dependencyMap))

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

for (const fileName of readdirSync(`${RIME_DIR}/opencc`)) {
  copyFileSync(`${RIME_DIR}/opencc/${fileName}`, `build/sysroot/usr/local/share/opencc/${fileName}`)
}
