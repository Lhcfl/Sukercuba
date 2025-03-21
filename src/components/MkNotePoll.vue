<template>
  <VList>
    <VListItem
      v-for="(choice, idx) in choices"
      :key="idx"
      :text="choice.text"
      :class="{ 'text-primary': choice.isVoted }"
      :prepend-icon="choice.isVoted ? 'mdi-circle-slice-8' : 'mdi-circle-outline'"
    />
  </VList>
</template>

<script setup lang="ts">
import type { NoteWithExtension } from '@/stores/note-cache';
const props = defineProps<{
  note: NoteWithExtension,
  poll: NonNullable<NoteWithExtension["poll"]>,
}>();

const choices = computed(() => props.poll.choices);
</script>