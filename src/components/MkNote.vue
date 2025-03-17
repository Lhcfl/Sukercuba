<template>
  <VCard
    v-ripple="!disableRoute"
    :class="$style.note"
    :variant
    @click.stop="routeToNote"
  >
    <MkNoteSub
      v-if="appearNote.reply && !detailed && !simple"
      :note="appearNote.reply"
      :detailed="false"
    />
    <VCardItem v-if="isPureRenote">
      <span>
        <VIcon icon="mdi-repeat-variant" />
        <VAvatar :image="note.user.avatarUrl ?? undefined" />
        <MkUserName :user="note.user" />
      </span>
    </VCardItem>
    <VCardItem :prepend-avatar="appearNote.user.avatarUrl ?? undefined">
      <div class="d-flex flex-column">
        <MkUserName :user="appearNote.user" />
        <span> @{{ Misskey.acct.toString(appearNote.user) }} </span>
      </div>
    </VCardItem>
    <MkNoteBody
      :note="appearNote"
      :detailed
      :simple
    />
    <VCardActions v-if="!hideActions">
      <MkNoteActions :note="appearNote" />
    </VCardActions>
  </VCard>
</template>

<script lang="ts" setup>
import * as Misskey from "misskey-js";
import type { VCard } from "vuetify/components";
import { useNoteCache } from "@/stores/note-cache";
import router from "@/router";

const props = withDefaults(
  defineProps<{
    note: Misskey.entities.Note;
    variant?: VCard["$props"]["variant"];
    newFetch?: boolean;
    hideActions?: boolean;
    detailed?: boolean;
    simple?: boolean;
    disableRoute?: boolean;
  }>(),
  {
    variant: "text",
  }
);

const noteCache = useNoteCache();
const note = noteCache.cached(props.note, props.newFetch);
const isPureRenote = computed(() => Misskey.note.isPureRenote(note.value));
const appearNote = computed(() =>
  isPureRenote.value ? note.value.renote! : note.value
);

function routeToNote() {
  if (props.disableRoute) return;
  router.push({ name: "/notes/[id]", params: { id: appearNote.value.id } });
}
</script>

<style lang="scss" module>
.note {
  overflow: visible;
}
</style>
