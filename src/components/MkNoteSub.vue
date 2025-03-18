<template>
  <VCard
    v-ripple="!disableRoute"
    :class="$style.note"
    :variant
    @click.stop="routeToNote"
  >
    <VCardItem :class="$style.noteMain">
      <template #prepend>
        <MkAvatar
          :user="appearNote.user"
          :class="$style.avatar"
        />
      </template>
      <VCardItem class="py-0">
        <div class="d-flex flex-column">
          <MkUserName :user="appearNote.user" />
          <span> @{{ Misskey.acct.toString(appearNote.user) }} </span>
        </div>
      </VCardItem>
      <MkNoteBody
        :note="appearNote"
        simple
      />
      <VCardText
        v-if="!hideReactions && Object.keys(appearNote.reactions).length > 0"
        class="py-0"
      >
        <MkNoteReactions :note="appearNote" />
      </VCardText>
      <VCardActions
        v-if="!hideActions"
        class="py-0"
      >
        <MkNoteActions :note="appearNote" />
      </VCardActions>
    </VCardItem>
  </VCard>
</template>

<script lang="ts" setup>
import * as Misskey from "misskey-js";
import type { VCard } from "vuetify/components";
import { useNoteCache } from "@/stores/note-cache";
import router from "@/router";

const props = withDefaults(defineProps<{
  note: Misskey.entities.Note;
  variant?: VCard["$props"]["variant"];
  newFetch?: boolean;
  hideActions?: boolean,
  disableRoute?: boolean,
  hideReactions?: boolean,
}>(), {
  variant: "text",
});

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
  .noteMain {
    :global(.v-card-item__prepend) {
      height: 100%;
      display: block;
    }
    .avatar {
      position: sticky;
      top: 0;
    }
  }
}
</style>
