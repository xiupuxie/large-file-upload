import { incrementCalHash } from '../hash'

self.onmessage = (e) => {
  const { chunks } = e.data
  incrementCalHash(chunks).then((hash) => {
    self.postMessage(hash)
  })
}
