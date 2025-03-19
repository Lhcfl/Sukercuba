<template>
  <div class="d-flex flex-column w-100">
    <div class="d-flex align-center">
      <VBtn
        v-if="note.repliesCount == 0"
        icon="mdi-reply"
        :color="posting === 'reply' ? 'primary' : undefined"
        @click.stop="posting = posting === 'reply' ? null : 'reply'"
      />
      <VBtn
        v-else
        prepend-icon="mdi-reply"
        rounded
        size="large"
        :text="note.repliesCount"
        :color="posting === 'reply' ? 'primary' : undefined"
        @click.stop="posting = posting === 'reply' ? null : 'reply'"
      />
      <VBtn
        v-if="note.renoteCount == 0"
        icon="mdi-repeat-variant"
        :loading="renoting"
        :color="note.renotedByMe ? 'primary' : undefined"
        @click.stop="renoteOrCancel"
      />
      <VBtn
        v-else
        prepend-icon="mdi-repeat-variant"
        rounded
        :loading="renoting"
        :color="note.renotedByMe ? 'primary' : undefined"
        size="large"
        :text="note.renoteCount"
        @click.stop="renoteOrCancel"
      />
      <VBtn
        icon="mdi-format-quote-close-outline"
        :color="posting === 'quote' ? 'primary' : undefined"
        @click.stop="posting = posting === 'quote' ? null : 'quote'"
      />
      <VBtn
        v-if="note.myReaction"
        icon="mdi-minus"
        color="primary"
        :loading="reacting"
        @click.stop="undoReact"
      />
      <template v-else>
        <VBtn
          icon="mdi-heart-outline"
          :loading="reacting"
          @click.stop="react()"
        />
        <VMenu
          v-if="note.reactionAcceptance !== 'likeOnly'"
          v-model="showEmojiPicker"
          :close-on-content-click="false"
        >
          <template #activator="{ props: p }">
            <VBtn
              v-bind="p"
              icon="mdi-sticker-emoji"
              :loading="reacting"
            />
          </template>
          <MkEmojiPicker
            :accept="note.reactionAcceptance"
            @selected="react"
          />
        </VMenu>
      </template>
      <VMenu v-model="showMenu">
        <template #activator="{ props: p }">
          <VBtn
            icon="mdi-dots-horizontal"
            v-bind="p"
            @click.stop
          />
        </template>
        <VList>
          <VListItem
            prepend-icon="mdi-content-copy"
            :title="t('copyContent')"
            @click.stop="copyNoteContent"
          />
          <VListItem
            prepend-icon="mdi-link"
            :title="t('copyLink')"
            @click.stop="copyLink"
          />
          <VListItem
            prepend-icon="mdi-link"
            :title="t('copyRemoteLink')"
            @click.stop="copyRemoteLink"
          />
          <VListItem
            prepend-icon="mdi-remote-desktop"
            :title="t('showOnRemote')"
            @click.stop="openRemote"
          />
          <VListItem
            prepend-icon="mdi-share-variant-outline"
            :title="t('share')"
            @click.stop="share"
          />
          <VListItem
            prepend-icon="mdi-translate"
            :title="t('translate')"
            @click.stop="
              emit('translate');
              showMenu = false;
            "
          />
          <VDivider />
          <VListItem
            v-if="isMyNote"
            prepend-icon="mdi-square-edit-outline"
            :title="t('edit')"
            @click.stop="
              posting = 'edit';
              showMenu = false;
            "
          />
          <VListItem
            v-if="isMyNote"
            class="text-red"
            prepend-icon="mdi-delete-outline"
            @click.stop="deleteNote"
          >
            <VProgressCircular
              v-if="deleting"
              indeterminate
            />
            <span v-else>
              {{ t("delete") }}
            </span>
          </VListItem>
        </VList>
      </VMenu>
    </div>
    <MkPostForm
      v-if="posting"
      variant="outlined"
      :reply-id="posting === 'reply' ? note.id : undefined"
      :quote-id="posting === 'quote' ? note.id : undefined"
      :edit="posting === 'edit' ? note : undefined"
      allow-cancel
      @click.stop
      @done="posting = null"
      @cancel="posting = null"
    />
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
import { useAccount } from "@/stores/account";
import type { NoteWithExtension } from "@/stores/note-cache";
import type { EmojiSimple } from "misskey-js/entities.js";

const props = defineProps<{
  note: NoteWithExtension;
}>();

const emit = defineEmits<{
  translate: [];
}>();

const { t } = useI18n();
const account = useAccount();
const renoting = ref(false);
const reacting = ref(false);
const posting = ref<"reply" | "quote" | "edit" | null>(null);
const deleting = ref(false);
const showMenu = ref(false);
const showEmojiPicker = ref(false);

const isMyNote = computed(() => props.note.userId === account.me?.id);

async function renoteOrCancel() {
  try {
    renoting.value = true;
    if (props.note.renotedByMe) {
      await account.api.request("notes/unrenote", { noteId: props.note.id });
    } else {
      await account.api.request("notes/create", { renoteId: props.note.id });
    }
  } catch (err) {
    console.error(err);
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
    console.error(err);
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
    console.error(err);
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
    console.error(err);
  } finally {
    deleting.value = false;
  }
}

function openRemote() {
  window.open(
    props.note.url ?? new URL("/notes/" + props.note.id, account.site)
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
    window.location.origin
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
      new URL(`/notes/${props.note.id}`, account.site).toString()
  );
}

async function share() {
  showMenu.value = false;
  await navigator.share({
    url: getLocalUrl(),
    text: props.note.cw || props.note.text || ""
  });
}
</script>
