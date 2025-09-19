<template>
  <div class="px-4 pt-2 text-tertiary">
    <div class="flex justify-between items-center">
      <span class="flex items-center gap-2 overflow-hidden">
        <VIcon icon="mdi-repeat-variant" />
        <MkAvatar :user="note.user" size="24" />
        <MkUserName :user="note.user" class="flex-[1_1_0] min-w-0" />
      </span>
      <div>
        <VMenu v-if="note.userId == account.me?.id">
          <template #activator="{ props: p }">
            <VBtn v-bind="p" icon="mdi-dots-vertical" variant="plain" size="small" @click.stop />
          </template>
          <VList>
            <VListItem prepend-icon="mdi-delete-outline" class="text-red" @click.stop="deleteRenote">
              <VProgressCircular v-if="deleting" indeterminate />
              <span v-else>
                {{ t('unrenote') }}
              </span>
            </VListItem>
          </VList>
        </VMenu>
        <VChip :append-icon="visibilityIcon" size="small">
          <MkTime :time="note.createdAt" />
        </VChip>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type * as Misskey from "misskey-js";

const props = defineProps<{
  note: Misskey.entities.Note;
}>();

const { t } = useI18n();

const account = useAccount();

const deleting = ref(false);

const visibilityIcon = computed(() => {
  if (props.note.visibility === "public") {
    return "mdi-earth";
  }
  if (props.note.visibility === "home") {
    return "mdi-home-outline";
  }
  if (props.note.visibility === "followers") {
    return "mdi-lock-outline";
  }
  if (props.note.visibility === "specified") {
    return props.note.visibleUserIds?.length
      ? "mdi-message-lock-outline"
      : "mdi-eye-off-outline";
  }
});

async function deleteRenote() {
  try {
    deleting.value = true;
    await account.api.request("notes/delete", {
      noteId: props.note.id,
    });
  } catch (err) {
    console.error(err);
    usePopupMessage().push({
      type: "error",
      message: (err as { message: string }).message,
    });
  } finally {
    deleting.value = false;
  }
}
</script>
