<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { NButton, NButtonGroup, NIcon, NSpace, NSelect } from 'naive-ui'
import { WeatherMoon16Regular, Circle16Regular } from '@vicons/fluent'
import {
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
  changeLanguage,
  changeVariant,
  changeWidth,
  changeCharset,
  changePunctuation,
  changeEmoji,
  changeIME
} from '../control'
import { getTextarea, getQueryString } from '../util'

const ime = ref<string>('') // visual vs internal

function displayIME (value: string) {
  ime.value = value
}

const showVariant = ref<boolean>(false)
const loading = ref<boolean>(true)

function setLoading (value: boolean) {
  loading.value = value
}

init(getQueryString('schemaId'), getQueryString('variantName')).then(() => {
  displayIME(schemaId.value)
  showVariant.value = true
  setLoading(false)
})

const variantLabel = computed(() => showVariant.value && !deployed.value ? variant.value.name : '')
const singleVariant = computed(() => !deployed.value && variants.value.length === 1)

watchEffect(() => {
  localStorage.setItem('schemaId', ime.value)
  localStorage.setItem('variantName', variantLabel.value)
})

async function selectIME (targetIME: string) {
  resetFocus()
  showVariant.value = false
  setLoading(true)
  displayIME('')
  await changeIME(targetIME)
  displayIME(targetIME) // update UI after variant properly set
  showVariant.value = true
  setLoading(false)
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

defineExpose({
  displayIME,
  setLoading,
  selectIME
})
</script>

<template>
  <n-space>
    <n-select
      style="width: 160px"
      :value="ime"
      :options="selectOptions"
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
        :disabled="isEnglish || singleVariant || deployed"
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
        {{ extendedDisabled ? '' : isExtendedCharset ? '增' : '常' }}
      </n-button>
      <n-button
        secondary
        :disabled="isEnglish"
        @click="changePunctuation"
      >
        {{ isEnglishPunctuation ? '.' : '。' }}
      </n-button>
      <n-button
        secondary
        @click="changeEmoji"
      >
        {{ enableEmoji ? '😀' : '🚫' }}
      </n-button>
    </n-button-group>
  </n-space>
</template>
