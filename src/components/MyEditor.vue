<script setup lang="ts">
import { NButton, useNotification } from 'naive-ui'
import { json } from '@codemirror/legacy-modes/mode/javascript'
import { lua } from '@codemirror/legacy-modes/mode/lua'
import { yaml } from '@codemirror/legacy-modes/mode/yaml'
import { WasmCode } from '@libreservice/wasm-code'
import { worker, deploy, FS } from '../workerAPI'

const langParserMap = {
  json, lua, yaml
}

const extLangMap = {
  json: 'json',
  lua: 'lua',
  yaml: 'yaml'
}

const notification = useNotification()

worker.control('deployStatus', (status: 'start' | 'failure' | 'success') => {
  const options = {
    duration: 5000,
    keepAliveOnHover: true
  }
  switch (status) {
    case 'start':
      notification.info({
        content: 'Deployment started',
        ...options
      })
      break
    case 'failure':
      notification.error({
        content: 'Deployment failed',
        ...options
      })
      break
    case 'success':
      notification.success({
        content: 'Deployment succeeded',
        ...options
      })
      break
  }
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
      :fs="FS"
      height="80vh"
      :lang-parser-map="langParserMap"
      :ext-lang-map="extLangMap"
    />
  </div>
</template>
