import { computed, ref, Ref } from 'vue'
import { setOption, setIME } from './workerAPI'
import schemas from '../schemas.json'

const ASCII_MODE = 'ascii_mode'
const FULL_SHAPE = 'full_shape'
const EXTENDED_CHARSET = 'extended_charset'
const ASCII_PUNCT = 'ascii_punct'
const EMOJI_SUGGESTION = 'emoji_suggestion'
const SIMPLIFICATION = 'simplification'

const deployed = ref<boolean>(false)

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

const selectOptions = ref<(
  {
    label: string
  } & ({
    value: string
  } | {
    type: 'group'
    key: string,
    children: {
      label: string
      value: string
    }[]
  })
)[]>([])

type Variants = {
  id: string,
  name: string
}[]

type HideComment = boolean | 'emoji'
const schemaComment: {[key: string]: HideComment} = {}
const hideComment = computed<HideComment>(() => schemaComment[schemaId.value] || false)

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
  group?: string
  disabled?: boolean
  hideComment?: HideComment
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

  function helper (id: string, name: string, group: string | undefined, extended: boolean | undefined, hideComment: HideComment | undefined) {
    const item = {
      label: name,
      value: id
    }
    if (group) {
      let found = false
      for (const option of selectOptions.value) {
        if ('children' in option && option.label === group) {
          option.children.push(item)
          found = true
          break
        }
      }
      if (!found) {
        selectOptions.value.push({
          type: 'group',
          label: group,
          key: group,
          children: [item]
        })
      }
    } else {
      selectOptions.value.push(item)
    }
    schemaVariantsIndex[id] = ref<number>(0)
    if (extended) {
      schemaExtended.push(id)
    }
    if (hideComment) {
      schemaComment[id] = hideComment
    }
  }

  helper(schema.id, schema.name, schema.group, schema.extended, schema.hideComment)
  schemaVariants[schema.id] = convertVariants(schema.variants)
  if (schema.family) {
    for (const { id, name, disabled, variants } of schema.family) {
      if (disabled) {
        continue
      }
      helper(id, name, schema.group, schema.extended, schema.hideComment)
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
  variantIndex.value = 0
  for (let i = 0; i < variants.value.length; ++i) {
    if (variants.value[i].name === variantName) {
      variantIndex.value = i
      break
    }
  }
  return changeIME(schemaId.value)
}

const isEnglish = ref<boolean>(false)
const isFullWidth = ref<boolean>(false)
const isExtendedCharset = ref<boolean>(false)
const isEnglishPunctuation = ref<boolean>(false)
const enableEmoji = ref<boolean>(true)

const basicOptionMap = {
  [ASCII_MODE]: isEnglish,
  [FULL_SHAPE]: isFullWidth,
  [EXTENDED_CHARSET]: isExtendedCharset,
  [ASCII_PUNCT]: isEnglishPunctuation,
  [EMOJI_SUGGESTION]: enableEmoji
}

const toggle = (option: keyof typeof basicOptionMap) => async () => {
  const box = basicOptionMap[option]
  const newValue = !box.value
  await setOption(option, newValue)
  box.value = newValue
}

const changeLanguage = toggle(ASCII_MODE)
const changeWidth = toggle(FULL_SHAPE)
const changeCharset = toggle(EXTENDED_CHARSET)
const changePunctuation = toggle(ASCII_PUNCT)
const changeEmoji = toggle(EMOJI_SUGGESTION)

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
    if (!deployed.value) {
      // Variant is specific to a schema
      await setVariant()
    }
    for (const [option, box] of Object.entries(basicOptionMap)) {
      if (option === ASCII_MODE) {
        // librime resets Chinese
        box.value = false
        continue
      }
      // Other options aren't specific to a schema
      await setOption(option, box.value)
    }
  } catch (e) {
    console.error(e)
  }
}

function syncOptions (updatedOptions: string[]) {
  if (updatedOptions.length === 1) { // global options or binary variant
    const updatedOption = updatedOptions[0]
    for (const [option, box] of Object.entries(basicOptionMap)) {
      if (option === updatedOption) {
        box.value = true
        return
      }
      if (`!${option}` === updatedOption) {
        box.value = false
        return
      }
    }
    if (!deployed.value && variants.value.length === 2) {
      for (const [i, v] of variants.value.entries()) {
        if ((v.id === updatedOption && v.value) || (`!${v.id}` === updatedOption && !v.value)) {
          variantIndex.value = i
          return
        }
      }
    }
  } else { // n-ary variant
    for (const updatedOption of updatedOptions) {
      if (updatedOption.startsWith('!')) {
        continue
      }
      for (const [i, v] of variants.value.entries()) {
        if (v.id === updatedOption) {
          variantIndex.value = i
          return
        }
      }
    }
  }
}

export {
  init,
  deployed,
  schemaId,
  selectOptions,
  variants,
  variant,
  isEnglish,
  isFullWidth,
  isExtendedCharset,
  isEnglishPunctuation,
  enableEmoji,
  schemaExtended,
  hideComment,
  changeLanguage,
  changeVariant,
  changeWidth,
  changeCharset,
  changePunctuation,
  changeEmoji,
  changeIME,
  syncOptions
}
