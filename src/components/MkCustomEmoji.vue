<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
  <span v-if="errored">:{{ customEmojiName }}:</span>
  <img v-else :class="[
    $style.root,
    { [$style.normal]: normal, [$style.noStyle]: noStyle },
  ]" :src="url" :alt="alt" :title="alt" decoding="async" @error="errored = true" @load="errored = false"
    @click="onClick">
</template>

<script lang="ts" setup>
const props = defineProps<{
  name: string;
  normal?: boolean;
  noStyle?: boolean;
  host?: string | null;
  url?: string;
  useOriginalSize?: boolean;
  menu?: boolean;
  menuReaction?: boolean;
  fallbackToImage?: boolean;
}>();

const emojis = useCustomEmojisData();

const customEmojiName = computed(() =>
  (props.name[0] === ":"
    ? props.name.substring(1, props.name.length - 1)
    : props.name
  ).replace("@.", ""),
);
const isLocal = computed(
  () =>
    !props.host &&
    (customEmojiName.value.endsWith("@.") ||
      !customEmojiName.value.includes("@")),
);

const url = computed(() => {
  if (props.url) {
    return props.url;
  }
  if (isLocal.value) {
    return emojis.emojiMap.get(customEmojiName.value)?.url ?? undefined;
  }
  return props.host
    ? `/emoji/${customEmojiName.value}@${props.host}.webp`
    : `/emoji/${customEmojiName.value}.webp`;
});

const alt = computed(() => `:${customEmojiName.value}:`);
const errored = ref(url.value == null);

function onClick(ev: MouseEvent) {
  // console.log(ev);
  // todo
}
</script>

<style lang="scss" module>
.root {
  display: inline;
  height: 2em;
  vertical-align: middle;
  transition: transform 0.2s ease;
}

.normal {
  height: 1.25em;
  vertical-align: -0.25em;

  &:hover {
    transform: none;
  }
}

.noStyle {
  height: auto !important;
}
</style>
