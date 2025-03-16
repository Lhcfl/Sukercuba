<template>
  <VInfiniteScroll @load="load">
    <div
      v-for="note in notes"
      :key="note.id"
    >
      <MkNote
        :note
      />
      <VDivider />
    </div>
  </VInfiniteScroll>
</template>
<script lang="ts" setup>
import type { Note } from "misskey-js/entities.js";
const props = defineProps<{
  next: (notes: Note[]) => Promise<Note[]>
}>();

const notes = ref<Note[]>([]);

async function load(context: { done: (stat: 'ok' |'error') => void }) {
  try {
    notes.value = notes.value.concat(await props.next(notes.value));
    context.done('ok')
  } catch {
    context.done('error')
  }
}
</script>