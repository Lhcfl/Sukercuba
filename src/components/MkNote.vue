<template>
  <VCard
    v-ripple
    :class="$style.note"
    :variant
  >
    <VCardItem
      v-if="isPureRenote"
    >
      <span>
        <VIcon icon="mdi-repeat-variant" />
        <VAvatar :image="note.user.avatarUrl ?? undefined" />
        <MkUserName :user="note.user" />
      </span>
    </VCardItem>
    <VCardItem :prepend-avatar="appearNote.user.avatarUrl ?? undefined">
      <div class="d-flex flex-column">
        <MkUserName :user="appearNote.user" />
        <span>
          @{{ Misskey.acct.toString(appearNote.user) }}
        </span>
      </div>
    </VCardItem>
    <VCardText :class="$style.cardText">
      <div :class="collapsed && $style.collapsed">
        <p v-if="appearNote.text">
          <MkMfm
            :text="appearNote.text"
            :author="appearNote.user"
            :emoji-urls="appearNote.emojis"
          />
        </p>
        <MkGallery
          v-if="appearNote.files"
          :images="appearNote.files"
        />
      </div>
      <VBtn
        v-if="isLongNote"
        :class="$style.collapseBtn"
        @click="collapsed = !collapsed"
      >
        展开
      </VBtn>
      <MkNoteReactions :note="appearNote" />
    </VCardText>
    <VCardActions>
      <VBtn icon="mdi-reply" />
      <VBtn icon="mdi-repeat-variant" />
      <VBtn icon="mdi-format-quote-close-outline" />
      <VBtn icon="mdi-heart-outline" />
      <VBtn icon="mdi-sticker-emoji" />
      <VBtn icon="mdi-dots-horizontal" />
    </VCardActions>
  </VCard>
</template>

<script lang="ts" setup>
import * as Misskey from "misskey-js";
import MkMfm from "./MkMfm.vue";
import type { VCard } from "vuetify/components";

const props = defineProps<{
  note: Misskey.entities.Note,
  variant?: VCard["$props"]["variant"],
}>()

const isPureRenote = computed(() => Misskey.note.isPureRenote(props.note));
const appearNote = computed(() => isPureRenote.value ? props.note.renote! : props.note);
const isLongNote = computed(() => appearNote.value.text && (appearNote.value.text.length > 400 || appearNote.value.text.split('\n').length > 5));
const collapsed = ref(isLongNote.value);
</script>

<style lang="scss" module>
.note {
  .collapsed {
    max-height: 200px;
    overflow: hidden;
  }
  .collapseBtn {
    margin: auto;
    position: sticky;
    bottom: 10px;
  }
  .cardText {
    padding-bottom: 0;
  }
}
</style>