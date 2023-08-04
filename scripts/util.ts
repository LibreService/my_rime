import { spawnSync } from 'child_process'

const utf8: { encoding: 'utf-8' } = { encoding: 'utf-8' }
const rf = { recursive: true, force: true }

function ensure (result: ReturnType<typeof spawnSync>) {
  if (result.status !== 0) {
    throw new Error('Command fails.')
  }
  return result
}

function md5sum (path: string) {
  return ensure(spawnSync('md5sum', [path], utf8)).stdout.slice(0, 32) as string
}

export {
  utf8,
  rf,
  ensure,
  md5sum
}
