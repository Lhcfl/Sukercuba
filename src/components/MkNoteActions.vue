<template>
  <div>
    <VBtn
      v-if="note.repliesCount == 0"
      icon="mdi-reply"
    />
    <VBtn
      v-else
      prepend-icon="mdi-reply"
      rounded
      size="large"
      :text="note.repliesCount"
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
    <VBtn icon="mdi-format-quote-close-outline" />
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
      <VBtn
        icon="mdi-sticker-emoji"
        :loading="reacting"
      />
    </template>
    <VBtn icon="mdi-dots-horizontal" />
  </div>
</template>

<script setup lang="ts">
import { useAccount } from "@/stores/account";
import type { NoteWithExtension } from "@/stores/note-cache";

const props = defineProps<{
  note: NoteWithExtension;
}>();

const account = useAccount();
const renoting = ref(false);
const reacting = ref(false);

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

async function react(reaction?: string) {
  try {
    reacting.value = true;
    reaction ??= "❤️";
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
</script>
