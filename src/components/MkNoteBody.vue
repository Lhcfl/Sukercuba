<template>
  <VCardText
    v-if="note.cw"
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
                  :text="note.cw"
                  :author="note.user"
                  :emoji-urls="note.emojis"
                />
              </p>
              <p v-if="!expanded">
                <VChip> 查看更多 </VChip>
              </p>
            </div>
          </template>
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <MkNoteText
            :note="note"
            :simple
          />
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </VCardText>
  <VCardText
    v-else
    :class="$style.cardText"
  >
    <MkNoteText
      :simple
      :note="note"
      :class="collapsed && $style.collapsed"
    />
    <VBtn
      v-if="isLongNote"
      :class="$style.collapseBtn"
      @click="collapsed = !collapsed"
    >
      展开
    </VBtn>
    <MkNoteReactions :note="note" />
  </VCardText>
</template>
<script setup lang="ts">
import type { Note } from 'misskey-js/entities.js';

const props = defineProps<{
  note: Note;
  detailed?: boolean;
  simple?: boolean;
}>()

const isLongNote = computed(
  () =>
    props.note.text &&
    (props.note.text.length > 400 ||
      props.note.text.split("\n").length > 5)
);

const collapsed = ref(isLongNote.value);
</script>

<style lang="scss" module>
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
</style>