<template>
  <VCard :class="$style.main" :loading="searching">
    <VTextField v-model="search" variant="filled" autofocus hide-details="auto" :label="t('enterEmoji')" />
    <div :class="$style.emojiPanels">
      <VItemGroup>
        <MkEmojiPickerEmojis :emojis="recentlyUsedEmojis" @selected="clickEmoji" />
      </VItemGroup>
      <VItemGroup v-if="searched">
        <MkEmojiPickerEmojis :emojis="searched" @selected="clickEmoji" />
      </VItemGroup>
      <VExpansionPanels variant="accordion" multiple>
        <VExpansionPanel v-for="section in sections" :key="section.name ?? '-1'">
          <VExpansionPanelTitle>
            <MkCustomEmoji v-if="section.example" :name="section.example.name" />
            {{ section.name ?? t("other") }}
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <VItemGroup>
              <MkEmojiPickerEmojis :emojis="section.emojis" @selected="clickEmoji" />
            </VItemGroup>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </div>
  </VCard>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import type { EmojiSimple } from "misskey-js/entities.js";
import type { NoteWithExtension } from "@/stores/note-cache";
import EmojiSearcher from "@/workers/emoji-searcher?worker";

const props = defineProps<{
  accept?: NoteWithExtension["reactionAcceptance"];
}>();

const emit = defineEmits<{
  selected: [emoji: EmojiSimple];
}>();

const { t } = useI18n();
const emojis = useCustomEmojisData();
const account = useAccount();

const recentlyUsedEmojis = computed(() =>
  (account.accountStore.reactive.recentlyUsedEmojis ?? []).map(attachInfo),
);

const search = ref("");
const searching = ref(false);
const searched = ref<ReturnType<typeof attachInfo>[]>([]);
const sections = ref(getSections());
const searchWorker = new EmojiSearcher();

searchWorker.postMessage({ op: "init", data: account.site });

function clickEmoji(e: EmojiSimple) {
  account.accountStore.reactive.recentlyUsedEmojis = [e]
    .concat(recentlyUsedEmojis.value.filter((x) => x.name !== e.name))
    .slice(0, 60);
  emit("selected", e);
}

function attachInfo(e: EmojiSimple) {
  return {
    ...e,
    disabled:
      e.isSensitive &&
      (props.accept === "nonSensitiveOnly" ||
        props.accept === "nonSensitiveOnlyForLocalLikeOnlyForRemote"),
  };
}

function getSections() {
  return [...emojis.emojiCategories.entries()]
    .map(([name, emojis]) => ({
      name,
      emojis: emojis
        .filter((e) => {
          if (!search.value) return true;
          return (
            e.name.includes(search.value) ||
            e.aliases.some((alias) => alias.includes(search.value)) ||
            e.category?.includes(search.value)
          );
        })
        .map(attachInfo),
      example: emojis.at(0),
    }))
    .filter((cat) => cat.emojis.length > 0)
    .sort((a, b) => {
      if (a.name == null) return 1;
      if (b.name == null) return -1;
      return a.name < b.name ? -1 : 1;
    });
}

searchWorker.addEventListener("message", (emojis) => {
  searched.value = !search.value ? [] : emojis.data.map(attachInfo);
  if (import.meta.env.DEV) {
    const time1 = performance.now();
    sections.value = getSections();
    const time2 = performance.now();
    console.log(`MkEmojiPicker: filtering took ${time2 - time1}ms`);
  } else {
    sections.value = getSections();
  }
  searching.value = false;
})

const debounceSearch = useDebounceFn(() => {
  if (search.value) {
    searching.value = true;
    searchWorker.postMessage({ op: "search", data: search.value });
  } else {
    searched.value = [];
    sections.value = getSections();
  }
}, 150);

watch(search, () => {
  debounceSearch();
});
</script>

<style lang="scss" module>
.main {
  .emojiPanels {
    width: 500px;
    max-height: 500px;
    overflow-y: auto;
  }
}
</style>
