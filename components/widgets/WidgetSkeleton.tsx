export default function WidgetSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-card-bg border border-card-border">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded animate-shimmer" />
        <div className="w-16 h-3 rounded animate-shimmer" />
      </div>
      <div className="w-24 h-6 rounded animate-shimmer mb-2" />
      <div className="w-32 h-3 rounded animate-shimmer" />
    </div>
  );
}
