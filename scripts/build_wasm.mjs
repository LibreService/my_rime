import { spawnSync } from 'child_process'
import { exit } from 'process'
import { readFileSync } from 'fs'
import { ensure } from './util.mjs'

const OPENCC_TARGET = '/usr/local/share/opencc'
const OPENCC_HOST = `build/sysroot/${OPENCC_TARGET}`
const LIB_PATH = 'build/sysroot/usr/local/lib'

const preloadFiles = []
function preload (file) {
  if (!preloadFiles.includes(file)) {
    preloadFiles.push(file)
  }
}

function collectPreload (config) {
  const content = JSON.parse(readFileSync(`${OPENCC_HOST}/${config}`, {
    encoding: 'utf-8'
  }))
  preload(config)
  preload(content.segmentation.dict.file)
  for (const { dict } of content.conversion_chain) {
    const { file, dicts } = dict
    file && preload(file)
    if (dicts) {
      for (const { file } of dicts) {
        preload(file)
      }
    }
  }
}

JSON.parse(readFileSync('opencc-configs.json', { encoding: 'utf-8' })).map(collectPreload)

const compileArgs = [
  '-std=c++14',
  '-O2',
  '-s', 'ALLOW_MEMORY_GROWTH=1',
  '-s', 'EXPORTED_FUNCTIONS=_init,_set_schema_name,_set_option,_set_ime,_process,_deploy',
  '-s', 'EXPORTED_RUNTIME_METHODS=["ccall","FS"]',
  '--preload-file', 'rime-config@rime',
  '--preload-file', 'build/librime_native/bin/build/default.yaml@rime/build/default.yaml',
  '-I', 'build/sysroot/usr/local/include',
  '-o', 'public/rime.js'
]

for (const file of preloadFiles) {
  compileArgs.push('--preload-file', `${OPENCC_HOST}/${file}@${OPENCC_TARGET}/${file}`)
}

const linkArgs = [
  '-fexceptions',
  '-L', LIB_PATH,
  // To include __attribute__((constructor)) in librime-lua, see https://stackoverflow.com/a/842770
  '-Wl,--whole-archive', '-l', 'rime', '-Wl,--no-whole-archive',
  '-l:libboost_filesystem.bc',
  '-l', 'yaml-cpp',
  '-l', 'leveldb',
  '-l', 'marisa',
  '-l', 'opencc'
]

// In case you forget setting ENABLE_LOGGING
function isLibRimeBuiltWithGLog () {
  try {
    ensure(spawnSync('grep', ['LogMessage', `${LIB_PATH}/librime.a`]))
    return true
  } catch {
    return false
  }
}

if (process.env.ENABLE_LOGGING === 'ON' || isLibRimeBuiltWithGLog()) {
  linkArgs.push('-l', 'glog')
}

try {
  ensure(spawnSync('em++', ['-v']))
} catch {
  console.error('Command em++ not available. Please activate emscripten environment.')
  exit(1)
}

ensure(spawnSync('em++', [
  ...compileArgs,
  'wasm/api.cpp',
  ...linkArgs
], {
  stdio: 'inherit'
}))
