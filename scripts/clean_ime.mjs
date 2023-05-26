import { rmSync, readFileSync, readdirSync } from 'fs'
import { exit } from 'process'
import { rf } from './util.mjs'

const imeDir = 'public/ime'

if (process.env.LIBRESERVICE_CDN) {
  rmSync(imeDir, rf)
  exit(0)
}

function keepPackage (dir, patterns) {
  for (const name of readdirSync(dir)) {
    const subDir = `${dir}/${name}`
    let keep = false
    const subPatterns = []
    for (const pattern of patterns) {
      const i = pattern.indexOf('/')
      const base = i >= 0 ? pattern.substring(0, i) : pattern
      if (name === base) {
        keep = true
        if (i >= 0) {
          subPatterns.push(pattern.substring(i + 1))
        }
      }
    }
    if (subPatterns.length) {
      keepPackage(subDir, subPatterns)
    } else if (!keep) {
      rmSync(subDir, rf)
    }
  }
}

const targetFiles = JSON.parse(readFileSync('target-files.json'))
keepPackage(imeDir, Object.keys(targetFiles))
