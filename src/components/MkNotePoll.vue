<template>
  <VList density="compact">
    <VListItem
      v-for="(choice, idx) in choices"
      :key="idx"
      rounded
      class="text-body-2"
      :class="{ 'text-primary': choice.isVoted }"
      :prepend-icon="
        choice.isVoted ? 'mdi-circle-slice-8' : 'mdi-circle-outline'
      "
      @click.stop="vote(idx)"
    >
      <span>
        {{ choice.text }}
      </span>
      <span
        v-if="meVoted"
        class="text-grey"
      >
        ({{ t("_poll.votesCount", choice.votes) }})
      </span>
      <VProgressLinear
        v-if="expired || meVoted"
        :model-value="choice.precentage"
        height="3"
      />
    </VListItem>
    <div class="text-subtitle-2">
      <span
        v-if="poll.multiple"
        class="mr-1 text-secondary"
      >{{
        t("_poll.multiple")
      }}</span>
      <span
        v-if="expired"
        class="mr-1 text-grey"
      >{{ t("_poll.closed") }}</span>
      <span
        v-if="meVoted"
        class="mr-1 text-primary"
      >{{
        t("_poll.voted")
      }}</span>
    </div>
  </VList>
</template>

<script setup lang="ts">
import { useAccount } from "@/stores/account";
import type { NoteWithExtension } from "@/stores/note-cache";
const props = defineProps<{
  note: NoteWithExtension;
  poll: NonNullable<NoteWithExtension["poll"]>;
}>();

const { t } = useI18n();
const account = useAccount();

const expired = computed(() =>
  props.poll.expiresAt
    ? new Date(props.poll.expiresAt).getTime() < Date.now()
    : false
);

const meVoted = computed(() => props.poll.choices.some((x) => x.isVoted));

const choices = computed(() => {
  const cs = props.poll.choices;
  const total_votes = props.poll.multiple
    ? cs.reduce((sum, choice) => Math.max(sum, choice.votes), 0)
    : cs.reduce((sum, choice) => sum + choice.votes, 0);
  return cs.map((choice) => ({
    ...choice,
    precentage: Math.round((choice.votes / total_votes) * 100),
  }));
});

function vote(choice: number) {
  if (expired.value) {
    return;
  }
  account.api.request("notes/polls/vote", { noteId: props.note.id, choice });
}
</script>
