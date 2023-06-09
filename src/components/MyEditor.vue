<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NButton } from 'naive-ui'
import { json } from '@codemirror/legacy-modes/mode/javascript'
import { lua } from '@codemirror/legacy-modes/mode/lua'
import { yaml } from '@codemirror/legacy-modes/mode/yaml'
import { WasmCode } from '@libreservice/wasm-code'
import { deploy, FS } from '../workerAPI'

const langParserMap = {
  json, lua, yaml
}

const extLangMap = {
  json: 'json',
  lua: 'lua',
  yaml: 'yaml'
}

const wc = ref<InstanceType<typeof WasmCode>>()

onMounted(() => {
  [
    '/',
    '/rime/',
    '/usr/',
    '/usr/local/',
    '/usr/local/share/',
    '/usr/local/share/opencc/'
  ].forEach(wc.value!.expandFolder)
})
</script>

<template>
  <div>
    <n-button
      secondary
      type="info"
      @click="deploy()"
    >
      Deploy
    </n-button>
    <wasm-code
      ref="wc"
      :fs="FS"
      height="80vh"
      :lang-parser-map="langParserMap"
      :ext-lang-map="extLangMap"
    />
  </div>
</template>
