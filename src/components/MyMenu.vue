<script setup lang="ts">
import { ref, Ref, computed } from 'vue'
import { NButton, NButtonGroup, NIcon, NSpace, NSelect } from 'naive-ui'
import { WeatherMoon16Regular, Circle16Regular } from '@vicons/fluent'
import { SIMPLIFICATION, isEnglish, isFullWidth, isEnglishPunctuation, changeLanguage, changeVariant, changeWidth, changePunctuation } from '../control'
import { getTextarea } from '../util'
import { setIME } from '../workerAPI'
import schemas from '../../schemas.json'

const luna = 'luna_pinyin'

const ime = ref<string>(luna)

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

for (const schema of schemas as {
  id: string
  variants?: {
    id: string
    name: string
  }[]
}[]) {
  schemaVariantsIndex[schema.id] = ref<number>(0)
  if (schema.variants) {
    schemaVariants[schema.id] = []
    for (const variant of schema.variants) {
      schemaVariants[schema.id].push({
        ...variant,
        value: true
      })
    }
  } else {
    schemaVariants[schema.id] = [
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
}

const variants = computed(() => schemaVariants[ime.value])

const variantIndex = computed({
  get () {
    return schemaVariantsIndex[ime.value].value
  },
  set (newIndex) {
    schemaVariantsIndex[ime.value].value = newIndex
  }
})

const variantLabel = computed(() => variants.value[variantIndex.value].name)

const options = (schemas as {
  id: string
  name: string
}[]).map(schema => ({
  label: schema.name,
  value: schema.id
}))
const loading = ref<boolean>(false)

async function selectIME (targetIME: string) {
  resetFocus()
  loading.value = true
  try {
    await setIME(targetIME)
    ime.value = targetIME
    const variant = variants.value[variantIndex.value]
    await changeVariant(variants.value.map(v => v.id), variant.id, variant.value)
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

function switchVariant () {
  variantIndex.value = (variantIndex.value + 1) % variants.value.length
  const variant = variants.value[variantIndex.value]
  changeVariant(variants.value.map(v => v.id), variant.id, variant.value)
}

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
        :disabled="isEnglish"
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
        :disabled="isEnglish"
        @click="changePunctuation"
      >
        {{ isEnglishPunctuation ? '.' : '。' }}
      </n-button>
    </n-button-group>
  </n-space>
</template>
