<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NSpace, NCheckboxGroup, NCheckbox } from 'naive-ui'
import fonts from '../../fonts.json'

let defaultFont = ''
const UbuntuFont = 'Noto Sans CJK SC'
const WindowsFont = 'Microsoft YaHei'
const macOSFont = 'PingFang SC'

function loadFont (font: string) {
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
      const style = document.createElement('style')
      style.innerHTML = `
@font-face {
  font-family: ${fontFamily};
  src: url(${url}) format("woff2")
}`
      document.body.appendChild(style)
      break
    }
  }
}

const loadedFonts: string[] = []
const selectedFonts = ref<string[]>([])

function updatedFonts (value: (string | number)[]) {
  selectedFonts.value = value as string[]
  selectedFonts.value.forEach(loadFont)
  document.body.style.fontFamily = [
    defaultFont,
    UbuntuFont,
    WindowsFont,
    macOSFont,
    ...selectedFonts.value
  ].join(', ')
}

onMounted(() => {
  defaultFont = getComputedStyle(document.body).fontFamily
})
</script>

<template>
  <n-space>
    Font for uncommon characters
    <n-checkbox-group
      :value="selectedFonts"
      @update:value="updatedFonts"
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
