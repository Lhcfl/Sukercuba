import { defineStore } from "pinia";
import * as Misskey from "misskey-js";
import { useAccount } from "./account";

// fetch emojis every hour
const FETCH_DURATION = 1000 * 60 * 60;

const KEY_EMOJI_LAST_FETCHED_AT = "emojiLastFetch";
const KEY_EMOJIS = "emojis";

export const useCustomEmojisData = defineStore("emojis", () => {
  const emojis = shallowRef<Misskey.entities.EmojiSimple[]>([]);

  const emojiMap = computed(
    () => new Map(emojis.value.map((e) => [e.name, e]))
  );

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
    emojis.value = res.emojis;
    await account.siteStore.setMany([
      [KEY_EMOJI_LAST_FETCHED_AT, now],
      [KEY_EMOJIS, emojis.value],
    ]);
  }

  return {
    emojis,
    emojiMap,
    init,
    update,
  };
});
