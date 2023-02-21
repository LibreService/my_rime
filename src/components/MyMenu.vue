<script setup lang="ts">
import { ref, Ref, computed } from 'vue'
import { NButton, NButtonGroup, NIcon, NSpace, NSelect } from 'naive-ui'
import { WeatherMoon16Regular, Circle16Regular } from '@vicons/fluent'
import { SIMPLIFICATION, isEnglish, isFullWidth, isExtendedCharset, isEnglishPunctuation, changeLanguage, changeVariant, changeWidth, changeCharset, changePunctuation } from '../control'
import { getTextarea } from '../util'
import { setIME } from '../workerAPI'
import schemas from '../../schemas.json'

const _ime = ref<string>(schemas[0].id) // internal
const ime = ref<string>(_ime.value) // visual
const showVariant = ref<boolean>(true)

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
  family?: {
    id: string,
    name: string,
    disabled?: boolean,
    variants?: Variants
  }[]
  variants?: Variants
  extended?: boolean
}[]) {
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

const variants = computed(() => schemaVariants[_ime.value])

const variantIndex = computed({
  get () {
    return schemaVariantsIndex[_ime.value].value
  },
  set (newIndex) {
    schemaVariantsIndex[_ime.value].value = newIndex
  }
})

const variantLabel = computed(() => showVariant.value ? variants.value[variantIndex.value].name : '')
const singleVariant = computed(() => variants.value.length === 1)

const loading = ref<boolean>(false)

async function selectIME (targetIME: string) {
  resetFocus()
  showVariant.value = false
  loading.value = true
  try {
    await setIME(targetIME)
    _ime.value = targetIME
    const variant = variants.value[variantIndex.value]
    await changeVariant(variants.value.map(v => v.id), variant.id, variant.value)
  } catch (e) {
    console.error(e)
  }
  ime.value = targetIME // update UI after variant properly set
  showVariant.value = true
  loading.value = false
}

async function switchVariant () {
  showVariant.value = false
  variantIndex.value = (variantIndex.value + 1) % variants.value.length
  const variant = variants.value[variantIndex.value]
  await changeVariant(variants.value.map(v => v.id), variant.id, variant.value)
  showVariant.value = true
}

const extendedDisabled = computed(() => ime.value !== _ime.value || !schemaExtended.includes(ime.value))

const props = defineProps<{
  textareaSelector: string
}>()

function resetFocus () {
  getTextarea(props.textareaSelector).focus()
}
</script>

<template>
  <n-space>
    <n-select
      style="width: 160px"
      :value="ime"
      :options="options"
      :loading="loading"
      @update:value="selectIME"
    />
    <n-button-group
      class="square-group"
      @click="resetFocus"
    >
      <n-button
        secondary
        @click="changeLanguage"
      >
        {{ isEnglish ? 'En' : '中' }}
      </n-button>
      <n-button
        secondary
        :disabled="isEnglish || singleVariant"
        @click="switchVariant"
      >
        {{ variantLabel }}
      </n-button>
      <n-button
        secondary
        @click="changeWidth"
      >
        <template #icon>
          <n-icon :component="isFullWidth ? Circle16Regular : WeatherMoon16Regular" />
        </template>
      </n-button>
      <n-button
        secondary
        :disabled="extendedDisabled"
        @click="changeCharset"
      >
        {{ isExtendedCharset ? '增' : '常' }}
      </n-button>
      <n-button
        secondary
        :disabled="isEnglish"
        @click="changePunctuation"
      >
        {{ isEnglishPunctuation ? '.' : '。' }}
      </n-button>
    </n-button-group>
  </n-space>
</template>
