<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
const link = document.createElement('link')
const UbuntuFont = 'Noto Sans CJK SC'
const WindowsFont = 'Microsoft YaHei'
const macOSFont = 'PingFang SC'
const fallbackFont = 'HanaMin'
link.rel = 'preload'
link.href = '__LIBRESERVICE_CDN__' + 'HanaMinB.woff2'
link.as = 'font'
link.type = 'font/woff2'
link.crossOrigin = 'anonymous'

onMounted(() => {
  const { body, head } = document
  head.appendChild(link)
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
  document.body.style.fontFamily = ''
})
</script>
