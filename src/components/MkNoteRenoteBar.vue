<template>
  <VCardItem class="pb-0 text-secondary">
    <div class="d-flex justify-space-between align-center">
      <span>
        <VIcon icon="mdi-repeat-variant" />
        <VAvatar :image="note.user.avatarUrl ?? undefined" />
        <MkUserName :user="note.user" />
      </span>
      <div>
        <VMenu v-if="note.userId == account.me?.id">
          <template #activator="{ props: p }">
            <VBtn
              v-bind="p"
              icon="mdi-dots-vertical"
              variant="plain"
              size="small"
              @click.stop
            />
          </template>
          <VList>
            <VListItem
              prepend-icon="mdi-delete-outline"
              class="text-red"
              @click.stop="deleteRenote"
            >
              <VProgressCircular
                v-if="deleting"
                indeterminate
              />
              <span v-else>
                {{ t('unrenote') }}
              </span>
            </VListItem>
          </VList>
        </VMenu>
        <VChip
          :append-icon="visibilityIcon"
          size="small"
        >
          <MkTime :time="note.createdAt" />
        </VChip>
      </div>
    </div>
  </VCardItem>
</template>

<script lang="ts" setup>
import * as Misskey from "misskey-js";

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
    usePopupMessage().push({ type: "error", message: (err as { message: string }).message });
  } finally {
    deleting.value = false;
  }
}
</script>
