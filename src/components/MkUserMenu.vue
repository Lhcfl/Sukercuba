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
          @click="controllerWithLoading.breakFollow()" />
        <VListItem v-if="user.isMuted" prepend-icon="mdi-bell-outline" :title="t('unmute')"
          @click="controllerWithLoading.unmute()" />
        <VListItem v-if="!user.isMuted" prepend-icon="mdi-bell-off-outline" :title="t('mute')"
          @click="showMuteModal = true" />
        <VListItem v-if="user.isBlocking" prepend-icon="mdi-cancel" :title="t('unblock')"
          @click="controllerWithLoading.unblock()" />
        <VListItem v-if="!user.isBlocking" prepend-icon="mdi-block-helper" :title="t('block')"
          @click="controllerWithLoading.block()" />
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
    <VCard :loading="isMuting">
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
const isMuting = ref(false);
const loading = ref(false);
watch(loading, val => emit("update:loading", val));

const isMe = computed(() => account.me?.id === props.user.id);
const controller = computed(() => new UserController(props.user));
const controllerWithLoading = computed(() => controller.value.with(loading));

async function mute() {
  // we don't need to set loading here
  await controller.value.with(isMuting).mute(mutePeriod.value && Date.now() + mutePeriod.value);
  showMuteModal.value = false;
}
</script>
