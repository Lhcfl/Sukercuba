<template>
  <VNavigationDrawer>
    <VList nav>
      <VListItem
        title="Sukerkuba"
        :to="{ name: '/' }"
      />
      <VListItem
        :title="t('login')"
        :to="{ name: '/login' }"
      />
      <VListItem
        :title="t('clearCache')"
        @click.stop="clearCache"
      />
      <VListItem>
        <VSelect
          v-model="theme.global.name.value"
          :items="themeNames"  
        />
      </VListItem>
      <VListItem>
        <VSelect
          v-model="locale"
          :items="availableLanguages"  
        />
      </VListItem>
    </VList>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { useCustomEmojisData } from '@/stores/custom-emoji-map';
import { useTheme } from 'vuetify';
import langs from '@/locales/index.json';

const { t, locale } = useI18n();

const theme = useTheme();

async function clearCache() {
  await useCustomEmojisData().update();
  location.reload();
}

const themeNames = computed(() => Object.keys(theme.computedThemes.value));

const availableLanguages = [...langs];
</script>