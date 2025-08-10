<template>
  <div class="flex flex-col">
    <VTabs v-model="tab" :items="tabs" class="flex-0-0">
      <VTab v-for="item in tabs" :key="item.value" :value="item.value">
        {{ item.text }}
      </VTab>
    </VTabs>
    <div class="overflow-y-auto!">
      <MkPostForm class="mx-2.5 mt-2.5 border flex-0-0" />
      <VTabsWindow v-model="tab" class="flex-1-1">
        <VTabsWindowItem v-for="item in tabs" :key="item.value" :value="item.value">
          <MkTimeline :timeline="item.value" />
        </VTabsWindowItem>
      </VTabsWindow>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { availableTimelines, type Timeline } from "@/types/timeline";

const { t } = useI18n();

const tabs = availableTimelines.map((x) => ({
  text: t(`_timelines.${x === "hybrid" ? "social" : x}`),
  value: `${x}Timeline` as Timeline,
}));

const tab = ref(tabs[0].value);
</script>
