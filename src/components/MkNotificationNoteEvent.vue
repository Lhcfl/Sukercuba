<template>
  <VCard v-ripple>
    <VCardItem :prepend-icon="icon">
      <div
        v-if="users"
        class="d-flex"
      >
        <MkAvatar
          v-for="user in users"
          :key="user.id"
          :user="user"
        />
      </div>
      <div
        v-if="reactions"
        class="d-flex flex-wrap"
      >
        <div
          v-for="(pair, index) in reactions"
          :key="index"
        >
          <MkAvatar
            :user="pair.user"
          />
          <MkAnyEmoji
            :class="$style.emoji"
            :name="pair.reaction"
          />
        </div>
      </div>
    </VCardItem>
    <VCardText>
      <p :class="$style.note">
        <span v-if="appearNote.files?.length">
          <VIcon icon="mdi-image" />
          x{{ appearNote.files?.length }}
        </span>
        <MkMfm
          v-if="appearNote.text"
          :text="appearNote.text"
          :author="appearNote.user"
          :emoji-urls="appearNote.emojis"
        />
      </p>
    </VCardText>
  </VCard>
</template>

<script lang="ts" setup>
import type { ExtractNotifications, NoteEventNotificationTypes } from "@/types/notification";

const props = defineProps<{
  notification: ExtractNotifications<typeof NoteEventNotificationTypes>;
}>()

const icon = computed(() => ({
  renote: "mdi-repeat-variant",
  reaction: 'mdi-sticker-emoji',
  pollEnded: 'mdi-poll',
  'reaction:grouped': 'mdi-sticker-emoji',
  'renote:grouped': "mdi-repeat-variant",
}[props.notification.type]))

const users = computed(() => {
  if (props.notification.type === 'pollEnded') return null;
  if (props.notification.type === 'reaction') return [props.notification.user];
  if (props.notification.type === 'renote') return [props.notification.user];
  if (props.notification.type === 'renote:grouped') return props.notification.users;
  if (props.notification.type === 'reaction:grouped') return null;
})

const reactions = computed(() => {
  if (props.notification.type === 'reaction:grouped') return props.notification.reactions;
  return null;
})

const appearNote = computed(() => props.notification.type === 'renote:grouped' ? props.notification.note.renote! : props.notification.note)

</script>

<style lang="scss" module>
.note {
  max-height: 100px;
}
.emoji {
  height: 1.7em;
  width: 1.7em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(var(--v-theme-background));
  border-radius: 100px;
  padding: 2px;
  margin-left: -1.3em;
  transform: translateY(0.5em);
  margin-right: 0.5em;
  position: relative;
  left: 0;
}
</style>