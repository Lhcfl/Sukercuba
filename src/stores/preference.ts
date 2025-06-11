import { defineStore } from "pinia";

export const usePreferences = defineStore('preferences', () => {
  const noteGap = ref(0);

  return {
    noteGap,
  }
});