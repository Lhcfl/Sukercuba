<template>
  <VCard v-ripple :variant @click.stop="router.push({ name: '/notes/[id]', params: { id: appearNote.id } })">
    <VCardItem :prepend-icon="icon">
      <div v-if="avatars" class="flex flex-wrap">
        <div v-for="(pair, index) in avatars" :key="index" class="w-14 h-14 relative">
          <MkAvatar :user="pair.user" />
          <MkAnyEmoji v-if="pair.reaction" class="absolute right-0 bottom-0 scale-75" :name="pair.reaction"
            :urls="appearNote.reactionEmojis" />
        </div>
        <VBtn class="w-12 h-12" v-if="showMore" color="secondary-container" rounded="circle" variant="flat"
          icon="mdi-chevron-up" @click.stop="showMore = false" />
        <VBtn class="w-12 h-12" v-else-if="reactions && reactions.length > 3" color="secondary-container"
          rounded="circle" variant="flat" icon="mdi-chevron-down" @click.stop="showMore = true" />
      </div>
    </VCardItem>
    <VCardText>
      <p class="mt--2" :class="{ 'line-clamp-3': !showMore }">
        <span v-if="appearNote.files?.length">
          <VIcon icon="mdi-image" />
          x{{ appearNote.files?.length }}
        </span>
        <MkMfm v-if="appearNote.text" :text="appearNote.text" :author="appearNote.user"
          :emoji-urls="appearNote.emojis" />
      </p>
    </VCardText>
  </VCard>
</template>

<script lang="ts" setup>
import type { VCard } from "vuetify/components";
import type {
  ExtractNotifications,
  NoteEventNotificationTypes,
} from "@/types/notification";

const props = defineProps<{
  notification: ExtractNotifications<typeof NoteEventNotificationTypes>;
  variant?: VCard["$props"]["variant"];
}>();

const router = useRouter();

const icon = computed(
  () =>
    ({
      renote: "mdi-repeat-variant",
      reaction: "mdi-sticker-emoji",
      pollEnded: "mdi-poll",
      "reaction:grouped": "mdi-sticker-emoji",
      "renote:grouped": "mdi-repeat-variant",
    })[props.notification.type],
);

const users = computed(() => {
  if (props.notification.type === "pollEnded") return null;
  if (props.notification.type === "reaction") return [props.notification.user];
  if (props.notification.type === "renote") return [props.notification.user];
  if (props.notification.type === "renote:grouped")
    return props.notification.users;
  if (props.notification.type === "reaction:grouped") return null;
});

const reactions = computed(() => {
  if (users.value) return users.value.map((user) => ({ user, reaction: null }));
  if (props.notification.type === "reaction:grouped")
    return props.notification.reactions;
  return null;
});

const appearNote = computed(() =>
  props.notification.type.startsWith("renote")
    ? props.notification.note.renote!
    : props.notification.note,
);

const showMore = ref(false);
const avatars = computed(() =>
  showMore.value ? reactions.value : reactions.value?.slice(0, 3),
);
</script>
