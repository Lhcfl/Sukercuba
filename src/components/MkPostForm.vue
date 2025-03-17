<template>
  <VCard
    variant="flat"
    tile
  >
    <VCardActions class="d-flex justify-space-between">
      <MkAvatar
        v-if="account.me"
        :user="account.me"
      />
      <div>
        <VBtn icon="mdi-earth" />
        <VBtn icon="mdi-cloud-check-outline" />
        <VBtn icon="mdi-clock-outline" />
      </div>
    </VCardActions>
    <VCardText class="pa-0">
      <VTextarea
        v-if="showCw"
        :rows="2"
        density="compact"
        auto-grow
        variant="underlined"
        label="cw"
        hide-details="auto"
      />
      <VTextarea
        v-model="text"
        placeholder="在想些什么"
        flat
        autofocus
        auto-grow
        hide-details="auto"
      />
      <VCombobox
        v-if="showTags"
        label="tags"
        variant="underlined"
        :delimiters="[' ']"
        chips
        multiple
        closable-chips
        hide-details="auto"
      >
        <template #chip="data">
          <VChip
            :key="data.index"
            prepend-icon="mdi-tag"
            v-bind="data.props"
          />
        </template>
      </VCombobox>
    </VCardText>
    <VCardText v-if="showPreview">
      <MkMfm :text="text" />
    </VCardText>
    <VCardActions class="d-flex justify-space-between">
      <div>
        <VBtn icon="mdi-image-outline" />
        <VBtn icon="mdi-poll" />
        <VBtn
          icon="mdi-eye-off-outline"
          :color="showCw ? 'primary': undefined"
          @click.stop="showCw = !showCw"
        />
        <VBtn
          icon="mdi-tag-multiple-outline" 
          :color="showTags ? 'primary': undefined"
          @click.stop="showTags = !showTags"
        />
        <VBtn icon="mdi-sticker-emoji" />
        <VBtn icon="mdi-dots-horizontal" />
      </div>
      <div>
        <VBtn
          icon="mdi-eye-outline"
          :color="showPreview ? 'primary': undefined"
          @click.stop="showPreview = !showPreview"
        />
        <VBtn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-send-outline"
        >
          发送
        </VBtn>
      </div>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { useAccount } from '@/stores/account';

const account = useAccount();

const showCw = ref(false);
const showTags = ref(false);
const showPreview = ref(false);

const text = ref('');


</script>
