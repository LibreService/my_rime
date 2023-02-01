import { ref } from 'vue'
import { setOption } from './workerAPI'

const SIMPLIFICATION = 'simplification'

const isEnglish = ref<boolean>(false)
const isFullWidth = ref<boolean>(false)
const isEnglishPunctuation = ref<boolean>(false)

function changeLanguage () {
  isEnglish.value = !isEnglish.value
  setOption('ascii_mode', isEnglish.value)
}

async function changeVariant (keys: string[], key: string, value: boolean) {
  for (const k of keys) {
    if (k !== key) {
      await setOption(k, false)
    }
  }
  return setOption(key, value)
}

function changeWidth () {
  isFullWidth.value = !isFullWidth.value
  setOption('full_shape', isFullWidth.value)
}

function changePunctuation () {
  isEnglishPunctuation.value = !isEnglishPunctuation.value
  setOption('ascii_punct', isEnglishPunctuation.value)
}

export { SIMPLIFICATION, isEnglish, isFullWidth, isEnglishPunctuation, changeLanguage, changeVariant, changeWidth, changePunctuation }
