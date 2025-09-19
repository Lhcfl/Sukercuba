<template>
  <div v-ripple="!disableRoute" :class="$style.note" @click.stop="routeToNote">
    <MkNoteSub v-if="appearNote.reply && !detailed && !simple" :note="appearNote.reply" :detailed="false" />
    <MkNoteRenoteBar v-if="isPureRenote" :note />
    <VCardItem>
      <template #prepend>
        <MkAvatar :user="appearNote.user" />
      </template>
      <MkNoteHeader :note="appearNote" />
    </VCardItem>
    <MkNoteBody :note="appearNote" :detailed :simple :never-collapse />
    <template v-if="translatedText || translating" :loading="translating">
      <VCardText v-if="translatedText">
        <p class="font-bold my-2">{{ $t("translatedFrom", { x: sourceLang }) }}</p>
        <p>
          <MkMfm :text="translatedText" />
        </p>
      </VCardText>
      <VSkeletonLoader v-if="translating" type="paragraph" />
    </template>
    <VCardText v-if="!hideReactions && Object.keys(appearNote.reactions).length > 0" class="py-0">
      <MkNoteReactions :note="appearNote" />
    </VCardText>
    <VCardActions v-if="!hideActions" class="py-0">
      <MkNoteActions :note="appearNote" @translate="translateNote" />
    </VCardActions>
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
    detailed?: boolean;
    simple?: boolean;
    disableRoute?: boolean;
    hideReactions?: boolean;
    /** 防止subnote也被折叠 */
    neverCollapse?: boolean;
  }>(),
  {
    variant: undefined,
    gap: 0,
  },
);

const router = useRouter();
const account = useAccount();

const isPureRenote = computed(() => Misskey.note.isPureRenote(props.note));
const appearNote = computed(() =>
  isPureRenote.value ? props.note.renote! : props.note,
);

const translating = ref(false);
const sourceLang = ref<string | null>(null);
const translatedText = ref<string | null>(null);

function routeToNote() {
  if (window.getSelection()?.toString()) {
    // 如果有选中的文本，则不触发路由跳转
    return;
  }
  if (props.disableRoute) return;
  router.push({ name: "/notes/[id]", params: { id: appearNote.value.id } });
}

async function translateNote() {
  try {
    translating.value = true;
    const res = await account.api.request("notes/translate", {
      noteId: appearNote.value.id,
      targetLang: account.me?.lang ?? navigator.language,
    });

    sourceLang.value = res.sourceLang;
    translatedText.value = res.text;
  } finally {
    translating.value = false;
  }
}

</script>

<style lang="scss" module>
.note {
  overflow: visible;

  :global(.v-card-item__content) {
    overflow: visible;
  }
}
</style>
