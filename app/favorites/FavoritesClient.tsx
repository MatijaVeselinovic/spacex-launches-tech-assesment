"use client";

import React from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { queryLaunchesByIds } from "@/lib/spacex";
import LaunchCard from "@/components/LaunchCard";
import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";

export default function FavoritesClient() {
  const { ids } = useFavorites();

  const list = React.useMemo(() => Array.from(ids).sort(), [ids]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["favorites", list],
    queryFn: () => queryLaunchesByIds(list),
    enabled: list.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,

    select: (res) => ({
      ...res,
      docs: res.docs.filter((d) => ids.has(d.id)),
    }),
  });

  if (list.length === 0) {
    return (
      <p className="text-gray-600">
        No favorites yet. Browse <a href="/launches">launches</a> and star some!
      </p>
    );
  }

  // Important: only show "Loading…" when there is no data at all yet.
  // When un-favoriting, we still have previous data, so we keep rendering it.
  if (!data && isLoading) return <p>Loading…</p>;

  const docs = (data?.docs ?? []).filter((d) => ids.has(d.id));

  return (
    <div className="space-y-3">
      {docs.map((l) => (
        <LaunchCard key={l.id} launch={l} />
      ))}
      {isFetching && (
        <div aria-hidden className="text-xs mt-2 text-gray-400">
          Refreshing…
        </div>
      )}
    </div>
  );
}
