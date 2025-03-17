<template>
  <div>
    <MkPostForm />
    <VDivider />
  </div>
  <MkNotes :next />
  <VNavigationDrawer
    location="right"
    :width="400"
  >
    <MkNotifications />
  </VNavigationDrawer>
</template>

<script lang="ts" setup>
import { useAccount } from "@/stores/account";
import type { Note } from "misskey-js/entities.js";
const account = useAccount();

async function next(notes: Note[]) {
    const last = notes.at(-1);
    return account.api.request('notes/timeline', {
      untilId: last?.id,
    })
}
</script>
