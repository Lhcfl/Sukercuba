<template>
  <VDialog
    :model-value="show"
    max-width="500"
  >
    <VCard v-if="message">
      <VCardText v-if="message.message">
        {{ message.message }}
      </VCardText>
      <VCardText v-if="message.mfm">
        <MkMfm :text="message.mfm" />
      </VCardText>
      <VCardText v-if="message.vnodes">
        <component :is="message.vnodes" />
      </VCardText>

      <v-card-actions>
        <v-spacer />
        <v-btn
          :text="t('gotIt')"
          @click="close"
        />
      </v-card-actions>
    </VCard>
  </VDialog>
</template>

<script lang="ts" setup>
import { usePopupMessage } from '@/stores/popup-message';
const popupMessages = usePopupMessage();
const { t } = useI18n();
const message = computed(() => popupMessages.messages.at(0));
const show = computed(() => message.value && !message.value.resolved);

function close() {
  message.value!.callback?.();
  message.value!.resolved = true;
  setTimeout(() => {
    popupMessages.messages.shift();
  }, 500);
}
</script>
