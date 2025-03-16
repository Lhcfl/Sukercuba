<template>
  <VAvatar :image="user.avatarUrl ?? undefined" />
</template>

<script setup lang="ts">
import type { User } from "misskey-js/entities.js";

defineProps<{
  user: User;
}>();
</script>
