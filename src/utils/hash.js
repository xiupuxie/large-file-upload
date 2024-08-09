import SparkMD5 from 'spark-md5'
import { promiseWithResolvers } from './withResolvers';

export function calcHash(chunk) {
  const { promise, resolve } = promiseWithResolvers()
  const spark = new SparkMD5.ArrayBuffer()
  const fileReader = new FileReader()
  fileReader.addEventListener('load', (e) => {
    spark.append(e.target.result);
    resolve(spark.end())
  })
  fileReader.readAsArrayBuffer(chunk)
  return promise
}

export function incrementCalHash(chunks) {
  const { promise, resolve } = promiseWithResolvers()
  const spark = new SparkMD5.ArrayBuffer();
  function read(index) {
    if (index >= chunks.length) {
      resolve(spark.end())
      return
    }
    const chunk = chunks[index]
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (e) => {
      spark.append(e.target.result);
      read(index + 1)
    })
    fileReader.readAsArrayBuffer(chunk.blob)
  }
  read(0)
  return promise;
}
