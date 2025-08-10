<template>
  <VNavigationDrawer color="primary-container" mobile-breakpoint="sm" :rail="mdAndDown"
    :expand-on-hover="!platform.touch">
    <VList nav>
      <VListItem class="rounded-2xl!" v-if="account.me" :prepend-avatar="account.me.avatarUrl || undefined"
        :to="{ name: '/@[userhandle]', params: { userhandle: account.me.username } }">
        <MkUserName :user="account.me" />
      </VListItem>
      <VDivider class="my-2" />
      <VListItem v-for="item in navigationsShow" :key="item.title" :title="item.title" :to="item.to"
        :prepend-icon="item.icon" class="rounded-2xl!" @click="item.action" />
      <VListItem class="rounded-2xl!"
        :prepend-icon="theme.global.name.value === 'darkPurple' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        @click="theme.global.name.value = theme.global.name.value === 'darkPurple' ? 'lightWarm' : 'darkPurple'"
        :title="theme.global.name.value === 'darkPurple' ? t('lightThemes') : t('darkThemes')">
      </VListItem>
      <VListItem class="rounded-2xl!" prepend-icon="mdi-dots-horizontal" :title="t('other')"
        @click.stop="expanded = !expanded" />
      <VListItem class="rounded-2xl!" @click.stop="blurMode = !blurMode"
        :prepend-icon="blurMode ? 'mdi-eye-off' : 'mdi-eye'" title="模糊模式">
      </VListItem>
      <VListItem>
        <VSelect v-model="locale" :items="availableLanguages" />
      </VListItem>
      <VListItem>
        <VSlider v-model="prefer.noteGap" :max="16" :step="1" />
      </VListItem>
    </VList>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { useDisplay, useTheme } from "vuetify";
import langs from "@/locales/index.json";

const { t, locale } = useI18n();
const theme = useTheme();
const prefer = usePreferences();
const { mdAndDown, platform } = useDisplay();
const account = useAccount();

async function clearCache() {
  await useCustomEmojisData().update();
  location.reload();
}

const navigations = useNavigations();
const expanded = ref(false);
const navigationsShow = computed(() => expanded.value ? navigations.value : navigations.value.filter(x => x.sidebar));

const themeNames = computed(() => Object.keys(theme.computedThemes.value));

const availableLanguages = [...langs];

const blurMode = ref(false);
watch(blurMode, (nv) => {
  document.body.classList.toggle("blur-mode");
})
</script>

<style lang="scss">
body.blur-mode {

  .mfm,
  .username,
  .v-avatar,
  .mk-gallery {
    filter: blur(5px);
  }
}
</style>
