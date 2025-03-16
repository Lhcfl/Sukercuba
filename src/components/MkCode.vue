<template>
  <pre>
    <code>
      {{ code }}
    </code>
  </pre>
</template>

<script setup lang="ts">
defineProps<{
  code: string,
  lang?: string,
}>()
</script>