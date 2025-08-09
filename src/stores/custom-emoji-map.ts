import Fuse from "fuse.js";
import type { EmojiSimple } from "misskey-js/entities.js";
import { defineStore } from "pinia";
import { useAccount } from "./account";

// fetch emojis every hour
const FETCH_DURATION = 1000 * 60 * 60;

export const useCustomEmojisData = defineStore("emojis", () => {
  const account = useAccount();

  const emojis = account.siteStore.getRef("emojis");

  const emojiFuse = computed(
    () =>
      new Fuse(emojis.value ?? [], {
        keys: ["name", "aliases"],
        threshold: 0.1,
        includeScore: true,
      }),
  );

  const emojiMap = computed(
    () => new Map((emojis.value ?? []).map((e) => [e.name, e])),
  );

  const emojiCategories = computed(() => {
    const ret = new Map<string | null, EmojiSimple[]>();
    for (const e of emojis.value ?? []) {
      const arr = ret.get(e.category || null);
      if (arr != null) {
        arr.push(e);
      } else {
        ret.set(e.category || null, [e]);
      }
    }
    return ret;
  });

  async function init() {
    const account = useAccount();
    const now = Date.now();
    await account.siteStore.init();
    const lastFetchedAt = account.siteStore.reactive.emojiLastFetch;
    if (!lastFetchedAt || now - lastFetchedAt > FETCH_DURATION) {
      update();
    }
  }

  async function update() {
    const account = useAccount();
    const now = Date.now();
    const res = await account.api.request("emojis", {});
    emojis.value = res.emojis.sort((a, b) => {
      return a.name < b.name ? -1 : 1;
    });
    account.siteStore.reactive.emojiLastFetch = now;
  }

  return {
    emojis,
    emojiMap,
    emojiCategories,
    emojiFuse,
    init,
    update,
  };
});
