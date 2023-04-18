import { LambdaWorker, asyncFS } from '@libreservice/my-worker'

const worker = new LambdaWorker('./worker.js')

const setIME: (ime: string) => Promise<void> = worker.register('setIME')
const setOption: (option: string, value: boolean) => Promise<void> = worker.register('setOption')
const deploy: () => Promise<void> = worker.register('deploy')
const process: (input: string) => Promise<string> = worker.register('process')
const FS = asyncFS(worker)

export {
  worker,
  FS,
  setOption,
  deploy,
  process,
  setIME
}
