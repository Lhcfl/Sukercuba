<template>
  <VInfiniteScroll @load="load">
    <div
      v-for="notification in notifications"
      :key="notification.id"
    >
      <MkNotification
        tile
        :notification
      />
      <VDivider />
    </div>
  </VInfiniteScroll>
</template>
<script lang="ts" setup>
import { useAccount } from "@/stores/account";
import type { Notification } from "misskey-js/entities.js";
import type { Connection } from "misskey-js/streaming.js";
const account = useAccount();

const notifications = ref<Notification[]>([]);
const untilId = ref<string>();
let connection: Connection | undefined;

onMounted(() => {
  // Misskey的类型不够完善
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connection = account.streamApi.useChannel("notification" as any, (n : Notification) => {
    notifications.value.unshift(n);
  })
});

onUnmounted(() => {
  connection?.dispose();
})

async function load(context: { done: (stat: 'ok' |'error') => void }) {
  try {
    const res = await account.api.request('i/notifications-grouped', { untilId: untilId.value});
    untilId.value = res.at(-1)?.id;
    notifications.value = notifications.value.concat(res);
    context.done('ok');
  } catch {
    context.done('error')
  }
}
</script>