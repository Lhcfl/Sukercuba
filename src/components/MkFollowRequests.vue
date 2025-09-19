<template>
  <VList lines="two">
    <VInfiniteScroll @load="load">
      <TransitionGroup name="note">
        <MkFollowRequestsItem :user="props.type === 'received' ? item.follower : item.followee" :type
          v-for="item in data?.pages.flat()" :key="item.id" />
      </TransitionGroup>
      <template #loading>
        <div class="w-full">
          <VSkeletonLoader type="list-item-avatar-two-line" v-for="n in 5" :key="n" />
        </div>
      </template>
    </VInfiniteScroll>
  </VList>
</template>

<script setup lang="ts">
import type { InfiniteScrollStatus } from 'vuetify/lib/components/VInfiniteScroll/VInfiniteScroll.mjs';

const props = defineProps<{
  type: "received" | "sent"
}>()

const account = useAccount()

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['follow-requests', props.type],
  queryFn: ({ pageParam }) => props.type === 'received'
    ? account.api.request("following/requests/list", { untilId: pageParam, limit: 30 })
    : account.api.request("following/requests/sent", { untilId: pageParam, limit: 30 }),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => {
    return lastPage.at(-1)?.id
  },
})

async function load(ctx: { done: (status: InfiniteScrollStatus) => void }) {
  if (hasNextPage.value) {
    fetchNextPage().then(() => ctx.done('ok')).catch(() => ctx.done('error'));
  } else if (data.value) {
    ctx.done('empty');
  } else {
    ctx.done('ok');
  }
}
</script>
