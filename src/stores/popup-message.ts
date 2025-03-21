import { defineStore } from "pinia";
import type { VNode } from "vue";

type PopupMessage = {
  type: "error" | "warn" | "info" | "success",
  message?: string,
  vnodes?: VNode[],
  mfm?: string,
  callback?: () => void;
}

export const usePopupMessage = defineStore("popupMessages", () => {
  const messages = ref<(PopupMessage & { resolved?: boolean })[]>([]);
  
  function push(m: PopupMessage) {
    messages.value.push(m);
    return new Promise<void>((r) => {
      const old_cb = m.callback;
      m.callback = () => {
        old_cb?.();
        r();
      }
    });
  }

  return {
    messages,
    push,
  }
});