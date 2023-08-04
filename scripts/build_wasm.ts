import { spawnSync } from 'child_process'
import { exit } from 'process'
import { existsSync } from 'fs'
import { ensure } from './util.js'

const OPENCC_TARGET = '/usr/share/opencc'
const LIB_PATH = 'build/sysroot/usr/lib'
const RIME_PATH = 'build/librime_native/bin'
const OPENCC_HOST = `${RIME_PATH}/opencc`
const RIME_SHARED = '/usr/share/rime-data'

const exportedFunctions = [
  'init',
  'set_schema_name',
  'set_option',
  'set_page_size',
  'set_ime',
  'process',
  'select_candidate_on_current_page',
  'deploy',
  'reset'
]

const compileArgs = [
  '-std=c++14',
  process.env.BUILD_TYPE === 'Debug' ? '-g' : '-O2',
  '-s', 'ALLOW_MEMORY_GROWTH=1',
  '-s', `EXPORTED_FUNCTIONS=${exportedFunctions.map(name => '_' + name).join(',')}`,
  '-s', 'EXPORTED_RUNTIME_METHODS=["ccall","FS"]',
  '--preload-file', `${OPENCC_HOST}@${OPENCC_TARGET}`,
  '--preload-file', `${RIME_PATH}/build/default.yaml@${RIME_SHARED}/build/default.yaml`,
  '-I', 'build/sysroot/usr/include',
  '-o', 'public/rime.js'
]

for (const file of ['rime.lua', 'lua']) {
  const path = `${RIME_PATH}/${file}`
  if (existsSync(path)) {
    compileArgs.push('--preload-file', `${path}@${RIME_SHARED}/${file}`)
  }
}

const linkArgs = [
  '-fexceptions',
  '-l', 'idbfs.js',
  '-L', LIB_PATH,
  // To include __attribute__((constructor)) in librime-lua, see https://stackoverflow.com/a/842770
  '-Wl,--whole-archive', '-l', 'rime', '-Wl,--no-whole-archive',
  '-l:libboost_filesystem.bc',
  '-l', 'yaml-cpp',
  '-l', 'leveldb',
  '-l', 'marisa',
  '-l', 'opencc'
]

function isLibRimeBuiltWithGLog () {
  try {
    ensure(spawnSync('grep', ['LogMessage', `${LIB_PATH}/librime.a`]))
    return true
  } catch {
    return false
  }
}

if (isLibRimeBuiltWithGLog()) {
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
