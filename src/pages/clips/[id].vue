<template>
  <VCard v-if="clip">
    <VCardTitle>{{ clip.name }}</VCardTitle>
    <VCardText>
      <MkMfm :text="clip.description || $t('noDescription')" :plain="true" />
    </VCardText>
    <VCardActions>
      <VBtn :to="`/clips/${clip.id}/edit`" text>
        {{ $t('edit') }}
      </VBtn>
    </VCardActions>
  </VCard>
  <VCard v-if="isPending">
    <VSkeletonLoader type="subtitle" />
    <VSkeletonLoader type="paragraph" />
  </VCard>
  <VCard v-if="isError">
    <VCardTitle>{{ $t('error') }}</VCardTitle>
    <VCardText>
      {{ (error as Error).message }}
    </VCardText>
  </VCard>
  <MkNotesList v-model="notes" :next="load"></MkNotesList>
</template>

<script setup lang="ts">
const account = useAccount();
const noteCache = useNoteCache();
const notes = ref<NoteWithExtension[]>([]);

const route = useRoute<"/clips/[id]">();

const { data: clip, isPending, isError, error } = useQuery({
  queryKey: ["clips", route.params.id],
  queryFn: () => account.api.request("clips/show", { clipId: route.params.id }),
})

async function load(notes: NoteWithExtension[]) {
  const params = {
    clipId: route.params.id,
    untilId: notes.at(-1)?.id,
    limit: 50,
  };

  const res = await account.api.request("clips/notes", params);
  return res.map((note) => noteCache.cached(note, true).value);
}
</script>
