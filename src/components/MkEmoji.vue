<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span v-html="parsed" />
</template>

<script setup lang="ts">
import { useAccount } from '@/stores/account';
import Twemoji from 'twemoji';

const props = defineProps<{
  emoji: string,
  menu?: boolean,
}>();

const account = useAccount();

const parsed = computed(() => 
  // Twemoji.parse(props.emoji)  
  Twemoji.parse(props.emoji, {
    base: account.site,
    ext: '.svg',
    folder: '/twemoji',
    className: useCssModule().root
  })
);
</script>

<style lang="scss" module>
.root {
  height: 2em;
  vertical-align: middle;
  transition: transform 0.2s ease;
}

.normal {
  height: 1.25em;
  vertical-align: -0.25em;

  &:hover {
    transform: none;
  }
}

.noStyle {
  height: auto !important;
}
</style>
