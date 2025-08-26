import Image from "next/image";
import { getLaunch, getLaunchpad, getRocket } from "@/lib/spacex";
import { fmtDate } from "@/utils/format";
import { Badge } from "@/components/Badge";
import { toSizedFlickr } from "@/utils/flickr";

function getRevalidateFor(dateIso: string, upcoming: boolean) {
  const when = new Date(dateIso).getTime();
  const now = Date.now();
  const diff = Math.abs(now - when);
  const twoDays = 1000 * 60 * 60 * 48;
  if (upcoming || diff < twoDays) return 60; // 1 min near launch
  return 6 * 3600; // 6 hours
}

export default async function Page({ params }: { params: { id: string } }) {
  const launch = await getLaunch(params.id, 0);
  const revalidate = getRevalidateFor(launch.date_utc, launch.upcoming);
  const [rocket, pad] = await Promise.all([
    getRocket(launch.rocket, revalidate),
    getLaunchpad(launch.launchpad, revalidate),
  ]);

  const gallery = launch.links?.flickr?.original ?? [];

  return (
    <article className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{launch.name}</h1>
          <p className="text-gray-600">
            <time dateTime={launch.date_utc}>{fmtDate(launch.date_utc)}</time>
          </p>
        </div>
        <Badge
          color={
            launch.success === null ? "gray" : launch.success ? "green" : "red"
          }
        >
          {launch.success === null
            ? "TBD"
            : launch.success
              ? "Success"
              : "Failure"}
        </Badge>
      </div>

      {launch.details && <p className="leading-relaxed">{launch.details}</p>}

      <section className="grid md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Rocket</h2>
          {rocket ? (
            <div>
              <p className="font-medium">{rocket.name}</p>
              <p className="text-sm text-gray-600">
                Success rate: {rocket.success_rate_pct}% • First flight:{" "}
                {rocket.first_flight}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No rocket info.</p>
          )}
        </div>

        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Launchpad</h2>
          {pad ? (
            <div>
              <p className="font-medium">{pad.name}</p>
              <p className="text-sm text-gray-600">
                {pad.full_name ?? ""} {pad.locality ? `• ${pad.locality}` : ""}{" "}
                {pad.region ? `• ${pad.region}` : ""}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No launchpad info.</p>
          )}
        </div>
      </section>

      {gallery.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {gallery.map((src, i) => {
              const thumb = toSizedFlickr(src, "z"); // ~640px for thumbnails
              return (
                <div className="relative aspect-video" key={i}>
                  <Image
                    src={thumb}
                    alt={`Launch photo ${i + 1}`}
                    fill
                    className="object-cover rounded"
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    quality={60}
                    priority={i < 1}
                    fetchPriority={i < 1 ? "high" : "auto"}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="text-sm text-blue-700 flex gap-4">
        {launch.links?.webcast && (
          <a href={launch.links.webcast} target="_blank" rel="noreferrer">
            Webcast
          </a>
        )}
        {launch.links?.article && (
          <a href={launch.links.article} target="_blank" rel="noreferrer">
            Article
          </a>
        )}
        {launch.links?.wikipedia && (
          <a href={launch.links.wikipedia} target="_blank" rel="noreferrer">
            Wikipedia
          </a>
        )}
      </section>
    </article>
  );
}
