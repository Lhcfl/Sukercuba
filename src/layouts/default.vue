<template>
  <AppSidebar />
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
  <VNavigationDrawer
    mobile-breakpoint="md"
    location="right"
    :width="400"
  >
    <MkNotifications />
  </VNavigationDrawer>
</template>

<script lang="ts" setup>
const route = useRoute();
const componentId = computed(() => `${route.name}[${JSON.stringify(route.params)}]`)
</script>
