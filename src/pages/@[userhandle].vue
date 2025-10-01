<template>
  <MkError v-if="error" :message="errorToString(error)"></MkError>
  <MkUserPageCard :query="query" />
  <MkNoteSkeleton v-if="loading"></MkNoteSkeleton>
  <template v-if="user">
    <MkError :title="$t('userBlockedYou', { name: user.name || user.username })" v-if="user.isBlocked"
      :message="$t('youCanNotSeeBecauseYouAreBlocked')" />
    <MkUserTimeline v-else :user-id="user.id" />
  </template>
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
