import { LambdaWorker } from '@libreservice/my-worker'

const worker = new LambdaWorker('./worker.js')

const setIME: (ime: string) => Promise<void> = worker.register('setIME')
const setOption: (option: string, value: boolean) => Promise<void> = worker.register('setOption')
const process: (input: string) => Promise<string> = worker.register('process')

export { setOption, process, setIME }
