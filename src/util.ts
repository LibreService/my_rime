import { computed } from 'vue'
import { LocationQuery } from 'vue-router'
import { useBreakpoint } from 'vooks'

let query: LocationQuery

function setQuery (_query: LocationQuery) {
  query = _query
}

const breakpoint = useBreakpoint()
const isMobile = computed(() => breakpoint.value === 'xs')

const textareaSelector = '#container textarea'

function getTextarea () {
  return document.querySelector(textareaSelector) as HTMLTextAreaElement
}

function getQueryString (key: string) {
  const queryValue = query[key]
  return typeof queryValue === 'string' ? queryValue : ''
}

function getQueryOrStoredString (key: string) {
  return getQueryString(key) || localStorage.getItem(key) || ''
}

export {
  isMobile,
  setQuery,
  getTextarea,
  getQueryString,
  getQueryOrStoredString
}
