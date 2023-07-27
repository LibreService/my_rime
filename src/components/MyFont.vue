<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NSpace, NCheckboxGroup, NCheckbox } from 'naive-ui'
import { LazyCache } from '@libreservice/lazy-cache'
import { getLanguage } from '../locale'
import fonts from '../../fonts.json'

const UbuntuFontMap = {
  'zh-CN': 'Noto Sans CJK SC',
  'zh-TW': 'Noto Sans CJK TC',
  'zh-HK': 'Noto Sans CJK HK',
  'zh-SG': 'Noto Sans CJK SC'
}

const WindowsFontMap = {
  'zh-CN': 'Microsoft YaHei',
  'zh-TW': 'Microsoft JhengHei',
  'zh-HK': 'Microsoft JhengHei',
  'zh-SG': 'Microsoft YaHei'
}

const macOSFontMap = {
  'zh-CN': 'PingFang SC',
  'zh-TW': 'PingFang TC',
  'zh-HK': 'PingFang HK',
  'zh-SG': 'PingFang SC'
}

const language = getLanguage()
let defaultFont = ''
const UbuntuFont = UbuntuFontMap[language]
const WindowsFont = WindowsFontMap[language]
const macOSFont = macOSFontMap[language]

const storageKey = 'selectedFonts'

const lazyCache = new LazyCache('font')

async function loadFont (font: string) {
  if (loadedFonts.includes(font)) {
    return
  }
  loadedFonts.push(font)

  for (const {
    fontFamily,
    file,
    version
  } of fonts) {
    if (fontFamily === font) {
      const url = (
        '__LIBRESERVICE_CDN__' // eslint-disable-line no-constant-condition
          ? `https://cdn.jsdelivr.net/npm/@libreservice/font-collection@${version}/dist/`
          : './'
      ) + file
      const buffer = await lazyCache.get(file, version, url)
      const blob = new Blob([buffer], { type: 'font/woff2' })
      const blobURL = URL.createObjectURL(blob)
      const style = document.createElement('style')
      style.innerHTML = `
@font-face {
  font-family: ${fontFamily};
  src: url(${blobURL}) format("woff2")
}`
      document.body.appendChild(style)
      break
    }
  }
}

const loadedFonts: string[] = []
const selectedFonts = ref<string[]>([])

async function updateFonts (value: (string | number)[]) {
  selectedFonts.value = value as string[]
  localStorage.setItem(storageKey, JSON.stringify(selectedFonts.value))
  await Promise.all(selectedFonts.value.map(loadFont))
  document.body.style.fontFamily = [
    defaultFont,
    UbuntuFont,
    WindowsFont,
    macOSFont,
    ...selectedFonts.value
  ].join(', ')
}

try {
  const supportedFonts = fonts.map(({ fontFamily }) => fontFamily)
  updateFonts((JSON.parse(localStorage.getItem(storageKey) || '[]') as string[]).filter(font => supportedFonts.includes(font)))
} catch {}

onMounted(() => {
  defaultFont = getComputedStyle(document.body).fontFamily
})
</script>

<template>
  <n-space>
    Font for uncommon characters
    <n-checkbox-group
      :value="selectedFonts"
      @update:value="updateFonts"
    >
      <n-checkbox
        v-for="font of fonts"
        :key="font.name"
        :label="font.name"
        :value="font.fontFamily"
      />
    </n-checkbox-group>
  </n-space>
</template>
