<template>
  <VList>
    <VListItem prepend-icon="mdi-upload-outline" :title="`${t('upload')} (${t('compress')})`"
      @click.stop="uploadFilesFromDevice(false)" />
    <VListItem prepend-icon="mdi-upload-outline" :title="t('upload')" @click.stop="uploadFilesFromDevice(true)" />
    <VListItem prepend-icon="mdi-cloud-upload-outline" :title="t('fromDrive')" />
    <VListItem prepend-icon="mdi-link" :title="t('fromUrl')" />
  </VList>
</template>

<script setup lang="ts">
import type { DriveFile } from 'misskey-js/entities.js';

const { t } = useI18n();

const uploader = useUploader();

const props = withDefaults(defineProps<{
  multiple?: boolean;
  folder?: string | null;
}>(), {
  multiple: true,
});

const emit = defineEmits<{
  (e: 'uploading', promises: Promise<DriveFile>[]): void;
}>();

function uploadFilesFromDevice(keepOriginal: boolean) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = props.multiple;
  input.onchange = () => {
    if (!input.files) return;
    const files = Array.from(input.files);
    emit('uploading', files.map(file => uploader.uploadFile(file, props.folder, undefined, keepOriginal)));
  };
  input.click();
}
</script>
