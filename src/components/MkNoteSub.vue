<template>
  <VCard
    v-ripple="!disableRoute"
    :class="$style.note"
    :variant
    @click.stop="routeToNote"
  >
    <div class="d-flex">
      <div
        class="flex-0-0"
        :class="$style.avatarContainer"
      >
        <MkAvatar
          :user="appearNote.user"
          :class="$style.avatar"
        />
      </div>
      <div class="flex-1-1">
        <VCardItem>
          <MkNoteHeader :note="appearNote" />
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
      </div>
    </div>
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
    disableRoute?: boolean;
    hideReactions?: boolean;
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
  :global(.v-card-item__prepend) {
    height: 100%;
    display: block;
  }
  :global(.v-card-item__content) {
    overflow-y: visible;
    overflow: visible;
  }
  .avatarContainer {
    padding: 1rem 0 0 1rem;
  }
  .avatar {
    position: sticky;
    top: 0;
  }
}
</style>
