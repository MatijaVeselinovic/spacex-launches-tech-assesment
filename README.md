# SpaceX Launches Tech Assesment (Next.js + TypeScript)

Explore SpaceX launches with server-side pagination, filters, details, favorites, and more.

## Tech & Key Choices

- **Next.js App Router (14+)** — Route-level loading/error, Server Components, clean data fetching.
- **TypeScript (strict)** — Strong types for SpaceX entities and paginated responses.
- **TanStack React Query** — Infinite scroll, caching, background refresh, retries.
- **Tailwind CSS** — Simple, accessible UI with consistent styles.
- **Performance** — Virtualized lists (react-window), slim `select` fields, dynamic code-splitting.
- **Accessibility** — Semantic structure, labeled forms, keyboard/focus management, `aria-live`.
- **Optional bonuses implemented** — Charts and Compare.

## How to run

```bash
npm i
npm dev
# open http://localhost:3000
```

## Routes

- `/launches` — Server-rendered first page, client infinite scroll. Filters in URL. Proper server-side pagination with `/launches/query`.
- `/launches/[id]` — Launch details with rocket + launchpad, image gallery, adaptive ISR (fresh near launch).
- `/favorites` — LocalStorage favorites; client-only.
- `/stats` — Yearly launches and success rate (charts). ISR daily.

## Rendering Strategy

- **List**: SSR first page (SEO & fast TTFB) + CSR for more pages via React Query. Marked dynamic due to search params.
- **Details**: Server Fetch with adaptive `revalidate` (1 min near launch, 6h later).
- **Favorites**: CSR (uses `localStorage`).
- **Stats**: Server fetch all (slim select), daily ISR, client charts via dynamic import.
- **Compare**: SSR fetch of both launches in parallel.

## SpaceX API Usage

- `POST /launches/query` with shaped body:
  - Filters: `upcoming`, `success`, `date_utc` range, `name` regex.
  - Sort: `date_utc` or `name` ascending/descending.
  - `select`: Slim fields for list.
  - Pagination: `page`, `limit` (and infinite `nextPage` handling).
- `GET /launches/:id`, `GET /rockets/:id`, `GET /launchpads/:id` on details.
- Batched favorites via `/launches/query` with `{ _id: { $in: [...] }, options: { pagination: false } }`.

## Performance & A11y Notes

- Virtualized list via `react-window` to minimize DOM nodes.
- Thin list payload via `select` minimizes bandwidth.
- Images via `next/image` with remotePatterns for SpaceX/Flickr domains.
- Controls are properly labeled, with visible focus and keyboard reachable actions.
