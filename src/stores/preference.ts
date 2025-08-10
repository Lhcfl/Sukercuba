import { defineStore } from "pinia";

export const usePreferences = defineStore("preferences", () => {
  const noteGap = ref(5);

  return {
    noteGap,
  };
});
