<template>
  <VCard :class="$style.main">
    <VTextField
      v-model="search"
      :label="t('enterEmoji')"
    />
    <div :class="$style.emojiPanels">
      <VItemGroup v-if="searched">
        <VBtn
          v-for="emoji in searched"
          :key="emoji.name"
          @click.stop="emit('selected', emoji)"
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
                @click.stop="emit('selected', emoji)"
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
import { useCustomEmojisData } from "@/stores/custom-emoji-map";
import { useDebounceFn } from "@vueuse/core";
import type { EmojiSimple } from "misskey-js/entities.js";

const emit = defineEmits<{
  selected: [emoji: EmojiSimple]
}>()

const { t } = useI18n();
const emojis = useCustomEmojisData();

const search = ref("");
const searched = ref<EmojiSimple[]>([]);
const sections = ref(getSections());

function getSections() {
  return [...emojis.emojiCategories.entries()]
    .map(([name, emojis]) => ({
      name,
      emojis: emojis.filter((e) => {
        if (!search.value) return true;
        return (
          e.name.includes(search.value) ||
          e.aliases.some((alias) => alias.includes(search.value)) ||
          e.category?.includes(search.value)
        );
      }),
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
    : emojis.emojiFuse.search(search.value, { limit: 100 }).map((x) => x.item);
  sections.value = getSections();
}, 150);

watch(search, () => {
  debounceSearch();
});

console.log({ emojis });
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
