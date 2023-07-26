<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { NSpace, NCheckbox, NSelect } from 'naive-ui'
import { forceVertical } from '../control'
import { setPageSize } from '../workerAPI'

const PAGE_SIZE = 'pageSize'
const pageSize = ref<number>(Number(localStorage.getItem(PAGE_SIZE)) || 0)

watchEffect(() => {
  localStorage.setItem(PAGE_SIZE, pageSize.value.toString())
  setPageSize(pageSize.value)
})

const options = [
  { label: 'default', value: 0 },
  ...Array.from({ length: 10 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1 }))
]
</script>

<template>
  <n-space style="align-items: center">
    <h3>Appearance</h3>
    <n-checkbox v-model:checked="forceVertical">
      Force vertical
    </n-checkbox>
    <n-space style="align-items: center">
      Number of candidates
      <n-select
        v-model:value="pageSize"
        style="width: 96px"
        :options="options"
      />
    </n-space>
  </n-space>
</template>
