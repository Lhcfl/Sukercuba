<template>
  <span class="mk-any-emoji">
    <MkCustomEmoji
      v-if="isCustom"
      v-bind="props"
      :url
    />
    <MkEmoji
      v-else
      v-bind="props"
      :emoji="name"
    />
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string;
  normal?: boolean;
  noStyle?: boolean;
  host?: string | null;
  url?: string;
  urls?: Record<string, string | undefined>;
  useOriginalSize?: boolean;
  menu?: boolean;
  menuReaction?: boolean;
  fallbackToImage?: boolean;
}>();

const isCustom = computed(() => props.name.startsWith(":"))
const url = computed(() => isCustom.value ? ((props.urls ?? {})[props.name.slice(1, -1)] ?? props.url) : props.url)
</script>