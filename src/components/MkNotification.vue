<template>
  <MkNotificationNoteEvent
    v-if="isNoteEventNotification(notification)"
    :notification
    variant="flat"
  />
  <MkNote
    v-else-if="notification.type === 'mention' || notification.type === 'quote' || notification.type === 'reply'"
    variant="flat"
    :note="notification.note"
    new-fetch
  />
  <span v-else> 暂未实现 </span>
</template>

<script lang="ts" setup>
import { NoteEventNotificationTypes, type ExtractNotifications } from "@/types/notification";
import type { Notification } from "misskey-js/entities.js";
defineProps<{
  notification: Notification;
}>()

function isNoteEventNotification(n: Notification): n is ExtractNotifications<typeof NoteEventNotificationTypes> {
  return (NoteEventNotificationTypes as readonly string[]).includes(n.type)
}
</script>

<style lang="scss" module>

</style>