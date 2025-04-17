import { defineStore } from "pinia";
type SnackMessage = {
  color?: string
  timeout?: number,
  text: string,
  multiLine?: boolean
}

/**
 * Queue a popup message dialog.
 * 
 * Warning: Modals are bad for user experience. It disables all other actions, 
 * thereby forcing users to interact with it.
 * 
 * Modals should only be used to alert the user to important events.
 */
export const useSnackbarQueue = defineStore("snackbar-queue", () => {
  const messages = ref<SnackMessage[]>([]);
  
  function push(m: SnackMessage) {
    messages.value.push(m);
  }

  return {
    messages,
    push,
  }
});

if (import.meta.env.DEV) {
  Object.assign(window, { useSnackbarQueue });
}