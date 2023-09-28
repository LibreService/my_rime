<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NButton } from 'naive-ui'
import { StreamParser } from '@codemirror/language'
import { json } from '@codemirror/legacy-modes/mode/javascript'
import { lua } from '@codemirror/legacy-modes/mode/lua'
import { yaml } from '@codemirror/legacy-modes/mode/yaml'
import { WasmCode } from '@libreservice/wasm-code'
import { deploy, FS } from '../workerAPI'

const langParserMap: {
  [key: string]: StreamParser<any>
} = {
  json, lua, yaml
}

const extLangMap = {
  json: 'json',
  lua: 'lua',
  yaml: 'yaml'
}

const wc = ref<InstanceType<typeof WasmCode>>()

function hidePath (path: string): boolean {
  return path.match(/^\/(rime|usr)(\/|$)/) === null
}

onMounted(() => {
  [
    '/',
    '/rime/',
    '/usr/',
    '/usr/share/',
    '/usr/share/opencc/',
    '/usr/share/rime-data/'
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
      :hide-path="hidePath"
    />
  </div>
</template>
