<template>
  <VNavigationDrawer>
    <VList nav>
      <VListItem
        :title="t('home')"
        :to="{ name: '/' }"
      />
      <VListItem
        :title="t('followRequests')"
      />
      <VListItem
        :to="{ name: '/search' }"
        :title="t('search')"
      />
      <VListItem
        :title="t('favorites')"
      />
      <VListItem
        :title="t('clips')"
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
        <VBtn
          :icon="theme.global.name.value === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          @click="theme.global.name.value = theme.global.name.value === 'dark' ? 'light' : 'dark'"
        />
      </VListItem>
      <VListItem>
        <VSelect
          v-model="locale"
          :items="availableLanguages"
        />
      </VListItem>
      <VListItem>
        <VSlider
          v-model="prefer.noteGap"
          :max="16"
          :step="1"
        />
      </VListItem>
    </VList>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify";
import langs from "@/locales/index.json";

const { t, locale } = useI18n();

const theme = useTheme();

const prefer = usePreferences();

async function clearCache() {
  await useCustomEmojisData().update();
  location.reload();
}

const themeNames = computed(() => Object.keys(theme.computedThemes.value));

const availableLanguages = [...langs];
</script>
