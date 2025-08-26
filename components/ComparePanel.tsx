"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getLaunch, getRocket, getLaunchpad } from "@/lib/spacex";
import { fmtDate } from "@/utils/format";

type CompareData = {
  launchId: string;
  name: string;
  date: string;
  success: boolean | null;
  rocketName: string | null;
  padName: string | null;
  links: {
    wikipedia?: string | null;
    webcast?: string | null;
    article?: string | null;
  };
};

async function loadOne(id: string): Promise<CompareData> {
  const launch = await getLaunch(id, 3600);
  const [rocket, pad] = await Promise.all([
    getRocket(launch.rocket),
    getLaunchpad(launch.launchpad),
  ]);
  return {
    launchId: launch.id,
    name: launch.name,
    date: fmtDate(launch.date_utc),
    success: launch.success,
    rocketName: rocket?.name ?? null,
    padName: pad?.name ?? null,
    links: {
      wikipedia: launch.links?.wikipedia ?? null,
      webcast: launch.links?.webcast ?? null,
      article: launch.links?.article ?? null,
    },
  };
}

export default function ComparePanel({
  initialLeft = "",
  initialRight = "",
}: {
  initialLeft?: string;
  initialRight?: string;
}) {
  const [leftId, setLeftId] = React.useState(initialLeft);
  const [rightId, setRightId] = React.useState(initialRight);

  // This is the ONLY trigger for fetching; set when user clicks "Compare".
  const [pair, setPair] = React.useState<{
    left: string;
    right: string;
  } | null>(null);

  const { data, isFetching, isError, error } = useQuery({
    // Tie the key to the submitted pair so edits don't auto-refetch
    queryKey: pair ? ["compare", pair.left, pair.right] : ["compare", "idle"],
    queryFn: async () => {
      const [L, R] = await Promise.all([
        loadOne(pair!.left),
        loadOne(pair!.right),
      ]);
      return { L, R };
    },
    enabled: !!pair, // fetch only when a pair has been submitted
    staleTime: 60_000,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const L = leftId.trim();
    const R = rightId.trim();
    if (L && R) setPair({ left: L, right: R });
  };

  const onClear = () => {
    setLeftId("");
    setRightId("");
    setPair(null); // also hide previous results
  };

  const statusText = (s: boolean | null) =>
    s === null ? "TBD" : s ? "Success" : "Failure";
  const statusColor = (s: boolean | null) =>
    s === null ? "gray" : s ? "green" : "red";

  const canCompare = leftId.trim().length > 0 && rightId.trim().length > 0;

  return (
    <section className="mt-8 space-y-3" aria-label="Compare launches">
      <h2 className="text-xl font-semibold">Compare Launches</h2>

      <form className="grid gap-2 md:grid-cols-4 items-end" onSubmit={onSubmit}>
        <div className="flex flex-col">
          <label htmlFor="left-id" className="text-sm mb-1">
            First ID
          </label>
          <input
            id="left-id"
            name="leftId"
            data-testid="left-id"
            className="border rounded px-2 py-2"
            placeholder="Enter first launch ID"
            value={leftId}
            onChange={(e) => setLeftId(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="right-id" className="text-sm mb-1">
            Second ID
          </label>
          <input
            id="right-id"
            name="rightId"
            data-testid="right-id"
            className="border rounded px-2 py-2"
            placeholder="Enter second launch ID"
            value={rightId}
            onChange={(e) => setRightId(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-3 py-2 rounded-lg border shadow-sm"
            disabled={!canCompare}
            aria-disabled={!canCompare}
          >
            Compare
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-lg border shadow-sm"
            onClick={onClear}
          >
            Clear
          </button>
        </div>
        {isFetching && pair && (
          <div className="text-sm text-gray-500">Loading comparison…</div>
        )}
      </form>

      {pair ? (
        isError ? (
          <p className="text-red-600 text-sm">
            Failed to load comparison:{" "}
            {(error as any)?.message ?? "Unknown error"}
          </p>
        ) : data ? (
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 border">Field</th>
                  <th className="text-left p-2 border">Left</th>
                  <th className="text-left p-2 border">Right</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border font-medium">Name</td>
                  <td className="p-2 border">{data.L.name}</td>
                  <td className="p-2 border">{data.R.name}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Date</td>
                  <td className="p-2 border">{data.L.date}</td>
                  <td className="p-2 border">{data.R.date}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Outcome</td>
                  <td className="p-2 border">
                    <span
                      className={`px-2 py-1 text-xs rounded-full border bg-${statusColor(
                        data.L.success,
                      )}-100 text-${statusColor(data.L.success)}-800 border-${statusColor(
                        data.L.success,
                      )}-200`}
                    >
                      {statusText(data.L.success)}
                    </span>
                  </td>
                  <td className="p-2 border">
                    <span
                      className={`px-2 py-1 text-xs rounded-full border bg-${statusColor(
                        data.R.success,
                      )}-100 text-${statusColor(data.R.success)}-800 border-${statusColor(
                        data.R.success,
                      )}-200`}
                    >
                      {statusText(data.R.success)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Rocket</td>
                  <td className="p-2 border">{data.L.rocketName ?? "—"}</td>
                  <td className="p-2 border">{data.R.rocketName ?? "—"}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Launchpad</td>
                  <td className="p-2 border">{data.L.padName ?? "—"}</td>
                  <td className="p-2 border">{data.R.padName ?? "—"}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Links</td>
                  <td className="p-2 border">
                    {data.L.links.wikipedia && (
                      <a
                        className="mr-2 underline"
                        href={data.L.links.wikipedia}
                        target="_blank"
                      >
                        Wiki
                      </a>
                    )}
                    {data.L.links.webcast && (
                      <a
                        className="mr-2 underline"
                        href={data.L.links.webcast}
                        target="_blank"
                      >
                        Webcast
                      </a>
                    )}
                    {data.L.links.article && (
                      <a
                        className="mr-2 underline"
                        href={data.L.links.article}
                        target="_blank"
                      >
                        Article
                      </a>
                    )}
                  </td>
                  <td className="p-2 border">
                    {data.R.links.wikipedia && (
                      <a
                        className="mr-2 underline"
                        href={data.R.links.wikipedia}
                        target="_blank"
                      >
                        Wiki
                      </a>
                    )}
                    {data.R.links.webcast && (
                      <a
                        className="mr-2 underline"
                        href={data.R.links.webcast}
                        target="_blank"
                      >
                        Webcast
                      </a>
                    )}
                    {data.R.links.article && (
                      <a
                        className="mr-2 underline"
                        href={data.R.links.article}
                        target="_blank"
                      >
                        Article
                      </a>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null
      ) : (
        <p className="text-gray-600">Enter two IDs and click Compare.</p>
      )}
    </section>
  );
}
