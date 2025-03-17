<template>
  <VCard
    variant="flat"
    :loading
    :disabled="loading"
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
    <VCardText>
      <VTextarea
        v-if="showCw"
        v-model="cw"
        :rows="2"
        density="compact"
        auto-grow
        variant="underlined"
        label="cw"
        hide-details="auto"
      />
      <VTextarea
        v-model="text"
        :loading
        placeholder="在想些什么"
        variant="underlined"
        flat
        autofocus
        auto-grow
        hide-details="auto"
      />
      <VCombobox
        v-if="showTags"
        v-model="appendTags"
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
      <p v-if="computedCw">
        <MkMfm :text="computedCw" />
        <VDivider />
      </p>
      <p>
        <MkMfm :text="computedText" />
      </p>
    </VCardText>
    <VCardActions class="d-flex justify-space-between">
      <div>
        <VBtn icon="mdi-image-outline" />
        <VBtn icon="mdi-poll" />
        <VBtn
          icon="mdi-eye-off-outline"
          :color="showCw ? 'primary' : undefined"
          @click.stop="showCw = !showCw"
        />
        <VBtn
          icon="mdi-tag-multiple-outline"
          :color="showTags ? 'primary' : undefined"
          @click.stop="showTags = !showTags"
        />
        <VBtn icon="mdi-sticker-emoji" />
        <VBtn icon="mdi-dots-horizontal" />
      </div>
      <div>
        <VBtn
          icon="mdi-eye-outline"
          :color="showPreview ? 'primary' : undefined"
          @click.stop="showPreview = !showPreview"
        />
        <VBtn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-send-outline"
          :loading
          text="发送"
          @click.stop="submit"
        />
      </div>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { useAccount } from "@/stores/account";
import type { NotesCreateRequest } from "misskey-js/entities.js";

const account = useAccount();

const showCw = ref(false);
const showTags = ref(false);
const showPreview = ref(false);
const loading = ref(false);

const text = ref("");
const cw = ref("");
const appendTags = ref<string[]>([])

const computedCw = computed(() => showCw.value ? cw.value : undefined);
const computedTags = computed(() => showTags.value ? appendTags.value : []);
const computedText = computed(() => {
  let ret = text.value;
  if (computedTags.value.length > 0) {
    if (ret.at(-1) === '\n') {
      ret += "\n";
    } else {
      ret += " ";
    }
    ret += computedTags.value.map(x=>`#${x}`).join(" ");
  }
  return ret;
})

async function submit() {
  try {
    loading.value = true;
    await new Promise((r) => setTimeout(r, 1000));
    const req: NotesCreateRequest = {
      text: computedText.value,
      cw: computedCw.value,
    }
    await account.api.request("notes/create", req);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>
