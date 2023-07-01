import { writeFileSync } from 'fs'
import fonts from '../fonts.json' assert { type: 'json' }

fonts.forEach(async ({ file, version }) => {
  const response = await fetch(`https://cdn.jsdelivr.net/npm/@libreservice/font-collection@${version}/dist/${file}`)
  const buffer = await response.arrayBuffer()
  writeFileSync(`public/${file}`, new Uint8Array(buffer))
})
