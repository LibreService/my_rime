import { computed } from 'vue'
import { useRoute, LocationQuery } from 'vue-router'
import { useBreakpoint } from 'vooks'

let query: LocationQuery

function setQuery (_query: LocationQuery) {
  query = _query
}

const breakpoint = useBreakpoint()
const isMobile = computed(() => breakpoint.value === 'xs')

function getTextarea (selector: string) {
  return document.querySelector(selector) as HTMLTextAreaElement
}

let route: ReturnType<typeof useRoute> | undefined

function getQueryString (key: string) {
  console.log(query)
  if (!route) {
    route = useRoute()
  }
  const queryValue = route.query[key]
  const param = typeof queryValue === 'string' ? queryValue : ''
  return param || localStorage.getItem(key) || ''
}

export {
  isMobile,
  setQuery,
  getTextarea,
  getQueryString
}
