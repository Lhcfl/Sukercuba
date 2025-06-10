<template>
  <VCard :class="$style.main">
    <VTextField
      v-model="search"
      autofocus
      :label="t('enterEmoji')"
    />
    <div :class="$style.emojiPanels">
      <VItemGroup>
        <VBtn
          v-for="emoji in recentlyUsedEmojis"
          :key="emoji.name"
          variant="flat"
          :disabled="emoji.disabled"
          @click.stop="clickEmoji(emoji)"
        >
          <MkCustomEmoji :name="emoji.name" />
        </VBtn>
      </VItemGroup>
      <VItemGroup v-if="searched">
        <VBtn
          v-for="emoji in searched"
          :key="emoji.name"
          variant="flat"
          :disabled="emoji.disabled"
          @click.stop="clickEmoji(emoji)"
        >
          <MkCustomEmoji :name="emoji.name" />
        </VBtn>
      </VItemGroup>
      <VExpansionPanels
        variant="accordion"
        multiple
      >
        <VExpansionPanel
          v-for="section in sections"
          :key="section.name ?? '-1'"
        >
          <VExpansionPanelTitle>
            <MkCustomEmoji
              v-if="section.example"
              :name="section.example.name"
            />
            {{ section.name ?? t("other") }}
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <VItemGroup>
              <VBtn
                v-for="emoji in section.emojis"
                :key="emoji.name"
                variant="flat"
                :disabled="emoji.disabled"
                @click.stop="clickEmoji(emoji)"
              >
                <MkCustomEmoji :name="emoji.name" />
              </VBtn>
            </VItemGroup>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </div>
  </VCard>
</template>

<script setup lang="ts">
import type { NoteWithExtension } from "@/stores/note-cache";
import { useDebounceFn } from "@vueuse/core";
import type { EmojiSimple } from "misskey-js/entities.js";

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
  (account.accountStore.reactive.recentlyUsedEmojis ?? []).map(attachInfo)
);

const search = ref("");
const searched = ref<ReturnType<typeof attachInfo>[]>([]);
const sections = ref(getSections());

function clickEmoji(e: EmojiSimple) {
  account.accountStore.reactive.recentlyUsedEmojis = [e]
    .concat(recentlyUsedEmojis.value.filter((x) => x.name != e.name))
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

const debounceSearch = useDebounceFn(() => {
  searched.value = !search.value
    ? []
    : emojis.emojiFuse
        .search(search.value, { limit: 100 })
        .map((x) => attachInfo(x.item));
  sections.value = getSections();
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
