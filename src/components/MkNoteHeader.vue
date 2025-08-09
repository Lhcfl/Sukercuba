<template>
  <div class="d-flex justify-space-between align-center">
    <div class="d-flex flex-column">
      <MkUserName :user="note.user" />
      <span class="text-subtitle-2">@{{ acct.toString(note.user) }}</span>
    </div>
    <div class="d-flex flex-column align-end">
      <VBtn
        variant="plain"
        size="small"
        :append-icon="visibilityIcon"
        :to="{ name: '/notes/[id]', params: { id: props.note.id } }"
        @click.stop
      >
        <MkTime :time="note.createdAt" />
      </VBtn>
      <MkInstanceChip :instance="note.user.instance" />
    </div>
  </div>
</template>
<script setup lang="ts">
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
