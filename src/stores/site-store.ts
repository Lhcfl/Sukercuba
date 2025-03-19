import type { EmojiSimple } from "misskey-js/entities.js";
import { IDBRefStore } from "./idb-ref-store";
import { SiteStore } from "./store";

export function createSiteStore(site: string) {
  return new IDBRefStore<{
    emojis: EmojiSimple[];
    emojiLastFetch: number;
  }>(new SiteStore(site));
}