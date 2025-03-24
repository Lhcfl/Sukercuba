import { defineStore } from "pinia";
import type { VNode } from "vue";

type PopupMessage = ({
  okcancel?: false,
} | {
  okcancel: true,
}) & {
  type: "error" | "warn" | "info" | "success",
  message?: string,
  vnodes?: VNode[],
  mfm?: string,
  okText?: string,
  cancelText?: string,
}

type MsgReturn = { ok?: boolean };

type InfoAttachedPopupMessage = PopupMessage & {
  callback: (arg0: MsgReturn) => void,
  resolved?: boolean,
}

export const usePopupMessage = defineStore("popupMessages", () => {
  const messages = ref<InfoAttachedPopupMessage[]>([]);
  
  function push(m: PopupMessage) {
    const msg = m as InfoAttachedPopupMessage;
    messages.value.push(msg);
    return new Promise<MsgReturn>((r) => {
      msg.callback = r;
    });
  }

  return {
    messages,
    push,
  }
});

if (import.meta.env.DEV) {
  Object.assign(window, { usePopupMessage });
}