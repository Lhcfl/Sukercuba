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
        <VBtn
          icon="mdi-sticker-emoji"
          :loading="reacting"
        />
      </template>
      <VMenu>
        <template #activator="{ props: p }">
          <VBtn
            icon="mdi-dots-horizontal"
            v-bind="p"
            @click.stop
          />
        </template>
        <VList>
          <VListItem
            v-if="note.userId == account.me?.id"
            prepend-icon="mdi-square-edit-outline"
            @click.stop="posting = 'edit'"
          >
            Edit
          </VListItem>
          <VListItem prepend-icon="mdi-translate">
            Translate
          </VListItem>
          <VListItem
            prepend-icon="mdi-remote-desktop"
            @click.stop="openRemote()"
          >
            Open in remote
          </VListItem>
        </VList>
      </VMenu>
    </div>
    <MkPostForm
      v-if="posting"
      variant="plain"
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
import { useAccount } from "@/stores/account";
import type { NoteWithExtension } from "@/stores/note-cache";

const props = defineProps<{
  note: NoteWithExtension;
}>();

const account = useAccount();
const renoting = ref(false);
const reacting = ref(false);
const posting = ref<"reply" | "quote" | "edit" | null>(null);

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

function openRemote() {
  window.open(props.note.url ?? new URL("/notes/" + props.note.id, account.site));
}
</script>
