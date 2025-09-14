<template>
  <div v-ripple="!disableRoute" :class="$style.note" @click.stop="routeToNote">
    <div class="flex">
      <div class="flex-0-0" :class="$style.avatarContainer">
        <MkAvatar :user="appearNote.user" :class="$style.avatar" />
      </div>
      <div class="flex-1-1">
        <VCardItem>
          <MkNoteHeader :note="appearNote" />
        </VCardItem>
        <MkNoteBody :note="appearNote" simple />
        <VCardText v-if="!hideReactions && Object.keys(appearNote.reactions).length > 0" class="py-0">
          <MkNoteReactions :note="appearNote" />
        </VCardText>
        <VCardActions v-if="!hideActions" class="py-0">
          <MkNoteActions :note="appearNote" />
        </VCardActions>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as Misskey from "misskey-js";
import type { VCard } from "vuetify/components";
import type { NoteWithExtension } from "@/stores/note-cache";

const props = withDefaults(
  defineProps<{
    note: NoteWithExtension;
    variant?: VCard["$props"]["variant"];
    newFetch?: boolean;
    hideActions?: boolean;
    disableRoute?: boolean;
    hideReactions?: boolean;
  }>(),
  {
    variant: "text",
  },
);

const router = useRouter();

const isPureRenote = computed(() => Misskey.note.isPureRenote(props.note));
const appearNote = computed(() =>
  isPureRenote.value ? props.note.renote! : props.note,
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
