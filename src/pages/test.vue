<template>
  <button p="2" flex="~ col" @click="num++">{{ num }} test miao</button>
</template>

<script setup lang="ts">
const num = ref(0);
</script>
