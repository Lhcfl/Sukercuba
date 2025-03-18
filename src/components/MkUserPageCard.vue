<template>
  <VCard>
    <VParallax
      :src="user?.bannerUrl"
    >
      <VCardText class="d-flex h-100 justify-space-between justify-end">
        <div>
          <VChip
            v-if="user.isFollowed"
            class="bg-background"
          >
            {{ user.isFollowing ? t('mutualFollow') : t('followsYou') }}
          </VChip>
          <VChip
            v-if="user.isBlocked"
            class="bg-black"
          >
            {{ t('blockingYou') }}
          </VChip>
          <VChip
            v-if="user.isMuted"
            class="bg-grey-darken-2"
          >
            {{ t('muted') }}
          </VChip>
        </div>
          
        <VBtnGroup>
          <template v-if="!isMe">
            <VBtn
              v-if="user.isFollowing"
              prepend-icon="mdi-minus"
              color="primary"
            >
              {{ t('youFollowing') }}
            </VBtn>
            <VBtn
              v-else-if="user.isBlocking"
              prepend-icon="mdi-cancel"
              color="black"
            >
              {{ t('blocked') }}
            </VBtn>
            <VBtn
              v-else
              prepend-icon="mdi-plus"
            >
              {{ followText }}
            </VBtn>
          </template>
          <VBtn
            icon="mdi-dots-horizontal"
          />
        </VBtnGroup>
      </VCardText>
    </VParallax>
    <div :class="$style.avatarContainer">
      <MkAvatar
        :user
        :size="150"
      />
    </div>
    <VCardTitle class="text-center">
      <MkMfm
        :text="user.name ?? user.username"
        :emoji-urls="user.emojis"
        plain
      />
    </VCardTitle>
    <VCardSubtitle class="text-center">
      <span>@{{ user.username }}</span>
      <span v-if="user.host">@{{ user.host }}</span>
    </VCardSubtitle>
    <VCardText class="text-center">
      <VAlert
        v-if="user.followedMessage"
        class="text-secondary"
        density="compact"
      >
        <p>
          <small>
            {{ t('messageToFollower') }}
          </small>
        </p>
        <MkMfm
          :text="user.followedMessage"
          :emoji-urls="user.emojis"
          :author="user"
        />
      </VAlert>
      <p
        v-if="user.description"
        class="py-3"
      >
        <MkMfm
          :text="user.description"
          :emoji-urls="user.emojis"
          :author="user"
        />
      </p>
      <VDivider />
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { useAccount } from '@/stores/account';
import type { UserDetailed } from 'misskey-js/entities.js';

const props = defineProps<{
  user: UserDetailed,
}>();

const { t } = useI18n();
const account = useAccount();

const isMe = computed(() => account.me?.id == props.user.id);

const followText = computed(() => props.user.isLocked ? t('followRequest') : t('follow'));
</script>


<style lang="scss" module>
.avatarContainer {
  margin-top: -80px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}
</style>