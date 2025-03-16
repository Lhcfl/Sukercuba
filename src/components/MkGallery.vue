<template>
  <div>
    <VImg
      v-for="img in images"
      :key="img.id"
      :src="img.url"
    />
  </div>
</template>

<script setup lang="ts">
import type { DriveFile } from 'misskey-js/entities.js';

const props = defineProps<{
  images: DriveFile[]
}>();

const images = computed(() => props.images.filter(i => i.type.startsWith('image')))
</script>