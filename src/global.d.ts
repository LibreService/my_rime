declare global {
  const Module: {
    onRuntimeInitialized: () => void
    ccall: (name: string, returnType: string, argsType: string[], args: any[]) => any
  }
  type RIME_COMMITTED = {
    state: 0
    committed: string
  }
  type RIME_ACCEPTED = {
    state: 1
    head: string
    body: string,
    tail: string,
    page: number
    isLastPage: boolean
    highlighted: number
    candidates: string[]
  }
  type RIME_REJECTED = {
    state: 2
  }
  type RIME_RESULT = RIME_COMMITTED | RIME_ACCEPTED | RIME_REJECTED
  type RIME_OPTION = 'ascii_mode' | 'zh_simp' | 'full_shape' | 'ascii_punct'
}

export {}
