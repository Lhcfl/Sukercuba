<template>
  <MkUrl
    :url
    class="text-secondary"
  >
    #{{ tag }}
  </MkUrl>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    tag: string;
    kind: "user" | "note";
    noNavigate?: boolean;
  }>(),
  {
    kind: "user",
    noNavigate: false,
  },
);

const router = useRouter();

const url = computed(() =>
  props.kind === "note"
    ? router.resolve({ name: "/tags/[tag]", params: { tag: props.tag } }).href
    : "",
);
</script>
