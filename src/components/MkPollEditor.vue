<template>
  <VCardText>
    <VTextField
      v-for="(_, num) in poll.choices"
      ref="textFields"
      :key="num"
      v-model="poll.choices[num]"
      class="mb-2"
      :label="t('_poll.choiceN', num + 1)"
      variant="outlined"
      density="compact"
      hide-details="auto"
    >
      <template #append-inner>
        <VBtn
          icon="mdi-arrow-up-thin"
          size="x-small"
          variant="plain"
          :disabled="num == 0"
          @click="swapPoll(num, num - 1)"
        />
        <VBtn
          icon="mdi-arrow-down-thin"
          size="x-small"
          variant="plain"
          :disabled="num == poll.choices.length - 1"
          @click="swapPoll(num, num + 1)"
        />
        <VBtn
          icon="mdi-close"
          size="x-small"
          variant="plain"
          :disabled="poll.choices.length <= 2"
          @click="removePoll(num)"
        />
      </template>
    </VTextField>
    <VTextField
      v-if="poll.choices.length < 10"
      :key="poll.choices.length"
      class="mb-2"
      :label="t('add')"
      variant="outlined"
      density="compact"
      hide-details="auto"
      @click.stop="addPoll"
    />
    <VSwitch
      v-model="poll.multiple"
      :label="t('_poll.multiple')"
      hide-details
    />
    <VContainer class="pa-0">
      <VRow>
        <VCol>
          <VSelect
            v-model="expireKind"
            :items="expireKinds"
            hide-details
          />
        </VCol>
        <VCol v-if="expireKind == 'after'">
          <VTextField
            v-model="expiredAfter"
            type="number"
            hide-details="auto"
          />
        </VCol>
        <VCol v-if="expireKind == 'after'">
          <VSelect
            v-model="after"
            :items="afterKinds"
            hide-details
          />
        </VCol>
        <VCol v-if="expireKind == 'at'">
          <VTextField
            v-model="expiredAt"
            type="datetime-local"
            hide-details
          />
        </VCol>
      </VRow>
    </VContainer>
  </VCardText>
</template>

<script setup lang="ts">
import type { DraftPoll } from "@/stores/draft";
const poll = defineModel<DraftPoll>({ required: true });

onMounted(() => {
  while (poll.value.choices.length < 2) {
    poll.value.choices.push("");
  }
});

const { t } = useI18n();
const textFields = useTemplateRef("textFields");

const expireKinds = computed(() =>
  (["infinite", "after", "at"] as const).map((x) => ({
    title: t(`_poll.${x}`),
    value: x,
  }))
);

const afterKinds = computed(() =>
  ["day", "hour", "minute", "second"].map((x) => ({
    title: t(`_time.${x}`),
    value: x,
  }))
);

const after = ref<"day" | "hour" | "minute" | "second">("day");

const expireKind = computed({
  get: () =>
    poll.value.expiredAfter != null
      ? "after"
      : poll.value.expiresAt != null
      ? "at"
      : "infinite",
  set: (v: "infinite" | "after" | "at") => {
    if (v == "after") {
      poll.value.expiredAfter = 3 * 86400 * 1000;
      poll.value.expiresAt = undefined;
    } else if (v == "infinite") {
      poll.value.expiredAfter = undefined;
      poll.value.expiresAt = undefined;
    } else {
      poll.value.expiredAfter = undefined;
      poll.value.expiresAt = Date.now();
    }
  },
});

const expiredAfter = computed({
  get: () => {
    switch (after.value) {
      case "day":
        return Math.round(poll.value.expiredAfter! / (1000 * 86400));
      case "hour":
        return Math.round(poll.value.expiredAfter! / (1000 * 3600));
      case "minute":
        return Math.round(poll.value.expiredAfter! / (1000 * 60));
      case "second":
        return Math.round(poll.value.expiredAfter! / 1000);
    }
  },
  set: (v: number) => {
    switch (after.value) {
      case "day":
        poll.value.expiredAfter = v * (1000 * 86400);
        break;
      case "hour":
        poll.value.expiredAfter = v * (1000 * 3600);
        break;
      case "minute":
        poll.value.expiredAfter = v * (1000 * 60);
        break;
      case "second":
        poll.value.expiredAfter = v * 1000;
        break;
    }
  },
});

const expiredAt = computed({
  get: () => new Date(poll.value.expiresAt!).toISOString().slice(0, -1),
  set: (v: string) => {
    poll.value.expiresAt = new Date(v).getTime();
  },
});

function removePoll(idx: number) {
  poll.value.choices.splice(idx, 1);
}

function swapPoll(a: number, b: number) {
  const t = poll.value.choices[b];
  poll.value.choices[b] = poll.value.choices[a];
  poll.value.choices[a] = t;
}

function addPoll() {
  poll.value.choices.push("");
  nextTick(() => {
    textFields.value?.at(-1)?.focus();
  });
}
</script>
