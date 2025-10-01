<template>
  <VListItem v-if="valid">
    <template #prepend>
      <MkAvatar class="mr-2" :user />
    </template>
    <template #title>
      <MkUserName :user />
    </template>
    <template #subtitle>
      <span class="username">@{{ acct.toString(user) }}</span>
    </template>
    <template #append>
      <div v-if="props.type === 'received'" class="flex gap-0.5">
        <VBtn class="text-secondary rounded-r-md" prepend-icon="mdi-check-circle-outline" :text="t('accept')"
          :loading="sendingAccept" @click.stop="accept" />
        <VBtn class="text-red rounded-l-md" prepend-icon="mdi-close-circle-outline" :loading="sendingReject"
          :text="t('reject')" @click.stop="reject" />
      </div>
      <div v-if="props.type === 'sent'">
        <VBtn class="text-red" prepend-icon="mdi-close-circle-outline" :loading="sendingCancelFollowRequest"
          :text="t('cancel')" @click.stop="cancelFollowRequest" />
      </div>
    </template>
  </VListItem>
</template>

<script lang="ts" setup>
import { acct } from 'misskey-js';
import type { User } from 'misskey-js/entities.js';

const props = defineProps<{
  user: User;
  type: 'received' | 'sent';
}>();

const { t } = useI18n()
const valid = ref(true);
const sendingAccept = ref(false);
const sendingReject = ref(false);
const sendingCancelFollowRequest = ref(false);

const queryClient = useQueryClient();

watch(valid, (ns) => {
  if (ns == false) {
    queryClient.invalidateQueries({ queryKey: ['follow-requests', props.type] })
  }
})

const controller = computed(() => new UserController(props.user));
const accept = () => controller.value.with(sendingAccept).accept().then(() => valid.value = false);
const reject = () => controller.value.with(sendingReject).reject().then(() => valid.value = false);
const cancelFollowRequest = () =>
  controller.value.with(sendingCancelFollowRequest).cancelFollowRequest().then(() => valid.value = false);
</script>
