<template>
  <VCard v-if="images.length > 0" variant="text">
    <VCardText>
      <div class="mk-gallery flex w-full justify-evenly">
        <div class="flex flex-wrap justify-between" :class="$style.photobox">
          <div v-for="(col, idx) in columns" :key="idx" :class="[$style.col, $style[`col-${columns.length}`]]">
            <div v-for="img in col" :key="img.id" :class="$style.imgRow">
              <img :src="img.url" :class="$style.img" loading="lazy" cover>
            </div>
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import type { DriveFile } from "misskey-js/entities.js";

const props = defineProps<{
  images: DriveFile[];
}>();

const images = computed(() =>
  props.images
    .filter((i) => i.type.startsWith("image"))
    .map((i) => ({
      ...i,
      ...i.properties,
    })),
);
const columns = computed(() => {
  const ret: [typeof images.value, typeof images.value] = [[], []];
  let i = 0;
  for (const img of images.value) {
    ret[i].push(img);
    i = 1 - i;
  }
  if (ret[1].length === 0) ret.pop();
  return ret;
});
</script>

<style lang="scss" module>
.photobox {
  .img {
    min-width: 180px;
    width: 100%;
    object-fit: cover;
    height: 200px;
  }

  .col {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .col-1 {
    flex: 1 1 100%;
  }

  .col-2 {
    flex: 0 0 calc(50% - 4.002px);
  }

  .imgRow {
    flex: 1 1 auto
  }
}
</style>
