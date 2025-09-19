<template>
  <MkNotesList v-model="notes" :next="load"></MkNotesList>
</template>

<script setup lang="ts">
const account = useAccount();
const noteCache = useNoteCache();
const notes = ref<NoteWithExtension[]>([]);

async function load(notes: NoteWithExtension[]) {
  const params = {
    untilId: notes.at(-1)?.id,
    limit: 50,
  };

  const res = await account.api.request("i/favorites", params);
  return res.map(({ note }) => noteCache.cached(note, true).value);
}
</script>
