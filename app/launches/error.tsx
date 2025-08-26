"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="border rounded p-4 bg-red-50">
      <h2 className="font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-3 py-2 rounded bg-red-600 text-white"
      >
        Retry
      </button>
    </div>
  );
}
