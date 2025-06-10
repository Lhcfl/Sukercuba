<template>
  <VMenu :disabled>
    <template #activator="{ props: p }">
      <VBtn
        v-bind="p"
        :disabled
      >
        <template #prepend>
          <VIcon :icon="selectedVisibility.icon" />
        </template>
        {{ selectedVisibility.title }}
        <template #append>
          <VIcon
            v-if="draft.localOnly"
            class="text-red"
            icon="mdi-cloud-cancel-outline"
          />
          <VIcon
            v-else
            icon="mdi-cloud-check-outline"
          />
        </template>
      </VBtn>
    </template>
    <VList>
      <VListItem
        v-for="visibility in visibilities"
        :key="visibility.value"
        :class="draft.visibility === visibility.value && 'text-primary'"
        :prepend-icon="visibility.icon"
        :title="visibility.title"
        :subtitle="visibility.subtitle"
        @click.stop="draft.visibility = visibility.value"
      />
      <VListItem
        :class="draft.localOnly && 'text-primary'"
        :prepend-icon="
          draft.localOnly
            ? 'mdi-toggle-switch-outline'
            : 'mdi-toggle-switch-off-outline'
        "
        :title="t('_visibility.disableFederation')"
        :subtitle="t('_visibility.disableFederationDescription')"
        @click.stop="draft.localOnly = !draft.localOnly"
      />
    </VList>
  </VMenu>
</template>

<script setup lang="ts">
const draft = defineModel<ReturnType<typeof useDraft>>({ required: true });

defineProps<{
  disabled?: boolean
}>();

const { t } = useI18n();

const visibilities = computed(() =>
  (
    [
      { value: "public", icon: "mdi-earth" },
      { value: "home", icon: "mdi-home-outline" },
      { value: "followers", icon: "mdi-lock-outline" },
      { value: "specified", icon: "mdi-message-lock-outline" },
    ] as const
  ).map((v) => ({
    ...v,
    title: t(`_visibility.${v.value}`),
    subtitle: t(`_visibility.${v.value}Description`),
  }))
);

const selectedVisibility = computed(
  () => visibilities.value.find((v) => v.value == draft.value.visibility)!
);
</script>
