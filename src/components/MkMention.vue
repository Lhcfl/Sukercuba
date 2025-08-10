<template>
  <VChip :to size="small" color="primary" class="my-0.5" text="xs"
    :prepend-avatar="mentionUser?.data?.avatarUrl ?? undefined" @click.stop>
    <span>@{{ username }}</span><span v-if="host">@{{ host }}</span>
  </VChip>
</template>

<script setup lang="ts">
const props = defineProps<{
  navigationBehaviour?: unknown;
  host?: string | null;
  username: string;
  noNavigate?: boolean;
}>();

const userCache = useUserCache();
const mentionUser = userCache.getCache({
  username: props.username,
  host: props.host ?? null,
});

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
