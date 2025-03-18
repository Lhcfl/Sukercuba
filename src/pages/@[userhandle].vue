<template>
  <VCard v-if="err">
    <VCardText>{{ err }}</VCardText>
  </VCard>
  <div
    v-else-if="!user"
    class="d-flex h-screen w-100 align-center justify-space-evenly"
  >
    <VProgressCircular indeterminate />
  </div>
  <template v-else>
    <MkUserPageCard :user />
    <MkUserTimeline :user-id="user.id" />
  </template>
</template>

<script setup lang="ts">
import { useAccount } from "@/stores/account";
import { isAPIError } from "misskey-js/api.js";
import type { UserDetailed } from "misskey-js/entities.js";

const route = useRoute<"/@[userhandle]">();
const [username, host] = route.params.userhandle.split("@") as [
  string,
  string | undefined
];

const account = useAccount();
const user = ref<UserDetailed>();
const err = ref<string>();

async function load() {
  try {
    user.value = await account.api.request("users/show", { username, host });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    err.value =
      (typeof error == "object" && error != null && isAPIError(error))
        ? error.message
        : String(error);
  }
}

load();
</script>
