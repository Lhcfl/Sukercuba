<template>
  <VInfiniteScroll @load="load">
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
import type { Timeline } from "@/types/timeline";

const props = withDefaults(
  defineProps<{
    timeline: Timeline;
    withRenotes?: boolean;
    withReplies?: boolean;
    withFiles?: boolean;
  }>(),
  {
    withReplies: true,
    withRenotes: true,
    withFiles: false,
  }
);

const account = useAccount();
const noteCache = useNoteCache();
const notes = ref<NoteWithExtension[]>([]);
const computedNotes = computed(() => notes.value.filter(x => !x.isDeleted));

onMounted(() => {
  const connection = account.streamApi.useChannel(props.timeline as "localTimeline", {
    withFiles: props.withFiles,
    withRenotes: props.withRenotes,
    withReplies: props.withReplies,
  });
  connection.on("note", (note) => {
    const cached = noteCache.cached(note, true);
    notes.value.unshift(cached.value);
  });

  onUnmounted(() => {
    console.log("connection disposed: ", props.timeline);
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
      withFiles: props.withFiles,
      withRenotes: props.withRenotes,
      withReplies: props.withReplies,
    };

    const mapedRequest = {
      homeTimeline: () => account.api.request("notes/timeline", params),
      globalTimeline: () =>
        account.api.request("notes/global-timeline", params),
      localTimeline: () => account.api.request("notes/local-timeline", params),
      hybridTimeline: () =>
        account.api.request("notes/hybrid-timeline", params),
      // fix sharkey
      bubbleTimeline: () => account.api.request("notes/bubble-timeline" as "notes/hybrid-timeline", params),
    };

    const res = await mapedRequest[props.timeline]();
    const cachedRes = res.map(note => noteCache.cached(note, true).value);

    notes.value.push(...cachedRes);
    context.done(cachedRes.length === 0 ? "empty" : "ok");
  } catch {
    context.done("error");
  }
}
</script>
