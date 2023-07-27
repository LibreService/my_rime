<script setup lang="ts">
import { NSpace, NButtonGroup, NButton, NIcon, NCheckbox } from 'naive-ui'
import {
  Cut20Regular,
  Copy20Regular,
  ClipboardLink20Regular
} from '@vicons/fluent'
import { getTextarea } from '../util'
import {
  text,
  loading,
  deployed,
  autoCopy,
  schemaId,
  variant
} from '../control'

function copy () {
  const textarea = getTextarea()
  textarea.focus()
  return navigator.clipboard.writeText(text.value)
}

async function cut () {
  await copy()
  text.value = ''
}

async function copyLink () {
  const usp = new URLSearchParams({
    schemaId: schemaId.value,
    variantName: variant.value.name
  })
  const url = `${window.location.origin}${window.location.pathname}?${usp}`
  await navigator.clipboard.writeText(url)
  const textarea = getTextarea()
  textarea.focus()
}
</script>

<template>
  <n-space style="align-items: center">
    <n-button-group class="square-group">
      <n-button
        secondary
        @click="cut"
      >
        <n-icon :component="Cut20Regular" />
      </n-button>
      <n-button
        secondary
        @click="copy"
      >
        <n-icon :component="Copy20Regular" />
      </n-button>
      <n-button
        :disabled="loading || deployed"
        secondary
        title="Copy link for current IME"
        @click="copyLink"
      >
        <n-icon :component="ClipboardLink20Regular" />
      </n-button>
    </n-button-group>
    <!-- Least astonishment: user may explicitly cut, so shouldn't overwrite the clipboard. -->
    <n-checkbox v-model:checked="autoCopy">
      Auto copy on commit
    </n-checkbox>
  </n-space>
</template>

<style scoped>
.n-button-group .n-button {
  font-size: 24px;
}
</style>
