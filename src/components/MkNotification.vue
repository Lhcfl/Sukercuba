<template>
  <MkNotificationNoteEvent
    v-if="NoteEventNotificationTypes.includes(notification.type as never)"
    :notification="notification"
  />
  <MkNote
    v-else-if="notification.type === 'mention' || notification.type === 'quote' || notification.type === 'reply'"
    :note="notification.note"
  />
  <span v-else> 暂未实现 </span>
</template>

<script lang="ts" setup>
import { NoteEventNotificationTypes } from "@/types/notification";
import type { Notification } from "misskey-js/entities.js";
defineProps<{
  notification: Notification;
}>()
</script>

<style lang="scss" module>

</style>