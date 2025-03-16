<template>
  <MkMfm
    v-if="user.name"
    plain
    :text="user.name"
    :author="user"
    :emoji-urls="user.emojis"
  />
  <span v-else>
    {{ user.username }}
  </span>
</template>

<script setup lang="ts">
import type { User } from "misskey-js/entities.js";

defineProps<{
  user: User;
}>();
</script>
