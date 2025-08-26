import dynamic from "next/dynamic";

const FavoritesClient = dynamic(() => import("./FavoritesClient"), {
  ssr: false,
  loading: () => <p>Loading…</p>, // same on server and client, avoids mismatch
});

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Favorites</h1>
      <p className="text-gray-600">
        Your bookmarked launches are saved in this browser.
      </p>

      <FavoritesClient />
    </div>
  );
}
