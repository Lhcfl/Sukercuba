<template>
  <VSnackbarQueue v-model="queue.messages" />
</template>

<script lang="ts" setup>
import { useSnackbarQueue } from '@/stores/snackbar-queue';
const queue = useSnackbarQueue();
</script>
