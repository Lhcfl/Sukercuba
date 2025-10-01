<template>
  <div>
    <VCard v-if="user" :width class="rounded-none" density="compact" :loading="sendingRequest">
      <VCardActions v-if="user.hasPendingFollowRequestToYou">
        <span>
          {{ t("receiveFollowRequest") }}
        </span>
        <VSpacer />
        <VBtn class="text-secondary" prepend-icon="mdi-check-circle-outline" :text="t('accept')"
          :loading="sendingAccept" @click.stop="accept" />
        <VBtn class="text-red" prepend-icon="mdi-close-circle-outline" :loading="sendingReject" :text="t('reject')"
          @click.stop="reject" />
      </VCardActions>
      <VParallax class="w-full min-h-40" :class="[user.bannerUrl ? 'aspect-[2/1]' : 'aspect-[6/1]']"
        :src="user?.bannerUrl">
        <template #placeholder>
          <div class="relative w-full h-full">
            <MkImageBlurHash class="w-full h-full object-cover" :blurhash="user.bannerBlurhash || user.avatarBlurhash"
              :id="user.id" />
          </div>
        </template>
        <VCardText class="flex h-100 justify-between justify-end">
          <div class="flex gap-1">
            <VChip v-if="user.isFollowed" class="bg-primary-container">
              {{ user.isFollowing ? t('mutualFollow') : t('followsYou') }}
            </VChip>
            <VChip v-if="user.isBlocked" class="bg-black">
              {{ t('blockingYou') }}
            </VChip>
            <VChip v-if="user.isMuted" class="bg-gray">
              {{ t('muted') }}
            </VChip>
          </div>

          <VBtnGroup>
            <template v-if="!isMe">
              <VBtn v-if="user.isFollowing" prepend-icon="mdi-minus" color="primary" :loading="followLoading"
                @click.stop="unfollow">
                {{ t('youFollowing') }}
              </VBtn>
              <VBtn v-else-if="user.isBlocking" prepend-icon="mdi-cancel" color="black" :loading="followLoading"
                @click.stop="unblock">
                {{ t('blocked') }}
              </VBtn>
              <VBtn v-else-if="user.hasPendingFollowRequestFromYou" prepend-icon="mdi-clock-outline"
                :loading="followLoading" color="secondary" @click.stop="cancelFollowRequest">
                {{ t('followRequestPending') }}
              </VBtn>
              <VBtn v-else-if="!user.isBlocked" prepend-icon="mdi-plus" :loading="followLoading" @click.stop="follow">
                {{ followText }}
              </VBtn>
            </template>
            <VBtn>
              <VIcon icon="mdi-dots-vertical" />
              <MkUserMenu :user="user" @update:loading="(x) => sendingRequest = x" />
            </VBtn>
          </VBtnGroup>
        </VCardText>
      </VParallax>
      <div class="avatar-and-name w-full relative p-2 mt--20 flex gap-3">
        <MkAvatar :user :size="150" />
        <div class="name-username flex w-full flex-col justify-center gap-2 flex-[1_1_0] min-w-0">
          <MkUserName class="text-2xl text-white drop-shadow-lg drop-shadow-color-black" :user wrap />
          <span>@{{ acct.toString(user) }}</span>
        </div>
      </div>
      <VCardText class="text-center">
        <VAlert v-if="user.followedMessage" class="text-secondary" density="compact">
          <p>
            <small>
              {{ t('messageToFollower') }}
            </small>
          </p>
          <MkMfm :text="user.followedMessage" :emoji-urls="user.emojis" :author="user" />
        </VAlert>
        <p v-if="user.description" class="py-3">
          <MkMfm :text="user.description" :emoji-urls="user.emojis" :author="user" />
        </p>
      </VCardText>
      <VCardText v-if="Object.keys(user.fields ?? {}).length > 0">
        <div class="flex flex-col gap-1">
          <VAlert v-for="(item, idx) in user.fields" :key="idx" class="bg-secondary-container" density="compact">
            <p class="title text-sm opacity-70">
              <MkMfm :text="item.name" :emoji-urls="user.emojis" :author="user" />
            </p>
            <MkMfm :text="item.value" :emoji-urls="user.emojis" :author="user" />
          </VAlert>
        </div>
      </VCardText>
      <VCardText>
        <div class="flex justify-evenly text-center mt-2">
          <div class="flex flex-col">
            <span class="text-xl">{{ user.notesCount }}</span>
            <span class="text-xs opacity-70">{{ t('notes') }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xl">{{ user.followersCount }}</span>
            <span class="text-xs opacity-70">{{ t('followers') }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xl">{{ user.followingCount }}</span>
            <span class="text-xs opacity-70">{{ t('following') }}</span>
          </div>
        </div>
      </VCardText>
    </VCard>
    <VSkeletonLoader v-if="loading" type="card-avatar,article"></VSkeletonLoader>
    <MkError v-if="error" :message="errorToString(error)" />
  </div>
</template>

<script setup lang="ts">
import { acct } from "misskey-js";

const props = defineProps<{
  query: { id: string } | { username: string, host: string | null };
  width?: number;
}>();

const { t } = useI18n();
const account = useAccount();
const { user, loading, error, controller } = useUserQuery({
  ...props.query,
  detailed: true,
});
const sendingRequest = ref(false);
const isMe = computed(() => account.me?.id === user.value?.id);
const followText = computed(() =>
  user.value?.isLocked ? t("followRequest") : t("follow"),
);

const [sendingAccept, accept] = useLoading(() => controller.value!.accept());
const [sendingReject, reject] = useLoading(() => controller.value!.reject());
const [followLoading, unblock, unfollow, follow, cancelFollowRequest] = useSharedLoading(
  () => controller.value!.unblock(),
  () => controller.value!.unfollow(),
  () => controller.value!.follow(),
  () => controller.value!.cancelFollowRequest(),
);
</script>
