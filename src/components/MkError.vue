<template>
  <VAlert type="error" variant="outlined" class="ma-4">
    <VAlertTitle v-if="title">{{ title }}</VAlertTitle>
    <VAlertTitle v-else>{{ t("somethingHappened") }}</VAlertTitle>
    <div>{{ message }}</div>
    <VBtn v-if="retryable" variant="text" @click="emit('retry')">
      {{ $t("retry") }}
    </VBtn>
  </VAlert>
</template>

<script setup lang="ts">
const { t } = useI18n();

defineProps<{
  title?: string;
  message: string;
  retryable?: boolean;
}>()

const emit = defineEmits<{
  retry: [];
}>();
</script>
