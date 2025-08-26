export function Badge({
  children,
  color = "gray",
}: {
  children: React.ReactNode;
  color?: "green" | "red" | "gray";
}) {
  const palette =
    color === "green"
      ? "bg-green-100 text-green-800 border-green-200"
      : color === "red"
        ? "bg-red-100 text-red-800 border-red-200"
        : "bg-gray-100 text-gray-800 border-gray-200";
  return (
    <span className={`border text-xs px-2 py-1 rounded-full ${palette}`}>
      {children}
    </span>
  );
}
