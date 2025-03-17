import { defineStore } from "pinia";
import * as Misskey from "misskey-js";
import { SiteStore } from "./site-store";
import type { MeDetailed } from "misskey-js/entities.js";

export const useAccount = defineStore(
  "account",
  () => {
    const me = ref<MeDetailed>();

    async function init() {
      me.value = await api.value.request("i", {});
    }

    const token = ref("");
    const site = ref("");

    const siteStore = computed(() => new SiteStore(site.value));

    const api = computed(
      () =>
        new Misskey.api.APIClient({
          origin: site.value,
          credential: token.value,
        })
    );

    const streamApi = computed(
      () => new Misskey.Stream(site.value, { token: token.value })
    );

    // Implements Misskey.api.ApiClient.request
    function misskeyApiGet<
      ResT = void,
      E extends keyof Misskey.Endpoints = keyof Misskey.Endpoints,
      P extends Misskey.Endpoints[E]["req"] = Misskey.Endpoints[E]["req"],
      _ResT = ResT extends void
        ? Misskey.api.SwitchCaseResponseType<E, P>
        : ResT
    >(
      endpoint: E,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: P = {} as any
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
      token,
      site,
      siteStore,
      api,
      streamApi,
      apiGet: misskeyApiGet,
    };
  },
  {
    persist: true,
  }
);
