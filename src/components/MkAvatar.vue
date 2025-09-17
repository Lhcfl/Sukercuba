<template>
  <div class="mk-avatar" @click="routeToUser">
    <VImg :src="user.avatarUrl ?? undefined" :width="size" :height="size" class="rounded-full">
      <template #placeholder>
        <div class="relative" :style="{ width: size + 'px', height: size + 'px' }">
          <MkImageBlurHash :id="user.id" :width="64" :height="64" :blurhash="user.avatarBlurhash"
            class="w-full h-full object-cover" />
        </div>
      </template>
    </VImg>
  </div>
</template>

<script setup lang="ts">
import { acct } from "misskey-js";
import type { User } from "misskey-js/entities.js";

const props = withDefaults(defineProps<{
  user: User;
  size?: string | number;
  noTooltip?: boolean;
  routeOnClick?: boolean;
}>(), {
  size: 40,
  noTooltip: false,
  routeOnClick: true,
});

const router = useRouter();

const showTip = ref(false);

onDeactivated(() => {
  showTip.value = false;
});

function routeToUser(ev: MouseEvent) {
  if (!props.routeOnClick) return;
  ev.stopPropagation();
  router.push({
    name: "/@[userhandle]",
    params: {
      userhandle: acct.toString(props.user!),
    },
  });
}
</script>
