<template>
  <mk-timeline timeline="homeTimeline"></mk-timeline>
  <button @click="num++">{{ num }} test miao</button>
</template>

<script setup lang="ts">
const num = ref(0);
</script>
