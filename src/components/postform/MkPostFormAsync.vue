<template>
  <!-- wrap the component in a vcard -->
  <!-- <VCard v-ripple.stop="false" :variant :loading :disabled="loading" @keydown.stop @keyup.stop> -->
  <VCardActions class="flex justify-between">
    <MkAvatar v-if="account.me" no-tooltip :user="account.me" />
    <div>
      <MkVisibilityPicker v-model="draft" :disabled="!!edit" />
      <VBtn icon="mdi-clock-outline" />
      <VBtn v-if="allowCancel" icon="mdi-close" @click.stop="emit('cancel')" />
    </div>
  </VCardActions>
  <VCardText class="py-0">
    <VTextarea v-if="draft.showCw" v-model="draft.cw" :rows="2" density="compact" auto-grow variant="underlined"
      :label="t('_initialTutorial._postNote._cw.title')" hide-details="auto" />
    <VTextarea ref="textRef" v-model="draft.text" :loading :rows="2" density="compact"
      :placeholder="t('_postForm._placeholders.' + randomPlaceHolder)" variant="underlined" flat autofocus auto-grow
      hide-details="auto" @keydown="onkeydown" @paste="onPaste" />
    <VCombobox v-if="draft.showTags" v-model="draft.appendTags" :label="t('tags')" variant="underlined"
      :delimiters="[' ']" chips multiple closable-chips hide-details="auto">
      <template #chip="data">
        <VChip :key="data.index" prepend-icon="mdi-tag" v-bind="data.props" />
      </template>
    </VCombobox>
  </VCardText>
  <MkPollEditor v-if="draft.showPoll" v-model="draft.poll" />
  <MkPostFormFiles v-if="draft.files.length" :files="draft.files" />
  <VCardText v-if="draft.showPreview">
    <div class="postform-preview rounded-lg">
      <p v-if="computedCw">
        <MkMfm :text="computedCw" />
        <VDivider />
      </p>
      <p>
        <MkMfm :text="computedText" />
      </p>
    </div>
  </VCardText>
  <VCardActions class="flex justify-between">
    <div>
      <VMenu :close-on-content-click="true">
        <template #activator="{ props: p }">
          <VBtn icon="mdi-image-outline" v-bind="p" color="base"></VBtn>
        </template>
        <MkUploadFileMenu @uploading="onUploading" />
      </VMenu>
      <VBtn icon="mdi-poll" :color="draft.showPoll ? 'primary' : 'base'"
        @click.stop="draft.showPoll = !draft.showPoll" />
      <VBtn icon="mdi-eye-off-outline" :color="draft.showCw ? 'primary' : 'base'"
        @click.stop="draft.showCw = !draft.showCw" />
      <VBtn icon="mdi-tag-multiple-outline" :color="draft.showTags ? 'primary' : 'base'"
        @click.stop="draft.showTags = !draft.showTags" />
      <VMenu :close-on-content-click="false">
        <template #activator="{ props: p }">
          <VBtn color="base" icon="mdi-sticker-emoji" v-bind="p" />
        </template>
        <MkEmojiPicker @selected="prependEmoji" />
      </VMenu>
      <VBtn color="base" icon="mdi-dots-horizontal" />
    </div>
    <div>
      <VBtn icon="mdi-eye-outline" :color="draft.showPreview ? 'primary' : 'base'"
        @click.stop="draft.showPreview = !draft.showPreview" />
      <VBtn color="primary" variant="tonal" :prepend-icon="sendbtn.icon" :loading :text="sendbtn.text"
        :disabled="submitDisabled" @click.stop="submit" />
    </div>
  </VCardActions>
</template>

<script setup lang="ts">
import { IdbDraft } from '@/stores/draft-new';
import type { NoteWithExtension } from '@/stores/note-cache';
import { isAPIError } from 'misskey-js/api.js';
import type { DriveFile, EmojiSimple, NotesCreateRequest } from 'misskey-js/entities.js';

const props = defineProps<{
  replyId?: string;
  quoteId?: string;
  edit?: NoteWithExtension;
  allowCancel?: boolean;
}>();

const manager = new IdbDraft({
  replyId: props.replyId,
  quoteId: props.quoteId,
  edit: props.edit,
});

const emit = defineEmits<{
  done: [];
  cancel: [];
  "update:loading": [boolean];
}>();

const { t } = useI18n();
const account = useAccount();

const draft = await manager.load();

watch(draft, () => {
  manager.save();
}, {
  deep: true,
})

const textRef = useTemplateRef("textRef");
const loading = ref(false);
const randomPlaceHolder = ref("abcdef"[Math.floor(Math.random() * 6)]);
const popupMessages = usePopupMessage();
const uploader = useUploader();

watch(loading, (val) => {
  emit("update:loading", val);
}, {
  immediate: true,
});

const computedCw = computed(() => (draft.value.showCw ? draft.value.cw : undefined));
const computedTags = computed(() =>
  draft.value.showTags ? draft.value.appendTags : [],
);
const computedText = computed(() => {
  let ret = draft.value.text;
  if (computedTags.value.length > 0) {
    if (ret.at(-1) === "\n") {
      ret += "\n";
    } else {
      ret += " ";
    }
    ret += computedTags.value.map((x) => `#${x}`).join(" ");
  }
  return ret;
});
const pollAvailable = computed(
  () => draft.value.showPoll && draft.value.poll.choices.length >= 2,
);

const sendbtn = computed(() =>
  props.edit
    ? { icon: "mdi-square-edit-outline", text: t("edit") }
    : props.quoteId
      ? { icon: "mdi-comment-quote-outline", text: t("quote") }
      : props.replyId
        ? { icon: "mdi-reply-outline", text: t("reply") }
        : { icon: "mdi-send-outline", text: t("send") },
);

const submitDisabled = computed(
  () => !computedText.value && !pollAvailable.value,
);

async function submit() {
  try {
    loading.value = true;
    draft.value.poll.choices = draft.value.poll.choices.filter((x) => x);
    const req: NotesCreateRequest = {
      text: computedText.value || null,
      cw: computedCw.value || null,
      replyId: props.replyId,
      renoteId: props.quoteId,
      visibility: draft.value.visibility,
      localOnly: draft.value.localOnly,
      poll: draft.value.showPoll ? draft.value.poll : undefined,
      fileIds: draft.value.files.map(f => f.id),
    };

    if (props.edit) {
      // Sharkey and other misskey varient supports edit
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await account.api.request("notes/edit" as any, {
        editId: props.edit?.id,
        ...req,
      });
    } else {
      await account.api.request("notes/create", req);
    }

    emit("done");

    if (props.edit || props.quoteId || props.replyId) {
      manager.remove();
    } else {
      manager.clean();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err);
    if (isAPIError(err)) {
      popupMessages.push({ type: "error", message: err.message });
    } else {
      if (err instanceof Error) {
        popupMessages.push({ type: "error", message: err.message });
      }
    }
  } finally {
    loading.value = false;
  }
}

function onkeydown(ev: KeyboardEvent) {
  if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey) && !submitDisabled.value)
    submit();
}

function prependEmoji(emoji: EmojiSimple) {
  const el = textRef.value?.$el;
  if (!el) return;
  const textarea = (el as HTMLElement).querySelector("textarea");
  if (!textarea) {
    return;
  }
  const selectionSt = textarea.selectionStart;
  const st = draft.value.text.slice(0, selectionSt);
  const ed = draft.value.text.slice(textarea.selectionEnd);
  const emojiCode = `:${emoji.name}:`;
  draft.value.text = st + emojiCode + ed;
  setTimeout(() => {
    textarea.setSelectionRange(
      selectionSt + emojiCode.length,
      selectionSt + emojiCode.length,
    );
  }, 0);
}

async function onUploading(promises: Promise<DriveFile>[]) {
  emit('update:loading', true);
  const results = await Promise.allSettled(promises);
  emit('update:loading', false);
  draft.value.files = [
    ...draft.value.files,
    ...results.filter(x => x.status === 'fulfilled').map(x => x.value)
  ];
}

async function onPaste(ev: ClipboardEvent) {
  console.log(ev);
  const files = ev.clipboardData?.files;
  if (files && files.length > 0) {
    ev.preventDefault();
    ev.stopPropagation();
    onUploading(
      Array.from(files).map(f => uploader.uploadFile(f))
    );
  }
}

</script>
