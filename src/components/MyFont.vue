<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
const style = document.createElement('style')
const UbuntuFont = 'Noto Sans CJK SC'
const WindowsFont = 'Microsoft YaHei'
const macOSFont = 'PingFang SC'
const fallbackFont = 'HanaMin'
const fontURL = '__LIBRESERVICE_CDN__' + 'HanaMinB.woff2'
style.innerHTML = `
  @font-face {
    font-family: ${fallbackFont};
    src: url(${fontURL}) format("woff2")
  }`

onMounted(() => {
  const { body } = document
  body.appendChild(style)
  body.style.fontFamily = [
    getComputedStyle(body).fontFamily,
    UbuntuFont,
    WindowsFont,
    macOSFont,
    fallbackFont
  ].join(', ')
})

onUnmounted(() => {
  document.body.removeChild(style)
  document.body.style.fontFamily = ''
})
</script>
