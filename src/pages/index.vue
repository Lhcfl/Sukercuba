<template>
  <div>
    <div>
      <MkPostForm />
      <VDivider />
    </div>
    <VTabs :items="tabs">
      <template #tab="{item}">
        <VTab :key="item.value">
          {{ item.text }}
        </VTab>
      </template>
      <template #item="{item}">
        <VTabsWindowItem
          :key="item.value"
          :value="item.value"
        >
          <MkTimeline
            :timeline="item.value"
          />
        </VTabsWindowItem>
      </template>
    </VTabs>
  </div>
  <VNavigationDrawer
    mobile-breakpoint="md"
    location="right"
    :width="400"
  >
    <MkNotifications />
  </VNavigationDrawer>
</template>

<script lang="ts" setup>
import { availableTimelines } from '@/types/timeline';
const tabs = availableTimelines.map(x => ({
  text: x,
  value: x
}))

</script>
