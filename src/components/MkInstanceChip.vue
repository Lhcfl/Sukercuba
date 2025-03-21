<template>
  <VChip 
    :prepend-avatar="iconUrl"
    :elevation="3"
    :class="$style.main"
    :style="{ backgroundColor: color }"
    size="x-small"  
  >
    <span :class="$style.name">
      {{ name }}
    </span>
  </VChip>
</template>
<script setup lang="ts">
import { useAccount } from "@/stores/account";
import type { NoteWithExtension } from "@/stores/note-cache";

const props = defineProps<{
  instance?: NoteWithExtension["user"]["instance"];
}>();

const account = useAccount();

const iconUrl = computed(() => props.instance?.iconUrl ?? account.meta?.iconUrl ?? account.site + "/favicon.ico")
const color = computed(() => props.instance?.themeColor ?? account.meta?.themeColor ?? undefined)
const name = computed(() => props.instance?.name ?? account.meta?.name ?? "")
</script>

<style lang="scss" module>
.main {
  max-width: 150px;
  text-overflow: ellipsis;

  .name {
    text-shadow: /* .866 ≈ sin(60deg) */
		1px 0 1px rgb(var(--v-theme-background)),
		.866px .5px 1px rgb(var(--v-theme-background)),
		.5px .866px 1px rgb(var(--v-theme-background)),
		0 1px 1px rgb(var(--v-theme-background)),
		-.5px .866px 1px rgb(var(--v-theme-background)),
		-.866px .5px 1px rgb(var(--v-theme-background)),
		-1px 0 1px rgb(var(--v-theme-background)),
		-.866px -.5px 1px rgb(var(--v-theme-background)),
		-.5px -.866px 1px rgb(var(--v-theme-background)),
		0 -1px 1px rgb(var(--v-theme-background)),
		.5px -.866px 1px rgb(var(--v-theme-background)),
		.866px -.5px 1px rgb(var(--v-theme-background));
  }
}
</style>