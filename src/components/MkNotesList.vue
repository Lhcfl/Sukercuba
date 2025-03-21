<template>
  <VInfiniteScroll
    class="overflow-y-visible"
    :side
    @load="load"
  >
    <TransitionGroup name="note">
      <div
        v-for="note in computedNotes"
        :key="note.id"
      >
        <MkNote
          :note
          variant="flat"
          tile
        />
        <VDivider />
      </div>
    </TransitionGroup>
  </VInfiniteScroll>
</template>
<script lang="ts" setup>
import type { NoteWithExtension } from "@/stores/note-cache";

const props = defineProps<{
  side?: 'start' | 'end' | 'both'
  pre?: (notes: NoteWithExtension[]) => Promise<NoteWithExtension[]>,
  next?: (notes: NoteWithExtension[]) => Promise<NoteWithExtension[]>,
}>();

const notes = defineModel<NoteWithExtension[]>({ default: [] });
const computedNotes = computed(() => notes.value.filter(x => !x.isDeleted));

async function load(context: { 
  side: 'start' | 'end' | 'both',
  done: (stat: "ok" | "error" | "empty") => void }
) {
  try {
    const ret = await (context.side == 'start' ? props.pre : props.next)?.(notes.value);
    if (!ret || ret.length == 0) {
      context.done("empty");
    } else {
      notes.value = notes.value.concat(ret);
      context.done("ok");
    }
  } catch {
    context.done("error");
  }
}
</script>
