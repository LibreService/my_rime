<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  DialogReactive,
  NSpace,
  NTransfer,
  NButton
} from 'naive-ui'
import yaml from 'js-yaml'
import {
  u2s,
  getBinaryNames,
  Recipe,
  FileLoader
} from '@libreservice/micro-plum'
import { traverseFS } from '@libreservice/wasm-code'
import { FS, deploy } from '../../workerAPI'
import {
  RIME_PATH,
  DEFAULT_CUSTOM,
  prerequisites,
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

class LocalLoader implements FileLoader {
  repo: string
  schemaIds: string[]

  constructor (repo: string, schemaIds: string[]) {
    this.repo = repo
    this.schemaIds = schemaIds
  }

  loadFile (file: string): Promise<Uint8Array> {
    return FS.readFile(`${RIME_PATH}/${file}`)
  }
}

async function getOptions (schemas: string[]) {
  const _options: typeof options.value = []
  for (const schema of schemas) {
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
  return _options
}

onMounted(async () => {
  let _selected: string[]
  const available = await getAvailableSchemas()
  const _options = await getOptions(available)

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

async function onTrash () {
  const keptFiles: string[] = []
  const add = async (loader: LocalLoader) => {
    const manifest = await new Recipe(loader).load()
    for (const { file, content } of manifest) {
      if (content && !keptFiles.includes(file)) {
        keptFiles.push(file)
      }
      if (file.endsWith('.schema.yaml')) {
        const schemaYaml = `build/${file}`
        try {
          const obj = yaml.load(u2s(await FS.readFile(`${RIME_PATH}/${schemaYaml}`))) as object
          const { dict, prism } = getBinaryNames(obj)
          if (dict) {
            const defaultYaml = 'build/default.yaml'
            const tableBin = `build/${dict}.table.bin`
            const reverseBin = `build/${dict}.reverse.bin`
            const prismBin = `build/${prism}.prism.bin`
            for (const bin of [defaultYaml, schemaYaml, tableBin, reverseBin, prismBin]) {
              keptFiles.includes(bin) || keptFiles.push(bin)
            }
          }
        } catch {}
      }
    }
  }
  await Promise.all(prerequisites.map(prerequisite => add(new LocalLoader(prerequisite, []))))
  await add(new LocalLoader('', selected.value))
  await traverseFS(FS, undefined, async (path: string) => {
    const file = path.slice(6) // Trim /rime/ prefix
    const match = file.match(/^(\S+)\.userdb\/\S+$/)
    if (!keptFiles.includes(file) && (!match || !keptFiles.includes(`${match[1]}.dict.yaml`))) {
      await FS.unlink(path)
    }
  }, (path: string) => FS.rmdir(path).catch(() => {}))(RIME_PATH)
  options.value = await getOptions(await getAvailableSchemas())
}

async function onDeploy () {
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
    <n-space style="justify-content: end">
      <n-button
        :disabled="selected.length === options.length"
        secondary
        type="error"
        @click="onTrash"
      >
        Purge unused
      </n-button>
      <n-button
        :disabled="selected.length === 0"
        secondary
        type="info"
        @click="onDeploy"
      >
        Deploy
      </n-button>
    </n-space>
  </n-space>
</template>
