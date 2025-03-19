import type { User, UserDetailed } from "misskey-js/entities.js";
import { defineStore } from "pinia";
import type { Ref } from "vue";
import { useAccount } from "./account";
import { acct } from "misskey-js";
import { isAPIError, type APIError } from "misskey-js/api.js";

type CacheUserDetailed = {
  error: false,
  apiError?: APIError,
  detailed: true;
  data: UserDetailed;
  cachedAt: Date;
};
type CacheUserLight = {
  error: false,
  apiError?: APIError,
  detailed: false;
  data: User;
  cachedAt: Date;
};
type CachedUserError = {
  error: true,
  apiError?: APIError,
  detailed: undefined,
  data: undefined,
  cachedAt: Date;
}

type CacheUserType = CacheUserDetailed | CacheUserLight | CachedUserError;
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
    detailed?: true,
    forceUpdate?: true,
  ): Ref<CacheUserDetailed | undefined>;
  function getCache(
    query: UserQuery,
    detailed?: false
  ): Ref<CacheUserLight | undefined>;
  function getCache(
    query: UserQuery,
    detailed: boolean = false,
    forceUpdate: boolean = false,
  ): Ref<CacheUserType | undefined> {
    const cached = getCacheByQuery(query);
    const now = new Date();
    if (
      forceUpdate ||
      cached.value == null ||
      cached.value.error ||
      (detailed && !cached.value.detailed) ||
      (now.getTime() - cached.value.cachedAt.getTime() > CACHE_DURATION)
    ) {
      account.api
        .request("users/show", "id" in query ? { userId: query.id } : query as { username: string; host: string | null })
        .then((data) => {
          cached.value = {
            error: false,
            detailed: true,
            data,
            cachedAt: now,
          }
        }).catch((err) => {
          cached.value = {
            error: true,
            apiError: isAPIError(err) ? err : undefined,
            detailed: undefined,
            data: undefined,
            cachedAt: now,
          }
        });
    }
    return cached;
  }

  function cache(user: UserDetailed, fully?: true): Ref<CacheUserType>;
  function cache(user: User, fully?: false): Ref<CacheUserType>;
  function cache(user: User, fully: boolean = false): Ref<CacheUserType> {
    const cached = getCacheByQuery(user);
    const now = new Date();
    if (fully) {
      cached.value = {
        error: false,
        detailed: true,
        data: user as UserDetailed,
        cachedAt: now,
      }
    } else {
      cached.value ??= {
        error: false,
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
