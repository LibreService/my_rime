<script lang="ts">
import { ref, h } from 'vue'
import {
  useDialog,
  useMessage,
  NSpace,
  NButton,
  NTabs,
  NTabPane
} from 'naive-ui'
import { resetUserDirectory } from '../../workerAPI'
import {
  init,
  deployed,
  selectOptions,
  defaultSelectOptions
} from '../../control'
import InstallPane from './InstallPane.vue'
import DeployPane from './DeployPane.vue'

const rimePath = '/rime/'
const schemaPattern = /^[-_a-zA-Z0-9]+$/

const tab = ref<'install' | 'deploy'>('install')
const source = ref<'GitHub' | 'jsDelivr'>('GitHub')
const mode = ref<'schema' | 'plum'>('schema')
const installedPrerequisites = ref<boolean>(false)
const downloading = ref<boolean>(false)
const preSelectedSchemas = ref<string[]>([])

export {
  rimePath,
  schemaPattern,
  tab,
  source,
  mode,
  installedPrerequisites,
  downloading,
  preSelectedSchemas
}
</script>

<script setup lang="ts">

const dialog = useDialog()
const message = useMessage()

function showMicroPlum () {
  tab.value = 'install'
  preSelectedSchemas.value = []
  const dialogInstance = dialog.info({
    title: 'Micro Plum',
    content: () => h(NTabs, {
      type: 'segment',
      value: tab.value,
      'onUpdate:value': newValue => { tab.value = newValue }
    }, () => [
      h(NTabPane, {
        name: 'install',
        tab: 'Install'
      }, () => [h(InstallPane, { message })]),
      h(NTabPane, {
        name: 'deploy',
        tab: 'Deploy'
      }, () => [h(DeployPane, {
        dialogInstance
      })])
    ])
  })
}

async function onReset () {
  await resetUserDirectory()
  deployed.value = false
  selectOptions.value = defaultSelectOptions
  init()
}
</script>

<template>
  <n-space style="align-items: center">
    Add new schemas
    <n-button
      secondary
      type="success"
      @click="showMicroPlum"
    >
      Micro Plum
    </n-button>
    <n-button
      secondary
      type="error"
      @click="onReset"
    >
      Reset
    </n-button>
  </n-space>
</template>
