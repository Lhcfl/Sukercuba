<template>
  <VList>
    <VListItem prepend-icon="mdi-upload-outline" :title="t('upload')" />
    <VListItem prepend-icon="mdi-cloud-upload-outline" :title="t('fromDrive')" />
    <VListItem prepend-icon="mdi-link" :title="t('fromUrl')" />
  </VList>
</template>

<script setup lang="ts">
const { t } = useI18n();

</script>
