<template>
  <VMenu activator="parent">
    <VList>
      <VListItem
        prepend-icon="mdi-share-variant"
        :title="t('copyProfileUrl')"
      />
      <VListItem
        prepend-icon="mdi-email-edit-outline"
        :title="t('sendMessage')"
      />
      <template v-if="isMe">
        <VDivider />
        <VListItem
          prepend-icon="mdi-account-edit-outline"
          :title="t('editProfile')"
        />
      </template>
    </VList>
  </VMenu>
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
</script>