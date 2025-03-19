import type { Ref, WritableComputedRef } from "vue";
import { IDBStore } from "./store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IDBRefStoreRes<T extends Record<string, any>> = {
  [K in keyof T]: T[K] | undefined;
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class IDBRefStore<T extends Record<string, any>> {
  base: IDBStore;
  private __inited = false;
  private __refs: Record<string, Ref<unknown> | undefined> = {};

  constructor(base: IDBStore) {
    this.base = base;
    this.init();
  }

  async init() {
    if (this.__inited) return;
    const kvs = await this.base.entries();
    for (const [k, v] of kvs) {
      const r = this.__refs[k as string];
      if (r) {
        r.value = v;
      } else {
        this.__refs[k as string] = ref(v);
      }
    }
    this.__inited = true;
  }

  get reactive() {
    const base = this.base;
    return new Proxy(this.__refs, {
      get(target, key) {
        if (typeof key != 'string') throw "key must be string"
        target[key] ??= ref();
        return target[key].value;
      },
      set(target, key, val) {
        if (typeof key != 'string') throw "key must be string";
        const r = target[key];
        if (r) { r.value = val; }
        else { target[key] = ref(val); }
        base.set(key, val)
        return true;
      }
    }) as IDBRefStoreRes<T>;
  }

  getRef<K extends keyof T>(key: K) {
    this.__refs[key as string] ??= ref();
    return computed({
      get: () => this.__refs[key as string]!.value,
      set: (v) => {
        this.__refs[key as string]!.value = v;
        this.base.set(key as string, v);
      }
    }) as WritableComputedRef<T[K] | undefined>;
  }
}