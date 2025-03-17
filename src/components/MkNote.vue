<template>
  <VCard
    v-ripple
    :class="$style.note"
    :variant
  >
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
    <VCardText
      v-if="appearNote.cw"
      :class="$style.cwCardText"
    >
      <VExpansionPanels
        bg-color="#0000"
        ripple
      >
        <VExpansionPanel :elevation="0">
          <VExpansionPanelTitle>
            <template #default="{ expanded }">
              <div class="d-inline-block text-body-2">
                <p>
                  <MkMfm
                    :text="appearNote.cw"
                    :author="appearNote.user"
                    :emoji-urls="appearNote.emojis"
                  />
                </p>
                <p v-if="!expanded">
                  <VChip> 查看更多 </VChip>
                </p>
              </div>
            </template>
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <MkNoteText :note="appearNote" />
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </VCardText>
    <VCardText
      v-else
      :class="$style.cardText"
    >
      <MkNoteText
        :note="appearNote"
        :class="collapsed && $style.collapsed"
      />
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
      <MkNoteActions :note="appearNote" />
    </VCardActions>
  </VCard>
</template>

<script lang="ts" setup>
import * as Misskey from "misskey-js";
import MkMfm from "./MkMfm.vue";
import type { VCard } from "vuetify/components";
import { useNoteCache } from "@/stores/note-cache";

const props = defineProps<{
  note: Misskey.entities.Note;
  variant?: VCard["$props"]["variant"];
}>();

const noteCache = useNoteCache();

const note = noteCache.stored(props.note);
const isPureRenote = computed(() => Misskey.note.isPureRenote(note.value));
const appearNote = computed(() =>
  isPureRenote.value ? note.value.renote! : note.value
);
const isLongNote = computed(
  () =>
    appearNote.value.text &&
    (appearNote.value.text.length > 400 ||
      appearNote.value.text.split("\n").length > 5)
);

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
  .cwCardText {
    padding: 0;
    :global(.v-expansion-panel-text__wrapper) {
      padding: 0 1rem;
    }
  }
}
</style>
