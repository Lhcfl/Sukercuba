<route lang="yaml">
meta:
  layout: login
</route>

<template>
  <div class="d-flex h-screen w-100 align-center justify-space-evenly">
    <VCard
      class="w-sm-100 w-md-50"
    >
      <VCardTitle>{{ t('login') }}</VCardTitle>
      <VForm>
        <VCardText>
          <VCombobox
            v-model="site"
            :label="t('specifyServerHost')"
            :items="autocompleteSites"
          />
        </VCardText>
        <VCardActions>
          <VBtn
            color="primary"
            @click.stop="redirectAuth"
          >
            {{ t("done") }}
          </VBtn>
        </VCardActions>
      </VForm>
    </VCard>
  </div>
</template>

<script lang="ts" setup>
import { useAccount } from "@/stores/account";
import { permissions } from "misskey-js";

const { t } = useI18n();
const account = useAccount();

const site = ref("");

const autocompleteSites = ref<string[]>([]);

function redirectAuth() {
  const session = `${crypto.randomUUID()}`;
  if (!site.value.startsWith("http")) {
    site.value = "https://" + site.value
  }
  const url = new URL(`/miauth/${session}`, site.value);
  account.site = url.origin;

  url.searchParams.append("name", "Sukerkuba the another Misskey Client");
  url.searchParams.append("callback", window.location.origin + "/login-redriect");
  url.searchParams.append("permission", permissions.join(","));

  window.location.href = url.toString();
}
</script>
