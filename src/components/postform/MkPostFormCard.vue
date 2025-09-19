<template>
  <VCard v-ripple.stop="false" :variant :loading :disabled="loading" @keydown.stop @keyup.stop>
    <MkPostForm v-bind="props" @done="emit('done')" @cancel="emit('cancel')" @update:loading="(x) => loading = x" />
  </VCard>
</template>

<script setup lang="ts">
import type { NoteWithExtension } from '@/stores/note-cache';
import type { VCard } from 'vuetify/components';

const props = withDefaults(
  defineProps<{
    replyId?: string;
    quoteId?: string;
    edit?: NoteWithExtension;
    allowCancel?: boolean;
    variant?: VCard["$props"]["variant"];
  }>(),
  {
    replyId: undefined,
    quoteId: undefined,
    edit: undefined,
    allowCancel: undefined,
    variant: "flat",
  },
);

const emit = defineEmits<{
  done: [];
  cancel: [];
}>();

const loading = ref(false);
</script>
