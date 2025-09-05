<template>
  <VImg :src="url" class="w-full h-full object-contain bg-tertiary-container rounded-lg" :alt="img.comment || img.name">
    <template #sources>
      <template v-if="img.comment">
        <VDialog>
          <template #activator="{ props: binder }">
            <VBtn icon="mdi-text" class="m-2" v-bind="binder" />
          </template>
          <template #default="{ isActive }">
            <VCard class="max-w-[50em] m-auto">
              <VCardTitle>{{ $t("caption") }}</VCardTitle>
              <VCardText>
                <p>{{ img.comment }}</p>
              </VCardText>
              <VCardActions>
                <VBtn @click.stop="isActive.value = false">{{ $t("close") }}</VBtn>
              </VCardActions>
            </VCard>
          </template>
        </VDialog>
      </template>
      <a class="sr-only" :data-pswp-src="img.url" :data-pswp-width="img.properties.width"
        :data-pswp-height="img.properties.height"></a>
    </template>
    <template #placeholder>
      <div class="relative w-full h-full">
        <MkImageBlurHash :id="img.id" :width="img.properties.width" :height="img.properties.height"
          :blurhash="img.blurhash" class="w-full h-full object-cover" />
      </div>
    </template>
  </VImg>
</template>

<script setup lang="ts">
import type { DriveFile } from 'misskey-js/entities.js';
import MkImageBlurHash from './MkImageBlurHash.vue';

const props = defineProps<{
  img: DriveFile;
  thumbnail?: boolean;
}>();

const url = computed(() => props.thumbnail && props.img.thumbnailUrl ? props.img.thumbnailUrl : props.img.url);

const showComment = ref(false);
</script>
