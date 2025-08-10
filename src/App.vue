<template>
  <v-defaults-provider :defaults>
    <v-app>
      <router-view />
      <AppPopupMessageContainer />
      <AppSnackbarQueueContainer />
    </v-app>
  </v-defaults-provider>
</template>

<script lang="ts" setup>
import type { DefaultsOptions } from 'vuetify/lib/composables/defaults.mjs';

const defaults: DefaultsOptions = {
  VCard: {
    rounded: "2xl!",
    variant: "flat",
  },
  VChip: {
    rounded: "pill"
  },
  VBtn: {
    variant: "tonal",
  },
}
</script>
