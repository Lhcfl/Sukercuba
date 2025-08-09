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
    <div
      ref="noteTextRef"
      :class="!neverCollapse && isLongNote && collapsed && $style.collapsed"
    >
      <MkNoteText
        :simple
        :note="note"
        :never-collapse="neverCollapse || isLongNote"
      />
    </div>
    <VBtn
      v-if="!neverCollapse && isLongNote"
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
import type { NoteWithExtension } from "@/stores/note-cache";
import { useResizeObserver } from "@vueuse/core";

const { t } = useI18n();

defineProps<{
  note: NoteWithExtension;
  detailed?: boolean;
  simple?: boolean;
  /** 防止subnote也被折叠 */
  neverCollapse?: boolean;
}>();

const noteTextRef = useTemplateRef("noteTextRef");
const isLongNote = ref(false);
const collapsed = ref(true);

/**
 * 当 noteTextRef 第一次被加载的时候，施加一个 ResizeObserver
 * 只要检测到一次 long note 就无须再检测
 */
watch(
  noteTextRef,
  () => {
    const observer = useResizeObserver(noteTextRef, () => {
      const height = noteTextRef.value?.clientHeight;
      if (height && height > 400) {
        isLongNote.value = true;
        observer.stop();
      }
    });
  },
  {
    once: true,
  },
);
</script>

<style lang="scss" module>
.collapsed {
  max-height: 300px;
  overflow: hidden;
  /* 使用 mask 进行透明渐变 */
  -webkit-mask-image: linear-gradient(to bottom, black, black 70%, transparent);
  mask-image: linear-gradient(to bottom, black, black 70%, transparent);
}
.collapseBtn {
  margin: auto;
  position: sticky;
  bottom: 1em;
}
.cwCardText {
  padding: 0;
  :global(.v-expansion-panel-text__wrapper) {
    padding: 0 1rem;
  }
}
</style>