<template>
  <canvas ref="canvasRef" class="object-cover" :width :height draggable="false" tabindex="-1"
    style="-webkit-user-drag: none;" />
</template>

<script setup lang="ts">
import drawBlurHash from "@/workers/draw-blurhash?worker";

const props = defineProps<{
  id: string;
  width?: number | null;
  height?: number | null;
  blurhash: string | null;
}>();

const canvasRef = useTemplateRef("canvasRef");
const worker = new drawBlurHash();

const ratio = computed(() => props.width != null && props.height != null ? props.width / props.height : 1);
const width = computed(() => ratio.value > 1 ? Math.round(64 * ratio.value) : 64);
const height = computed(() => ratio.value > 1 ? 64 : Math.round(64 / ratio.value));

watch(() => props.id, generateBitMap);
onMounted(generateBitMap);

function generateBitMap() {
  if (!canvasRef.value) return;
  worker.postMessage({
    id: props.id,
    hash: props.blurhash,
  });
}

worker.addEventListener("message", (ev) => {
  const bitmap = ev.data.bitmap;
  drawImage(bitmap);
});

function drawImage(bitmap: CanvasImageSource) {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(bitmap, 0, 0, width.value, height.value);
}
</script>
