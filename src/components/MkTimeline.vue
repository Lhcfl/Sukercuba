<template>
  <MkNotesList
    v-model="notes"
    :next="load"
  />
</template>
<script lang="ts" setup>
import type { NoteWithExtension } from "@/stores/note-cache";
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

onMounted(() => {
  const connection = account.streamApi.useChannel(
    props.timeline as "localTimeline",
    {
      withFiles: props.withFiles,
      withRenotes: props.withRenotes,
      withReplies: props.withReplies,
    }
  );
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

async function load() {
  const params = {
    untilId: notes.value.at(-1)?.id,
    withFiles: props.withFiles,
    withRenotes: props.withRenotes,
    withReplies: props.withReplies,
    limit: 50,
  };

  const mapedRequest = {
    homeTimeline: () => account.api.request("notes/timeline", params),
    globalTimeline: () => account.api.request("notes/global-timeline", params),
    localTimeline: () => account.api.request("notes/local-timeline", params),
    hybridTimeline: () => account.api.request("notes/hybrid-timeline", params),
    // fix sharkey
    bubbleTimeline: () =>
      account.api.request(
        "notes/bubble-timeline" as "notes/hybrid-timeline",
        params
      ),
  };

  const res = await mapedRequest[props.timeline]();
  return res.map((note) => noteCache.cached(note, true).value);
}
</script>
