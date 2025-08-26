import {
  Paginated,
  Launch,
  LaunchListItem,
  Rocket,
  Launchpad,
  Id,
} from "@/types/spacex";

const BASE = "https://api.spacexdata.com/v4";

type FetchOpts = {
  revalidateSeconds?: number | false;
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  cacheMode?: RequestCache;
};

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchJson<T>(
  path: string,
  {
    revalidateSeconds,
    method = "GET",
    body,
    signal,
    cacheMode,
  }: FetchOpts = {},
): Promise<T> {
  const url = `${BASE}${path}`;
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  const init: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
    // Prefer explicit cache OR next.revalidate, not both. For POSTs, omit next.revalidate.
    cache: cacheMode,
    ...(method === "GET"
      ? {
          next:
            revalidateSeconds === false
              ? { revalidate: 0 }
              : typeof revalidateSeconds === "number"
                ? { revalidate: revalidateSeconds }
                : undefined,
        }
      : {}),
  };

  let attempt = 0;
  const max = 3;
  while (true) {
    attempt++;
    const res = await fetch(url, init);
    if (res.ok) return res.json() as Promise<T>;
    // Retry for 429/5xx
    if (
      (res.status === 429 || (res.status >= 500 && res.status < 600)) &&
      attempt < max
    ) {
      await sleep(500 * Math.pow(2, attempt - 1));
      continue;
    }
    const text = await res.text();
    throw new Error(`SpaceX API error ${res.status}: ${text}`);
  }
}

// Queries
export type LaunchesQueryParams = {
  page: number;
  limit: number;
  sort: Record<string, 1 | -1>;
  query: Record<string, unknown>;
  select?: string[];
  pagination?: boolean;
};

export async function queryLaunches(
  params: LaunchesQueryParams,
  opts?: { revalidateSeconds?: number | false },
) {
  const body = {
    query: params.query,
    options: {
      page: params.page,
      limit: params.limit,
      sort: params.sort,
      select: params.select,
      pagination: params.pagination ?? true,
    },
  };
  return fetchJson<Paginated<LaunchListItem>>("/launches/query", {
    method: "POST",
    body,
    revalidateSeconds: opts?.revalidateSeconds ?? false,
    cacheMode: "no-store",
  });
}

export async function getLaunch(
  id: Id,
  revalidateSeconds: number | false = 3600,
) {
  return fetchJson<Launch>(`/launches/${id}`, { revalidateSeconds });
}

export async function getRocket(
  id: Id | null,
  revalidateSeconds: number | false = 86400,
) {
  if (!id) return null;
  return fetchJson<Rocket>(`/rockets/${id}`, { revalidateSeconds });
}

export async function getLaunchpad(
  id: Id | null,
  revalidateSeconds: number | false = 86400,
) {
  if (!id) return null;
  return fetchJson<Launchpad>(`/launchpads/${id}`, { revalidateSeconds });
}

export async function queryLaunchesByIds(ids: Id[]) {
  if (!ids.length) return { docs: [] as LaunchListItem[] };
  return fetchJson<{ docs: LaunchListItem[] }>("/launches/query", {
    method: "POST",
    body: {
      query: { _id: { $in: ids } },
      options: {
        pagination: false,
        select: [
          "id",
          "name",
          "date_utc",
          "success",
          "links.patch.small",
          "rocket",
          "launchpad",
        ],
      },
    },
    cacheMode: "no-store",
    revalidateSeconds: false,
  });
}
