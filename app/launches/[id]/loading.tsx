import SkeletonRow from "@/components/SkeletonRow";

export default function Loading() {
  return (
    <div className="space-y-3">
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  );
}
