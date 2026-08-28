const Skeleton = ({ className = '' }: Readonly<{ className?: string }>) => (
  <div className={`mhn-shimmer-box rounded-lg ${className}`} />
);

export function ProfileSkeletonLoader() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading profile page">
      <section className="overflow-hidden rounded-lg border border-auth-stroke bg-auth-field p-6">
        <div className="flex items-center gap-6">
          <Skeleton className="size-[102px] shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-3"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-32" /></div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-1.5 max-[520px]:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-14" />)}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2"><Skeleton className="h-9" /><Skeleton className="h-9" /></div>
        <div className="mt-6 grid grid-cols-5 gap-3 border-t border-auth-stroke pt-4">
          {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-5" />)}
        </div>
      </section>
      {Array.from({ length: 2 }, (_, index) => (
        <section key={index} className="rounded-lg border border-auth-stroke bg-auth-field p-4">
          <div className="flex items-center gap-3"><Skeleton className="size-10 rounded-full" /><div className="flex flex-1 flex-col gap-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-24" /></div></div>
          <div className="mt-4 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
          <Skeleton className="mt-4 aspect-video w-full" />
        </section>
      ))}
    </div>
  );
}
