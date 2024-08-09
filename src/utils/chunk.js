import { calcHash } from './hash.js'

export function createChunk(file, index, chunkSize) {
  const start = index * chunkSize
  const end = Math.min(start + chunkSize, file.size)
  const blob = file.slice(start, end)

  return { blob, index, start, end, hash: '', }
}

export function createChunks(file, chunkSize) {
  const chunks = []
  const chunkCount = Math.ceil(file.size / chunkSize)
  for (let i = 0; i < chunkCount; i++) {
    chunks.push(createChunk(file, i, chunkSize))
  }
  return chunks
}

export async function createChunkWithHash(file, index, chunkSize) {
  const chunk = createChunk(file, index, chunkSize)
  chunk.hash = await calcHash(chunk.blob)
  return chunk
}

