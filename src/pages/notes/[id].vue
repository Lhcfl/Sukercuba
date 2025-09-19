<template>
  <MkNoteSkeleton v-if="!note" />
  <div v-else class="p-2">
    <VCard v-if="note.replyId" class="previous-conversations mb-2 border">
      <VInfiniteScroll side="start" @load="preConversation">
        <TransitionGroup name="note">
          <div v-for="n in conversationsComputed" :key="n.id">
            <MkNoteSub :note="n" />
          </div>
        </TransitionGroup>
      </VInfiniteScroll>
    </VCard>
    <VCard class="border">
      <MkNote :note="note" detailed disable-route />
    </VCard>
    <VInfiniteScroll @load="nextReplies">
      <TransitionGroup name="note">
        <div v-for="n in repliesComputed" :key="n.id">
          <MkNoteSub :note="n" />
          <VDivider />
        </div>
      </TransitionGroup>
    </VInfiniteScroll>
  </div>
</template>

<script setup lang="ts">
import { useAccount } from "@/stores/account";
import { type NoteWithExtension, useNoteCache } from "@/stores/note-cache";

const account = useAccount();
const noteCache = useNoteCache();
const route = useRoute<"/notes/[id]">();

const conversations = ref<NoteWithExtension[]>([]);
const replies = ref<NoteWithExtension[]>([]);
const conversationsComputed = computed(() =>
  conversations.value.filter((x) => !x.isDeleted),
);
const repliesComputed = computed(() =>
  replies.value.filter((x) => !x.isDeleted),
);
const note = ref<NoteWithExtension | null>(null);

async function load() {
  const n = await account.api.request("notes/show", {
    noteId: route.params.id,
  });
  note.value = noteCache.cached(n, true).value;
}

async function preConversation(context: {
  done: (stat: "ok" | "error" | "empty") => void;
}) {
  try {
    const res = await account.api.request("notes/conversation", {
      noteId: conversations.value.at(0)?.id ?? route.params.id,
    });
    const cachedRes = res
      .map((note) => noteCache.cached(note, true).value)
      .reverse();
    conversations.value = cachedRes.concat(conversations.value);
    context.done(res.length === 0 ? "empty" : "ok");
  } catch {
    context.done("error");
  }
}

async function nextReplies(context: {
  done: (stat: "ok" | "error" | "empty") => void;
}) {
  try {
    const res = await account.api.request("notes/children", {
      noteId: route.params.id,
      untilId: replies.value.at(-1)?.id,
    });
    const cachedRes = res.map((note) => noteCache.cached(note, true).value);
    replies.value.push(...cachedRes);
    context.done(res.length === 0 ? "empty" : "ok");
  } catch {
    context.done("error");
  }
}

load();
</script>
