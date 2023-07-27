<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { NInput, NSpace, NSwitch, useMessage } from 'naive-ui'
import MyMenu from '../components/MyMenu.vue'
import MyPanel from '../components/MyPanel.vue'
import MyBar from '../components/MyBar.vue'
import MyAppearance from '../components/MyAppearance.vue'
import MyFont from '../components/MyFont.vue'
import MyDeployer from '../components/MyDeployer.vue'
import type MySimulator from '../components/MySimulator.vue'
import type MyEditor from '../components/MyEditor.vue'
import MicroPlum from '../components/micro-plum/MicroPlum.vue'
import MyPlatform from '../components/MyPlatform.vue'
import {
  setQuery,
  getTextarea,
  getQueryString,
  isMobile
} from '../util'
import {
  init,
  text
} from '../control'
import { setMessage } from '../micro-plum'

setQuery(useRoute().query)
setMessage(useMessage())
init()

let savedStart = 0
let savedEnd = 0

function onBlur () {
  const textarea = getTextarea()
  savedStart = textarea.selectionStart
  savedEnd = textarea.selectionEnd
}

function onFocus () {
  const textarea = getTextarea()
  textarea.selectionStart = savedStart
  textarea.selectionEnd = savedEnd
}

const panel = ref<InstanceType<typeof MyPanel>>()
const simulator = ref<InstanceType<typeof MySimulator>>()
const editor = ref<InstanceType<typeof MyEditor>>()

const advancedLoaded = ref<boolean>(Boolean(getQueryString('debug')))
const showAdvanced = ref<boolean>(advancedLoaded.value)
const editorLoaded = ref<boolean>(advancedLoaded.value && !isMobile.value)
const showEditor = computed(() => showAdvanced.value && !isMobile.value)

watch(showEditor, (newValue: boolean) => {
  if (newValue) {
    editorLoaded.value = true
  }
})

function toggleAdvanced (newValue: boolean) {
  advancedLoaded.value = true
  showAdvanced.value = newValue
}

const AsyncSimulator = defineAsyncComponent(() => import('../components/MySimulator.vue'))
const AsyncEditor = defineAsyncComponent(() => import('../components/MyEditor.vue'))
</script>

<template>
  <n-space
    vertical
    class="my-column"
  >
    <my-menu />
    <n-input
      id="container"
      v-model:value="text"
      type="textarea"
      :rows="15"
      clearable
      @blur="onBlur"
      @focus="onFocus"
    />
    <my-bar />
    <my-panel
      ref="panel"
      :debug-mode="simulator?.debugMode"
    />
    <my-appearance />
    <my-font />
    <my-deployer />
    <micro-plum />
    <n-space style="align-items: center">
      <h3>Advanced</h3>
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
    <component
      :is="AsyncEditor"
      v-if="editorLoaded"
      v-show="showEditor"
      ref="editor"
    />
    <my-platform />
  </n-space>
</template>
