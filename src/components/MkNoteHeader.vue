<template>
  <div class="flex justify-between items-center">
    <div class="flex flex-col">
      <MkUserName :user="note.user" />
      <span class="username text-sm opacity-70">@{{ acct.toString(note.user) }}</span>
    </div>
    <div class="flex flex-col items-end">
      <VBtn variant="plain" size="small" :append-icon="visibilityIcon"
        :to="{ name: '/notes/[id]', params: { id: props.note.id } }" @click.stop>
        <MkTime :time="note.createdAt" />
      </VBtn>
      <MkInstanceChip :instance="note.user.instance" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { acct } from "misskey-js";
import type { NoteWithExtension } from "@/stores/note-cache";

const props = defineProps<{
  note: NoteWithExtension;
}>();

const visibilityIcon = computed(() => {
  if (props.note.visibility === "public") {
    return "mdi-earth";
  }
  if (props.note.visibility === "home") {
    return "mdi-home-outline";
  }
  if (props.note.visibility === "followers") {
    return "mdi-lock-outline";
  }
  if (props.note.visibility === "specified") {
    return props.note.visibleUserIds?.length
      ? "mdi-message-lock-outline"
      : "mdi-eye-off-outline";
  }
});
</script>
