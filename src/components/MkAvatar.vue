<template>
  <VTooltip :eager="false">
    <template #activator="{ props: bind }">
      <VAvatar
        v-bind="bind"
        :image="user?.avatarUrl ?? undefined"
        :size
        @click.stop="routeToUser"
      />
    </template>
    <MkUserPageCard
      v-if="user"
      :user="user"
    />
  </VTooltip>
</template>

<script setup lang="ts">
import router from "@/router";
import { acct } from "misskey-js";
import type { User } from "misskey-js/entities.js";

const props = defineProps<{
  user: User;
  size?: string | number;
}>();

function routeToUser() {
  router.push({ name: '/@[userhandle]', params: {
    userhandle: acct.toString(props.user!)
  }})
}
</script>
