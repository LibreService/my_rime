<script setup lang="ts">
import { ref, h } from 'vue'
import { NForm, NFormItem, NInput, NSpace, NTreeSelect, TreeSelectOption, NButton, NTag, NText, useMessage } from 'naive-ui'
import { LazyCache } from '@libreservice/lazy-cache'
import {
  prerequisites,
  install
} from '../../micro-plum'
import {
  RPPI,
  _rppi,
  tab,
  downloading,
  installedPrerequisites
} from './MicroPlum.vue'

let rppi = _rppi.value

const INDEX = 'index.json'
const lazyCache = new LazyCache('rppi')
const decoder = new TextDecoder('utf-8', { fatal: true })
let date = ''
const labelMap = {
  chord: '并击',
  lua: 'Lua'
}

const loadingIndex = ref<boolean>(false)

type PARENT_INDEX = {
  categories: {
    key: string
    name: string
  }[]
}

type RECIPE = {
  repo: string
  branch?: string
  name: string
  labels?: (keyof typeof labelMap)[]
  schemas: string[]
  dependencies?: string[]
  license?: string
}

type CHILD_INDEX = {
  recipes: RECIPE[]
}

const props = defineProps<{
  message: ReturnType<typeof useMessage>
}>()

const repoKeyMap: {
  [key: string]: string
} = {}

const keyRecipeMap: {
  [key: string]: RECIPE
} = {}

const rules = {
  rppi: {
    trigger: ['blur'],
    validator: async () => {
      let error
      if (!/^https?:\/\/\S*\/index.json$/.test(_rppi.value)) {
        if (_rppi.value) {
          error = new Error('Invalid RPPI source')
        }
        _rppi.value = RPPI
      }
      if (rppi !== _rppi.value) {
        rppi = _rppi.value
        await lazyCache.invalidate()
        await updateIndex()
      }
      if (error) {
        throw error
      }
    }
  }
}

const selectedKey = ref<string | undefined>()

async function fetchJson (key: string, time: string) {
  const url = `${rppi.slice(0, rppi.lastIndexOf('/'))}/${key}`
  const ab = await lazyCache.get(key, time, url)
  return JSON.parse(decoder.decode(new Uint8Array(ab)))
}

const options = ref<TreeSelectOption[]>([])

async function handleLoad (option: TreeSelectOption) {
  const index = await fetchJson(`${option.key}/${INDEX}`, date) as PARENT_INDEX | CHILD_INDEX
  if ('categories' in index) {
    option.children = await Promise.all(index.categories.map(async category => {
      const subOption = {
        label: category.name,
        key: `${option.key}/${category.key}`,
        isLeaf: false
      }
      await handleLoad(subOption)
      return subOption
    }))
  } else {
    option.children = []
    for (const recipe of index.recipes) {
      const key = `${option.key}/${recipe.repo}`
      repoKeyMap[recipe.repo] = key
      keyRecipeMap[key] = recipe
      option.children.push({
        label: recipe.name,
        key,
        isLeaf: true
      })
    }
  }
}

function filterRepo (pattern: string, option: TreeSelectOption) {
  return (option.key as string).toLowerCase().includes(pattern.toLowerCase())
}

async function updateIndex () {
  loadingIndex.value = true
  const _options = []
  options.value = []
  try {
    const index = await fetchJson(INDEX, Math.round(new Date().getTime() / 86400000).toString()) as {
    date: string
  } & PARENT_INDEX // cache for today
    date = index.date
    for (const category of index.categories) {
      const option = {
        label: category.name,
        key: category.key,
        isLeaf: false
      }
      await handleLoad(option)
      _options.push(option)
    }
    options.value = _options
  } finally {
    loadingIndex.value = false
  }
}

updateIndex()

async function onClick () {
  downloading.value = true
  try {
    if (!installedPrerequisites.value) {
      await Promise.all(prerequisites.map(prerequisite => install(prerequisite)))
      installedPrerequisites.value = true
    }
    const { repo, branch, schemas, dependencies } = keyRecipeMap[selectedKey.value!]
    if (dependencies) {
      await Promise.all(dependencies.map(dependency => {
        const recipe = keyRecipeMap[repoKeyMap[dependency]]
        const target = recipe.branch ? `${recipe.repo}@${recipe.branch}` : recipe.repo
        return install(target, { schemaIds: recipe.schemas })
      }))
    }
    const target = branch ? `${repo}@${branch}` : repo
    await install(target, { schemaIds: schemas })
    tab.value = 'deploy'
  } catch (e) {
    console.error(e)
    props.message.error((e as Error).message)
  }
  downloading.value = false
}

function renderSuffix (info: { option: TreeSelectOption }) {
  if (info.option.key as string in keyRecipeMap) {
    const nodes: ReturnType<typeof h>[] = []
    const { repo, labels, license } = keyRecipeMap[info.option.key as string]
    labels?.forEach(label => nodes.push(h(NTag, {
      type: 'info',
      size: 'small',
      bordered: false
    }, () => [labelMap[label] || label])))
    nodes.push(h(NText, {
      type: license ? 'success' : 'warning',
      title: license ? 'Free' : 'Proprietary'
    }, () => repo))
    return h(NSpace, {}, () => nodes)
  }
}
</script>

<template>
  <n-form
    :disabled="downloading"
    :rules="rules"
  >
    <n-form-item
      label="RPPI source"
      path="rppi"
    >
      <n-input
        v-model:value="_rppi"
        clearable
      />
    </n-form-item>
    <n-form-item label="Schema">
      <n-tree-select
        v-model:value="selectedKey"
        :loading="loadingIndex"
        check-strategy="child"
        filterable
        :filter="filterRepo"
        :options="options"
        :render-suffix="renderSuffix"
      />
    </n-form-item>
  </n-form>
  <div style="display: flex; justify-content: end">
    <n-button
      secondary
      type="info"
      :disabled="!selectedKey || downloading"
      @click="onClick"
    >
      Install
    </n-button>
  </div>
</template>
