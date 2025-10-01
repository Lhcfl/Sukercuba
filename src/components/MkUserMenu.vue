<template>
  <VMenu activator="parent">
    <VList>
      <VListItem prepend-icon="mdi-share-variant" :title="t('copyProfileUrl')" />
      <VListItem prepend-icon="mdi-email-edit-outline" :title="t('sendMessage')" />
      <VListItem prepend-icon="mdi-remote-desktop" :title="t('showOnRemote')" />
      <VListItem prepend-icon="mdi-account-search-outline" :title="t('searchThisUsersNotes')" />
      <template v-if="!isMe">
        <VDivider />
        <VListItem v-if="user.isFollowing" prepend-icon="mdi-account-minus-outline" :title="t('breakFollow')"
          @click="withEmitLoading('breakFollow')" />
        <VListItem v-if="user.isMuted" prepend-icon="mdi-bell-outline" :title="t('unmute')"
          @click="withEmitLoading('unmute')" />
        <VListItem v-if="!user.isMuted" prepend-icon="mdi-bell-off-outline" :title="t('mute')"
          @click="showMuteModal = true" />
        <VListItem v-if="user.isBlocking" prepend-icon="mdi-cancel" :title="t('unblock')"
          @click="withEmitLoading('unblock')" />
        <VListItem v-if="!user.isBlocking" prepend-icon="mdi-block-helper" :title="t('block')"
          @click="withEmitLoading('block')" />
        <VDivider />
        <VListItem prepend-icon="mdi-alert-circle-outline" :title="t('reportAbuse')" />
      </template>
      <template v-if="isMe">
        <VDivider />
        <VListItem prepend-icon="mdi-account-edit-outline" :title="t('editProfile')" />
      </template>
    </VList>
  </VMenu>
  <VDialog v-model="showMuteModal" class="max-w-100">
    <VCard :loading="muting">
      <VCardTitle>{{ t('mutePeriod') }}</VCardTitle>
      <VCardText>
        <VSelect :items="availableMutingPeriods" item-title="label" item-value="value" v-model="mutePeriod" />
      </VCardText>
      <VCardActions>
        <VBtn prepend-icon="mdi-close" @click="showMuteModal = false">{{ t('cancel') }}</VBtn>
        <VBtn prepend-icon="mdi-volume-off" @click="mute">{{ t('mute')
          }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { UserController } from "@/stores/user-singleton";
import type { UserDetailed } from "misskey-js/entities.js";

const props = defineProps<{
  user: UserDetailed;
}>();

const emit = defineEmits<{
  "update:loading": [boolean];
}>();

const { t } = useI18n();
const account = useAccount();

const showMuteModal = ref(false);
const availableMutingPeriods = computed(() => [
  { label: t("tenMinutes"), value: 10 * 60 * 1000 },
  { label: t("oneHour"), value: 60 * 60 * 1000 },
  { label: t("oneDay"), value: 24 * 60 * 60 * 1000 },
  { label: t("threeDays"), value: 3 * 24 * 60 * 60 * 1000 },
  { label: t("oneWeek"), value: 7 * 24 * 60 * 60 * 1000 },
  { label: t("oneMonth"), value: 30 * 24 * 60 * 60 * 1000 },
  { label: t("threeMonths"), value: 90 * 24 * 60 * 60 * 1000 },
  { label: t("oneYear"), value: 365 * 24 * 60 * 60 * 1000 },
  { label: t("indefinitely"), value: null },
]);

const mutePeriod = ref<number | null>(null);
const controller = computed(() => new UserController(props.user));
const [muting, mute] = useLoading(() =>
  controller.value
    .mute(mutePeriod.value && Date.now() + mutePeriod.value)
    .then(() => {
      showMuteModal.value = false;
    }));

const isMe = computed(() => account.me?.id === props.user.id);

function withEmitLoading(k: "breakFollow" | "unmute" | "unblock" | "block") {
  emit("update:loading", true);
  return controller.value[k]().finally(() => emit("update:loading", false));
}
</script>
