import { queryLaunches, type LaunchesQueryParams } from "@/lib/spacex";
import LaunchesClient from "./LaunchesClient";
import FiltersBar from "@/components/FiltersBar";
import ComparePanel from "@/components/ComparePanel";

function parseParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const get = (k: string) =>
    Array.isArray(searchParams[k]) ? searchParams[k]![0] : searchParams[k];
  const status = (get("status") as "all" | "upcoming" | "past") ?? "all";
  const success = (get("success") as "all" | "success" | "failure") ?? "all";
  const sort =
    (get("sort") as "date_desc" | "date_asc" | "name_asc" | "name_desc") ??
    "date_desc";
  const search = (get("search") as string) ?? "";
  const from = get("from") as string | undefined;
  const to = get("to") as string | undefined;
  return { status, success, sort, search, from, to };
}

function buildQueryBody(params: ReturnType<typeof parseParams>) {
  const query: Record<string, unknown> = {};
  if (params.status === "upcoming") query["upcoming"] = true;
  else if (params.status === "past") query["upcoming"] = false;
  if (params.success === "success") query["success"] = true;
  else if (params.success === "failure") query["success"] = false;
  if (params.from || params.to) {
    query["date_utc"] = {
      ...(params.from ? { $gte: params.from } : {}),
      ...(params.to ? { $lte: params.to } : {}),
    };
  }
  if (params.search) {
    query["name"] = { $regex: params.search, $options: "i" };
  }

  const sort: Record<string, 1 | -1> =
    params.sort === "name_asc"
      ? ({ name: 1 } as const)
      : params.sort === "name_desc"
        ? ({ name: -1 } as const)
        : params.sort === "date_asc"
          ? ({ date_utc: 1 } as const)
          : ({ date_utc: -1 } as const);

  const body: LaunchesQueryParams = {
    page: 1,
    limit: 20,
    sort,
    query,
    select: [
      "id",
      "name",
      "date_utc",
      "success",
      "links.patch.small",
      "rocket",
      "launchpad",
    ],
  };
  return body;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = parseParams(searchParams);
  const body = buildQueryBody(params);
  const firstPage = await queryLaunches(body, { revalidateSeconds: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Launches</h1>
      <FiltersBar initial={params} />
      <LaunchesClient initialPage={firstPage} initialBody={body} />
      <ComparePanel />
    </div>
  );
}
