<template>
  <VMain>
    <RouterView v-slot="{ Component }">
      <KeepAlive>
        <component
          :is="Component"
          :key="componentId"
        />
      </KeepAlive>
    </RouterView>
  </VMain>
</template>

<script lang="ts" setup>
const route = useRoute();
const componentId = computed(() => `${route.name}[${JSON.stringify(route.params)}]`)
</script>
