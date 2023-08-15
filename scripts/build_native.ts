import {
  rmSync
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

const CMAKE_INSTALL_PREFIX = `${root}/librime`
const CMAKE_DEF = [
  `-DCMAKE_INSTALL_PREFIX:PATH=${CMAKE_INSTALL_PREFIX}`,
  '-DCMAKE_BUILD_TYPE:STRING=Release',
  '-DBUILD_SHARED_LIBS:BOOL=ON'
]

const spawnArg: SpawnSyncOptionsWithBufferEncoding = {
  stdio: 'inherit',
  env: process.env
}

const dst = 'build'

function buildBoost () {
  console.log('Building boost')
  // headers installed to librime/include is referenced before build/sysroot/usr/include
  patch('boost/libs/interprocess', 'interprocess_patch')
  chdir('boost')
  ensure(spawnSync('./bootstrap.sh', [], spawnArg))
  ensure(spawnSync('./b2', [
    'link=shared',
    '--with-filesystem',
    '--with-system',
    '--with-regex',
    `--prefix=${CMAKE_INSTALL_PREFIX}`,
    'install',
    '-j', `${n}`
  ], spawnArg))
  chdir(root)
}

function buildYamlCpp () {
  console.log('Building yaml-cpp')
  chdir('librime/deps/yaml-cpp')
  rmSync(dst, rf)
  ensure(spawnSync('cmake', [
    '.',
    '-B', dst,
    '-G', 'Ninja',
    ...CMAKE_DEF,
    '-DYAML_CPP_BUILD_CONTRIB:BOOL=OFF',
    '-DYAML_CPP_BUILD_TESTS:BOOL=OFF',
    '-DYAML_CPP_BUILD_TOOLS:BOOL=OFF'
  ], spawnArg))
  ensure(spawnSync('cmake', ['--build', dst], spawnArg))
  ensure(spawnSync('cmake', ['--install', dst], spawnArg))
  chdir(root)
}

function buildLevelDB () {
  console.log('Building leveldb')
  chdir('librime/deps/leveldb')
  rmSync(dst, rf)
  ensure(spawnSync('cmake', [
    '.',
    '-B', dst,
    '-G', 'Ninja',
    ...CMAKE_DEF,
    '-DLEVELDB_BUILD_BENCHMARKS:BOOL=OFF',
    '-DLEVELDB_BUILD_TESTS:BOOL=OFF'
  ], spawnArg))
  ensure(spawnSync('cmake', ['--build', dst], spawnArg))
  ensure(spawnSync('cmake', ['--install', dst], spawnArg))
  chdir(root)
}

function buildMarisaTrie () {
  console.log('Building marisa-trie')
  chdir('librime/deps')
  rmSync(dst, rf)
  ensure(spawnSync('cmake', [
    '.',
    '-B', dst,
    '-G', 'Ninja',
    ...CMAKE_DEF
  ], spawnArg))
  ensure(spawnSync('cmake', ['--build', dst], spawnArg))
  ensure(spawnSync('cmake', ['--install', dst], spawnArg))
  chdir(root)
}

function buildOpenCC () {
  console.log('Building opencc')
  const src = 'librime/deps/opencc'
  patch(src, 'opencc_patch')
  chdir(src)
  rmSync(dst, rf)
  ensure(spawnSync('cmake', [
    '.',
    '-B', dst,
    '-G', 'Ninja',
    ...CMAKE_DEF,
    `-DCMAKE_FIND_ROOT_PATH:PATH=${CMAKE_INSTALL_PREFIX}`,
    '-DUSE_SYSTEM_MARISA:BOOL=ON'
  ], spawnArg))
  ensure(spawnSync('cmake', ['--build', dst], spawnArg))
  ensure(spawnSync('cmake', ['--install', dst], spawnArg))
  chdir(root)
}

function buildLibrime () {
  console.log('Building librime')

  rmSync('librime/plugins/lua', rf)

  const src = 'librime'
  const dst = 'build/librime_native'
  patch(src, 'librime_patch')
  rmSync(dst, rf)
  ensure(spawnSync('cmake', [
    src,
    '-B', dst,
    '-G', 'Ninja',
    ...CMAKE_DEF,
    '-DBUILD_TEST:BOOL=OFF',
    '-DENABLE_LOGGING:BOOL=OFF'
  ], spawnArg))
  ensure(spawnSync('cmake', ['--build', dst], spawnArg))
}

if (PLATFORM !== 'linux') {
  buildBoost()
  buildYamlCpp()
  buildLevelDB()
  buildMarisaTrie()
  buildOpenCC()
}

buildLibrime()
