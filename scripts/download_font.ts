import { writeFileSync } from 'fs'
import fonts from '../fonts.json' assert { type: 'json' }
import { exit } from 'process'

fonts.forEach(async ({ files, version }) => {
  for (const file of files) {
    const response = await fetch(`https://cdn.jsdelivr.net/npm/@libreservice/font-collection@${version}/dist/${file}`)
    if (response.status !== 200) {
      console.error(`Fail to download ${file}`)
      exit(1)
    }
    const buffer = await response.arrayBuffer()
    writeFileSync(`public/${file}`, new Uint8Array(buffer))
  }
})
