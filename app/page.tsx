export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome</h1>
      <p className="text-gray-700">
        Explore SpaceX launches, view details, bookmark your favorites, compare
        two launches, and inspect historical stats.
      </p>
      <ul className="list-disc list-inside text-blue-700">
        <li>
          <a href="/launches">Browse Launches</a>
        </li>
        <li>
          <a href="/favorites">Favorites</a>
        </li>
        <li>
          <a href="/stats">Stats</a>
        </li>
      </ul>
    </div>
  );
}
