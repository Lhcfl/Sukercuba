<template>
  <VNavigationDrawer>
    <VListItem title="Sukerkuba" />
    <VListItem>
      <VSelect
        v-model="theme.global.name.value"
        :items="themeNames"  
      />
    </VListItem>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify';
const theme = useTheme();

const themeNames = computed(() => Object.keys(theme.computedThemes.value));

</script>