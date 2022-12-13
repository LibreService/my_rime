<script setup lang="ts">
import { NButton, NButtonGroup, NIcon } from 'naive-ui'
import { WeatherMoon16Regular, Circle16Regular } from '@vicons/fluent'
import { isEnglish, isSimplified, isFullWidth, isEnglishPunctuation, changeLanguage, changeFont, changeWidth, changePunctuation } from '../control'
import { getTextarea } from '../util'

const props = defineProps<{
  textareaSelector: string
}>()

function resetFocus () {
  getTextarea(props.textareaSelector).focus()
}
</script>

<template>
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
</template>
