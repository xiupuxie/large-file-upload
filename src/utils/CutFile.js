import { EventEmitter } from './emitter'
import { createChunks } from './chunk'
import { promiseWithResolvers } from './withResolvers'

export const EVENT_MAP = Object.freeze({
  CAL_FILE_HASH_FINISH: 'cal-file-hash-finish',
  CUT_CHUNK: 'cut-chunk',
  CUT_FINISH: 'cut-finish'
})

export class CutFile extends EventEmitter {

  constructor(file, chunkSize) {
    super()
    this.file = file
    this.chunkSize = chunkSize || 1024 * 1024 * 5
    if (file instanceof File) {
      this.calFileHash()
      this.cutWithoutFileHash()
    }
  }

  get threadCount() {
    const count = navigator.hardwareConcurrency || 1
    return Math.max(1, count)
  }

  get chunkCount() {
    const { file, chunkSize } = this
    if (file instanceof File) {
      return Math.ceil(file.size / chunkSize)
    }
    return 0
  }

  get threadChunksCount() {
    const { chunkCount, threadCount } = this
    if (!chunkCount) return 0
    return Math.ceil(chunkCount / threadCount)
  }

  cutInWorker({ file, chunkSize, startChunkIndex, endChunkIndex, onChunk }) {
    const { promise, resolve } = promiseWithResolvers()
    const result = {}
    let count = endChunkIndex - startChunkIndex
    const worker = new Worker(new URL('./workers/chunk.js', import.meta.url), { type: 'module' })
    worker.postMessage({ file, chunkSize, startChunkIndex, endChunkIndex })
    worker.onmessage = (e) => {
      const { chunkIndex, chunk } = e.data
      result[chunkIndex] = chunk
      count--
      if (count === 0) {
        worker.terminate()
        resolve(result)
      }
      if (typeof onChunk === 'function') {
        onChunk(chunkIndex, chunk)
      }
    }
    return promise
  }

  calFileHash() {
    const { file, chunkSize } = this
    const { promise, resolve } = promiseWithResolvers()
    const onFinish = (hash) => { this.emit(EVENT_MAP.CAL_FILE_HASH_FINISH, hash) }
    const chunks = createChunks(file, chunkSize)
    const worker = new Worker(
      new URL('./workers/file-hash.js', import.meta.url),
      { type: 'module' }
    )
    worker.postMessage({ chunks })
    worker.onmessage = (e) => {
      const hash = e.data
      worker.terminate()
      resolve(hash)
      onFinish(hash)
    }
    return promise
  }

  cutWithoutFileHash() {
    const { threadCount, chunkCount, threadChunksCount, chunkSize, file, cutInWorker } = this
    const onChunk = (index, chunk) => { this.emit(EVENT_MAP.CUT_CHUNK, index, chunk) }
    const onFinish = (chunks) => { this.emit(EVENT_MAP.CUT_FINISH, chunks) }

    const proms = []
    for (let i = 0; i < threadCount; i++) {
      const startChunkIndex = i * threadChunksCount
      const endChunkIndex = Math.min((i + 1) * threadChunksCount, chunkCount)
      proms.push(cutInWorker({ file, chunkSize, startChunkIndex, endChunkIndex, onChunk }))
      if (endChunkIndex >= chunkCount) break;
    }

    return Promise.all(proms).then((res) => {
      const arrayLike = res.reduce((prev, next) => {
        return {
          ...prev,
          ...next
        }
      }, { length: chunkCount })

      const chunks = Array.from(arrayLike)
      onFinish(chunks)
      return chunks
    })
  }

}
