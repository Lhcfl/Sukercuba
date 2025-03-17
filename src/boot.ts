import { useAccount } from "./stores/account";
import { useCustomEmojisData } from "./stores/custom-emoji-map";

export async function boot() {
  useAccount().init();
  useCustomEmojisData().init();
}
