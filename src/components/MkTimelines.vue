<template>
  <div class="d-flex flex-column">
    <VTabs
      v-model="tab"
      :items="tabs"
      class="flex-0-0"
    >
      <VTab
        v-for="item in tabs"
        :key="item.value"
      >
        {{ item.text }}
      </VTab>
    </VTabs>
    <VTabsWindow
      v-model="tab"
      class="flex-1-1"
      :style="{ overflowY: 'auto' }"
    >
      <VTabsWindowItem
        v-for="item in tabs"
        :key="item.value"
        :value="item.value"
      >
        <MkPostForm />
        <MkTimeline
          :timeline="item.value"
        />
      </VTabsWindowItem>
    </VTabsWindow>
  </div>
</template>

<script lang="ts" setup>
import { availableTimelines } from '@/types/timeline';
const tabs = availableTimelines.map(x => ({
  text: x,
  value: x
}));
const tab = ref(tabs[0].value);
</script>
