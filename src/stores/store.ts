import * as IDB from "idb-keyval";

export class IDBStore {
  store?: IDB.UseStore;

  constructor(dbName?: string) {
    this.store = dbName ? IDB.createStore(dbName, "keyval") : undefined;
  }
  
  protected storeKey(k: string) { return k; }

  async get(k: string) {
    return await IDB.get(this.storeKey(k), this.store);
  }

  async set(k: string, v: unknown) {
    return await IDB.set(this.storeKey(k), v, this.store);
  }

  async setMany(kvs: [string, unknown][]) {
    return await IDB.setMany(kvs.map(([k, v]) => [this.storeKey(k), v]), this.store);
  }

  async getMany(ks: string[]) {
    return await IDB.getMany(ks.map((x) => this.storeKey(x)), this.store);
  }

  async del(k: string) {
    return await IDB.del(this.storeKey(k), this.store);
  }

  async delMany(ks: string[]) {
    return await IDB.delMany(ks.map((k) => this.storeKey(k)), this.store);
  }
  
  async entries() {
    return await IDB.entries(this.store);
  }
}

export class SiteStore extends IDBStore {
  constructor(site: string) {
    super(`site:${site}`);
  }
}

export class UserStore extends IDBStore {
  constructor(token: string) {
    super(`user:${token}`);
  }
}
