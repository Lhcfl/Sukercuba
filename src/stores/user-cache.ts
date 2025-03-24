import type { User, UserDetailed } from "misskey-js/entities.js";
import { defineStore } from "pinia";
import type { Ref } from "vue";
import { useAccount } from "./account";
import { acct } from "misskey-js";
import { isAPIError, type APIError } from "misskey-js/api.js";
import { usePopupMessage } from "./popup-message";
import { getI18n } from "@/plugins/i18n";

type CachedUserDetailed = {
  error: false;
  apiError?: APIError;
  detailed: true;
  data: UserDetailed;
  cachedAt: Date;
};
type CachedUserLight = {
  error: false;
  apiError?: APIError;
  detailed: false;
  data: User;
  cachedAt: Date;
};
type CachedUserError = {
  error: true;
  apiError?: APIError;
  detailed: undefined;
  data: undefined;
  cachedAt: Date;
};

type CachedUserType = CachedUserDetailed | CachedUserLight | CachedUserError;
const CACHE_DURATION = 1000 * 60 * 60;

type isUserDetailed<T extends User> = T extends UserDetailed ? true : false;

type UserQuery = { id: string } | { username: string; host: string | null };

function debugLog(...args: unknown[]) {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
}

export const useUserCache = defineStore("user-cache", () => {
  const userCache = new Map<string, Ref<CachedUserType | undefined>>();
  const isFetching = new Map<string, boolean>();

  const account = useAccount();

  if (account.me) {
    // for user me, always set yourself.
    const me = computed({
      get: () =>
        ({
          error: false,
          detailed: true,
          data: account.me,
          cachedAt: new Date(),
        } as CachedUserDetailed),
      set: (u) => {
        debugLog("Warning: don't set user me.", u);
        // do nothing
      },
    })
    userCache.set(account.me.id, me);
    userCache.set(acct.toString(account.me), me);
  }

  function getCacheKey(query: UserQuery) {
    return "id" in query ? query.id : acct.toString(query);
  }

  function getCacheByQuery(query: UserQuery): Ref<CachedUserType | undefined> {
    const key = getCacheKey(query);
    const r = userCache.has(key);
    if (!r) userCache.set(key, ref());
    return userCache.get(key)!;
  }

  function getCache(
    query: UserQuery,
    params: {
      detailed?: boolean;
      /** 无论如何都 fetch */
      fetch?: boolean;
    } = {}
  ): Ref<CachedUserType | undefined> {
    const cached = getCacheByQuery(query);
    nextTick(() =>
      fetchUser(
        query,
        cached.value == null ||
          params.fetch ||
          (!cached.value?.detailed && params.detailed)
      )
    );
    return cached;
  }

  async function fetchUser(query: UserQuery, force?: boolean) {
    const cached = getCacheByQuery(query);
    const now = new Date();

    const key = getCacheKey(query);
    if (isFetching.get(key)) {
      return;
    }

    if (
      force ||
      cached.value == null ||
      cached.value.error ||
      now.getTime() - cached.value.cachedAt.getTime() > CACHE_DURATION
    ) {
      try {
        debugLog("fetcing the user", query);
        isFetching.set(key, true);
        const data = await account.api.request(
          "users/show",
          "id" in query
            ? { userId: query.id }
            : (query as { username: string; host: string | null })
        );

        cached.value = {
          error: false,
          detailed: true,
          data,
          cachedAt: now,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        cached.value = {
          error: true,
          apiError: isAPIError(err) ? err : undefined,
          detailed: undefined,
          data: undefined,
          cachedAt: now,
        };
      } finally {
        isFetching.delete(key);
      }
    }
  }

  function isDetailed(user: User): user is UserDetailed {
    return (user as UserDetailed).fields != null;
  }

  function updateUser(ref: Ref<CachedUserType>, user: User) {
    ref.value.data ??= user;
    for (const k of Object.keys(user)) {
      (ref.value.data as Record<string, unknown>)[k] = (
        user as Record<string, unknown>
      )[k];
    }
  }

  function patchUser(id: string, user: Partial<User>) {
    const ref = userCache.get(id);
    if (ref?.value?.data == null) return;
    for (const k of Object.keys(user)) {
      (ref.value.data as Record<string, unknown>)[k] = (
        user as Record<string, unknown>
      )[k];
    }
  }

  function cache<U extends User, Updateable extends isUserDetailed<U>>(
    user: U,
    params: {
      /** patch the user */
      update?: Updateable;
      /** get a detailed user if is a lite user */
      detailed?: boolean;
    } = {}
  ): Ref<U extends UserDetailed ? CachedUserDetailed : CachedUserType> {
    const cached = getCacheByQuery(user);
    const now = new Date();

    debugLog("cache the user", user);

    if (!isDetailed(user) && !cached.value?.detailed && params.detailed) {
      fetchUser(user, true);
    }
    if (params.update) {
      cached.value = {
        error: false,
        detailed: true,
        data: user as UserDetailed,
        cachedAt: now,
      };
    } else {
      if (cached.value == null) {
        cached.value = {
          error: false,
          detailed: isDetailed(user),
          data: user,
          cachedAt: now,
        } as CachedUserType;
      } else {
        cached.value.cachedAt = now;
        updateUser(cached as Ref<CachedUserType>, user);
      }
    }

    return cached as never;
  }

  return {
    cache,
    getCache,
    patchUser,
  };
});

export class UserApi {
  account: ReturnType<typeof useAccount>;
  userCache: ReturnType<typeof useUserCache>;
  user: User;

  constructor(user: User) {
    this.account = useAccount();
    this.userCache = useUserCache();
    this.user = user;
  }

  handleRequestError(err: unknown) {
    console.error(err);
    usePopupMessage().push({
      type: "error",
      message: (err as { message: string }).message,
    });
  }

  async follow(ing: Ref<boolean>) {
    ing.value = true;
    try {
      await this.account.api.request("following/create", {
        userId: this.user.id,
      });
      this.userCache.getCache(this.user, { fetch: true });
    } catch (err) {
      this.handleRequestError(err);
    } finally {
      ing.value = false;
    }
  }
  
  async accept(ing: Ref<boolean>) {
    ing.value = true;
    try {
      await this.account.api.request("following/requests/accept", {
        userId: this.user.id,
      });
      this.userCache.patchUser(this.user.id, { isFollowed: true, hasPendingFollowRequestToYou: false });
    } catch (err) {
      this.handleRequestError(err)
    } finally {
      ing.value = false;
    }
  }
  async reject(ing: Ref<boolean>) {
    ing.value = true;
    try {
      await this.account.api.request("following/requests/reject", {
        userId: this.user.id,
      });
      this.userCache.patchUser(this.user.id, { hasPendingFollowRequestToYou: false });
    } catch (err) {
      this.handleRequestError(err);
    } finally {
      ing.value = false;
    }
  }
  async cancelFollowRequest(ing: Ref<boolean>) {
    ing.value = true;
    try {
      await this.account.api.request("following/requests/cancel", {
        userId: this.user.id,
      });
      this.userCache.patchUser(this.user.id, { hasPendingFollowRequestFromYou: false });
    } catch (err) {
      this.handleRequestError(err);
    } finally {
      ing.value = false;
    }
  }
  async unfollow(ing: Ref<boolean>) {
    const i18n = getI18n().global;
    const { ok } = await usePopupMessage().push({ type: 'info', message: i18n.t('unfollowConfirm', { name: this.user.name ?? this.user.username }) });
    if (!ok) {
      return;
    }
    ing.value = true;
    try {
      await this.account.api.request("following/delete", {
        userId: this.user.id,
      });
      this.userCache.patchUser(this.user.id, { isFollowing: false });
    } catch (err) {
      this.handleRequestError(err);
    } finally {
      ing.value = false;
    }
  }
  async unblock(ing: Ref<boolean>) {
    ing.value = true;
    try {
      await this.account.api.request("blocking/delete", {
        userId: this.user.id,
      });
      this.userCache.patchUser(this.user.id, { isBlocking: false });
    } catch (err) {
      this.handleRequestError(err);
    } finally {
      ing.value = false;
    }
  }

  async breakFollow(ing: Ref<boolean>) {
    ing.value = true;
    try {
      await this.account.api.request("following/invalidate", {
        userId: this.user.id,
      });
      this.userCache.patchUser(this.user.id, { isFollowed: false });
    } catch (err) {
      this.handleRequestError(err);
    } finally {
      ing.value = false;
    }
  }
}