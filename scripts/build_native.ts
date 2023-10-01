import {
  renameSync,
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

const CMAKE_DEF_COMMON = [
  '-G', 'Ninja',
  '-DCMAKE_BUILD_TYPE:STRING=Release',
  ...(PLATFORM === 'win32'
    ? [
        '-DCMAKE_C_COMPILER=clang',
        '-DCMAKE_CXX_COMPILER=clang++',
        `-DCMAKE_USER_MAKE_RULES_OVERRIDE:PATH=${root}/librime/cmake/c_flag_overrides.cmake`,
        `-DCMAKE_USER_MAKE_RULES_OVERRIDE_CXX:PATH=${root}/librime/cmake/cxx_flag_overrides.cmake`,
        '-DCMAKE_EXE_LINKER_FLAGS_INIT:STRING=-llibcmt',
        '-DCMAKE_MSVC_RUNTIME_LIBRARY:STRING=MultiThreaded'
      ]
    : [])
]

const dst = 'build'
const dstRime = 'build/librime_native'

const CMAKE_DEF = [
  '-B', dst,
  ...CMAKE_DEF_COMMON,
  `-DCMAKE_INSTALL_PREFIX:PATH=${CMAKE_INSTALL_PREFIX}`,
  '-DBUILD_SHARED_LIBS:BOOL=OFF'
]

const CMAKE_DEF_RIME = [
  '-B', dstRime,
  ...CMAKE_DEF_COMMON,
  '-DBUILD_SHARED_LIBS:BOOL=ON',
  ...(PLATFORM === 'linux' ? [] : ['-DBUILD_STATIC:BOOL=ON']),
  '-DBUILD_TEST:BOOL=OFF',
  '-DENABLE_TIMESTAMP:BOOL=OFF',
  '-DENABLE_LOGGING:BOOL=OFF'
]

const spawnArg: SpawnSyncOptionsWithBufferEncoding = {
  stdio: 'inherit',
  env: {
    ...(PLATFORM === 'linux' ? {} : { BOOST_ROOT: `${root}/boost` }),
    ...process.env
  }
}

function buildBoost () {
  console.log('Building boost')
  chdir('boost')
  ensure(spawnSync(PLATFORM === 'win32' ? '.\\bootstrap.bat' : './bootstrap.sh', [], spawnArg))
  ensure(spawnSync('./b2', [
    ...(PLATFORM === 'win32' ? ['toolset=clang-win'] : []),
    'address-model=64',
    'variant=release',
    'link=static',
    'stage',
    'runtime-link=static',
    '--with-filesystem',
    '--with-regex',
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
    ...CMAKE_DEF,
    '-DCMAKE_CXX_FLAGS:STRING=-Wno-error=deprecated-declarations',
    '-DLEVELDB_BUILD_BENCHMARKS:BOOL=OFF',
    '-DLEVELDB_BUILD_TESTS:BOOL=OFF'
  ], spawnArg))
  ensure(spawnSync('cmake', ['--build', dst], spawnArg))
  ensure(spawnSync('cmake', ['--install', dst], spawnArg))
  chdir(root)
}

function buildMarisaTrie () {
  console.log('Building marisa-trie')
  const src = 'librime/deps/marisa-trie'
  patch(src, 'marisa_patch')
  chdir(src)
  rmSync(dst, rf)
  ensure(spawnSync('cmake', [
    '.',
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
    ...CMAKE_DEF,
    `-DCMAKE_FIND_ROOT_PATH:PATH=${CMAKE_INSTALL_PREFIX}`,
    '-DENABLE_DARTS:BOOL=OFF',
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
  patch(src, 'librime_patch')
  rmSync(dstRime, rf)
  ensure(spawnSync('cmake', [
    src,
    ...CMAKE_DEF_RIME
  ], spawnArg))
  ensure(spawnSync('cmake', ['--build', dstRime], spawnArg))
  if (PLATFORM === 'win32') {
    renameSync(`${dstRime}/lib/rime.dll`, `${dstRime}/bin/rime.dll`)
  }
}

if (PLATFORM !== 'linux') {
  buildBoost()
  buildYamlCpp()
  buildLevelDB()
  buildMarisaTrie()
  buildOpenCC()
}

buildLibrime()
