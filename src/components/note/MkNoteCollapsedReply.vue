<template>
  <div v-ripple
    class="collapsed-reply w-full bg-primary/5 p-2 border border-primary/50 rounded-lg mb-2 flex items-center gap-1 text-xs cursor-pointer transition"
    @click.stop="emit('uncollapse')" v-if="note.reply">
    <VIcon icon="mdi-reply" class="text-primary" />
    <MkAvatar :user="note.reply.user" :size="'1.2em'" class="inline-block" />
    <MkMfm :text="computedText" inline class="truncate line-clamp-1" />
  </div>
</template>
<script lang="ts" setup>
import type { NoteWithExtension } from '@/stores/note-cache';

const props = defineProps<{
  note: NoteWithExtension;
}>();

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'uncollapse'): void;
}>();

const computedText = computed(() => {
  return [
    props.note.reply?.text,
    props.note.fileIds?.length && t('_cw.files', { count: props.note.fileIds.length }),
  ].filter(Boolean)
    .join(', ');
})
</script>
