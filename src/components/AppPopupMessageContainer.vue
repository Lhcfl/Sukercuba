<template>
  <VDialog :model-value="show" max-width="500" :persistent="message?.okcancel">
    <VCard v-if="message">
      <VCardTitle v-if="message.title">
        {{ message.title }}
      </VCardTitle>
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
        <v-btn :text="message.okText ?? t('gotIt')" @click="close(true)" />
        <v-btn v-if="message.okcancel" :text="message.cancelText ?? t('cancel')" @click="close(false)" />
      </v-card-actions>
    </VCard>
  </VDialog>
</template>

<script lang="ts" setup>
const popupMessages = usePopupMessage();
const { t } = useI18n();
const message = computed(() => popupMessages.messages.at(0));
const show = computed(() => message.value && !message.value.resolved);

function close(ok: boolean) {
  message.value?.callback({ ok });
  message.value!.resolved = true;
  setTimeout(() => {
    popupMessages.messages.shift();
  }, 500);
}
</script>
