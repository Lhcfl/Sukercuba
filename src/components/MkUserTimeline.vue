<template>
  <MkNotesList
    v-model="notes"
    :next="load"
  />
</template>
<script lang="ts" setup>
import { useAccount } from "@/stores/account";
import { useNoteCache, type NoteWithExtension } from "@/stores/note-cache";

const props = withDefaults(
  defineProps<{
    userId: string;
    withRenotes?: boolean;
    withReplies?: boolean;
    withFiles?: boolean;
    withChannelNotes?: boolean;
  }>(),
  {
    withReplies: true,
    withRenotes: true,
    withFiles: false,
    withChannelNotes: true,
  }
);

const account = useAccount();
const noteCache = useNoteCache();
const notes = ref<NoteWithExtension[]>([]);

onMounted(() => {
  const connection = account.streamApi.useChannel("homeTimeline", {
    withFiles: props.withFiles,
    withRenotes: props.withRenotes,
  });
  connection.on("note", (note) => {
    if (note.userId !== props.userId) return;
    const cached = noteCache.cached(note, true);
    notes.value.unshift(cached.value);
  });

  onUnmounted(() => {
    console.log("connection disposed: user", props.userId);
    connection.dispose();
  });
});

watch(props, () => {
  notes.value = [];
});

async function load(notes: NoteWithExtension[]) {
  const params = {
    untilId: notes.at(-1)?.id,
    userId: props.userId,
    withFiles: props.withFiles,
    withRenotes: props.withRenotes,
    withReplies: props.withReplies,
    withChannelNotes: props.withChannelNotes,
    limit: 50,
  };

  const res = await account.api.request("users/notes", params);
  return res.map((note) => noteCache.cached(note, true).value);
}
</script>
