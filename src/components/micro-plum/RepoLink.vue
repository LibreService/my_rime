<script setup lang="ts">
import { NText, NA } from 'naive-ui'

defineProps<{
  repo: string
  license?: string
}>()

function repo2gh (repo: string) {
  return `https://github.com/${repo}`
}
</script>

<template>
  <n-a
    :href="repo2gh(repo)"
    target="_blank"
    style="text-decoration: none"
  >
    <n-text
      :type="license ? 'success' : 'warning'"
      :title="license ? 'Free' : 'Proprietary'"
    >
      {{ repo }}
    </n-text>
  </n-a>
</template>
