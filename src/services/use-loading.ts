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
