import { rmSync } from 'fs'
import { rf } from './util.mjs'
import fonts from '../fonts.json' assert { type: 'json' }

if (process.env.LIBRESERVICE_CDN) {
  for (const { file } of fonts) {
    rmSync(`dist/${file}`, rf)
  }
}
