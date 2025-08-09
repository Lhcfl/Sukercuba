<template>
  <VBottomNavigation color="secondary" v-model="currentActive" :active="xs">
    <VBtn v-for="item in navigations.filter(x => x.bottom)" :key="item.title" :value="item.to">
      <v-icon :icon="item.icon"></v-icon>
      <span>{{ item.title }}</span>
    </VBtn>
    <VBtn>
      <v-icon icon="mdi-dots-horizontal"></v-icon>
      <span>{{ t('other') }}</span>
    </VBtn>
  </VBottomNavigation>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify";

const { t } = useI18n();
const { xs } = useDisplay();
const router = useRouter();
const navigations = useNavigations();

const currentActive = computed({
  get: () => {
    return router.currentRoute.value.name;
  },
  set: (to) => {
    if (to) {
      router.push(to);
    }
  }
});
</script>
