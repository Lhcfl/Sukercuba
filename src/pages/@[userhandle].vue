<template>
  <VCard v-if="data?.error">
    <VCardText>{{ data.apiError?.message }}</VCardText>
  </VCard>
  <div v-else-if="!data?.data" class="flex h-screen w-full items-center justify-evenly">
    <VProgressCircular indeterminate />
  </div>
  <template v-else>
    <MkUserPageCard :user="data.data" />
    <MkUserTimeline :user-id="data.data.id" />
  </template>
</template>

<script setup lang="ts">
import { useUserCache } from "@/stores/user-cache";

const route = useRoute<"/@[userhandle]">();
const [username, host] = route.params.userhandle.split("@") as [
  string,
  string | undefined,
];

const userCache = useUserCache();
const data = userCache.getCache(
  { username, host: host ?? null },
  { detailed: true, fetch: true },
);
</script>
