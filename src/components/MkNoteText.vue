<template>
  <div>
    <p v-if="note.text">
      <VIcon
        v-if="note.renoteId && !detailed"
        icon="mdi-format-quote-close-outline"
        color="primary"
      />
      <VIcon
        v-if="note.replyId && !detailed"
        icon="mdi-reply-outline"
        color="primary"
      />
      <MkMfm
        :text="note.text"
        :author="note.user"
        :emoji-urls="note.emojis"
      />
    </p>
    <MkGallery
      v-if="note.files"
      :images="note.files"
    />
    <MkNote
      v-if="note.renote"
      hide-actions
      :note="note.renote"
      variant="tonal"
      :detailed="false"
    />
  </div>
</template>
<script setup lang="ts">
import type { Note } from 'misskey-js/entities.js';

defineProps<{
  note: Note;
  detailed?: boolean;
}>()

</script>