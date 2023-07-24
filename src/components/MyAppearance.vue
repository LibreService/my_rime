<script setup lang="ts">
import { NSpace, NCheckbox } from 'naive-ui'
import { forceVertical } from '../control'
</script>

<template>
  <n-space>
    Appearance
    <n-checkbox v-model:checked="forceVertical">
      Force vertical
    </n-checkbox>
  </n-space>
</template>
