<template>
  <RouterLink
    v-if="selfSite"
    :to="url"
  >
    <slot>
      {{ url }}
    </slot>
  </RouterLink>
  <a
    v-else
    :href="url"
  >
    <slot>
      {{ url }}
    </slot>
  </a>
</template>

<script setup lang="ts">
const props = defineProps<{
  rel?: string,
  url: string,
  navigationBehaviour?: unknown,
}>();

const selfSite = computed(() => props.url.startsWith('/'));
</script>