function ensure (result) {
  if (result.status !== 0) {
    throw new Error('Command fails.')
  }
  return result
}

export { ensure }
