<template>
  <VInfiniteScroll
    class="overflow-y-visible"
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
import { useAccount } from "@/stores/account";
import { useNoteCache, type NoteWithExtension } from "@/stores/note-cache";

const props = withDefaults(
  defineProps<{
    userId: string,
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
const computedNotes = computed(() => notes.value.filter(x => !x.isDeleted));

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

async function load(context: { done: (stat: "ok" | "error" | "empty") => void }) {
  try {
    const params = {
      untilId: notes.value.at(-1)?.id,
      userId: props.userId,
      withFiles: props.withFiles,
      withRenotes: props.withRenotes,
      withReplies: props.withReplies,
      withChannelNotes: props.withChannelNotes,
    };

    const res = await account.api.request("users/notes", params);
    const cachedRes = res.map(note => noteCache.cached(note, true).value);

    notes.value.push(...cachedRes);
    context.done(cachedRes.length === 0 ? "empty" : "ok");
  } catch {
    context.done("error");
  }
}
</script>
