import { CardSkeleton, Skeleton } from '@/components/dashboard/Skeleton';

export default function Loading() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-8">
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton h={30} w={180} />
          <Skeleton h={14} w={240} className="mt-2.5" />
        </div>
        <div className="flex gap-2.5">
          <Skeleton h={40} w={110} className="rounded-lg" />
          <Skeleton h={40} w={110} className="rounded-lg" />
          <Skeleton h={40} w={150} className="rounded-lg" />
        </div>
      </div>

      {/* bento card grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <CardSkeleton className="lg:col-span-2 lg:row-span-2" />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton className="lg:col-span-2" />
        <CardSkeleton />
      </div>
    </section>
  );
}
