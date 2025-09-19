<template>
  <span v-if="user.name" class="mfm-name">
    <MkMfm inline plain :nowrap="!wrap" :text="user.name" :author="user" :emoji-urls="user.emojis" />
  </span>
  <span v-else>
    {{ user.username }}
  </span>
</template>

<script setup lang="ts">
import type { User } from "misskey-js/entities.js";

defineProps<{
  user: User;
  wrap?: boolean
}>();
</script>
