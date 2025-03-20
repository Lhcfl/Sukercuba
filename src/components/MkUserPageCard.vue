<template>
  <VCard
    :class="$style.main"
    :loading
    :width
  >
    <VParallax
      :class="$style.parallax"
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
          <VBtn>
            <VIcon icon="mdi-dots-vertical" />
            <MkUserMenu
              v-if="detailedUser?.detailed"
              :user="detailedUser.data"
            />
          </VBtn>
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
    </VCardText>
    <VCardText v-if="Object.keys(user.fields ?? {}).length > 0">
      <VDivider />
      <div class="d-flex justify-space-evenly  mt-2">
        <VTable
          :class="$style.fieldTable"
        >
          <tbody>
            <tr
              v-for="(item, idx) in user.fields"
              :key="idx"
            >
              <td :class="$style.fieldName">
                <MkMfm
                  :text="item.name"
                  :emoji-urls="user.emojis"
                  :author="user"
                />
              </td>
              <td />
              <td :class="$style.fieldVal">
                <MkMfm
                  :text="item.value"
                  :emoji-urls="user.emojis"
                  :author="user"
                />
              </td>
            </tr>
          </tbody>
        </VTable>
      </div>
    </VCardText>
    <VCardText>
      <VDivider />
      <div class="d-flex justify-space-evenly text-center mt-2">
        <div class="d-flex flex-column">
          <span class="text-h5">{{ user.notesCount }}</span>
          <span class="text-subtitle-2">{{ t('notes') }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="text-h5">{{ user.followersCount }}</span>
          <span class="text-subtitle-2">{{ t('followers') }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="text-h5">{{ user.followingCount }}</span>
          <span class="text-subtitle-2">{{ t('following') }}</span>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { useAccount } from '@/stores/account';
import { useUserCache } from '@/stores/user-cache';
import type { User, UserDetailed } from 'misskey-js/entities.js';

const props = defineProps<{
  user: Partial<UserDetailed> & User,
  width?: number,
}>();

const { t } = useI18n();
const account = useAccount();
const userCache = useUserCache();
const detailedUser = userCache.cache(props.user, { detailed: true });
const user = computed(() => detailedUser.value.detailed ? detailedUser.value.data : props.user);
const loading = computed(() => !detailedUser.value.detailed);
const isMe = computed(() => account.me?.id == props.user.id);
const followText = computed(() => props.user.isLocked ? t('followRequest') : t('follow'));
const parallaxMaxH = computed(() => (props.width ? props.width * 0.6 : 500) + 'px');
</script>


<style lang="scss" module>
.main {
  .parallax {
    max-height: v-bind("parallaxMaxH");
  }
  .avatarContainer {
    margin-top: -80px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  }
  .fieldTable {
    width: 500px;
    --v-table-row-height: 2.5em;
    tr {
      margin: 1em;
    }
    td {
      border: none !important;
    }
    .fieldName {
      width: 25%;
      text-align: right;
      font-weight: bold;
    }
    .fieldVal {
      width: 65%;
      text-align: left;
    }
  }
}
</style>