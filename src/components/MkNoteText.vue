<template>
  <div>
    <p>
      <VBtn
        v-if="note.renoteId && simple"
        variant="plain"
        icon="mdi-format-quote-close-outline"
        color="primary"
        @click.stop="routeToNote(note.renoteId)"
      />
      <VBtn
        v-if="note.replyId && simple"
        variant="plain"
        icon="mdi-reply-outline"
        color="primary"
        @click.stop="routeToNote(note.replyId)"
      />
      <MkMfm
        v-if="note.text"
        :text="note.text"
        :author="note.user"
        :emoji-urls="note.emojis"
      />
      <span v-if="note.isHidden">({{ t('private') }})</span>
    </p>
    <MkNotePoll
      v-if="note.poll"
      :note
      :poll="note.poll"
    />
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
      :never-collapse
      hide-reactions
      simple
    />
  </div>
</template>
<script setup lang="ts">
import router from "@/router";
import type { Note } from "misskey-js/entities.js";

defineProps<{
  note: Note;
  simple?: boolean;
  neverCollapse?: boolean;
}>();

const { t } = useI18n();

function routeToNote(id: string) {
  router.push({ name: "/notes/[id]", params: { id } });
}
</script>
