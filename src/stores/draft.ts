import { defineStore } from "pinia";
import type { NoteWithExtension } from "./note-cache";

export type DraftPoll = {
  choices: string[];
  multiple?: boolean;
  expiresAt?: number | null;
  expiredAfter?: number | null;
};

export function useDraft(opts: {
  id?: string,
  replyId?: string,
  quoteId?: string,
  edit?: NoteWithExtension,
} = {}) {
  let storeId = "draft:";
  if (opts.edit) {
    storeId += `edit:${opts.edit.id}:`;
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
    const text = ref(opts.edit?.text || '');
    const cw = ref(opts.edit?.cw || '');
    const appendTags = ref<string[]>([]);
    const visibility = ref<NoteWithExtension["visibility"]>("public");
    const localOnly = ref(false);
    const poll = ref<DraftPoll>({ choices: [], expiredAfter: 3 * 86400 * 1000 });

    const showCw = ref(!!cw.value);
    const showTags = ref(false);
    const showPreview = ref(false);
    const showPoll = ref(false);

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

    function remove() {
      localStorage.removeItem(storeId);
    }

    return {
      showCw,
      showTags,
      showPreview,
      showPoll,
      poll,
      text,
      cw,
      localOnly,
      visibility,
      appendTags,
      computedCw,
      computedTags,
      computedText,
      remove,
      storeId,
    }
  }, {
    persist: true
  })();
}