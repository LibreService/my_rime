import { LambdaWorker, asyncFS } from '@libreservice/my-worker'

const worker = new LambdaWorker('./worker.js')

const setIME: (ime: string) => Promise<void> = worker.register('setIME')
const setOption: (option: string, value: boolean) => Promise<void> = worker.register('setOption')
const setPageSize: (size: number) => Promise<void> = worker.register('setPageSize')
const deploy: () => Promise<void> = worker.register('deploy')
const process: (input: string) => Promise<RIME_RESULT> = worker.register('process')
const selectCandidateOnCurrentPage: (index: number) => Promise<string> = worker.register('selectCandidateOnCurrentPage')
const changePage: (backward: boolean) => Promise<string> = worker.register('changePage')
const resetUserDirectory: () => Promise<void> = worker.register('resetUserDirectory')
const FS = asyncFS(worker)

export {
  worker,
  FS,
  resetUserDirectory,
  setOption,
  setPageSize,
  deploy,
  process,
  selectCandidateOnCurrentPage,
  changePage,
  setIME
}
