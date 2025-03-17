<template>
  <VChipGroup>
    <VChip
      v-for="[reaction, count] in reactions"
      :key="reaction"
    >
      <MkAnyEmoji
        :name="reaction"
        :urls="emojiUrls"
      />
      {{ count }}
    </VChip>
  </VChipGroup>
</template>

<script setup lang="ts">
import type { Note } from 'misskey-js/entities.js';
const props = defineProps<{
  note: Note,
}>();

const reactions = computed(() => Object.entries(props.note.reactions));
const emojiUrls = computed(() => props.note.reactionEmojis ?? {});

</script>