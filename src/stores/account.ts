import * as Misskey from "misskey-js";
import type { MeDetailed, MetaLite } from "misskey-js/entities.js";
import { defineStore } from "pinia";
import { createSiteStore } from "./site-store";
import { createUserStore } from "./user-store";

export const useAccount = defineStore(
  "account",
  () => {
    const me = ref<MeDetailed>();
    const meta = ref<MetaLite>();

    async function init() {
      api.value.request("i", {}).then((v) => (me.value = v));
      api.value.request("meta", { detail: true }).then((v) => (meta.value = v));
    }

    const token = ref("");
    const site = ref("");

    const accountStore = computed(() => createUserStore(token.value));
    const siteStore = computed(() => createSiteStore(site.value));

    const api = computed(
      () =>
        new Misskey.api.APIClient({
          origin: site.value,
          credential: token.value,
        }),
    );

    const streamApi = computed(
      () => new Misskey.Stream(site.value, { token: token.value }),
    );

    // Implements Misskey.api.ApiClient.request
    function misskeyApiGet<
      ResT = void,
      E extends keyof Misskey.Endpoints = keyof Misskey.Endpoints,
      P extends Misskey.Endpoints[E]["req"] = Misskey.Endpoints[E]["req"],
      _ResT = ResT extends void
      ? Misskey.api.SwitchCaseResponseType<E, P>
      : ResT,
    >(
      endpoint: E,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: P = {} as any,
    ): Promise<_ResT> {
      const query = new URLSearchParams(data as never);

      const promise = new Promise<_ResT>((resolve, reject) => {
        // Send request
        window
          .fetch(`${site.value}/api/${endpoint}?${query}`, {
            method: "GET",
            credentials: "omit",
            cache: "default",
          })
          .then(async (res) => {
            const body = res.status === 204 ? null : await res.json();

            if (res.status === 200) {
              resolve(body);
            } else if (res.status === 204) {
              resolve(undefined as _ResT); // void -> undefined
            } else {
              reject(body.error);
            }
          })
          .catch(reject);
      });

      return promise;
    }

    return {
      init,
      me,
      meta,
      token,
      site,
      siteStore,
      api,
      streamApi,
      accountStore,
      apiGet: misskeyApiGet,
    };
  },
  {
    persist: true,
  },
);

if (import.meta.env.DEV) {
  Object.assign(window, { useAccount });
}
