<template>
  <Suspense>
    <MkPostFormAsync @done="emit('done')" @cancel="emit('cancel')" v-bind="props"
      @update:loading="(x) => emit('update:loading', x)" />

    <template #fallback>
      <VSkeletonLoader type="list-item-avatar, image"></VSkeletonLoader>
    </template>
  </Suspense>
</template>

<script lang="ts" setup>
import type { NoteWithExtension } from '@/stores/note-cache';
const props = withDefaults(
  defineProps<{
    replyId?: string;
    quoteId?: string;
    edit?: NoteWithExtension;
    allowCancel?: boolean;
  }>(),
  {
    replyId: undefined,
    quoteId: undefined,
    edit: undefined,
    allowCancel: undefined,
  },
);

const emit = defineEmits<{
  done: [];
  cancel: [];
  "update:loading": [boolean];
}>();
</script>
