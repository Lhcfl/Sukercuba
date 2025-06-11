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
    <MkNoteRenoteBar
      v-if="isPureRenote"
      :note
    />
    <VCardItem>
      <template #prepend>
        <MkAvatar :user="appearNote.user" />
      </template>
      <MkNoteHeader :note="appearNote" />
    </VCardItem>
    <MkNoteBody
      :note="appearNote"
      :detailed
      :simple
      :never-collapse
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
  </VCard>
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
    detailed?: boolean;
    simple?: boolean;
    disableRoute?: boolean;
    hideReactions?: boolean,
    /** 防止subnote也被折叠 */
    neverCollapse?: boolean;
    gap?: number;
  }>(),
  {
    gap: 0,
  }
);

const router = useRouter();

const variant = computed(() => props.variant || props.gap == 0 ? "text" : "elevated");

const isPureRenote = computed(() => Misskey.note.isPureRenote(props.note));
const appearNote = computed(() =>
  isPureRenote.value ? props.note.renote! : props.note
);

function routeToNote() {
  if (props.disableRoute) return;
  router.push({ name: "/notes/[id]", params: { id: appearNote.value.id } });
}
</script>

<style lang="scss" module>
.note {
  overflow: visible;
  margin: 
    v-bind("`${gap}px`")
    v-bind("`${gap * 2}px`");

  :global(.v-card-item__content) {
    overflow: visible;
  }
}
</style>
