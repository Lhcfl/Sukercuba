<template>
  <VSnackbarQueue v-model="queue.messages" />
</template>

<script lang="ts" setup>
const queue = useSnackbarQueue();
</script>
