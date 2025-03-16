<template>
  <MkCustomEmoji
    v-if="isCustom"
    v-bind="props"
  />
  <MkEmoji
    v-else
    :emoji="name"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string;
  normal?: boolean;
  noStyle?: boolean;
  host?: string | null;
  url?: string;
  useOriginalSize?: boolean;
  menu?: boolean;
  menuReaction?: boolean;
  fallbackToImage?: boolean;
}>();

const isCustom = computed(() => props.name.startsWith(":"))
</script>