<template>
  <VCardText v-if="note.cw" class="note-body with-cw">
    <p class="cw">
      <MkMfm :text="note.cw" :author="note.user" :emoji-urls="note.emojis" />
    </p>
    <div class="flex justify-evenly">
      <VBtn v-if="!cwExpanded" @click.stop="cwExpanded = true">
        {{ t('showMore') }} ({{ moreText }})
      </VBtn>
    </div>
    <MkNoteText v-if="cwExpanded" :note="note" :simple never-collapse :expandImages="true" />
    <div class="flex justify-evenly sticky bottom-1">
      <VBtn v-if="cwExpanded" @click.stop="cwExpanded = false">{{ t('showLess') }}</VBtn>
    </div>
  </VCardText>
  <VCardText v-else class="note-body">
    <div :class="!neverCollapse && isLongNote && collapsed && $style.collapsed">
      <MkNoteText :simple :note="note" :never-collapse="neverCollapse || isLongNote" :expandImages="!collapsed" />
    </div>
    <VBtn v-if="!neverCollapse && isLongNote" block variant="tonal" :class="$style.collapseBtn"
      @click.stop="collapsed = !collapsed">
      {{ collapsed ? t('showMore') : t('showLess') }}
    </VBtn>
  </VCardText>
</template>
<script setup lang="ts">
import type { NoteWithExtension } from "@/stores/note-cache";

const { t } = useI18n();

const props = defineProps<{
  note: NoteWithExtension;
  detailed?: boolean;
  simple?: boolean;
  /** 防止subnote也被折叠 */
  neverCollapse?: boolean;
}>();

const collapsed = ref(true);
const cwExpanded = ref(false);

const isLongNote = computed(() => [
  () => (props.note.text?.length ?? 0) > 500,
  () => (props.note.text ?? "").split("\n").length > 5,
  () => (props.note.files?.length ?? 0) > 4
].some((check) => check()));

const moreText = computed(() => [
  props.note.text && t('_cw.chars', props.note.text?.length ?? 0),
  (props.note.files?.length ?? 0) > 0 && t('_cw.files', props.note.files?.length ?? 0),
].filter(Boolean).join(", "));

// 这个逻辑经常出现 bug，取消掉
// /**
//  * 当 noteTextRef 第一次被加载的时候，施加一个 ResizeObserver
//  * 只要检测到一次 long note 就无须再检测
//  */
// watch(
//   noteTextRef,
//   () => {
//     const observer = useResizeObserver(noteTextRef, () => {
//       const height = noteTextRef.value?.clientHeight;
//       if (height && height > 400) {
//         isLongNote.value = true;
//         observer.stop();
//       }
//     });
//   },
//   {
//     once: true,
//   },
// );
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
</style>
