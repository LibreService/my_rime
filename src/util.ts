import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBreakpoint } from 'vooks'

const breakpoint = useBreakpoint()
const isMobile = computed(() => breakpoint.value === 'xs')

function getTextarea (selector: string) {
  return document.querySelector(selector) as HTMLTextAreaElement
}

function getQueryString (key: string) {
  const route = useRoute()
  const queryValue = route.query[key]
  const param = typeof queryValue === 'string' ? queryValue : ''
  return param || localStorage.getItem(key) || ''
}

export { isMobile, getTextarea, getQueryString }
