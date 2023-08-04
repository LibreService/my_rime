import { rmSync } from 'fs'
import { rf } from './util.js'
import fonts from '../fonts.json' assert { type: 'json' }

if (process.env.LIBRESERVICE_CDN) {
  for (const { files } of fonts) {
    for (const file of files) {
      rmSync(`dist/${file}`, rf)
    }
  }
}
