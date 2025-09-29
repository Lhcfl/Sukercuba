<template>
  <VAlert type="error" variant="outlined" class="ma-4">
    <VAlertTitle>{{ title }}</VAlertTitle>
    <div>{{ message }}</div>
  </VAlert>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  message: string;
}>();
</script>
