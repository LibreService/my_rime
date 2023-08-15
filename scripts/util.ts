import { cwd, chdir } from 'process'
import { spawnSync, SpawnSyncOptionsWithStringEncoding } from 'child_process'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'

const utf8: SpawnSyncOptionsWithStringEncoding = { encoding: 'utf-8' }
const rf = { recursive: true, force: true }

function ensure (result: ReturnType<typeof spawnSync>) {
  if (result.status !== 0) {
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
  const content = readFileSync(path)
  return createHash('md5').update(content).digest('hex')
}

export {
  utf8,
  rf,
  ensure,
  patch,
  md5sum
}
