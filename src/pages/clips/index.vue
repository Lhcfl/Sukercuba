<template>
  <VList lines="two">
    <VInfiniteScroll class="overflow-y-visible!" side="end" @load="load">
      <TransitionGroup>
        <VListItem v-for="clip in data?.pages.flat(1)" :key="clip.id" :to="`/clips/${clip.id}`"
          prepend-icon="mdi-bookmark-outline">
          <VListItemTitle>{{ clip.name }}</VListItemTitle>
          <VListItemSubtitle>
            <MkMfm :text="clip.description || t('noDescription')" :plain="true" :nowrap="true" />
          </VListItemSubtitle>
          <template #append>
            <VChip size="small" color="secondary">
              <span>
                {{ clip.notesCount }} / {{ account.me?.policies.noteEachClipsLimit }}
              </span>
            </VChip>
            <VChip size="small" color="primary" class="ml-1">
              <MkTime :time="clip.lastClippedAt" />
            </VChip>
          </template>
          <!-- <div class="text-sm">
          </div> -->
        </VListItem>
      </TransitionGroup>
      <template #loading>
        <div class="w-full">
          <VSkeletonLoader type="list-item-two-line" v-for="i in 3" :key="i" />
        </div>
      </template>
    </VInfiniteScroll>
  </VList>
</template>

<script setup lang="ts">
import { VList } from 'vuetify/components';

const account = useAccount();
const { t } = useI18n();

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ["clips"],
  queryFn: ({ pageParam }) => account.api.request("clips/list", {
    untilId: pageParam,
    limit: 50,
    allowPartial: true
  }),
  initialPageParam: '0',
  // I don't know why, but Misskey does not paginate clips correctly.
  getNextPageParam: () => undefined,
})

async function load(context: {
  done: (stat: "ok" | "error" | "empty") => void;
}) {
  if (data.value?.pages.length) {
    context.done('empty');
    return;
  }
  await fetchNextPage().then(() => {
    context.done("ok");
  }).catch(() => {
    context.done("error");
  })
}
</script>
