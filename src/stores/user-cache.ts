import type { User, UserDetailed } from "misskey-js/entities.js";
import { defineStore } from "pinia";
import type { Ref } from "vue";
import { useAccount } from "./account";
import { acct } from "misskey-js";

type CacheUserDetailed = {
  detailed: true;
  data: UserDetailed;
  cachedAt: Date;
};
type CacheUserLight = {
  detailed: false;
  data: User;
  cachedAt: Date;
};

type CacheUserType = CacheUserDetailed | CacheUserLight;
const CACHE_DURATION = 1000 * 60 * 60;

type UserQuery =
  | { id: string }
  | { username: string; host: string | null };

export const useUserCache = defineStore("user-cache", () => {
  const userCache = new Map<string, Ref<CacheUserType | undefined>>();
  const account = useAccount();

  function getCacheByQuery(query: UserQuery): Ref<CacheUserType | undefined> {
    const key = "id" in query ? query.id : acct.toString(query);
    const r = userCache.has(key);
    if (!r) userCache.set(key, ref());
    return userCache.get(key)!
  }

  function getCache(
    query: UserQuery,
    detailed: true
  ): Ref<CacheUserDetailed | undefined>;
  function getCache(
    query: UserQuery,
    detailed: false
  ): Ref<CacheUserLight | undefined>;
  function getCache(
    query: UserQuery,
    detailed: boolean = false
  ): Ref<CacheUserType | undefined> {
    const cached = getCacheByQuery(query);
    const now = new Date();
    if (
      cached.value == null ||
      (detailed && !cached.value.detailed) ||
      (now.getTime() - cached.value.cachedAt.getTime() > CACHE_DURATION)
    ) {
      account.api
        .request("users/show", "id" in query ? { userId: query.id } : query as { username: string; host: string | null })
        .then((data) => {
          cached.value = {
            detailed: true,
            data,
            cachedAt: now,
          }
        });
    }
    return cached;
  }

  function cache(user: UserDetailed, fully: true): Ref<CacheUserType>;
  function cache(user: User, fully: false): Ref<CacheUserType>;
  function cache(user: User, fully: boolean): Ref<CacheUserType> {
    const cached = getCacheByQuery(user);
    const now = new Date();
    if (fully) {
      cached.value = {
        detailed: true,
        data: user as UserDetailed,
        cachedAt: now,
      }
    } else {
      cached.value ??= {
        detailed: false,
        data: user,
        cachedAt: now,
      };
      cached.value.cachedAt = now;
      cached.value.data = {
        ...cached.value.data,
        ...user,
      };
    }
    return cached as Ref<CacheUserType>;
  }

  return {
    cache,
    getCache,
  };
});
