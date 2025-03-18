<template>
  <RouterLink :to>
    <span>@{{ username }}</span><span v-if="host">@{{ host }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  navigationBehaviour?: unknown,
  host?: string | null,
	username: string,
  noNavigate?: boolean
}>();

const to = computed(() => ({
  name: '/@[userhandle]' as const,
  params: {
    userhandle: [props.username, props.host].filter((x) => x).join("@"),
  }
}))
</script>