<template>
  <VCard
    v-ripple
    :variant
    @click.stop="routeToUser"
  >
    <VCardItem>
      <template #prepend>
        <MkAvatar :user="notification.user" />
      </template>
      <div class="d-flex flex-column">
        <span>
          <MkUserName :user="notification.user" />
          <span class="text-subtitle-2 ml-2">@{{ acct.toString(notification.user) }}</span>
        </span>
        <span class="text-subtitle-2">
          {{ message }}
        </span>
      </div>
    </VCardItem>
    <VCardActions v-if="showAcceptRefuse">
      <VBtn
        class="text-secondary"
        prepend-icon="mdi:check-circle-outline"
        :text="t('accept')"
        :loading="sendingAccept"
        @click.stop="accept"
      />
      <VBtn
        class="text-red"
        prepend-icon="mdi:close-circle-outline"
        :loading="sendingReject"
        :text="t('reject')"
        @click.stop="reject"
      />
    </VCardActions>
    <VCardActions
      v-if="showFollowBack"
      class="py-0"
    >
      <VBtn
        v-if="userDetailed?.hasPendingFollowRequestFromYou"
        class="bg-primary"
        prepend-icon="mdi-clock-outline"
        :text="t('followRequestPending')"
        :loading="sendingCancelFollowRequest"
        @click.stop="cancelFollowRequest"
      />
      <VBtn
        v-else
        class="text-primary"
        prepend-icon="mdi-account-plus-outline"
        :text="t('follow')"
        :loading="sendingFollow"
        @click.stop="follow"
      />
      <VBtn
        class="text-red"
        prepend-icon="mdi-account-minus-outline"
        :text="t('breakFollow')"
        :loading="sendingBreakFollow"
        @click.stop="breakFollow"
      />
    </VCardActions>
    <VCardText
      v-if="
        notification.type === 'followRequestAccepted' && notification.message
      "
    >
      <VAlert
        class="text-secondary"
        density="compact"
      >
        <MkMfm
          :text="notification.message"
          :emoji-urls="notification.user.emojis"
          :author="notification.user"
        />
      </VAlert>
    </VCardText>
  </VCard>
</template>

<script lang="ts" setup>
import router from "@/router";
import { useAccount } from "@/stores/account";
import { useUserCache } from "@/stores/user-cache";
import type { ExtractNotifications } from "@/types/notification";
import { acct } from "misskey-js";
import type { VCard } from "vuetify/components";

const props = defineProps<{
  notification: ExtractNotifications<
    ["follow", "receiveFollowRequest", "followRequestAccepted"]
  >;
  variant?: VCard["$props"]["variant"];
}>();

const { t } = useI18n();

const account = useAccount();
const userCache = useUserCache().cache(props.notification.user, {
  detailed: true,
});
const userDetailed = computed(() =>
  userCache.value.detailed
    ? userCache.value.data
    : undefined
);

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
    }[props.notification.type])
);

const showAcceptRefuse = computed(() =>
  !rejected.value &&
  props.notification.type === "receiveFollowRequest"
    ? !(userDetailed.value?.isFollowed || userDetailed.value?.isBlocking)
    : false
);

const showFollowBack = computed(() =>
  userDetailed.value?.isFollowed &&
  props.notification.type === "follow"
    ? !userDetailed.value?.isFollowing
    : false
);

function routeToUser() {
  router.push({
    name: "/@[userhandle]",
    params: { userhandle: acct.toString(props.notification.user) },
  });
}

async function follow() {
  sendingFollow.value = true;
  try {
    await account.api.request("following/create", {
      userId: props.notification.userId,
    });
    userDetailed.value!.isFollowing = true;
  } catch (err) {
    console.error(err);
  } finally {
    sendingFollow.value = false;
  }
}
async function accept() {
  sendingAccept.value = true;
  try {
    await account.api.request("following/requests/accept", {
      userId: props.notification.userId,
    });
    userDetailed.value!.isFollowed = true;
  } catch (err) {
    console.error(err);
  } finally {
    sendingAccept.value = false;
  }
}
async function reject() {
  sendingReject.value = true;
  try {
    await account.api.request("following/requests/reject", {
      userId: props.notification.userId,
    });
  } catch (err) {
    console.error(err);
  } finally {
    sendingReject.value = false;
  }
}
async function breakFollow() {
  sendingBreakFollow.value = true;
  try {
    await account.api.request("following/invalidate", {
      userId: props.notification.userId,
    });
    userDetailed.value!.isFollowed = false;
  } catch (err) {
    console.error(err);
  } finally {
    sendingBreakFollow.value = false;
  }
}
async function cancelFollowRequest() {
  sendingCancelFollowRequest.value = true;
  try {
    await account.api.request("following/requests/cancel", {
      userId: props.notification.userId,
    });
    userDetailed.value!.hasPendingFollowRequestFromYou = false;
  } catch (err) {
    console.error(err);
  } finally {
    sendingCancelFollowRequest.value = false;
  }
}
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
