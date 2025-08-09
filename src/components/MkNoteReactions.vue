<template>
  <VItemGroup>
    <VBtn
      v-for="[reaction, count] in reactions"
      :key="reaction"
      :value="reaction"
      :loading="reacting == reaction"
      :color="myReaction == reaction ? 'primary' : undefined"
      variant="tonal"
      rounded
      @click.stop="myReaction == reaction ? undoReact() : react(reaction)"
    >
      <MkAnyEmoji
        :name="reaction"
        :urls="emojiUrls"
      />
      <span>
        {{ count }}
      </span>
    </VBtn>
  </VItemGroup>
</template>

<script setup lang="ts">
import type { Note } from "misskey-js/entities.js";

const props = defineProps<{
  note: Note;
}>();

const account = useAccount();
const reactions = computed(() => Object.entries(props.note.reactions));
const emojiUrls = computed(() => props.note.reactionEmojis ?? {});
const reacting = ref<string | null>();
const myReaction = computed(() => props.note.myReaction);

async function react(reaction: string) {
  try {
    reacting.value = reaction;
    await account.api.request("notes/reactions/create", {
      noteId: props.note.id,
      reaction,
    });
  } catch (err) {
    console.error(err);
    usePopupMessage().push({
      type: "error",
      message: (err as { message: string }).message,
    });
  } finally {
    reacting.value = undefined;
  }
}

async function undoReact() {
  try {
    reacting.value = myReaction.value;
    await account.api.request("notes/reactions/delete", {
      noteId: props.note.id,
    });
  } catch (err) {
    console.error(err);
    usePopupMessage().push({
      type: "error",
      message: (err as { message: string }).message,
    });
  } finally {
    reacting.value = undefined;
  }
}
</script>