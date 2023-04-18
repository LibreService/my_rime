<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { NInput, NSpace, NButtonGroup, NButton, NIcon, NSwitch } from 'naive-ui'
import { Cut20Regular, Copy20Regular, ClipboardLink20Regular } from '@vicons/fluent'
import MyMenu from '../components/MyMenu.vue'
import MyPanel from '../components/MyPanel.vue'
import type MySimulator from '../components/MySimulator.vue'
import { getTextarea, getQueryString } from '../util'
import { schemaId, variant } from '../control'

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

async function copyLink () {
  const usp = new URLSearchParams({
    schemaId: schemaId.value,
    variantName: variant.value.name
  })
  const url = `${window.location.origin}${window.location.pathname}?${usp}`
  await navigator.clipboard.writeText(url)
  const textarea = getTextarea(textareaSelector)
  textarea.focus()
}

const panel = ref<InstanceType<typeof MyPanel>>()
const simulator = ref<InstanceType<typeof MySimulator>>()

const advancedLoaded = ref<boolean>(Boolean(getQueryString('debug')))
const showAdvanced = ref<boolean>(advancedLoaded.value)

function toggleAdvanced (newValue: boolean) {
  advancedLoaded.value = true
  showAdvanced.value = newValue
}

const AsyncSimulator = defineAsyncComponent(() => import('../components/MySimulator.vue'))
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
        secondary
        title="Copy link for current IME"
        @click="copyLink"
      >
        <n-icon :component="ClipboardLink20Regular" />
      </n-button>
    </n-button-group>
    <my-panel
      ref="panel"
      :textarea-selector="textareaSelector"
      :text="text"
      :update-text="updateText"
      :debug-mode="simulator?.debugMode"
    />
    <n-space>
      Advanced
      <n-switch
        :value="showAdvanced"
        @update:value="toggleAdvanced"
      />
    </n-space>
    <component
      :is="AsyncSimulator"
      v-if="advancedLoaded"
      v-show="showAdvanced"
      ref="simulator"
      :debug="panel?.debug"
    />
  </n-space>
</template>

<style scoped>
.n-button {
  font-size: 24px;
}
</style>
