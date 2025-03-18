<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
  <time
    :title="absolute"
    :class="{
      'text-yellow': colored && ago > 60 * 60 * 24 * 90,
      'text-red': colored && ago > 60 * 60 * 24 * 180,
    }"
  >
    <template v-if="invalid">{{ t("_ago.invalid") }}</template>
    <template v-else-if="mode === 'relative'">{{ relative }}</template>
    <template v-else-if="mode === 'absolute'">{{ absolute }}</template>
    <template v-else-if="mode === 'detail'">{{ absolute }} ({{ relative }})</template>
  </time>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

const props = withDefaults(
  defineProps<{
    time: Date | string | number | null;
    origin?: Date | null;
    mode?: "relative" | "absolute" | "detail";
    colored?: boolean;
  }>(),
  {
    origin: null,
    mode: "relative",
  }
);

function getDateSafe(n: Date | string | number) {
  try {
    if (n instanceof Date) {
      return n;
    }
    return new Date(n);
  } catch {
    return {
      getTime: () => NaN,
    };
  }
}

const _time = computed(() =>
  props.time == null ? NaN : getDateSafe(props.time).getTime()
);
const invalid = computed(() => Number.isNaN(_time.value));
const absolute = computed(() =>
  !invalid.value ? dateTimeFormat.format(_time.value) : t("_ago.invalid")
);
const realNow = ref(Date.now());
const now = computed(() => props.origin?.getTime() ?? realNow.value);
const ago = computed(() => (now.value - _time.value) / 1000 /*ms*/);

const relative = computed<string>(() => {
  if (props.mode === "absolute") return ""; // absoluteではrelativeを使わないので計算しない
  if (invalid.value) return t("_ago.invalid");

  return ago.value >= 31536000
    ? t("_ago.yearsAgo", { n: Math.round(ago.value / 31536000).toString() })
    : ago.value >= 2592000
    ? t("_ago.monthsAgo", { n: Math.round(ago.value / 2592000).toString() })
    : ago.value >= 604800
    ? t("_ago.weeksAgo", { n: Math.round(ago.value / 604800).toString() })
    : ago.value >= 86400
    ? t("_ago.daysAgo", { n: Math.round(ago.value / 86400).toString() })
    : ago.value >= 3600
    ? t("_ago.hoursAgo", { n: Math.round(ago.value / 3600).toString() })
    : ago.value >= 60
    ? t("_ago.minutesAgo", { n: (~~(ago.value / 60)).toString() })
    : ago.value >= 10
    ? t("_ago.secondsAgo", { n: (~~(ago.value % 60)).toString() })
    : ago.value >= -3
    ? t("_ago.justNow")
    : ago.value < -31536000
    ? t("_timeIn.years", {
        n: Math.round(-ago.value / 31536000).toString(),
      })
    : ago.value < -2592000
    ? t("_timeIn.months", {
        n: Math.round(-ago.value / 2592000).toString(),
      })
    : ago.value < -604800
    ? t("_timeIn.weeks", { n: Math.round(-ago.value / 604800).toString() })
    : ago.value < -86400
    ? t("_timeIn.days", { n: Math.round(-ago.value / 86400).toString() })
    : ago.value < -3600
    ? t("_timeIn.hours", { n: Math.round(-ago.value / 3600).toString() })
    : ago.value < -60
    ? t("_timeIn.minutes", { n: (~~(-ago.value / 60)).toString() })
    : t("_timeIn.seconds", { n: (~~(-ago.value % 60)).toString() });
});

let tickId: number;
let currentInterval: number;

function tick() {
  realNow.value = Date.now();
  const nextInterval =
    ago.value < 60 ? 10000 : ago.value < 3600 ? 60000 : 180000;

  if (currentInterval !== nextInterval) {
    if (tickId) window.clearInterval(tickId);
    currentInterval = nextInterval;
    tickId = window.setInterval(tick, nextInterval);
  }
}

onUnmounted(() => {
  if (tickId) window.clearInterval(tickId);
});

watch(() => props.time, tick, { immediate: true });
</script>
