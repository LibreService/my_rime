import { cwd, chdir } from 'process'
import { spawnSync, SpawnSyncOptionsWithStringEncoding } from 'child_process'

const utf8: SpawnSyncOptionsWithStringEncoding = { encoding: 'utf-8' }
const rf = { recursive: true, force: true }

function ensure (result: ReturnType<typeof spawnSync>) {
  if (result.status !== 0) {
    console.log(result.status, result.error)
    throw new Error('Command fails.')
  }
  return result
}

function patch (path: string, patchFile: string) {
  const root = cwd()
  chdir(path)
  const output = ensure(spawnSync('git', [
    'status',
    '--porcelain',
    '-uno',
    '--ignore-submodules'
  ], utf8)).stdout
  if (output.length === 0) {
    ensure(spawnSync('git', [
      'apply',
      `${root}/${patchFile}`
    ]))
  }
  chdir(root)
}

function md5sum (path: string) {
  return ensure(spawnSync('md5sum', [path], utf8)).stdout.slice(0, 32) as string
}

export {
  utf8,
  rf,
  ensure,
  patch,
  md5sum
}
