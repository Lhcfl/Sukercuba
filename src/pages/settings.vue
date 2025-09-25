<template>
  <div class="p-2 bg-surface h-full">
    <VTextField v-model="search" variant="filled" autofocus hide-details="auto" :label="t('search')" />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const search = ref("");
</script>
