<template>
  <div>
    <p v-if="note.text">
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
  </div>
</template>
<script setup lang="ts">
import type { Note } from 'misskey-js/entities.js';

defineProps<{
  note: Note,  
}>()

</script>