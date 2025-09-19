<template>
  <div class="flex flex-col w-full">
    <div class="flex items-center">
      <VBtn variant="plain" @click.stop="posting = posting === 'reply' ? null : 'reply'"
        :color="posting === 'reply' ? 'primary' : 'base'" v-bind="note.repliesCount == 0 ? {
          icon: 'mdi-reply'
        } : {
          prependIcon: 'mdi-reply',
          rounded: true,
          size: 'large',
          text: `${note.repliesCount}`
        }" />

      <VBtn ref="renoteBtn" v-if="renoteable" variant="plain" :loading="renoting"
        :color="note.isRenoted ? 'primary' : 'base'" @click.stop="renoteOrCancel" v-bind="note.renoteCount == 0 ? {
          icon: 'mdi-repeat-variant'
        } : {
          prependIcon: 'mdi-repeat-variant',
          rounded: true,
          size: 'large',
          text: `${note.renoteCount}`
        }" />
      <VMenu v-model="showRenoteVisibilitySelector" :activator="renoteBtn">
        <VList>
          <VListItem v-for="visibility in visibilities" :key="visibility.value" :prepend-icon="visibility.icon"
            :title="visibility.title" :subtitle="visibility.subtitle"
            @click.stop="renoteWithVisibility(visibility.value)" />
          <VListItem :class="renoteLocalOnly && 'text-primary'" :prepend-icon="renoteLocalOnly
            ? 'mdi-toggle-switch-outline'
            : 'mdi-toggle-switch-off-outline'
            " :title="t('_visibility.disableFederation')" :subtitle="t('_visibility.disableFederationDescription')"
            @click.stop="renoteLocalOnly = !renoteLocalOnly" />
        </VList>
      </VMenu>

      <VBtn variant="plain" icon="mdi-format-quote-close-outline" :color="posting === 'quote' ? 'primary' : 'base'"
        @click.stop="posting = posting === 'quote' ? null : 'quote'" />
      <VBtn v-if="note.myReaction" variant="plain" icon="mdi-minus" color="primary" :loading="reacting"
        @click.stop="undoReact" />
      <template v-else>
        <VBtn variant="plain" color="base" icon="mdi-heart-outline" :loading="reacting" @click.stop="react()" />
        <VMenu v-if="note.reactionAcceptance !== 'likeOnly'" v-model="showEmojiPicker" :close-on-content-click="false">
          <template #activator="{ props: p }">
            <VBtn v-if="!reacting" variant="plain" color="base" v-bind="p" icon="mdi-sticker-emoji" />
          </template>
          <MkEmojiPicker :accept="note.reactionAcceptance" @selected="react" />
        </VMenu>
      </template>
      <VMenu v-model="showMenu" close-on-content-click>
        <template #activator="{ props: p }">
          <VBtn variant="plain" color="base" icon="mdi-dots-horizontal" v-bind="p" @click.stop />
        </template>
        <VList>
          <VListItem prepend-icon="mdi-content-copy" :title="t('copyContent')" @click.stop="copyNoteContent" />
          <VListItem prepend-icon="mdi-link" :title="t('copyLink')" @click.stop="copyLink" />
          <VListItem prepend-icon="mdi-link" :title="t('copyRemoteLink')" @click.stop="copyRemoteLink"
            v-if="isRemote" />
          <VListItem prepend-icon="mdi-remote-desktop" :title="t('showOnRemote')" @click.stop="openRemote" />
          <VListItem prepend-icon="mdi-share-variant-outline" :title="t('share')" @click.stop="share" />
          <VListItem prepend-icon="mdi-translate" :title="t('translate')"
            @click.stop="() => { emit('translate'); showMenu = false; }" />
          <VListItem prepend-icon="mdi-star-outline" :title="t('favorite')" @click.stop="favorite" />
          <VDivider />
          <VListItem v-if="isMyNote" prepend-icon="mdi-square-edit-outline" :title="t('edit')"
            @click.stop="() => { posting = 'edit'; showMenu = false; }" />
          <VListItem v-if="isMyNote" class="text-red" prepend-icon="mdi-delete-outline" @click.stop="deleteNote">
            <VProgressCircular v-if="deleting" indeterminate />
            <span v-else>
              {{ t("delete") }}
            </span>
          </VListItem>
        </VList>
      </VMenu>
    </div>
    <VDivider v-if="posting" />
    <div class="post-form-wrapper" v-if="posting" @click.stop @keydown.stop>
      <MkPostForm variant="text" class="bg-transparent" :reply-id="posting === 'reply' ? note.id : undefined"
        :quote-id="posting === 'quote' ? note.id : undefined" :edit="posting === 'edit' ? note : undefined" allow-cancel
        @click.stop @done="posting = null" @cancel="posting = null" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isAPIError } from "misskey-js/api.js";
import type { EmojiSimple } from "misskey-js/entities.js";
import type { NoteWithExtension } from "@/stores/note-cache";

const props = defineProps<{
  note: NoteWithExtension;
}>();

const emit = defineEmits<{
  translate: [];
}>();

const { t } = useI18n();
const router = useRouter();
const account = useAccount();
const snackbarQueue = useSnackbarQueue();
const renoting = ref(false);
const reacting = ref(false);
const posting = ref<"reply" | "quote" | "edit" | null>(null);
const deleting = ref(false);
const showMenu = ref(false);
const showRenoteVisibilitySelector = ref(false);
const showEmojiPicker = ref(false);
const renoteLocalOnly = ref(false);
const renoteable = computed(() => props.note.visibility === "public" || props.note.visibility === "home");
const isMyNote = computed(() => props.note.userId === account.me?.id);
const isRemote = computed(() => props.note.user.host != null)

// type trick: bypass `:activator=` check
// oxlint-disable-next-line no-explicit-any
const renoteBtn = useTemplateRef("renoteBtn") as unknown as Ref<any>;

const visibilities = computed(() =>
  (
    [
      { value: "public", icon: "mdi-earth" },
      { value: "home", icon: "mdi-home-outline" },
      { value: "followers", icon: "mdi-lock-outline" },
    ] as const
  ).map((v) => ({
    ...v,
    title: t(`_visibility.${v.value}`),
    subtitle: t(`_visibility.${v.value}Description`),
  }))
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function popupError(err: any) {
  console.error(err);
  if (isAPIError(err)) {
    snackbarQueue.push({ color: "error", text: err.message });
  } else {
    if (err instanceof Error) {
      snackbarQueue.push({ color: "error", text: err.message });
    }
  }
}

async function renoteOrCancel() {
  try {
    renoting.value = true;
    if (props.note.isRenoted) {
      await account.api.request("notes/unrenote", { noteId: props.note.id });
    } else {
      // do nothing
      // showRenoteVisibilitySelector.value = true
      // await account.api.request("notes/create", { renoteId: props.note.id });
    }
  } catch (err) {
    popupError(err);
  } finally {
    renoting.value = false;
  }
}

async function renoteWithVisibility(visibility: "public" | "home" | "followers") {
  try {
    showRenoteVisibilitySelector.value = false;
    renoting.value = true;
    await account.api.request("notes/create", { renoteId: props.note.id, visibility });
  } catch (err) {
    popupError(err);
  } finally {
    renoting.value = false;
  }
}

async function react(emoji?: EmojiSimple) {
  try {
    reacting.value = true;
    showEmojiPicker.value = false;
    const reaction = emoji?.name ? `:${emoji.name}:` : "❤️";
    await account.api.request("notes/reactions/create", {
      noteId: props.note.id,
      reaction,
    });
  } catch (err) {
    popupError(err);
  } finally {
    reacting.value = false;
  }
}

async function undoReact() {
  try {
    reacting.value = true;
    await account.api.request("notes/reactions/delete", {
      noteId: props.note.id,
    });
  } catch (err) {
    popupError(err);
  } finally {
    reacting.value = false;
  }
}

async function deleteNote() {
  try {
    deleting.value = true;
    await account.api.request("notes/delete", {
      noteId: props.note.id,
    });
  } catch (err) {
    popupError(err);
  } finally {
    deleting.value = false;
  }
}

async function favorite() {
  try {
    showMenu.value = false;
    await account.api.request("notes/favorites/create", {
      noteId: props.note.id,
    });
    snackbarQueue.push({ text: t("favorited") });
  } catch (err) {
    popupError(err);
  }
}

function openRemote() {
  window.open(
    props.note.url ?? new URL(`/notes/${props.note.id}`, account.site),
  );
  showMenu.value = false;
}

async function copyNoteContent() {
  showMenu.value = false;
  let ctnt = props.note.cw ?? "";
  if (ctnt) ctnt += "\n-------\n";
  ctnt += props.note.text;
  await navigator.clipboard.writeText(ctnt);
}

function getLocalUrl() {
  return new URL(
    router.resolve({
      name: "/notes/[id]",
      params: { id: props.note.id },
    }).fullPath,
    window.location.origin,
  ).toString();
}

async function copyLink() {
  showMenu.value = false;
  await navigator.clipboard.writeText(getLocalUrl());
}

async function copyRemoteLink() {
  showMenu.value = false;
  await navigator.clipboard.writeText(
    props.note.url ??
    new URL(`/notes/${props.note.id}`, account.site).toString(),
  );
}

async function share() {
  showMenu.value = false;
  await navigator.share({
    url: getLocalUrl(),
    text: props.note.cw || props.note.text || "",
  });
}
</script>
