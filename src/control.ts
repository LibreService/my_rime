import { computed, ref, Ref } from 'vue'
import { setOption, setIME } from './workerAPI'
import schemas from '../schemas.json'

const SIMPLIFICATION = 'simplification'

const schemaId = ref<string>(schemas[0].id)

const schemaExtended: string[] = []

const schemaVariants: {
  [key: string]: {
    id: string
    name: string
    value: boolean
  }[]
} = {}
const schemaVariantsIndex: {
  [key: string]: Ref<number>
} = {}

const options: {
  label: string
  value: string
}[] = []

type Variants = {
  id: string,
  name: string
}[]

function convertVariants (variants: Variants | undefined) {
  if (variants) {
    if (variants.length) {
      return variants.map(variant => ({
        ...variant,
        value: true
      }))
    }
    return [{
      id: '',
      name: '',
      value: true
    }]
  }
  return [
    {
      id: SIMPLIFICATION,
      name: '简',
      value: true
    },
    {
      id: SIMPLIFICATION,
      name: '繁',
      value: false
    }
  ]
}

for (const schema of schemas as {
  id: string
  name: string
  disabled?: boolean
  family?: {
    id: string,
    name: string,
    disabled?: boolean,
    variants?: Variants
  }[]
  variants?: Variants
  extended?: boolean
}[]) {
  if (schema.disabled) {
    continue
  }
  options.push({
    label: schema.name,
    value: schema.id
  })
  schemaVariantsIndex[schema.id] = ref<number>(0)
  schemaVariants[schema.id] = convertVariants(schema.variants)
  if (schema.extended) {
    schemaExtended.push(schema.id)
  }
  if (schema.family) {
    for (const { id, name, disabled, variants } of schema.family) {
      if (disabled) {
        continue
      }
      if (schema.extended) {
        schemaExtended.push(id)
      }
      options.push({
        label: name,
        value: id
      })
      schemaVariantsIndex[id] = ref<number>(0)
      schemaVariants[id] = variants ? convertVariants(variants) : schemaVariants[schema.id]
    }
  }
}

const variants = computed(() => schemaVariants[schemaId.value])

const variantIndex = computed({
  get () {
    return schemaVariantsIndex[schemaId.value].value
  },
  set (newIndex) {
    schemaVariantsIndex[schemaId.value].value = newIndex
  }
})

const variant = computed(() => variants.value[variantIndex.value])

async function init (_schemaId: string, variantName: string) {
  if (_schemaId in schemaVariants) {
    schemaId.value = _schemaId
  }
  await setIME(schemaId.value)
  variantIndex.value = 0
  for (let i = 0; i < variants.value.length; ++i) {
    if (variants.value[i].name === variantName) {
      variantIndex.value = i
      break
    }
  }
  return setVariant()
}

const isEnglish = ref<boolean>(false)
const isFullWidth = ref<boolean>(false)
const isExtendedCharset = ref<boolean>(false)
const isEnglishPunctuation = ref<boolean>(false)

const toggle = (option: string, box: Ref<boolean>) => async () => {
  const newValue = !box.value
  await setOption(option, newValue)
  box.value = newValue
}

const changeLanguage = toggle('ascii_mode', isEnglish)
const changeWidth = toggle('full_shape', isFullWidth)
const changeCharset = toggle('extended_charset', isExtendedCharset)
const changePunctuation = toggle('ascii_punct', isEnglishPunctuation)

async function setVariant () {
  for (const v of variants.value) {
    if (v.id !== variant.value.id) {
      await setOption(v.id, false)
    }
  }
  return setOption(variant.value.id, variant.value.value)
}

function changeVariant () {
  variantIndex.value = (variantIndex.value + 1) % variants.value.length
  return setVariant()
}

async function changeIME (targetIME: string) {
  try {
    await setIME(targetIME)
    schemaId.value = targetIME
    await setVariant()
  } catch (e) {
    console.error(e)
  }
}

export { init, schemaId, options, variants, variant, isEnglish, isFullWidth, isExtendedCharset, isEnglishPunctuation, schemaExtended, changeLanguage, changeVariant, changeWidth, changeCharset, changePunctuation, changeIME }
