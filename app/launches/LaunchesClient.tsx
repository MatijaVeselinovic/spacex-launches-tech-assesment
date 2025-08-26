"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { queryLaunches, type LaunchesQueryParams } from "@/lib/spacex";
import LaunchCard from "@/components/LaunchCard";
import SkeletonRow from "@/components/SkeletonRow";
import type { Paginated, LaunchListItem } from "@/types/spacex";

export default function LaunchesClient({
  initialPage,
  initialBody,
}: {
  initialPage: Paginated<LaunchListItem>;
  initialBody: LaunchesQueryParams;
}) {
  const body = useMemo(() => initialBody, [initialBody]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["launches", body],
    initialPageParam: 1,
    initialData: { pages: [initialPage], pageParams: [1] },
    getNextPageParam: (last) => last.nextPage ?? undefined,
    queryFn: async ({ pageParam }) => {
      return queryLaunches(
        { ...body, page: Number(pageParam) },
        { revalidateSeconds: false },
      );
    },
  });

  const all = data?.pages.flatMap((p) => p.docs) ?? [];

  if (isError) {
    return (
      <div className="border rounded p-4 bg-red-50">
        <p className="mb-3">
          Failed to load launches: {(error as Error).message}
        </p>
        <button
          onClick={() => refetch()}
          className="px-3 py-2 rounded bg-red-600 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!all.length && isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (!all.length) {
    return <p className="text-gray-600">No launches match your filters.</p>;
  }

  const itemCount = all.length + (hasNextPage ? 1 : 0);
  const itemSize = 96;

  return (
    <div aria-live="polite">
      <List
        height={itemSize * 8}
        itemCount={itemCount}
        itemSize={itemSize}
        width="100%"
        className="border rounded-lg"
        overscanCount={3}
        onItemsRendered={({ visibleStopIndex }) => {
          // Auto-fetch when the loading row (last index) becomes visible
          if (
            hasNextPage &&
            visibleStopIndex >= all.length &&
            !isFetchingNextPage
          ) {
            void fetchNextPage();
          }
        }}
      >
        {({ index, style }) => {
          if (index === all.length) {
            return (
              <div
                style={style}
                className="flex items-center justify-center p-2"
                aria-busy="true"
              >
                <SkeletonRow />
              </div>
            );
          }
          const launch = all[index];
          return (
            <div style={style} className="p-2">
              <LaunchCard launch={launch} />
            </div>
          );
        }}
      </List>
    </div>
  );
}
