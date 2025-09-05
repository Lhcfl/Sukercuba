<template>
  <div class="mk-note-text">
    <p>
      <VBtn v-if="note.renoteId && simple" variant="plain" icon="mdi-format-quote-close-outline" color="primary"
        @click.stop="routeToNote(note.renoteId)" class="quote-indicator" />
      <VBtn v-if="note.replyId && simple" variant="plain" icon="mdi-reply-outline" color="primary"
        @click.stop="routeToNote(note.replyId)" class="reply-indicator" />
      <MkMfm v-if="note.text" :text="note.text" :author="note.user" :emoji-urls="note.emojis" />
      <span v-if="note.isHidden">({{ t('private') }})</span>
    </p>
    <MkNotePoll v-if="note.poll" :note :poll="note.poll" />
    <MkGallery class="w-full" v-if="images.length > 0" :images :expanded="expandImages" />
    <VCard v-if="note.renote" class="quote-note border border-tertiary my-2">
      <MkNote hide-actions :note="note.renote" variant="tonal" :detailed="false" :never-collapse hide-reactions
        simple />
    </VCard>
  </div>
</template>
<script setup lang="ts">
import type { NoteWithExtension } from "@/stores/note-cache";

const props = defineProps<{
  note: NoteWithExtension;
  simple?: boolean;
  expandImages?: boolean;
  neverCollapse?: boolean;
}>();

const { t } = useI18n();
const router = useRouter();

function routeToNote(id: string) {
  router.push({ name: "/notes/[id]", params: { id } });
}

const images = computed(() => props.note.files?.filter(x => x.type.startsWith("image")) ?? []);
</script>

<style lang="scss">
.mk-note-text {

  .quote-indicator,
  .reply-indicator {
    --v-btn-height: 1em;
  }
}
</style>
