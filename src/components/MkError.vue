<template>
  <VAlert type="error" variant="outlined" class="ma-4">
    <VAlertTitle>{{ title }}</VAlertTitle>
    <div>{{ message }}</div>
    <VBtn v-if="retryable" variant="text" @click="emit('retry')">
      {{ $t("retry") }}
    </VBtn>
  </VAlert>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  message: string;
  retryable?: boolean;
}>();

const emit = defineEmits<{
  retry: [];
}>();
</script>
