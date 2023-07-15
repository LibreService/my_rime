import { spawnSync } from 'child_process'
import { exit } from 'process'
import { existsSync } from 'fs'
import { ensure } from './util.mjs'

const OPENCC_TARGET = '/usr/share/opencc'
const LIB_PATH = 'build/sysroot/usr/lib'
const RIME_PATH = 'build/librime_native/bin'
const OPENCC_HOST = `${RIME_PATH}/opencc`

const compileArgs = [
  '-std=c++14',
  '-O2',
  '-s', 'ALLOW_MEMORY_GROWTH=1',
  '-s', 'EXPORTED_FUNCTIONS=_init,_set_schema_name,_set_option,_set_ime,_process,_select_candidate_on_current_page,_deploy',
  '-s', 'EXPORTED_RUNTIME_METHODS=["ccall","FS"]',
  '--preload-file', `${OPENCC_HOST}@${OPENCC_TARGET}`,
  '--preload-file', `${RIME_PATH}/build/default.yaml@rime/build/default.yaml`,
  '-I', 'build/sysroot/usr/include',
  '-o', 'public/rime.js'
]

for (const file of ['rime.lua', 'lua']) {
  const path = `${RIME_PATH}/${file}`
  if (existsSync(path)) {
    compileArgs.push('--preload-file', `${path}@rime/${file}`)
  }
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
