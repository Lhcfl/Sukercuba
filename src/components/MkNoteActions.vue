<template>
  <div>
    <VBtn
      v-if="note.repliesCount == 0"
      icon="mdi-reply"
    />
    <VBtn
      v-else
      prepend-icon="mdi-reply"
      rounded
      size="large"
      :text="note.repliesCount"
    />
    <VBtn
      v-if="note.renoteCount == 0"
      icon="mdi-repeat-variant"
      :loading="renoting"
      :color="note.renotedByMe ? 'primary' : undefined"
      @click.stop="renoteOrCancel"
    />
    <VBtn
      v-else
      prepend-icon="mdi-repeat-variant"
      rounded
      :loading="renoting"
      :color="note.renotedByMe ? 'primary' : undefined"
      size="large"
      :text="note.renoteCount"
      @click.stop="renoteOrCancel"
    />
    <VBtn icon="mdi-format-quote-close-outline" />
    <VBtn icon="mdi-heart-outline" />
    <VBtn icon="mdi-sticker-emoji" />
    <VBtn icon="mdi-dots-horizontal" />
  </div>
</template>

<script setup lang="ts">
import { useAccount } from '@/stores/account';
import { useNoteCache, type NoteWithExtension } from '@/stores/note-cache';

const props = defineProps<{
  note: NoteWithExtension
}>();

const noteCache = useNoteCache();
const account = useAccount();
const renoting = ref(false);

async function renoteOrCancel() {
  try {
    renoting.value = true;
    if (props.note.renotedByMe) {
      await account.api.request('notes/unrenote', { noteId: props.note.id });
      // 有一个小 Bug 要防止
      setTimeout(() => {
        noteCache.update({ id: props.note.id, renotedByMe: false });
      }, 300)
    } else {
      await account.api.request('notes/create', { renoteId: props.note.id });
      setTimeout(() => {
        noteCache.update({ id: props.note.id, renotedByMe: true });
      }, 300)
    }
  } catch(err) {
    console.error(err);
  } finally {
    renoting.value = false;
  }
}
</script>