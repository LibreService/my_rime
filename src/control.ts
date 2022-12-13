import { ref } from 'vue'
import { setOption } from './workerAPI'

const isEnglish = ref<boolean>(false)
const isSimplified = ref<boolean>(true)
const isFullWidth = ref<boolean>(false)
const isEnglishPunctuation = ref<boolean>(false)

function changeLanguage () {
  isEnglish.value = !isEnglish.value
  setOption('ascii_mode', isEnglish.value)
}

function changeFont () {
  isSimplified.value = !isSimplified.value
  setOption('zh_simp', isSimplified.value)
}

function changeWidth () {
  isFullWidth.value = !isFullWidth.value
  setOption('full_shape', isFullWidth.value)
}

function changePunctuation () {
  isEnglishPunctuation.value = !isEnglishPunctuation.value
  setOption('ascii_punct', isEnglishPunctuation.value)
}

export { isEnglish, isSimplified, isFullWidth, isEnglishPunctuation, changeLanguage, changeFont, changeWidth, changePunctuation }
