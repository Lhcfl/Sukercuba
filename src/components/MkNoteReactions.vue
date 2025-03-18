<template>
  <VChipGroup
    v-model="myReaction"
    selected-class="text-primary"
    column
  >
    <VChip
      v-for="[reaction, count] in reactions"
      :key="reaction"
      :value="reaction"
      @click.stop
    >
      <MkAnyEmoji
        :name="reaction"
        :urls="emojiUrls"
      />
      <VProgressCircular
        v-if="reacting == reaction"
        indeterminate
      />
      <span v-else>
        {{ count }}
      </span>
    </VChip>
  </VChipGroup>
</template>

<script setup lang="ts">
import { useAccount } from '@/stores/account';
import type { Note } from 'misskey-js/entities.js';
const props = defineProps<{
  note: Note,
}>();

const account = useAccount();
const reactions = computed(() => Object.entries(props.note.reactions));
const emojiUrls = computed(() => props.note.reactionEmojis ?? {});
const reacting = ref<string | null>();

const myReaction = computed({
  get: () => props.note.myReaction,
  set: (v?: string) => {
    if (v == null) {
      undoReact()
    } else {
      react(v);
    }
    console.log(v);
  }
})

async function react(reaction: string) {
  try {
    reacting.value = reaction;
    await account.api.request("notes/reactions/create", {
      noteId: props.note.id,
      reaction,
    });
  } catch (err) {
    console.error(err);
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
  } finally {
    reacting.value = undefined;
  }
}
</script>