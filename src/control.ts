import { ref, Ref } from 'vue'
import { setOption } from './workerAPI'

const SIMPLIFICATION = 'simplification'

const isEnglish = ref<boolean>(false)
const isFullWidth = ref<boolean>(false)
const isEnglishPunctuation = ref<boolean>(false)

const toggle = (option: string, box: Ref<boolean>) => async () => {
  const newValue = !box.value
  await setOption(option, newValue)
  box.value = newValue
}

const changeLanguage = toggle('ascii_mode', isEnglish)
const changeWidth = toggle('full_shape', isFullWidth)
const changePunctuation = toggle('ascii_punct', isEnglishPunctuation)

async function changeVariant (keys: string[], key: string, value: boolean) {
  for (const k of keys) {
    if (k !== key) {
      await setOption(k, false)
    }
  }
  return setOption(key, value)
}

export { SIMPLIFICATION, isEnglish, isFullWidth, isEnglishPunctuation, changeLanguage, changeVariant, changeWidth, changePunctuation }
