declare global {
  const Module: {
    FS: {
      lookupPath: (path: string) => void
      mkdir: (path: string) => void
      writeFile: (path: string, content: Uint8Array) => void
    }
    ccall: (name: string, returnType: string, argsType: string[], args: any[]) => any
  }
  type RIME_COMMITTED = {
    state: 0
    committed: string
  }
  type RIME_ACCEPTED = {
    state: 1
    committed?: string,
    head: string
    body: string,
    tail: string,
    page: number
    isLastPage: boolean
    highlighted: number
    candidates: {
      text: string
      comment: string
    }[]
  }
  type RIME_REJECTED = {
    state: 2
  }
  type RIME_RESULT = RIME_COMMITTED | RIME_ACCEPTED | RIME_REJECTED
}

export {}
