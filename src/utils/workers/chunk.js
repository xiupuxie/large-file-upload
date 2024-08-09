import { createChunkWithHash } from '../chunk'

self.onmessage = (e) => {
  const { file, chunkSize, startChunkIndex, endChunkIndex } = e.data
  for (let i = startChunkIndex; i < endChunkIndex; i++) {
    createChunkWithHash(file, i, chunkSize).then((res) => {
      postMessage({ chunkIndex: i, chunk: res })
    })
  }
}
