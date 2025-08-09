<template>
  <VCard
    v-ripple 
    :variant
    @click.stop="router.push({ name: '/notes/[id]', params: { id: appearNote.id }})"
  >
    <VCardItem :prepend-icon="icon">
      <div
        v-if="avatars"
        class="d-flex flex-wrap"
      >
        <div
          v-for="(pair, index) in avatars"
          :key="index"
          :class="$style.avatar"
        >
          <MkAvatar
            :user="pair.user"
          />
          <MkAnyEmoji
            v-if="pair.reaction"
            :class="$style.reaction"
            :name="pair.reaction"
            :urls="appearNote.reactionEmojis"
          />
        </div>
        <VBtn
          v-if="showMore"
          variant="flat"
          icon="mdi-chevron-up"
          @click.stop="showMore = false"
        />
        <VBtn
          v-else-if="reactions && reactions.length > 3"
          variant="flat"
          icon="mdi-chevron-down"
          @click.stop="showMore = true"
        />
      </div>
    </VCardItem>
    <VCardText>
      <p :class="[$style.note, showMore && $style.showMore]">
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
import type {
  ExtractNotifications,
  NoteEventNotificationTypes,
} from "@/types/notification";
import type { VCard } from "vuetify/components";

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

<style lang="scss" module>
.note {
  max-height: 100px;
  overflow: hidden;
  &.showMore {
    max-height: unset;
  }
}
.avatar {
  height: 45px;
  width: 45px;
}

.reaction {
  scale: 0.7;
  position: absolute;
  transform: translate(-40px, 20px);
  background-color: rgb(var(--v-theme-background));
  border-radius: 50%;
  padding: 5px;
  z-index: 1;
}
</style>