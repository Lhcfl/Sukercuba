import type { User, UserDetailed, UserLite } from "misskey-js/entities.js";
import { defineStore } from "pinia";
import type { ComputedRef, Ref } from "vue";
import { getI18n } from "@/plugins/i18n";

type UserSingletonCache = (
  | {
    detailed: true;
    user: Ref<UserDetailed | null>;
  }
  | {
    detailed: false;
    user: Ref<UserLite | null>;
  }
) & {
  loading: Ref<boolean>;
  error: Ref<unknown>;
  cachedAt: number | null;
};

type UserSingletonReturn = UserSingletonCache & {
  controller: ComputedRef<null | UserController>;
};

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const useUserSingleton = defineStore("user-singleton", () => {
  const userCache = new Map<string, UserSingletonCache>();
  const username2id = new Map<string, string>(); // username@host -> id
  const account = useAccount();

  if (account.me != null) {
    userCache.set(account.me.id, {
      detailed: true,
      user: computed({
        get: () => account.me ?? null,
        set: () => {
          console.warn("DO NOT SET ME IN USER CACHE");
        },
      }),
      loading: ref(false),
      cachedAt: Date.now(),
      error: ref(null),
    });
    createUsername2IdMapping(account.me);
  }

  function getCacheKey(
    props: { id: string } | { username: string; host: string | null },
  ): [boolean, string] {
    if ("id" in props) return [true, props.id];
    const cached = username2id.get(`${props.username}@${props.host}`);
    if (cached) return [true, cached];
    return [false, `${props.username}@${props.host}`];
  }

  function createUsername2IdMapping(user: UserLite) {
    username2id.set(`${user.username}@${user.host}`, user.id);
  }

  function isMe(
    props: { id: string } | { username: string; host: string | null },
  ) {
    return "id" in props
      ? props.id === account.me?.id
      : props.username === account.me?.username &&
      props.host === account.me.host;
  }

  function forceFetchUser(
    props: { id: string } | { username: string; host: string | null },
  ) {
    const [resolved, key] = getCacheKey(props);
    let entry = userCache.get(key);

    if (entry) {
      // Don't fetch twice
      if (entry.loading.value) return entry;

      entry.loading.value = true;
      entry.error.value = null;
      entry.user.value = null;
      entry.cachedAt = null;
    } else {
      entry = {
        detailed: true,
        loading: ref(true),
        error: ref(null),
        user: ref(null),
        cachedAt: null,
      };
      userCache.set(key, entry);
    }

    const promise = isMe(props)
      ? account.api.request("i", {}).then((user) => {
        entry.error.value = null;
        account.me = user;
        createUsername2IdMapping(user);
        if (!resolved) {
          userCache.set(user.id, entry);
          userCache.delete(key);
        }
      })
      : account.api
        .request(
          "users/show",
          "id" in props
            ? {
              userId: props.id,
            }
            : props,
        )
        .then((user) => {
          entry.error.value = null;
          entry.user.value = user;
          createUsername2IdMapping(user);
          if (!resolved) {
            userCache.set(user.id, entry);
            userCache.delete(key);
          }
        });

    promise
      .catch((err) => {
        entry.error.value = err;
        entry.user.value = null;
      })
      .finally(() => {
        entry.loading.value = false;
        entry.cachedAt = Date.now();
      });

    return entry;
  }

  function isInvalidated(entry: UserSingletonCache) {
    if (entry.cachedAt == null) return true;
    return Date.now() - entry.cachedAt > CACHE_DURATION;
  }

  function useUserQuery(
    props: ({ id: string } | { username: string; host: string | null }) & {
      detailed?: boolean;
      force?: boolean;
    },
  ): UserSingletonReturn {
    const [_, key] = getCacheKey(props);
    let entry = userCache.get(key);

    if (!entry || isInvalidated(entry)) {
      entry = forceFetchUser(props);
    }

    if (props.force || (props.detailed && !entry.detailed)) {
      entry = forceFetchUser(props);
    }

    return {
      ...entry,
      controller: computed(
        () => entry.user.value && new UserController(entry.user.value),
      ),
    };
  }

  function isDetailed(user: User): user is UserDetailed {
    return (user as UserDetailed).fields != null;
  }

  function cache(user: User | UserLite | UserDetailed) {
    if (isMe(user)) return;
    const detailed = isDetailed(user);
    createUsername2IdMapping(user);
    if (detailed) {
      let entry = userCache.get(user.id);
      if (!entry) {
        entry = {
          detailed: true,
          loading: ref(false),
          error: ref(null),
          user: ref(user),
          cachedAt: Date.now(),
        };
        userCache.set(user.id, entry);
      } else {
        entry.user.value = user;
        entry.detailed = true;
        entry.error.value = null;
        entry.loading.value = false;
        entry.cachedAt = Date.now();
      }
    } else {
      let entry = userCache.get(user.id);
      if (!entry) {
        entry = {
          detailed: false,
          loading: ref(false),
          error: ref(null),
          user: ref(user),
          cachedAt: Date.now(),
        };
        userCache.set(user.id, entry);
      } else {
        // patch the existing user
        entry.user.value = {
          ...(entry.user.value || {}),
          ...user,
        };
        // don't update other fields for non-detailed users
      }
    }
  }

  function updateUser(userId: string, patch: Partial<UserDetailed>) {
    const entry = userCache.get(userId);
    if (!entry || entry.user.value == null) {
      console.warn("Attempt to update user that is not cached:", userId);
      return;
    }
    entry.user.value = { ...entry.user.value, ...patch };
  }

  return {
    forceFetchUser,
    useUserQuery,
    cache,
    updateUser,
  };
});

export function useUserQuery<D extends boolean>(
  props: ({ id: string } | { username: string; host: string | null }) & {
    detailed?: D;
    force?: boolean;
  },
): UserSingletonReturn &
  (D extends true
    ? { user: Ref<UserDetailed | null> }
    : { user: Ref<UserLite | null> }) {
  const userSingleton = useUserSingleton();
  return userSingleton.useUserQuery(props);
}

export class UserController {
  account: ReturnType<typeof useAccount>;
  userSingleton: ReturnType<typeof useUserSingleton>;
  user: User;

  constructor(user: User) {
    this.account = useAccount();
    this.userSingleton = useUserSingleton();
    this.user = user;
  }

  handleRequestError(err: unknown) {
    console.error(err);
    usePopupMessage().push({
      type: "error",
      message: errorToString(err),
    });
  }

  /**
   * Magic function to wrap all methods to set ing state
   * @param ing
   * @returns
   */
  with(ing: Ref<boolean>) {
    return new Proxy(this, {
      get: (target, prop) => {
        if (typeof target[prop as keyof UserController] === "function") {
          return (...args: unknown[]) => {
            return target.withState(ing, () => {
              // @ts-expect-error: we checked it's a function
              return target[prop](...args);
            });
          };
        }
      }
    });
  }

  private async withState<T>(ing: Ref<boolean>, fn: () => Promise<T>) {
    ing.value = true;
    try {
      return await fn();
    } catch (err) {
      this.handleRequestError(err);
    } finally {
      ing.value = false;
    }
  }

  async follow() {
    await this.account.api.request("following/create", {
      userId: this.user.id,
    });
    this.userSingleton.forceFetchUser(this.user);
  }

  async accept() {
    await this.account.api.request("following/requests/accept", {
      userId: this.user.id,
    });
    this.userSingleton.updateUser(this.user.id, {
      isFollowed: true,
      hasPendingFollowRequestToYou: false,
    });
  }

  async reject() {
    await this.account.api.request("following/requests/reject", {
      userId: this.user.id,
    });
    this.userSingleton.updateUser(this.user.id, {
      hasPendingFollowRequestToYou: false,
    });
  }

  async cancelFollowRequest() {
    await this.account.api.request("following/requests/cancel", {
      userId: this.user.id,
    });
    this.userSingleton.updateUser(this.user.id, {
      hasPendingFollowRequestFromYou: false,
    });
  }

  async unfollow() {
    const i18n = getI18n().global;
    const { ok } = await usePopupMessage().push({
      type: "info",
      message: i18n.t("unfollowConfirm", {
        name: this.user.name ?? this.user.username,
      }),
    });
    if (!ok) {
      return;
    }
    await this.account.api.request("following/delete", {
      userId: this.user.id,
    });
    this.userSingleton.updateUser(this.user.id, { isFollowing: false });
  }

  async unblock() {
    await this.account.api.request("blocking/delete", {
      userId: this.user.id,
    });
    this.userSingleton.updateUser(this.user.id, { isBlocking: false });
  }

  async block() {
    const i18n = getI18n().global;
    const { ok } = await usePopupMessage().push({
      type: "info",
      message: i18n.t("blockConfirm", {
        name: this.user.name ?? this.user.username,
      }),
    });
    if (ok) {
      await this.account.api.request("blocking/create", {
        userId: this.user.id,
      });
      this.userSingleton.updateUser(this.user.id, { isBlocking: true });
    }
  }

  async breakFollow() {
    await this.account.api.request("following/invalidate", {
      userId: this.user.id,
    });
    this.userSingleton.updateUser(this.user.id, { isFollowed: false });
  }

  async mute(expiresAt: number | null) {
    await this.account.api.request("mute/create", {
      userId: this.user.id,
      expiresAt,
    });
    this.userSingleton.updateUser(this.user.id, { isMuted: true });
  }

  async unmute() {
    await this.account.api.request("mute/delete", {
      userId: this.user.id,
    });
    this.userSingleton.updateUser(this.user.id, { isMuted: false });
  }
}
