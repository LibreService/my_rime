<script setup lang="ts">
import { nextTick, ref, toRef, onMounted, onUnmounted } from 'vue'
import { NPopover, NMenu, MenuOption, NText, NButton, NIcon } from 'naive-ui'
import { CaretLeft, CaretRight } from '@vicons/fa'
// @ts-ignore
import getCaretCoordinates from 'textarea-caret'
import { process } from '../workerAPI'
import { changeLanguage } from '../control'
import { isMobile, getTextarea } from '../util'

const props = defineProps<{
  textareaSelector: string
  text: string
  updateText:(newText: string) => void
}>()

/* eslint-disable vue/no-setup-props-destructure */
const { textareaSelector, updateText } = props
/* eslint-enable vue/no-setup-props-destructure */
const text = toRef(props, 'text')

const mouseX = ref<number>(0)
const mouseY = ref<number>(0)
const dragging = ref<boolean>(false)
const dragged = ref<boolean>(false)
const x = ref<number>(0)
const y = ref<number>(0)

const preEditHead = ref<string>('')
const preEditBody = ref<string>('')
const preEditTail = ref<string>('')

const menuOptions = ref<MenuOption[]>([])
const highlighted = ref<string>('1')

const prevDisabled = ref<boolean>(true)
const nextDisabled = ref<boolean>(false)

const editing = ref<boolean>(false)
const showMenu = ref<boolean>(false)
const exclusiveShift = ref<boolean>(false)

const modifiers = ['Control', 'Alt']

const RIME_KEY_MAP = {
  Escape: 'Escape',
  Backspace: 'BackSpace',
  Delete: 'Delete',
  Enter: 'Return',
  Home: 'Home',
  End: 'End',
  PageUp: 'Page_Up',
  PageDown: 'Page_Down',
  ArrowUp: 'Up',
  ArrowRight: 'Right',
  ArrowDown: 'Down',
  ArrowLeft: 'Left'
}

function isPrintable (key: string) {
  return /^[a-z0-9!"#$%&'()*+,./:;<=>?@[\] ^_`{|}~\\-]$/i.test(key)
}

function insert (toInsert: string) {
  const textarea = getTextarea(textareaSelector)
  const { selectionStart, selectionEnd } = textarea
  updateText(text.value.slice(0, selectionStart) + toInsert + text.value.slice(selectionEnd))
  nextTick(() => {
    textarea.selectionEnd = selectionStart + toInsert.length
  })
}

async function input (rimeKey: string) {
  const result = JSON.parse(await process(rimeKey)) as RIME_RESULT
  if (result.state === 0) { // COMMITTED
    editing.value = false
    showMenu.value = false
    dragged.value = false
    insert(result.committed)
  } else if (result.state === 1) { // ACCEPTED
    preEditHead.value = result.head
    preEditBody.value = result.body
    preEditTail.value = result.tail
    highlighted.value = (result.highlighted + 1).toString()
    menuOptions.value = result.candidates.map((candidate, i) => ({
      label: `${i + 1} ${candidate}`,
      key: (i + 1).toString()
    }))
    prevDisabled.value = result.page === 0
    nextDisabled.value = result.isLastPage
    showMenu.value = true
  } else { // REJECTED
    editing.value = false
    showMenu.value = false
    if (isPrintable(rimeKey)) {
      insert(rimeKey)
    }
  }
  getTextarea(textareaSelector).focus()
}

function onKeydown (e: KeyboardEvent) {
  const { key } = e
  if (key === 'Shift') {
    exclusiveShift.value = true
    return
  }
  exclusiveShift.value = false
  const isPrintableKey = isPrintable(key)
  const textarea = getTextarea(textareaSelector)
  // In edit mode, rime handles every keydown;
  // In non-edit mode, only when the textarea is focused and a printable key is down will activate rime.
  if (!editing.value && (document.activeElement !== textarea || !isPrintableKey)) {
    return
  }
  for (const modifier of modifiers) {
    if (e.getModifierState(modifier)) {
      return
    }
  }
  let rimeKey: string | undefined
  if (isPrintableKey) {
    rimeKey = key
  } else if (e.getModifierState('Shift') && key === 'Delete') {
    rimeKey = '{Shift+Delete}'
  } else {
    for (const [k, v] of Object.entries(RIME_KEY_MAP)) {
      if (key === k) {
        rimeKey = `{${v}}`
      }
    }
  }
  if (rimeKey === undefined) {
    return
  }
  if (!dragged.value) {
    const box = textarea.getBoundingClientRect()
    const caret: { top: number, left: number, height: number } = getCaretCoordinates(textarea, textarea.selectionStart)
    x.value = box.x + caret.left
    y.value = isMobile.value ? 8 : box.y + caret.top + caret.height - textarea.scrollTop
  }
  editing.value = true
  e.preventDefault()
  input(rimeKey)
}

function onKeyup (e: KeyboardEvent) {
  if (e.key === 'Shift' && exclusiveShift.value) {
    changeLanguage()
  }
  exclusiveShift.value = false
}

function onClick (key: string) {
  input(key)
}

function singleTouch (e: TouchEvent) {
  return e.touches.length === 1 ? e.touches[0] : undefined
}

function handleDown (clientX: number, clientY: number) {
  mouseX.value = clientX
  mouseY.value = clientY
  // As flip is turned on, update x to actual position to avoid layout shift on click
  const panel = document.querySelector('.n-popover')!
  x.value = panel.getBoundingClientRect().left
  dragging.value = true
}

function onMousedown (e: MouseEvent) {
  handleDown(e.clientX, e.clientY)
}

function onTouchstart (e: TouchEvent) {
  const touch = singleTouch(e)
  touch && handleDown(touch.clientX, touch.clientY)
}

function handleMove (clientX: number, clientY: number) {
  if (!dragging.value) {
    return
  }
  dragged.value = true
  x.value += clientX - mouseX.value
  y.value += clientY - mouseY.value
  mouseX.value = clientX
  mouseY.value = clientY
}

function onMousemove (e: MouseEvent) {
  handleMove(e.clientX, e.clientY)
}

function onTouchmove (e: TouchEvent) {
  const touch = singleTouch(e)
  touch && handleMove(touch.clientX, touch.clientY)
}

function onMouseupOrTouchend () {
  dragging.value = false
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('keyup', onKeyup)
  document.addEventListener('mousemove', onMousemove)
  document.addEventListener('touchmove', onTouchmove)
  document.addEventListener('mouseup', onMouseupOrTouchend)
  document.addEventListener('touchend', onMouseupOrTouchend)
})

onUnmounted(() => { // Cleanup for HMR
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('keyup', onKeyup)
  document.removeEventListener('mousemove', onMousemove)
  document.removeEventListener('touchmove', onTouchmove)
  document.removeEventListener('mouseup', onMouseupOrTouchend)
  document.removeEventListener('touchend', onMouseupOrTouchend)
})
</script>

<template>
  <n-popover
    :show="showMenu"
    :show-arrow="false"
    :x="x"
    :y="y"
    :flip="!dragging"
    placement="bottom-start"
    trigger="manual"
    style="cursor: move"
    @mousedown="onMousedown"
    @touchstart="onTouchstart"
  >
    <n-text type="success">
      {{ preEditHead }}
    </n-text>&nbsp;
    <n-text type="info">
      {{ preEditBody }}
    </n-text>&nbsp;
    {{ preEditTail }}
    <br>
    <n-menu
      v-show="menuOptions.length"
      :options="menuOptions"
      :mode="isMobile ? 'vertical' : 'horizontal'"
      :value="highlighted"
      @update:value="onClick"
    />
    <br>
    <n-button
      text
      :disabled="prevDisabled"
    >
      <n-icon
        :component="CaretLeft"
        @click="input('-')"
      />
    </n-button>
    <n-button
      text
      :disabled="nextDisabled"
    >
      <n-icon
        :component="CaretRight"
        @click="input('=')"
      />
    </n-button>
  </n-popover>
</template>
