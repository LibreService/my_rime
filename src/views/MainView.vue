<script setup lang="ts">
import { ref } from 'vue'
import { NInput, NSpace, NButtonGroup, NButton, NIcon } from 'naive-ui'
import { Cut20Regular, Copy20Regular } from '@vicons/fluent'
import MyMenu from '../components/MyMenu.vue'
import MyPanel from '../components/MyPanel.vue'
import { getTextarea } from '../util'

const textareaSelector = '#container textarea'
let savedStart = 0
let savedEnd = 0
const text = ref<string>('')

function updateText (newText: string) {
  text.value = newText
}

function onBlur () {
  const textarea = getTextarea(textareaSelector)
  savedStart = textarea.selectionStart
  savedEnd = textarea.selectionEnd
}

function onFocus () {
  const textarea = getTextarea(textareaSelector)
  textarea.selectionStart = savedStart
  textarea.selectionEnd = savedEnd
}

function copy () {
  const textarea = getTextarea(textareaSelector)
  textarea.focus()
  return navigator.clipboard.writeText(text.value)
}

async function cut () {
  await copy()
  text.value = ''
}
</script>

<template>
  <n-space
    vertical
    class="my-column"
  >
    <my-menu :textarea-selector="textareaSelector" />
    <n-input
      id="container"
      v-model:value="text"
      type="textarea"
      :rows="15"
      clearable
      @blur="onBlur"
      @focus="onFocus"
    />
    <n-button-group class="square-group">
      <n-button
        secondary
        style="font-size: 24px"
        @click="cut"
      >
        <n-icon :component="Cut20Regular" />
      </n-button>
      <n-button
        secondary
        style="font-size: 24px"
        @click="copy"
      >
        <n-icon :component="Copy20Regular" />
      </n-button>
    </n-button-group>
  </n-space>
  <my-panel
    :textarea-selector="textareaSelector"
    :text="text"
    :update-text="updateText"
  />
</template>
