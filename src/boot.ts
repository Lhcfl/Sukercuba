
export async function boot() {
  const { fetchCustomEmojis } = await import("./scripts/custom-emoji-map");
  fetchCustomEmojis();
}