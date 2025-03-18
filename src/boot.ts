import router from "./router";
import { useAccount } from "./stores/account";
import { useCustomEmojisData } from "./stores/custom-emoji-map";

export async function boot() {
  const account = useAccount();
  if (account.site && account.token) {
    account.init()
    useCustomEmojisData().init();
  } else {
    const path = window.location.pathname;
    if (path.startsWith("/login")) {
      // nothing
    } else {
      await router.push({ name: "/login" });
      router.beforeEach(() => {
        throw "Please Login";
      })
    }
  }
}
