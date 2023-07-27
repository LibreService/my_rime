function getLanguage () {
  let language: Language | undefined
  let index = 0
  for (const lang of ['zh-CN', 'zh-TW', 'zh-HK', 'zh-SG'] as Language[]) {
    const i = navigator.languages.indexOf(lang)
    if (i >= 0 && (!language || i < index)) {
      language = lang
      index = i
    }
  }
  return language || 'zh-CN'
}

export { getLanguage }
