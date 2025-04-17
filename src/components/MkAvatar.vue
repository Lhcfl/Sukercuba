<template>
  <VTooltip
    v-model="showTip"
    :eager="false"
    :open-delay="600"
    :close-delay="1000"
    :content-class="['pa-0', 'elevation-4', $style.tooltipUserCard]"
    :open-on-hover="!noTooltip"
  >
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
      :width="400"
      variant="flat"
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
  noTooltip?: boolean;
}>();

const showTip = ref(false);

onDeactivated(() => {
  showTip.value = false;
});

function routeToUser() {
  router.push({
    name: "/@[userhandle]",
    params: {
      userhandle: acct.toString(props.user!),
    },
  });
}
</script>

<style lang="scss" module>
.tooltipUserCard {
  max-height: 600px;
  overflow-y: auto;
}
</style>