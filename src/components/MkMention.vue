<template>
  <a><span>@{{ username }}</span><span v-if="host">@{{ host }}</span></a>
</template>

<script setup lang="ts">
defineProps<{
  navigationBehaviour?: unknown,
  host?: string | null,
	username: string,
  noNavigate?: boolean
}>()
</script>