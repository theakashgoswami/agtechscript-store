export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-card">
      <div className="skeleton aspect-square w-full" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="flex items-center gap-2 mt-3">
          <div className="skeleton h-5 w-1/3 rounded" />
          <div className="skeleton h-4 w-1/4 rounded" />
        </div>
        <div className="skeleton h-8 w-full rounded-lg mt-2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="skeleton aspect-square w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-2">
            {[0,1,2,3].map(i => (
              <div key={i} className="skeleton aspect-square rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4 py-4">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-7 w-full rounded" />
          <div className="skeleton h-7 w-3/4 rounded" />
          <div className="skeleton h-5 w-32 rounded" />
          <div className="skeleton h-10 w-40 rounded" />
          <div className="space-y-2 pt-4">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="skeleton h-12 flex-1 rounded-xl" />
            <div className="skeleton h-12 flex-1 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BannerSkeleton() {
  return <div className="skeleton w-full h-48 md:h-64 rounded-2xl" />;
}
