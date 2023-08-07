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
  setLoading
} from '../../control'
import ManifestPane from './ManifestPane.vue'
import InstallPane from './InstallPane.vue'
import DeployPane from './DeployPane.vue'

const RPPI = 'https://raw.githubusercontent.com/rime/rppi/HEAD/index.json'
const _rppi = ref<string>(RPPI)

const tab = ref<'rppi' | 'install' | 'deploy'>('install')

const source = ref<'GitHub' | 'jsDelivr'>('GitHub')
const mode = ref<'schema' | 'plum'>('schema')
const installedPrerequisites = ref<boolean>(false)
const downloading = ref<boolean>(false)
const preSelectedSchemas = ref<string[]>([])

export {
  RPPI,
  _rppi,
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

async function showRPPI () {
  tab.value = 'rppi'
  const dialogInstance = dialog.info({
    title: 'RPPI',
    content: () => h(NTabs, {
      type: 'segment',
      value: tab.value,
      'onUpdate:value': newValue => { tab.value = newValue }
    }, () => [
      h(NTabPane, {
        name: 'rppi',
        tab: 'RPPI'
      }, () => [h(ManifestPane, { message })]),
      h(NTabPane, {
        name: 'deploy',
        tab: 'Deploy'
      }, () => [h(DeployPane, {
        dialogInstance
      })])
    ])
  })
}

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
  installedPrerequisites.value = false
  setLoading(true)
  localStorage.removeItem('schemaId')
  await resetUserDirectory()
  init()
}
</script>

<template>
  <n-space style="align-items: center">
    <h3>Add new schemas</h3>
    <n-button
      secondary
      type="info"
      @click="showRPPI"
    >
      RPPI
    </n-button>
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
