<template>
  <AppSidebar />
  <VMain class="bg-surface-light h-screen overflow-y-auto">
    <RouterView v-slot="{ Component }">
      <KeepAlive :max="10">
        <component :is="Component" :key="componentId" />
      </KeepAlive>
    </RouterView>
  </VMain>
  <AppRightSidebar />
  <AppBottomNavigation />
</template>

<script lang="ts" setup>
const route = useRoute();
const componentId = computed(
  () => `${route.name}[${JSON.stringify(route.params)}]`,
);
</script>
