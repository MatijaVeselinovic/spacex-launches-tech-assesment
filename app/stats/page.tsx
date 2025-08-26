import dynamic from "next/dynamic";

const ChartsClient = dynamic(() => import("./ChartsClient"), { ssr: false });

export const revalidate = 86400; // one day

export default async function Page() {
  // Fetch all (non-paginated) with only small fields
  const data = await fetch("https://api.spacexdata.com/v4/launches/query", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: {},
      options: {
        pagination: false,
        select: ["date_utc", "success"],
      },
    }),
    next: { revalidate: 86400 },
  }).then((r) => r.json());

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Stats</h1>
      <p className="text-gray-600">
        Historical launches per year and success rate.
      </p>
      <ChartsClient raw={data?.docs ?? []} />
    </div>
  );
}
