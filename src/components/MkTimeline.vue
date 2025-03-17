<template>
  <VInfiniteScroll @load="load">
    <div
      v-for="note in notes"
      :key="note.id"
    >
      <MkNote
        :note
        variant="flat"
        tile
      />
      <VDivider />
    </div>
  </VInfiniteScroll>
</template>
<script lang="ts" setup>
import { useAccount } from "@/stores/account";
import type { Timeline } from "@/types/timeline";
import type { Note } from "misskey-js/entities.js";

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
const notes = ref<Note[]>([]);

onMounted(() => {
  const connection = account.streamApi.useChannel(props.timeline, {
    withFiles: props.withFiles,
    withRenotes: props.withRenotes,
    withReplies: props.withReplies,
  });
  connection.on("note", (note) => {
    notes.value.unshift(note);
  });

  onUnmounted(() => {
    console.log("connection disposed: ", props.timeline);
    connection.dispose();
  });
});

watch(props, () => {
  notes.value = [];
});

async function load(context: { done: (stat: "ok" | "error") => void }) {
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
    };

    notes.value = notes.value.concat(await mapedRequest[props.timeline]());
    context.done("ok");
  } catch {
    context.done("error");
  }
}
</script>
