<template>
  <VList nav>
    <VListItem :title="t('profile')" prepend-icon="mdi-account"></VListItem>
    <VListItem :title="t('privacy')" prepend-icon="mdi-lock"></VListItem>
    <VListItem :title="t('notifications')" prepend-icon="mdi-bell"></VListItem>
    <VListItem :title="t('settings')" prepend-icon="mdi-cog"></VListItem>
    <VListItem :title="t('appearance')" prepend-icon="mdi-palette"></VListItem>
  </VList>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>
