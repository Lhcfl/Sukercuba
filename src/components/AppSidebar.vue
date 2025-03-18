<template>
  <VNavigationDrawer>
    <VList nav>
      <VListItem
        title="Sukerkuba"
        :to="{ name: '/' }"
      />
      <VListItem
        title="Login"
        :to="{ name: '/login' }"
      />
      <VListItem
        title="Clear Cache"
        @click.stop="clearCache"
      />
      <VListItem>
        <VSelect
          v-model="theme.global.name.value"
          :items="themeNames"  
        />
      </VListItem>
    </VList>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { useCustomEmojisData } from '@/stores/custom-emoji-map';
import { useTheme } from 'vuetify';
const theme = useTheme();

async function clearCache() {
  await useCustomEmojisData().update();
  location.reload();
}

const themeNames = computed(() => Object.keys(theme.computedThemes.value));

</script>