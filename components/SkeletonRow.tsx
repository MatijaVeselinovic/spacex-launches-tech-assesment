export default function SkeletonRow() {
  return (
    <div className="animate-pulse border rounded-lg p-4 flex items-center gap-4 w-full">
      <div className="w-16 h-16 bg-gray-200 rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
      <div className="w-20 h-6 bg-gray-200 rounded" />
    </div>
  );
}
