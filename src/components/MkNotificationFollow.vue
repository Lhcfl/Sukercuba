<template>
  <VCard v-ripple :variant @click.stop="routeToUser">
    <VCardItem>
      <template #prepend>
        <MkAvatar :user="notification.user" />
      </template>
      <div class="flex flex-col">
        <MkUserName :user="notification.user" />
        <span class="text-sm">
          {{ message }}
        </span>
      </div>
    </VCardItem>
    <VCardActions v-if="showAcceptRefuse">
      <VBtn class="text-secondary" prepend-icon="mdi-check-circle-outline" :text="t('accept')" :loading="sendingAccept"
        @click.stop="accept" />
      <VBtn class="text-red" prepend-icon="mdi-close-circle-outline" :loading="sendingReject" :text="t('reject')"
        @click.stop="reject" />
    </VCardActions>
    <VCardActions v-if="showFollowBack" class="py-0">
      <VBtn v-if="user?.hasPendingFollowRequestFromYou" class="bg-primary" prepend-icon="mdi-clock-outline"
        :text="t('followRequestPending')" :loading="sendingCancelFollowRequest" @click.stop="cancelFollowRequest" />
      <VBtn v-else class="text-primary" prepend-icon="mdi-account-plus-outline" :text="t('follow')"
        :loading="sendingFollow" @click.stop="follow" />
      <VBtn class="text-red" prepend-icon="mdi-account-minus-outline" :text="t('breakFollow')"
        :loading="sendingBreakFollow" @click.stop="breakFollow" />
    </VCardActions>
    <VCardText v-if="
      notification.type === 'followRequestAccepted' && notification.message
    ">
      <VAlert class="text-secondary" density="compact">
        <MkMfm :text="notification.message" :emoji-urls="notification.user.emojis" :author="notification.user" />
      </VAlert>
    </VCardText>
  </VCard>
</template>

<script lang="ts" setup>
import { acct } from "misskey-js";
import type { VCard } from "vuetify/components";
import type { ExtractNotifications } from "@/types/notification";

const props = defineProps<{
  notification: ExtractNotifications<
    ["follow", "receiveFollowRequest", "followRequestAccepted"]
  >;
  variant?: VCard["$props"]["variant"];
}>();

const { t } = useI18n();
const router = useRouter();
const { user, loading, error } = useUserQuery({
  id: props.notification.user.id,
  detailed: true,
});

const sendingFollow = ref(false);
const sendingBreakFollow = ref(false);
const sendingAccept = ref(false);
const sendingReject = ref(false);
const sendingCancelFollowRequest = ref(false);
const rejected = ref(false);

const message = computed(
  () =>
    ({
      follow: t("youGotNewFollower"),
      receiveFollowRequest: t("receiveFollowRequest"),
      followRequestAccepted: t("followRequestAccepted"),
    })[props.notification.type],
);

const showAcceptRefuse = computed(() =>
  !rejected.value && props.notification.type === "receiveFollowRequest"
    ? !(user.value?.isFollowed || user.value?.isBlocking)
    : false,
);

const showFollowBack = computed(() =>
  user.value?.isFollowed && props.notification.type === "follow"
    ? !user.value?.isFollowing
    : false,
);

function routeToUser() {
  router.push({
    name: "/@[userhandle]",
    params: { userhandle: acct.toString(props.notification.user) },
  });
}

const userApi = computed(() => new UserController(props.notification.user));
const accept = () => userApi.value.accept(sendingAccept);
const reject = () => userApi.value.reject(sendingReject);
const follow = () => userApi.value.follow(sendingFollow);
const cancelFollowRequest = () =>
  userApi.value.cancelFollowRequest(sendingCancelFollowRequest);
const breakFollow = () => userApi.value.breakFollow(sendingBreakFollow);
</script>

<style lang="scss" module>
.note {
  max-height: 100px;
  overflow: hidden;

  &.showMore {
    max-height: unset;
  }
}

.emoji {
  height: 1.7em;
  width: 1.7em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(var(--v-theme-background));
  border-radius: 100px;
  padding: 2px;
  margin-left: -1.3em;
  transform: translateY(0.5em);
  margin-right: 0.5em;
  position: relative;
  left: 0;
}
</style>
