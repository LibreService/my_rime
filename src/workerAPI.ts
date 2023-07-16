import { LambdaWorker, asyncFS } from '@libreservice/my-worker'

const worker = new LambdaWorker('./worker.js')

const setIME: (ime: string) => Promise<void> = worker.register('setIME')
const setOption: (option: string, value: boolean) => Promise<void> = worker.register('setOption')
const deploy: () => Promise<void> = worker.register('deploy')
const process: (input: string) => Promise<RIME_RESULT> = worker.register('process')
const selectCandidateOnCurrentPage: (index: number) => Promise<string> = worker.register('selectCandidateOnCurrentPage')
const resetUserDirectory: () => Promise<void> = worker.register('resetUserDirectory')
const FS = asyncFS(worker)

export {
  worker,
  FS,
  resetUserDirectory,
  setOption,
  deploy,
  process,
  selectCandidateOnCurrentPage,
  setIME
}
