<template>
  <div class="flex flex-wrap gap-1">
    <button v-for="emoji in emojis" type="button" @click.stop="emit('selected', emoji)" :disabled="emoji.disabled"
      :key="emoji.name" v-ripple="true">
      <MkCustomEmoji :name="emoji.name" />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { EmojiSimple } from 'misskey-js/entities.js';

export type EmojiExtended = EmojiSimple & {
  disabled?: boolean;
};

const props = defineProps<{
  emojis: EmojiExtended[];
}>();

const emit = defineEmits<{
  selected: [emoji: EmojiExtended];
}>();
</script>
