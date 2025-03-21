<template>
  <RouterLink
    v-if="selfSite"
    :class="$style.url"
    :to="url"
    @click.stop
  >
    <slot>
      {{ url }}
    </slot>
  </RouterLink>
  <a
    v-else
    :class="$style.url"
    :href="url"
    @click.stop
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

<style lang="scss" module>
.url {
  color: rgb(var(--v-theme-primary));
  word-break: break-all;
  text-decoration: none;
  transition: all 0.3s;
  &:hover {
    text-decoration: underline;
  }
}
</style>