import { defineStore } from "pinia";

export function useDraft(opts: {
  id?: string,
  replyId?: string,
  quoteId?: string,
  editId?: string,
} = {}) {
  let storeId = "draft:";
  if (opts.editId) {
    storeId += `edit:${opts.editId}:`;
  }
  else if (opts.replyId) {
    storeId += `reply:${opts.replyId}:`;
  }
  else if (opts.quoteId) {
    storeId += `quote:${opts.quoteId}:`;
  }
  else {
    storeId += `create::`
  }

  if (opts.id) {
    storeId += `${opts.id}`;
  } else {
    storeId += `default`;
  }

  return defineStore(storeId, () => {
    const showCw = ref(false);
    const showTags = ref(false);
    const showPreview = ref(false);

    const text = ref("");
    const cw = ref("");
    const appendTags = ref<string[]>([]);

    const computedCw = computed(() => showCw.value ? cw.value : undefined);
    const computedTags = computed(() => showTags.value ? appendTags.value : []);
    const computedText = computed(() => {
      let ret = text.value;
      if (computedTags.value.length > 0) {
        if (ret.at(-1) === '\n') {
          ret += "\n";
        } else {
          ret += " ";
        }
        ret += computedTags.value.map(x=>`#${x}`).join(" ");
      }
      return ret;
    })

    return {
      showCw,
      showTags,
      showPreview,
      text,
      cw,
      appendTags,
      computedCw,
      computedTags,
      computedText,
    }
  }, {
    persist: true
  })();
}