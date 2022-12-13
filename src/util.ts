import { computed } from 'vue'
import { useBreakpoint } from 'vooks'

const breakpoint = useBreakpoint()
const isMobile = computed(() => breakpoint.value === 'xs')

function getTextarea (selector: string) {
  return document.querySelector(selector) as HTMLTextAreaElement
}

export { isMobile, getTextarea }
