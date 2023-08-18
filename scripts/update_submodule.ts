import { chdir } from 'process'
import { spawnSync, SpawnSyncOptionsWithBufferEncoding } from 'child_process'
import { ensure } from './util.js'

const spawnArg: SpawnSyncOptionsWithBufferEncoding = {
  stdio: 'inherit',
  env: process.env
}

function update (submodule: string, boost?: boolean) {
  ensure(spawnSync('git', [
    'submodule',
    'update',
    '--init',
    ...(boost ? ['--depth', '1'] : ['--recursive']),
    '-f',
    submodule
  ], spawnArg))
}

for (const submodule of [
  'librime',
  'lua',
  'librime-lua'
]) {
  update(submodule)
}

update('boost', true)

chdir('boost')
update('tools', true)

chdir('libs')
for (const submodule of [
  'algorithm',
  'align',
  'any',
  'array',
  'assert',
  'atomic',
  'bind',
  'concept_check',
  'config',
  'container',
  'container_hash',
  'core',
  'crc',
  'date_time',
  'describe',
  'detail',
  'filesystem',
  'format',
  'function',
  'function_types',
  'functional',
  'headers',
  'integer',
  'interprocess',
  'intrusive',
  'io',
  'iostreams',
  'iterator',
  'json',
  'lexical_cast',
  'move',
  'mp11',
  'mpl',
  'numeric',
  'optional',
  'predef',
  'preprocessor',
  'random',
  'range',
  'regex',
  'scope_exit',
  'signals2',
  'smart_ptr',
  'static_assert',
  'system',
  'throw_exception',
  'tti',
  'type_index',
  'type_traits',
  'typeof',
  'utility',
  'uuid',
  'variant',
  'variant2',
  'winapi'
]) {
  update(submodule, true)
}
