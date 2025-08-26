"use client";

import Image from "next/image";
import Link from "next/link";
import { fmtDate } from "@/utils/format";
import { LaunchListItem } from "@/types/spacex";
import { useFavorites } from "@/hooks/useFavorites";
import { Badge } from "./Badge";

export default function LaunchCard({ launch }: { launch: LaunchListItem }) {
  const { has, toggle } = useFavorites();
  const fav = has(launch.id);

  const status =
    launch.success === null ? "TBD" : launch.success ? "Success" : "Failure";
  const color =
    launch.success === null ? "gray" : launch.success ? "green" : "red";

  return (
    <article className="border rounded-xl p-4 flex items-center gap-4">
      <div className="relative w-16 h-16 flex-shrink-0">
        {launch.links?.patch?.small ? (
          <Image
            src={launch.links.patch.small}
            alt=""
            fill
            sizes="64px"
            className="object-contain"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">
          <Link
            href={`/launches/${launch.id}`}
            className="no-underline hover:underline"
          >
            {launch.name}
          </Link>
        </h3>
        <p className="text-sm text-gray-600">
          {fmtDate(launch.date_utc)}, Launch Id: {launch.id}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Badge color={color as any}>{status}</Badge>
        <button
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          onClick={() => toggle(launch.id)}
          className={`text-xl ${fav ? "text-yellow-500" : "text-gray-400"} hover:scale-110 transition`}
          title={fav ? "Unfavorite" : "Favorite"}
        >
          {fav ? "★" : "☆"}
        </button>
      </div>
    </article>
  );
}
