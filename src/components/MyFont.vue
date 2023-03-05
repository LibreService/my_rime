<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const UbuntuFont = 'Noto Sans CJK SC'
const WindowsFont = 'Microsoft YaHei'
const macOSFont = 'PingFang SC'
const fallbackFont = 'HanaMin'
const fontURL = ('__LIBRESERVICE_CDN__' || './') + 'HanaMinB.woff2'

const link = document.createElement('link')
link.rel = 'preload'
link.href = fontURL
link.as = 'font'
link.type = 'font/woff2'
link.crossOrigin = 'anonymous'

const style = document.createElement('style')
style.innerHTML = `
  @font-face {
    font-family: ${fallbackFont};
    src: url(${fontURL}) format("woff2")
  }`

onMounted(() => {
  const { body, head } = document
  head.appendChild(link)
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
  document.head.removeChild(link)
  document.body.removeChild(style)
  document.body.style.fontFamily = ''
})
</script>
