import { defineStore } from "pinia";
import * as Misskey from "misskey-js";
import { useAccount } from "./account";
import type { EmojiSimple } from "misskey-js/entities.js";
import Fuse from "fuse.js";

// fetch emojis every hour
const FETCH_DURATION = 1000 * 60 * 60;

const KEY_EMOJI_LAST_FETCHED_AT = "emojiLastFetch";
const KEY_EMOJIS = "emojis";

export const useCustomEmojisData = defineStore("emojis", () => {
  const emojis = shallowRef<Misskey.entities.EmojiSimple[]>([]);

  const emojiFuse = computed(() => new Fuse(emojis.value, {
    keys: ['name', 'aliases'],
    threshold: 0.1,
    includeScore: true,
  }));

  const emojiMap = computed(
    () => new Map(emojis.value.map((e) => [e.name, e]))
  );

  const emojiCategories = computed(() => {
    const ret = new Map<string | null, EmojiSimple[]>();
    for (const e of emojis.value) {
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

    const lastFetchedAt = await account.siteStore.get(
      KEY_EMOJI_LAST_FETCHED_AT
    );
    if (lastFetchedAt && now - lastFetchedAt < FETCH_DURATION) {
      emojis.value = await account.siteStore.get(KEY_EMOJIS);
      return;
    } else {
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
    await account.siteStore.setMany([
      [KEY_EMOJI_LAST_FETCHED_AT, now],
      [KEY_EMOJIS, emojis.value],
    ]);
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
