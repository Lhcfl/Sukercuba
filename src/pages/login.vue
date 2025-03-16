<template>
  <VForm>
    <VTextField
      v-model="account.site"
      label="网站地址"
    />
    <VTextField
      v-model="account.token"
      label="Token"
    />
  </VForm>

  <VBtn :to="{ name: '/' }">
    好
  </VBtn>
</template>

<script lang="ts" setup>
import { useAccount } from "@/stores/account";
const account = useAccount();
</script>
