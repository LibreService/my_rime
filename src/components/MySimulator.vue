<script lang="ts">
import { ref } from 'vue'
import { NInput } from 'naive-ui'

interface Props {
  debug?: (e: KeyboardEvent, rimeKey: string) => void
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<Props>(), {
  debug: () => {}
})

const debugMode = ref<boolean>(false)
const debugCode = ref<string>('')

function onEnter (e: KeyboardEvent) {
  props.debug(e, debugCode.value)
}

defineExpose({
  debugMode
})
</script>

<template>
  <n-input
    v-model:value="debugCode"
    clearable
    placeholder="Send key sequence to librime"
    @keyup.enter="onEnter"
    @focus="debugMode = true"
    @blur="debugMode = false"
  />
</template>
