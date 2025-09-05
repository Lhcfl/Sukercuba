<template>
  <VAvatar :image="user?.avatarUrl ?? undefined" :size @click.stop="routeToUser" />
</template>

<script setup lang="ts">
import { acct } from "misskey-js";
import type { User } from "misskey-js/entities.js";

const props = defineProps<{
  user: User;
  size?: string | number;
  noTooltip?: boolean;
}>();

const router = useRouter();

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
