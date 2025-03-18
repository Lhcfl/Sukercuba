<route lang="yaml">
meta:
  layout: login
</route>

<template>
  <div class="d-flex h-screen w-100 align-center justify-space-evenly">
    <VProgressCircular
      v-if="loading"
      indeterminate
    />
    <VCard
      v-else
      class="w-sm-100 w-md-50"
    >
      <VCardTitle>{{ t("done") }}</VCardTitle>
    </VCard>
  </div>
</template>

<script lang="ts" setup>
import router from "@/router";
import { useAccount } from "@/stores/account";

const { t } = useI18n();
const route = useRoute<"/login-redirect">();
const account = useAccount();
const loading = ref(true);

onMounted(async () => {
  console.log(route.query.session);
  const session = route.query.session;
  if (!session) {
    router.push("/login");
  }
  try {
    const resp = await fetch(
      new URL(`/api/miauth/${session}/check`, account.site),
      {
        method: "POST",
      }
    ).then((x) => x.json());
    account.token = resp.token;
    account.me = resp.user;
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  } catch {
  } finally {
    loading.value = false;
  }
});
</script>
