<template>
  <div class="d-flex justify-space-between">
    <div class="d-flex flex-column">
      <MkUserName :user="note.user" />
      <span> @{{ acct.toString(note.user) }} </span>
    </div>
    <div>
      <VIcon :icon="visibilityIcon" />
    </div>
  </div>
</template>
<script setup lang="ts">
import router from "@/router";
import type { NoteWithExtension } from "@/stores/note-cache";
import { acct } from "misskey-js";

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

const { t } = useI18n();
</script>
