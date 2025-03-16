import * as IDB from "idb-keyval";

export class SiteStore {
  site: string;
  constructor(site: string) {
    this.site = site;
  }

  private storeKey(k: string) {
    return `${k}:${this.site}`;
  }

  async get(k: string) {
    return await IDB.get(this.storeKey(k));
  }

  async set(k: string, v: unknown) {
    return await IDB.set(this.storeKey(k), v);
  }

  async setMany(kvs: [string, unknown][]) {
    return await IDB.setMany(kvs.map(([k, v]) => [this.storeKey(k), v]));
  }

  async getMany(ks: string[]) {
    return await IDB.getMany(ks.map((x) => this.storeKey(x)));
  }

  async del(k: string) {
    return await IDB.del(this.storeKey(k));
  }

  async delMany(ks: string[]) {
    return await IDB.delMany(ks.map((k) => this.storeKey(k)));
  }
}
