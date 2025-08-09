<template>
  <VCard>
    <VCardTitle> {{ tag }}</VCardTitle>
  </VCard>
  <MkNotesList :next />
</template>

<script lang="ts" setup>
import { useAccount } from "@/stores/account";
import { type NoteWithExtension, useNoteCache } from "@/stores/note-cache";

const route = useRoute<"/tags/[tag]">();
const account = useAccount();
const noteCache = useNoteCache();
const tag = computed(() => route.params.tag);

async function next(notes: NoteWithExtension[]) {
  const ns = await account.api.request("notes/search-by-tag", {
    tag: tag.value,
    untilId: notes.at(-1)?.id,
    limit: 50,
  });
  return ns.map((n) => noteCache.cached(n, true).value);
}
</script>
