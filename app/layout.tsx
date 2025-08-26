import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SpaceX Explorer",
  description: "Explore SpaceX launches, rockets, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://live.staticflickr.com" />
        <link rel="preconnect" href="https://staticflickr.com" />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          <header className="border-b">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
              <Link href="/" className="font-bold text-lg no-underline">
                SpaceX Explorer
              </Link>
              <nav className="ml-auto flex gap-4">
                <Link href="/launches">Launches</Link>
                <Link href="/favorites">Favorites</Link>
                <Link href="/stats">Stats</Link>
              </nav>
            </div>
          </header>
          <main id="content" className="max-w-6xl mx-auto px-4 py-6">
            {children}
          </main>
          <footer className="border-t mt-10">
            <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-600">
              Data from{" "}
              <a
                href="https://github.com/r-spacex/SpaceX-API"
                target="_blank"
                rel="noreferrer"
              >
                SpaceX API v4
              </a>
              .
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
