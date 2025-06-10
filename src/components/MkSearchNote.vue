<template>
  <VCard>
    <VTextField
      v-model="query"
      :placeholder="$t('search')"
      class="mb-2"
      append-inner-icon="mdi-magnify"
      :loading="searching"
      @click:append-inner="search"
      @keydown.enter="search"
    />
    <VRadioGroup
      v-model="hostKind"
      :label="t('host')"
      inline
    >
      <VRadio
        :label="t('all')"
        value="all"
      />
      <VRadio
        :label="t('local')"
        value="local"
      />
      <VRadio
        :label="t('specifyHost')"
        value="specifyHost"
      />
    </VRadioGroup>
    <VTextField
      v-if="hostKind === 'specifyHost'"
      v-model="hostStr"
      :placeholder="t('host')"
      :label="t('specifyHost')"
    />
    <VContainer> // TODO 这里之后要放用户指定 </VContainer>
  </VCard>
  <MkNotesList
    :key="noteListKey"
    :next
  />
</template>

<script setup lang="ts">
import type { NoteWithExtension } from "@/stores/note-cache";

const query = ref("");
const { t } = useI18n();
const hostKind = ref("all");
const hostStr = ref("");
const searching = ref(false);
const account = useAccount();
const noteCache = useNoteCache();
const noteListKey = ref(crypto.randomUUID());

const next = shallowRef(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (_notes: NoteWithExtension[]): Promise<NoteWithExtension[]> => {
    // 默认不搜索
    return [];
  }
);

const queryHost = computed(() => {
  if (hostKind.value === "all") {
    return undefined;
  }
  if (hostKind.value === "local") {
    return ".";
  }
  return "host";
});

watch(queryHost, () => {
  search();
})

const search = async () => {
  if (query.value === "") {
    return;
  }
  searching.value = true;
  const q = query.value;
  const host = queryHost.value == "host" ? hostStr.value : queryHost.value;
  next.value = async (notes) => {
    const raw_notes = await account.api.request("notes/search", {
      untilId: notes.at(-1)?.id,
      query: q,
      host,
    });
    searching.value = false;
    return raw_notes.map((note) => {
      const cached = noteCache.cached(note, true);
      return cached.value;
    });
  };
  noteListKey.value = crypto.randomUUID();
}
</script>
