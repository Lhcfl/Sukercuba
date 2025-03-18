<template>
  <VCard
    v-ripple.stop
    :variant
    :loading
    :disabled="loading"
    @keydown.stop
    @keyup.stop
  >
    <VCardActions class="d-flex justify-space-between">
      <MkAvatar
        v-if="account.me"
        :user="account.me"
      />
      <div>
        <VBtn icon="mdi-earth" />
        <VBtn icon="mdi-cloud-check-outline" />
        <VBtn icon="mdi-clock-outline" />
        <VBtn
          v-if="allowCancel"
          icon="mdi-close"
          @click.stop="emit('cancel')"
        />
      </div>
    </VCardActions>
    <VCardText class="py-0">
      <VTextarea
        v-if="draft.showCw"
        v-model="draft.cw"
        :rows="2"
        density="compact"
        auto-grow
        variant="underlined"
        :label="t('_initialTutorial._postNote._cw.title')"
        hide-details="auto"
      />
      <VTextarea
        v-model="draft.text"
        :loading
        :rows="2"
        density="compact"
        :placeholder="t('_postForm._placeholders.' + randomPlaceHolder)"
        variant="underlined"
        flat
        autofocus
        auto-grow
        hide-details="auto"
        @keydown="onkeydown"
      />
      <VCombobox
        v-if="draft.showTags"
        v-model="draft.appendTags"
        :label="t('tags')"
        variant="underlined"
        :delimiters="[' ']"
        chips
        multiple
        closable-chips
        hide-details="auto"
      >
        <template #chip="data">
          <VChip
            :key="data.index"
            prepend-icon="mdi-tag"
            v-bind="data.props"
          />
        </template>
      </VCombobox>
    </VCardText>
    <VCardText v-if="draft.showPreview">
      <p v-if="draft.computedCw">
        <MkMfm :text="draft.computedCw" />
        <VDivider />
      </p>
      <p>
        <MkMfm :text="draft.computedText" />
      </p>
    </VCardText>
    <VCardActions class="d-flex justify-space-between">
      <div>
        <VBtn icon="mdi-image-outline" />
        <VBtn icon="mdi-poll" />
        <VBtn
          icon="mdi-eye-off-outline"
          :color="draft.showCw ? 'primary' : undefined"
          @click.stop="draft.showCw = !draft.showCw"
        />
        <VBtn
          icon="mdi-tag-multiple-outline"
          :color="draft.showTags ? 'primary' : undefined"
          @click.stop="draft.showTags = !draft.showTags"
        />
        <VBtn icon="mdi-sticker-emoji" />
        <VBtn icon="mdi-dots-horizontal" />
      </div>
      <div>
        <VBtn
          icon="mdi-eye-outline"
          :color="draft.showPreview ? 'primary' : undefined"
          @click.stop="draft.showPreview = !draft.showPreview"
        />
        <VBtn
          color="primary"
          variant="tonal"
          :prepend-icon="sendbtn.icon"
          :loading
          :text="sendbtn.text"
          :disabled="submitDisabled"
          @click.stop="submit"
        />
      </div>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { useAccount } from "@/stores/account";
import { useDraft } from "@/stores/draft";
import type { NoteWithExtension } from "@/stores/note-cache";
import type { NotesCreateRequest } from "misskey-js/entities.js";
import type { VCard } from "vuetify/components";

const props = withDefaults(
  defineProps<{
    replyId?: string;
    quoteId?: string;
    edit?: NoteWithExtension;
    allowCancel?: boolean;
    variant?: VCard["$props"]["variant"];
  }>(),
  {
    replyId: undefined,
    quoteId: undefined,
    edit: undefined,
    allowCancel: undefined,
    variant: "flat",
  }
);

const { t } = useI18n();

const emit = defineEmits<{
  done: [];
  cancel: [];
}>();

const account = useAccount();
const loading = ref(false);
const draft = useDraft({
  replyId: props.replyId,
  quoteId: props.quoteId,
  edit: props.edit,
});
const sendbtn = computed(() =>
  props.edit
    ? { icon: "mdi-square-edit-outline", text: t("edit") }
    : props.quoteId
    ? { icon: "mdi-comment-quote-outline", text: t("quote") }
    : props.replyId
    ? { icon: "mdi-reply-outline", text: t("reply") }
    : { icon: "mdi-send-outline", text: t("send") }
);
const randomPlaceHolder = ref("abcdef"[Math.floor(Math.random() * 6)]);

const submitDisabled = computed(() => !draft.computedText);

async function submit() {
  try {
    loading.value = true;

    const req: NotesCreateRequest = {
      text: draft.computedText,
      cw: draft.computedCw,
      replyId: props.replyId,
      renoteId: props.quoteId,
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
      draft.remove();
    } else {
      // Clean draft
      draft.text = "";
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function onkeydown(ev: KeyboardEvent) {
  if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey) && !submitDisabled.value)
    submit();
}
</script>
