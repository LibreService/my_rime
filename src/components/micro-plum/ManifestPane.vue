<script setup lang="ts">
import { ref, h, computed, watch } from 'vue'
import {
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NTreeSelect,
  TreeSelectOption,
  NButton,
  NTag,
  NCheckboxGroup,
  NCheckbox,
  NA,
  useMessage
} from 'naive-ui'
import {
  PARENT_INDEX,
  RECIPE,
  CHILD_INDEX
} from 'rppi'
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
import RepoLink from './RepoLink.vue'

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
const reverseDependencies = computed(() => (selectedKey.value && keyRecipeMap[selectedKey.value].reverseDependencies) || [])
const selectedReverseDependencies = ref<string[]>([])

watch(selectedKey, () => {
  selectedReverseDependencies.value = []
})

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

function installRepo (repo: string) {
  const recipe = keyRecipeMap[repoKeyMap[repo]]
  const target = recipe.branch ? `${repo}@${recipe.branch}` : repo
  return install(target, { schemaIds: recipe.schemas })
}

async function onClick () {
  downloading.value = true
  try {
    if (!installedPrerequisites.value) {
      await Promise.all(prerequisites.map(prerequisite => install(prerequisite)))
      installedPrerequisites.value = true
    }
    const { repo, dependencies } = keyRecipeMap[selectedKey.value!]
    if (dependencies) {
      await Promise.all(dependencies.map(dependency => installRepo(dependency)))
    }
    await installRepo(repo)
    await Promise.all(selectedReverseDependencies.value.map(dependency => installRepo(dependency)))
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
    nodes.push(h(RepoLink, { repo, license }))
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
      >
        <template
          v-if="_rppi == RPPI"
          #action
        >
          Submit a PR at <n-a
            href="https://github.com/rime/rppi"
            target="_blank"
          >
            rime/rppi
          </n-a> to include more schemas!
        </template>
      </n-tree-select>
    </n-form-item>
    <n-form-item
      v-if="reverseDependencies.length"
      label="Reverse-lookup dependencies"
    >
      <n-checkbox-group v-model:value="selectedReverseDependencies">
        <div
          v-for="dependency of reverseDependencies"
          :key="dependency"
          style="display: flex; justify-content: space-between"
        >
          <n-checkbox
            :label="keyRecipeMap[repoKeyMap[dependency]].name"
            :value="dependency"
          />
          <repo-link
            :repo="dependency"
            :license="keyRecipeMap[repoKeyMap[dependency]].license"
          />
        </div>
      </n-checkbox-group>
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
