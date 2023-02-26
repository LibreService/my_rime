<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NButtonGroup, NIcon, NSpace, NSelect } from 'naive-ui'
import { WeatherMoon16Regular, Circle16Regular } from '@vicons/fluent'
import { init, schemaId, options, variants, variant, isEnglish, isFullWidth, isExtendedCharset, isEnglishPunctuation, schemaExtended, changeLanguage, changeVariant, changeWidth, changeCharset, changePunctuation, changeIME } from '../control'
import { getTextarea } from '../util'

const ime = ref<string>('') // visual vs internal
const showVariant = ref<boolean>(true)

const route = useRoute()

function getKey (key: string) {
  const queryValue = route.query[key]
  const param = typeof queryValue === 'string' ? queryValue : ''
  console.log(param || localStorage.getItem(key) || '')
  return param || localStorage.getItem(key) || ''
}

init(getKey('schemaId'), getKey('variantName')).then(() => {
  ime.value = schemaId.value
})

const variantLabel = computed(() => showVariant.value ? variant.value.name : '')
const singleVariant = computed(() => variants.value.length === 1)

watchEffect(() => {
  localStorage.setItem('schemaId', ime.value)
  localStorage.setItem('variantName', variantLabel.value)
})

const loading = ref<boolean>(false)

async function selectIME (targetIME: string) {
  resetFocus()
  showVariant.value = false
  loading.value = true
  await changeIME(targetIME)
  ime.value = targetIME // update UI after variant properly set
  showVariant.value = true
  loading.value = false
}

async function switchVariant () {
  showVariant.value = false
  await changeVariant()
  showVariant.value = true
}

const extendedDisabled = computed(() => ime.value !== schemaId.value || !schemaExtended.includes(ime.value))

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
