<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  DialogReactive,
  NSpace,
  NTransfer,
  NButton
} from 'naive-ui'
import yaml from 'js-yaml'
import { u2s } from '@libreservice/micro-plum'
import { FS, deploy } from '../../workerAPI'
import {
  rimePath,
  schemaPattern,
  preSelectedSchemas
} from './MicroPlum.vue'

const props = defineProps<{
  dialogInstance: DialogReactive
}>()

const postfix = '.schema.yaml'
const custom = 'default.custom.yaml'

const options = ref<{
  label: string
  value: string
}[]>([])

const selected = ref<string[]>([])

onMounted(async () => {
  const _options: typeof options.value = []
  let _selected: string[]
  const available: string[] = []

  const files = await FS.readdir(rimePath)
  for (const file of files) {
    if (!file.endsWith(postfix)) {
      continue
    }
    const schema = file.slice(0, -postfix.length)
    if (!schemaPattern.test(schema)) {
      continue
    }
    available.push(schema)
    const content = u2s(await FS.readFile(rimePath + file))
    const obj = yaml.load(content) as {
      schema?: {
        name?: string
      }
    }
    const name = obj?.schema?.name || schema
    _options.push({
      label: name,
      value: schema
    })
  }
  try {
    const defaultCustomYaml = u2s(await FS.readFile(rimePath + custom))
    const schemaList: { schema: string }[] = (yaml.load(defaultCustomYaml) as any)?.patch?.schema_list || []
    _selected = schemaList.map(({ schema }) => schema).filter(schema => available.includes(schema))
  } catch {
    _selected = []
  }
  for (const schema of preSelectedSchemas.value) {
    if (available.includes(schema)) {
      _selected.push(schema)
    }
  }

  options.value = _options
  selected.value = _selected
})

async function onClick () {
  props.dialogInstance.destroy()
  await FS.writeFile(rimePath + custom, yaml.dump({
    patch: {
      schema_list: selected.value.map(schema => ({ schema }))
    }
  }))
  deploy()
}
</script>

<template>
  <n-space vertical>
    <n-transfer
      v-model:value="selected"
      :options="options"
    />
    <div style="display: flex; justify-content: end">
      <n-button
        :disabled="selected.length === 0"
        secondary
        type="info"
        @click="onClick"
      >
        Deploy
      </n-button>
    </div>
  </n-space>
</template>
