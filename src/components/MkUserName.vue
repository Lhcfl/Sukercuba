<template>
  <span
    v-if="user.name"
    :class="$style.mfmUsername"
  >
    <MkMfm
      plain
      :text="user.name"
      :author="user"
      :emoji-urls="user.emojis"
    />
  </span>
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

<style lang="scss" module>
.mfmUsername {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
