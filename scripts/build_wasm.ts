import { platform } from 'os'
import { spawnSync } from 'child_process'
import { exit } from 'process'
import {
  existsSync,
  readFileSync,
  writeFileSync
} from 'fs'
import { globSync } from 'glob'
import { ensure, utf8 } from './util.js'

const OPENCC_TARGET = '/usr/share/opencc'
const LIB_PATH = 'build/sysroot/usr/lib'
const RIME_PATH = 'build/librime_native/bin'
const DEFAULT_PATH = `${RIME_PATH}/build/default.yaml`
const OPENCC_HOST = `${RIME_PATH}/opencc`
const RIME_SHARED = '/usr/share/rime-data'

const PLATFORM = platform()
const empp = PLATFORM === 'win32' ? 'em++.bat' : 'em++'

const exportedFunctions = [
  'init',
  'set_schema_name',
  'set_option',
  'set_page_size',
  'set_ime',
  'process',
  'select_candidate_on_current_page',
  'change_page',
  'deploy',
  'reset'
]

const compileArgs = [
  '-std=c++17',
  ...(process.env.BUILD_TYPE === 'Debug'
    ? ['-g']
    : [
        '-O2',
        '-DBOOST_DISABLE_ASSERTS',
        '-DBOOST_DISABLE_CURRENT_LOCATION'
      ]),
  '-s', 'ALLOW_MEMORY_GROWTH=1',
  '-s', 'MAXIMUM_MEMORY=4GB',
  '-s', `EXPORTED_FUNCTIONS=${exportedFunctions.map(name => '_' + name).join(',')}`,
  '-s', 'EXPORTED_RUNTIME_METHODS=["ccall","FS"]',
  '--preload-file', `${OPENCC_HOST}@${OPENCC_TARGET}`,
  '--preload-file', `${DEFAULT_PATH}@${RIME_SHARED}/build/default.yaml`,
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
  '-l', 'yaml-cpp',
  '-l', 'leveldb',
  '-l', 'marisa',
  '-l', 'opencc'
]

function isLibRimeBuiltWithGLog () {
  const buffer = readFileSync(`${LIB_PATH}/librime.a`)
  return buffer.includes('LogMessage')
}

if (isLibRimeBuiltWithGLog()) {
  linkArgs.push('-l', 'glog')
}

try {
  ensure(spawnSync(empp, ['-v']))
} catch {
  console.error('Command em++ not available. Please activate emscripten environment.')
  exit(1)
}

function removeCR (path: string) {
  if (!existsSync(path)) {
    return
  }
  const content = readFileSync(path, utf8)
  const trimmed = content.replace(/\r\n/g, '\n')
  if (content !== trimmed) {
    writeFileSync(path, trimmed)
  }
}

if (PLATFORM === 'win32') {
  removeCR(DEFAULT_PATH)
  removeCR(`${RIME_PATH}/rime.lua`)
  for (const path of globSync(`${RIME_PATH}/lua/**/*.lua`)) {
    removeCR(path)
  }
}

ensure(spawnSync(empp, [
  ...compileArgs,
  'wasm/api.cpp',
  ...linkArgs
], {
  stdio: 'inherit'
}))
