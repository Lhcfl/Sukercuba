import type { EmojiSimple } from "misskey-js/entities.js";
import { IDBRefStore } from "./idb-ref-store";
import { UserStore } from "./store";

export function createUserStore(token: string) {
  return new IDBRefStore<{
    recentlyUsedEmojis: EmojiSimple[];
  }>(new UserStore(token));
}
