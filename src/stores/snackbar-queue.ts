import { defineStore } from "pinia";
type SnackMessage = {
  color?: string;
  timeout?: number;
  text: string;
  multiLine?: boolean;
};

/**
 * Global snackbar queue messages provider.
 *
 * @see https://vuetifyjs.com/en/components/snackbar-queue/#usage
 */
export const useSnackbarQueue = defineStore("snackbar-queue", () => {
  const messages = ref<SnackMessage[]>([]);

  function push(m: SnackMessage) {
    messages.value.push(m);
  }

  return {
    messages,
    push,
  };
});

if (import.meta.env.DEV) {
  Object.assign(window, { useSnackbarQueue });
}
