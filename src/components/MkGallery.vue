<template>
  <div class="mk-gallery-container relative" @click.stop>
    <div :class="`mk-gallery grid gap-2 w-full ${imageClass}`" ref="gallery" :style="{ aspectRatio }">
      <MkImage class="mk-gallery-item cursor-pointer" :img="img" v-for="img in shownImages" :key="img.id" v-ripple />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DriveFile } from "misskey-js/entities.js";
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

const props = defineProps<{
  images: DriveFile[];
  expanded?: boolean;
}>();

const gallery = useTemplateRef("gallery");

const images = computed(() =>
  props.images
    .filter((i) => i.type.startsWith("image"))
    .map((i) => ({
      ...i,
      ...i.properties,
    })),
);

const aspectRatio = computed(() => {
  if (props.expanded) return undefined;
  if (images.value.length === 1) {
    const img = images.value[0];
    if (!img.properties.width || !img.properties.height) return undefined;
    const ratio = img.properties.width / img.properties.height;
    if (ratio <= 16 / 9) return "16 / 9";
    return `${img.properties.width} / ${img.properties.height}`;
  }
  return "16 / 9";
});

const shownImages = computed(() => (props.expanded ? images.value : images.value.slice(0, 4)));
const imageClass = computed(() => images.value.length >= 4 ? "files-auto" : `files-${images.value.length}`);

onMounted(() => {
  const popstateHandler = (): void => {
    if (lightbox?.pswp && lightbox.pswp.isOpen === true) {
      lightbox.pswp.close();
    }
  };

  const lightbox = new PhotoSwipeLightbox({
    gallery: gallery.value!,
    dataSource: images.value.map(img => ({
      src: img.url,
      w: img.properties.width,
      h: img.properties.height,
      alt: img.comment ?? img.name,
    })),
    children: ".mk-gallery-item",
    loop: false,
    imageClickAction: 'close',
    tapAction: "close",
    showHideAnimationType: 'fade',
    pswpModule: PhotoSwipe,
  });

  lightbox.on('uiRegister', () => {
    lightbox.pswp?.ui?.registerElement({
      name: 'altText',
      className: 'absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-sm max-w-[80%] rounded-lg bg-primary/30 text-on-primary backdrop-blur-lg px-4 py-2',
      appendTo: 'wrapper',
      onInit: (el, pswp) => {
        const textBox = window.document.createElement('p');
        textBox.className = "max-h-20 overflow-y-auto";
        el.appendChild(textBox);

        pswp.on('change', () => {
          console.log(pswp.currSlide);
          if (pswp.currSlide?.data.alt) {
            textBox.style.display = '';
          } else {
            textBox.style.display = 'none';
          }
          textBox.textContent = pswp.currSlide?.data.alt || "";
        });

        // `passive: true` is for Safari compatibility, apparently
        const stopEvent = (name: string) => textBox.addEventListener(name, event => event.stopPropagation(), { passive: true });
        stopEvent('wheel');
        stopEvent('pointerdown');
        stopEvent('pointercancel');
      },
    });
  });

  lightbox.on('afterInit', () => {
    window.history.pushState(null, '', '#pswp');
  });

  lightbox.on('destroy', () => {
    if (window.location.hash === '#pswp') {
      window.history.back();
    }
  });

  window.addEventListener('popstate', popstateHandler);
  lightbox.init();

  onUnmounted(() => {
    window.removeEventListener('popstate', popstateHandler);
    lightbox.destroy();
  })
})
</script>

<style lang="scss">
.mk-gallery {
  &.files-1 {
    grid-template-columns: 1fr;
  }

  &.files-2 {
    grid-template-columns: 1fr 1fr;
  }

  &.files-3 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;

    &> :nth-child(1) {
      grid-row: 1 / span 2;
    }

    &> :nth-child(2),
    &> :nth-child(3) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  // starting from 4 images, use grid auto-fit
  &.files-auto {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
