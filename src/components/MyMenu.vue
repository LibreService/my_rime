<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { NButton, NButtonGroup, NIcon, NSpace, NSelect } from 'naive-ui'
import { WeatherMoon16Regular, Circle16Regular } from '@vicons/fluent'
import {
  init,
  deployed,
  loading,
  schemaId,
  ime,
  selectOptions,
  showVariant,
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
  selectIME
} from '../control'
import { getTextarea } from '../util'

init()

const variantLabel = computed(() => showVariant.value && !deployed.value ? variant.value.name : '')
const singleVariant = computed(() => !deployed.value && variants.value.length === 1)

watchEffect(() => {
  if (ime.value) {
    localStorage.setItem('schemaId', ime.value)
  }
  if (variantLabel.value) {
    localStorage.setItem('variantName', variantLabel.value)
  }
})

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

function onSelectIME (value: string) {
  resetFocus()
  selectIME(value)
}
</script>

<template>
  <n-space>
    <n-select
      style="width: 160px"
      :value="ime"
      :options="selectOptions"
      :loading="loading"
      @update:value="onSelectIME"
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
