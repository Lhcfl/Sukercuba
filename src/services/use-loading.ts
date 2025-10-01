import type { Ref } from "vue";

export function useLoading<F extends (...args: never[]) => Promise<unknown>>(
  trigger: F,
) {
  const loading = ref(false);
  const wrapped = (...args: Parameters<F>) => {
    loading.value = true;
    return trigger(...args).finally(() => (loading.value = false));
  };
  return [loading, wrapped as F] as const;
}

export function withLoading<F extends (...args: never[]) => Promise<unknown>>(
  loading: Ref<boolean>,
  trigger: F,
) {
  return (...args: Parameters<F>) => {
    loading.value = true;
    return trigger(...args).finally(() => (loading.value = false));
  };
}

export function useSharedLoading<Fs extends ((...args: never[]) => Promise<unknown>)[]>(
  ...triggers: Fs
) {
  const loading = ref(false);
  const wrapped = triggers.map((trigger) => {
    return (...args: Parameters<typeof trigger>) => {
      loading.value = true;
      return trigger(...args).finally(() => (loading.value = false));
    };
  }) as Fs;
  return [loading, ...wrapped] as const;
}
