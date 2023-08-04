import { readFileSync } from 'fs'
import { exit } from 'process'
import { md5sum } from './util.js'

const content = readFileSync('checksum', { encoding: 'utf-8' })
const iter = content.matchAll(/(\S+)\s+(\S+)/g)

let match: ReturnType<typeof iter.next>
while (match = iter.next(), match.value) { // eslint-disable-line no-sequences
  const expected = match.value[1]
  const path = match.value[2]
  const actual = md5sum(path)
  if (expected !== actual) {
    console.error(`Checksum mismatch for ${path}`)
    exit(1)
  }
}
