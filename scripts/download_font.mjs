import { spawnSync } from 'child_process'
import { chdir } from 'process'
import { ensure } from './util.mjs'
import fonts from '../fonts.json' assert { type: 'json' }

chdir('public')

for (const {
  file,
  version
} of fonts) {
  ensure(spawnSync('wget', [
    `https://cdn.jsdelivr.net/npm/@libreservice/font-collection@${version}/dist/${file}`
  ]))
}
