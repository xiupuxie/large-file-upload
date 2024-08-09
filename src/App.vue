<script setup>
import { CutFile, EVENT_MAP } from './utils/CutFile';
function handleSelectFile(e) {
  const file = e.target.files[0];
  const cutFile = new CutFile();
  cutFile.on(EVENT_MAP.CUT_CHUNK, (index, chunk) => {
    console.log('CUT_CHUNK', index, chunk);
  });
  cutFile.on(EVENT_MAP.CUT_FINISH, chunks => {
    console.log('CUT_FINISH', chunks);
  });
  cutFile.on(EVENT_MAP.CAL_FILE_HASH_FINISH, hash => {
    console.log('CAL_FILE_HASH_FINISH', hash);
  });
  cutFile.file = file;
  console.time('cutFile');
  Promise.all([cutFile.calFileHash(), cutFile.cutWithoutFileHash()]).then(([fileHash, chunks]) => {
    console.log(fileHash, chunks);
    console.timeEnd('cutFile');
  });
}
</script>

<template>
  <input type="file" @change="handleSelectFile" />
</template>

<style scoped></style>
