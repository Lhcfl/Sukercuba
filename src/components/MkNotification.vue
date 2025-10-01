<template>
  <MkNotificationNoteEvent v-if="isNoteEventNotification(notification)" :notification variant="flat" />
  <MkNote v-else-if="notification.type === 'mention' || notification.type === 'quote' || notification.type === 'reply'"
    variant="flat" :note="note!" collapse-reply />
  <MkNotificationFollow
    v-else-if="notification.type === 'follow' || notification.type === 'receiveFollowRequest' || notification.type === 'followRequestAccepted'"
    variant="flat" :notification />
  <VCard v-else>
    <VCardTitle>
      {{ notification.type }}
    </VCardTitle>
    <VCardText>
      <span>暂未实现</span>
    </VCardText>
  </VCard>
</template>

<script lang="ts" setup>
import type { Notification } from "misskey-js/entities.js";
import {
  type ExtractNotifications,
  NoteEventNotificationTypes,
} from "@/types/notification";

const props = defineProps<{
  notification: Notification;
}>();

function isNoteEventNotification(
  n: Notification,
): n is ExtractNotifications<typeof NoteEventNotificationTypes> {
  return (NoteEventNotificationTypes as readonly string[]).includes(n.type);
}

const noteCache = useNoteCache();

/** Notifications will always return detailed note */
const note = computed(() =>
  "note" in props.notification
    ? noteCache.cached(props.notification.note, true).value
    : undefined,
);
</script>
