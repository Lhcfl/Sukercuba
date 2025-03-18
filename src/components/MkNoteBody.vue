<template>
  <VCardText
    v-if="note.cw"
    :class="$style.cwCardText"
  >
    <VExpansionPanels
      bg-color="#0000"
      ripple
    >
      <VExpansionPanel
        :elevation="0"
        @click.stop
      >
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
                <VChip>{{ t('showMore') }} ({{ t('_cw.chars', note.text?.length ?? 0) }})</VChip>
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
      block
      variant="tonal"
      :class="$style.collapseBtn"
      @click.stop="collapsed = !collapsed"
    >
      {{ collapsed ? t('showMore') : t('showLess') }}
    </VBtn>
  </VCardText>
</template>
<script setup lang="ts">
import type { Note } from 'misskey-js/entities.js';

const { t } = useI18n();

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