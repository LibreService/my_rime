<script setup lang="ts">
import { ref } from 'vue'
import {
  useMessage,
  NForm,
  NFormItem,
  NRadioGroup,
  NRadio,
  NInput,
  NDynamicTags,
  NCheckbox,
  NButton,
  NIcon
} from 'naive-ui'
import { Add12Regular } from '@vicons/fluent'
import { normalizeTarget, Recipe } from '@libreservice/micro-plum'
import { FS } from '../../workerAPI'
import {
  rimePath,
  schemaPattern,
  tab,
  source,
  mode,
  downloading,
  installedPrerequisites,
  preSelectedSchemas
} from './MicroPlum.vue'

const props = defineProps<{
  message: ReturnType<typeof useMessage>
}>()

const form = ref<InstanceType<typeof NForm>>()

const prerequisites = ['rime/rime-essay', 'rime/rime-prelude', 'rime/rime-emoji']

const schemaURL = ref<string>('')
const target = ref<string>('')
const schemas = ref<string[]>([])
const installPrerequisites = ref<boolean>(!installedPrerequisites.value)
const installPrerequisitePrompt = `${installedPrerequisites.value ? 'Reinstall' : 'Install'} essay, prelude and emoji`

const rules = {
  target: {
    trigger: ['blur'],
    validator: () => {
      if (mode.value !== 'plum') {
        return
      }
      const error = new Error('Invalid plum target')
      if (target.value) {
        const normalized = normalizeTarget(target.value)
        if (!normalized || normalized.schema) {
          return error
        }
      } else if (!installPrerequisites.value) {
        return error
      }
    }
  },
  schemas: {
    validator: () => {
      if (mode.value !== 'plum') {
        return
      }
      for (const schema of schemas.value) {
        if (!schemaPattern.test(schema)) {
          return new Error(`Invalid schema id: ${schema}`)
        }
      }
      if (schemas.value.length === 0 &&
        target.value &&
        !prerequisites.includes(normalizeTarget(target.value)?.repo!)) {
        return new Error('Please provide at least one schema')
      }
    }
  },
  schemaURL: {
    trigger: ['blur'],
    validator: () => {
      if (mode.value !== 'schema') {
        return
      }
      if ((schemaURL.value && !normalizeTarget(schemaURL.value)?.schema) ||
        (!schemaURL.value && !installPrerequisites.value)) {
        return new Error('Invalid URL')
      }
    }
  }
}

async function ensureDir (path: string) {
  let i = 1
  while (i = path.indexOf('/', i) + 1, i > 0) { // eslint-disable-line no-sequences
    const dir = path.slice(0, i)
    try {
      await FS.lstat(dir)
    } catch {
      await FS.mkdir(dir)
    }
  }
}

async function install (target: string, schemaIds?: string[]) {
  const recipe = new Recipe(target, {
    source: source.value,
    schemaIds,
    onDownloadFailure (url: string, reason: number | string) {
      props.message.error(`Fail to download ${url.slice(url.lastIndexOf('/') + 1)}: ${reason}`)
    }
  })
  const manifest = await recipe.load()
  for (const { file, content } of manifest) {
    if (content) {
      const path = rimePath + file
      await ensureDir(path)
      await FS.writeFile(path, content)
    }
  }
  preSelectedSchemas.value = recipe.schemaIds
}

async function onClick () {
  try {
    await form.value!.validate()
  } catch {
    return
  }
  downloading.value = true
  try {
    if (installPrerequisites.value) {
      installedPrerequisites.value = true
      await Promise.all(prerequisites.map(prerequisite => install(prerequisite, [])))
    }
    if (mode.value === 'plum' && target.value) {
      await install(target.value, schemas.value)
    } else if (mode.value === 'schema' && schemaURL.value) {
      await install(schemaURL.value)
    }
    tab.value = 'deploy'
  } catch (e) {
    console.error(e)
    props.message.error((e as Error).message)
  }
  downloading.value = false
}
</script>

<template>
  <n-form
    ref="form"
    :disabled="downloading"
    :rules="rules"
  >
    <n-form-item label="Source">
      <n-radio-group v-model:value="source">
        <n-radio
          v-for="src of ['GitHub', 'jsDelivr']"
          :key="src"
          :value="src"
        >
          {{ src }}
        </n-radio>
      </n-radio-group>
    </n-form-item>
    <n-form-item label="Mode">
      <n-radio-group v-model:value="mode">
        <n-radio value="schema">
          Schema
        </n-radio>
        <n-radio value="plum">
          Plum
        </n-radio>
      </n-radio-group>
    </n-form-item>
    <n-form-item
      v-show="mode === 'plum'"
      label="Target"
      path="target"
    >
      <n-input
        v-model:value="target"
        placeholder="e.g. rime/rime-luna-pinyin"
      />
    </n-form-item>
    <n-form-item
      v-show="mode === 'plum'"
      label="Schemas"
      path="schemas"
    >
      <n-dynamic-tags v-model:value="schemas">
        <template #trigger="{ activate, disabled }">
          <n-button
            size="small"
            type="info"
            dashed
            :disabled="disabled"
            @click="activate()"
          >
            <template #icon>
              <n-icon :component="Add12Regular" />
            </template>
            e.g. luna_pinyin
          </n-button>
        </template>
      </n-dynamic-tags>
    </n-form-item>
    <n-form-item
      v-show="mode === 'schema'"
      label="Schema URL"
      path="schemaURL"
    >
      <n-input
        v-model:value="schemaURL"
        placeholder="GitHub URL of *.schema.yaml"
      />
    </n-form-item>
    <n-form-item label="Extra">
      <n-checkbox v-model:checked="installPrerequisites">
        {{ installPrerequisitePrompt }}
      </n-checkbox>
    </n-form-item>
  </n-form>
  <div style="display: flex; justify-content: end">
    <n-button
      secondary
      type="info"
      :disabled="downloading"
      @click="onClick"
    >
      Install
    </n-button>
  </div>
</template>
