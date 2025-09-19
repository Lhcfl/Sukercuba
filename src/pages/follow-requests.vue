<template>
  <div class="flex flex-col">
    <VTabs v-model="tab" :items="tabs" class="flex-0-0">
      <VTab v-for="item in tabs" :key="item.value" :value="item.value">
        {{ item.text }}
      </VTab>
    </VTabs>
    <div class="overflow-y-auto!">
      <VTabsWindow v-model="tab" class="flex-1-1">
        <VTabsWindowItem v-for="item in tabs" :key="item.value" :value="item.value">
          <MkFollowRequests :type="item.value" />
        </VTabsWindowItem>
      </VTabsWindow>
    </div>
  </div>
</template>

<script lang="ts" setup>

const { t } = useI18n();

const tabs = computed(() => [
  { value: "received" as const, text: t('_followRequest.recieved') },
  { value: "sent" as const, text: t('_followRequest.sent') },
]);

const tab = ref(tabs.value[0]);


</script>
