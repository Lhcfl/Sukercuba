<template>
  <div class="search-tabs d-flex flex-column">
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
        value="notes"
      >
        <MkSearchNote />
      </VTabsWindowItem>
      <VTabsWindowItem
        value="users"
      >
        <MkSearchUser />
      </VTabsWindowItem>
    </VTabsWindow>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const tabs = computed(() => [
  { text: t("notes"), value: "notes" },
  { text: t("users"), value: "users" },
]);
const tab = ref(0);
</script>