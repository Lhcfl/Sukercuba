<template>
  <VInfiniteScroll class="notes-list overflow-y-visible" :side @load="load">
    <TransitionGroup name="note">
      <div v-for="note in computedNotes" :key="note.id">
        <VCard class="note-card border" variant="flat">
          <MkNote :note />
        </VCard>
        <VDivider v-if="perfer.noteGap === 0" />
      </div>
    </TransitionGroup>
  </VInfiniteScroll>
</template>
<script lang="ts" setup>
import * as Misskey from "misskey-js";
import type { APIError } from "misskey-js/api.js";
import type { NoteWithExtension } from "@/stores/note-cache";

const props = defineProps<{
  side?: "start" | "end" | "both";
  pre?: (notes: NoteWithExtension[]) => Promise<NoteWithExtension[]>;
  next?: (notes: NoteWithExtension[]) => Promise<NoteWithExtension[]>;
}>();

const perfer = usePreferences();

const notes = defineModel<NoteWithExtension[]>({ default: [] });
const computedNotes = computed(() => notes.value.filter((x) => !x.isDeleted));

async function load(context: {
  side: "start" | "end" | "both";
  done: (stat: "ok" | "error" | "empty") => void;
}) {
  try {
    const ret = await (context.side === "start" ? props.pre : props.next)?.(
      notes.value,
    );
    if (!ret || ret.length === 0) {
      context.done("empty");
    } else {
      notes.value = notes.value.concat(ret);
      context.done("ok");
    }
  } catch (err) {
    context.done("error");
    if (Misskey.api.isAPIError(err as APIError)) {
      useSnackbarQueue().push({
        text: (err as APIError).message,
        color: "error",
      });
    } else if (err instanceof Error) {
      useSnackbarQueue().push({ text: err.message, color: "error" });
    } else {
      useSnackbarQueue().push({ text: String(err), color: "error" });
    }
  }
}
</script>

<style lang="scss">
.notes-list .note-card {
  margin: v-bind("`${perfer.noteGap}px`") v-bind("`${perfer.noteGap * 2}px`");
}

.v-infinite-scroll__side {
  padding: 2px;
}
</style>
