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
  RIME_PATH,
  DEFAULT_CUSTOM,
  getAvailableSchemas,
  customizeDefault
} from '../../micro-plum'
import {
  preSelectedSchemas
} from './MicroPlum.vue'

const props = defineProps<{
  dialogInstance: DialogReactive
}>()

const options = ref<{
  label: string
  value: string
}[]>([])

const selected = ref<string[]>([])

onMounted(async () => {
  const _options: typeof options.value = []
  let _selected: string[]
  const available = await getAvailableSchemas()

  for (const schema of available) {
    const content = u2s(await FS.readFile(`${RIME_PATH}/${schema}.schema.yaml`))
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
    const defaultCustomYaml = u2s(await FS.readFile(DEFAULT_CUSTOM))
    const schemaList: { schema: string }[] = (yaml.load(defaultCustomYaml) as any)?.patch?.schema_list || []
    _selected = schemaList.map(({ schema }) => schema).filter(schema => available.includes(schema))
  } catch {
    _selected = []
  }
  for (const schema of preSelectedSchemas.value) {
    if (available.includes(schema) && !_selected.includes(schema)) {
      _selected.push(schema)
    }
  }

  options.value = _options
  selected.value = _selected
})

async function onClick () {
  props.dialogInstance.destroy()
  await customizeDefault(selected.value)
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
