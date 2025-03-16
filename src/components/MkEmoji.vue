<template>
  <span>{{ emoji }}</span>
</template>

<script setup lang="ts">
defineProps<{
  emoji: string,
  menu?: boolean,
}>()
</script>