import {
  rmSync,
  existsSync,
  symlinkSync,
  mkdirSync
} from 'fs'
import { cpus, platform } from 'os'
import { cwd, chdir } from 'process'
import { spawnSync, SpawnSyncOptionsWithBufferEncoding } from 'child_process'
import {
  rf,
  ensure,
  patch
} from './util.js'

const root = cwd()
const n = cpus().length
const PLATFORM = platform()
const emcmake = PLATFORM === 'win32' ? 'emcmake.bat' : 'emcmake'

const ENABLE_LOGGING = process.env.ENABLE_LOGGING || 'ON'
const BUILD_TYPE = process.env.BUILD_TYPE || 'Release'
const CXXFLAGS = '-fexceptions'
const DESTDIR = `${root}/build/sysroot`
const CMAKE_FIND_ROOT_PATH = `${DESTDIR}/usr`
const CMAKE_DEF = [
  '-G', 'Ninja',
  '-DCMAKE_INSTALL_PREFIX:PATH=/usr',
  `-DCMAKE_BUILD_TYPE:STRING=${BUILD_TYPE}`,
  '-DBUILD_SHARED_LIBS:BOOL=OFF'
]

const spawnArg: SpawnSyncOptionsWithBufferEncoding = {
  stdio: 'inherit',
  env: {
    CXXFLAGS,
    ...process.env
  }
}

const installArg: SpawnSyncOptionsWithBufferEncoding = {
  stdio: 'inherit',
  env: {
    DESTDIR,
    ...process.env
  }
}

function buildBoost () {
  console.log('Building boost')
  patch('boost/libs/interprocess', 'interprocess_patch')
  chdir('boost')
  ensure(spawnSync(PLATFORM === 'win32' ? '.\\bootstrap.bat' : './bootstrap.sh', [], spawnArg))
  ensure(spawnSync('./b2', [
    'toolset=emscripten',
    'link=static',
    'threading=single', // threading defaults to multi on Linux and single on macOS
    'target-os=linux', // Windows hack
    '--layout=system',
    '--with-regex',
    '--disable-icu',
    `--prefix=${CMAKE_FIND_ROOT_PATH}`,
    'install',
    '-j', `${n}`
  ], spawnArg))
  chdir(root)
}

function buildYamlCpp () {
  console.log('Building yaml-cpp')
  const src = 'librime/deps/yaml-cpp'
  const dir = 'build/yaml-cpp'
  rmSync(dir, rf)
  ensure(spawnSync(emcmake, [
    'cmake', src,
    '-B', dir,
    ...CMAKE_DEF,
    '-DYAML_CPP_BUILD_CONTRIB:BOOL=OFF',
    '-DYAML_CPP_BUILD_TESTS:BOOL=OFF',
    '-DYAML_CPP_BUILD_TOOLS:BOOL=OFF'
  ], spawnArg))
  ensure(spawnSync('cmake', ['--build', dir], spawnArg))
  ensure(spawnSync('cmake', ['--install', dir], installArg))
}

function buildLevelDB () {
  console.log('Building leveldb')
  const src = 'librime/deps/leveldb'
  const dst = 'build/leveldb'
  patch(src, 'leveldb_patch')
  rmSync(dst, rf)
  ensure(spawnSync(emcmake, [
    'cmake', src,
    '-B', dst,
    ...CMAKE_DEF,
    '-DLEVELDB_BUILD_BENCHMARKS:BOOL=OFF',
    '-DLEVELDB_BUILD_TESTS:BOOL=OFF'
  ], spawnArg))
  ensure(spawnSync('cmake', ['--build', dst], spawnArg))
  ensure(spawnSync('cmake', ['--install', dst], installArg))
}

function buildMarisaTrie () {
  console.log('Building marisa-trie')
  const src = 'librime/deps/marisa-trie'
  const dst = 'build/marisa-trie'
  patch(src, 'marisa_patch')
  rmSync(dst, rf)
  ensure(spawnSync(emcmake, [
    'cmake', src,
    '-B', dst,
    ...CMAKE_DEF
  ], spawnArg))
  ensure(spawnSync('cmake', ['--build', dst], spawnArg))
  ensure(spawnSync('cmake', ['--install', dst], installArg))
}

function buildOpenCC () {
  console.log('Building opencc')
  const src = 'librime/deps/opencc'
  const dst = 'build/opencc'
  patch(src, 'opencc_patch')
  rmSync(dst, rf)
  ensure(spawnSync(emcmake, [
    'cmake', src,
    '-B', dst,
    ...CMAKE_DEF,
    `-DCMAKE_FIND_ROOT_PATH:PATH=${CMAKE_FIND_ROOT_PATH}`,
    '-DENABLE_DARTS:BOOL=OFF',
    '-DUSE_SYSTEM_MARISA:BOOL=ON'
  ], spawnArg))
  ensure(spawnSync('cmake', ['--build', dst], spawnArg))
  ensure(spawnSync('cmake', ['--install', dst], installArg))
}

function buildGlog () {
  if (ENABLE_LOGGING !== 'ON') {
    console.log('Skip glog')
    return
  }
  console.log('Building glog')
  const src = 'librime/deps/glog'
  const dst = 'build/glog'
  chdir(src)
  ensure(spawnSync('git', ['reset', '--hard']))
  ensure(spawnSync('git', [
    'pull',
    'https://github.com/google/glog',
    'master'
  ])) // TODO: wait for a new release
  chdir(root)
  patch(src, 'glog_patch')
  rmSync(dst, rf)
  ensure(spawnSync(emcmake, [
    'cmake', src,
    '-B', dst,
    ...CMAKE_DEF,
    '-DWITH_GFLAGS:BOOL=OFF',
    '-DBUILD_TESTING:BOOL=OFF',
    '-DWITH_UNWIND:BOOL=OFF'
  ], spawnArg))
  ensure(spawnSync('cmake', ['--build', dst], spawnArg))
  ensure(spawnSync('cmake', ['--install', dst], installArg))
}

function buildLibrime () {
  console.log('Building librime')

  const luaPluginLink = 'librime/plugins/lua'
  if (!existsSync(luaPluginLink)) {
    symlinkSync('../../librime-lua', luaPluginLink, 'dir')
  }

  const luaParent = 'librime-lua/thirdparty'
  const luaLink = `${luaParent}/lua5.4`
  mkdirSync(luaParent, { recursive: true })
  if (!existsSync(luaLink)) {
    symlinkSync('../../lua', luaLink, 'dir')
  }

  rmSync('lua/onelua.c', rf)

  const src = 'librime'
  const dst = 'build/librime_wasm'
  patch(src, 'librime_patch')
  rmSync(dst, rf)
  ensure(spawnSync(emcmake, [
    'cmake', src,
    '-B', dst,
    ...CMAKE_DEF,
    `-DCMAKE_FIND_ROOT_PATH:PATH=${CMAKE_FIND_ROOT_PATH}`,
    '-DBUILD_TEST:BOOL=OFF',
    '-DBUILD_STATIC:BOOL=ON',
    '-DENABLE_THREADING:BOOL=OFF',
    '-DENABLE_TIMESTAMP:BOOL=OFF',
    `-DENABLE_LOGGING:BOOL=${ENABLE_LOGGING}`
  ], spawnArg))
  ensure(spawnSync('cmake', ['--build', dst], spawnArg))
  ensure(spawnSync('cmake', ['--install', dst], installArg))
}

const targetHandler = {
  boost: buildBoost,
  'yaml-cpp': buildYamlCpp,
  leveldb: buildLevelDB,
  marisa: buildMarisaTrie,
  opencc: buildOpenCC,
  glog: buildGlog,
  rime: buildLibrime
}

let hasTarget = false
for (const [target, handler] of Object.entries(targetHandler)) {
  if (process.argv.includes(target)) {
    hasTarget = true
    handler()
  }
}

if (!hasTarget) {
  for (const handler of Object.values(targetHandler)) {
    handler()
  }
}
