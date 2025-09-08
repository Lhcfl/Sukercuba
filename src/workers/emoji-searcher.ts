import Fuse from "fuse.js";
import { SiteStore } from "@/stores/store";

let emojiFuse: Fuse<unknown>;

async function createEmojiFuse(site: string) {
  const siteStore = new SiteStore(site);
  emojiFuse = new Fuse((await siteStore.get("emojis")) ?? [], {
    keys: ["name", "aliases"],
    threshold: 0.1,
    includeScore: true,
  });
}

addEventListener("message", (event) => {
  if (typeof event.data !== "object" || event.data === null) {
    throw new Error("emoji-searcher: invalid data");
  }
  const { op, data } = event.data;
  if (typeof op !== "string") {
    throw new Error("emoji-searcher: invalid op");
  }
  if (typeof data !== "string") {
    throw new Error("emoji-searcher: invalid data");
  }
  switch (op) {
    case "init": {
      createEmojiFuse(data);
      return;
    }
    case "search": {
      const ret = emojiFuse.search(data, { limit: 100 }).map((x) => x.item);
      postMessage(ret);
    }
  }
});
