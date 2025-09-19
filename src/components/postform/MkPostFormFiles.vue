<template>
  <VCardText>
    <div class="images flex flex-wrap">
      <VImg v-for="img in images" :src="img.url" class="w-full h-full object-contain rounded-lg">
        <template #placeholder>
          <div class="relative w-full h-full">
            <MkImageBlurHash :id="img.id" :width="img.properties.width" :height="img.properties.height"
              :blurhash="img.blurhash" class="w-full h-full object-cover" />
          </div>
        </template>
      </VImg>
    </div>
    <div class="others">
      <VListItem v-for="file in others" :key="file.id" :title="file.name" :subtitle="file.type"
        :prepend-icon="iconForMime(file.type)" />
    </div>
  </VCardText>
</template>

<script setup lang="ts">
import type { DriveFile } from 'misskey-js/entities.js';

const props = defineProps<{
  files: DriveFile[];
}>();

const images = computed(() => props.files.filter(f => f.type.startsWith('image/')));
const others = computed(() => props.files.filter(f => !f.type.startsWith('image/')));

function iconForMime(mime: string): string {
  if (mime.startsWith('image/')) return 'mdi-image';
  if (mime.startsWith('video/')) return 'mdi-video';
  if (mime.startsWith('audio/')) return 'mdi-music';
  if (mime === 'application/pdf') return 'mdi-file-pdf';
  if (mime === 'application/zip' || mime === 'application/x-7z-compressed' || mime === 'application/x-rar-compressed') return 'mdi-folder-zip';
  return 'mdi-file';
}
</script>
