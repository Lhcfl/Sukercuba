<template>
  <VChip :to size="small" color="primary" class="my-0.5" text="xs" :prepend-avatar="mentionUrl" @click.stop>
    <span>@{{ username }}</span><span v-if="host">@{{ host }}</span>
  </VChip>
</template>

<script setup lang="ts">
import { acct } from 'misskey-js';
const props = defineProps<{
  navigationBehaviour?: unknown;
  host: string | null;
  username: string;
  noNavigate?: boolean;
}>();

const account = useAccount();
const mentionUrl = computed(() =>
  `${account.site}/avatar/@${acct.toString(props)}`
);

const to = computed(() =>
  props.noNavigate
    ? undefined
    : {
      name: "/@[userhandle]" as const,
      params: {
        userhandle: [props.username, props.host].filter((x) => x).join("@"),
      },
    },
);
</script>
