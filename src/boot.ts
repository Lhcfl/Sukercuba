import { useCustomEmojisData } from "./stores/custom-emoji-map";

export async function boot() {
  useCustomEmojisData().init();
}
