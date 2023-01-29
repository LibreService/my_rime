<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NButtonGroup, NIcon, NSpace, NSelect } from 'naive-ui'
import { WeatherMoon16Regular, Circle16Regular } from '@vicons/fluent'
import { isEnglish, isSimplified, isFullWidth, isEnglishPunctuation, changeLanguage, changeFont, changeWidth, changePunctuation } from '../control'
import { getTextarea } from '../util'
import { setIME } from '../workerAPI'
import schemas from '../../schemas.json'

const luna = 'luna_pinyin'

const ime = ref<string>(luna)
const options = (schemas as {
  id: string
  name: string
}[]).map(schema => ({
  label: schema.name,
  value: schema.id
}))
const loading = ref<boolean>(false)

async function selectIME (targetIME: string) {
  resetFocus()
  loading.value = true
  try {
    await setIME(targetIME)
    ime.value = targetIME
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

const props = defineProps<{
  textareaSelector: string
}>()

function resetFocus () {
  getTextarea(props.textareaSelector).focus()
}
</script>

<template>
  <n-space>
    <n-select
      style="width: 160px"
      :value="ime"
      :options="options"
      :loading="loading"
      @update:value="selectIME"
    />
    <n-button-group
      class="square-group"
      @click="resetFocus"
    >
      <n-button
        secondary
        @click="changeLanguage"
      >
        {{ isEnglish ? 'En' : '中' }}
      </n-button>
      <n-button
        secondary
        :disabled="isEnglish"
        @click="changeFont"
      >
        {{ isSimplified ? '简' : '繁' }}
      </n-button>
      <n-button
        secondary
        @click="changeWidth"
      >
        <template #icon>
          <n-icon :component="isFullWidth ? Circle16Regular : WeatherMoon16Regular" />
        </template>
      </n-button>
      <n-button
        secondary
        :disabled="isEnglish"
        @click="changePunctuation"
      >
        {{ isEnglishPunctuation ? '.' : '。' }}
      </n-button>
    </n-button-group>
  </n-space>
</template>
