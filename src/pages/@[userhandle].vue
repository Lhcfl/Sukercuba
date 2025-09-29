<template>
  <MkError v-if="error" :message="errorToString(error)"></MkError>
  <MkUserPageCard :query="query" />
  <MkNoteSkeleton v-if="loading"></MkNoteSkeleton>
  <MkUserTimeline v-if="user" :user-id="user.id" />
</template>

<script setup lang="ts">
const route = useRoute<"/@[userhandle]">();

const [username, host] = route.params.userhandle.split("@") as [
  string,
  string | undefined,
];
const query = { username, host: host ?? null };

const { user, loading, error } = useUserQuery(
  { ...query, detailed: true, force: true },
);
</script>
