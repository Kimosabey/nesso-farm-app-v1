import { Skeleton, TableSkeleton } from '@/components/dashboard/Skeleton';

export default function Loading() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton h={30} w={150} />
          <Skeleton h={14} w={230} className="mt-2.5" />
        </div>
        <div className="flex gap-2.5">
          <Skeleton h={40} w={130} className="rounded-lg" />
        </div>
      </div>
      <Skeleton h={38} w={320} className="mb-4 rounded-[12px]" />
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Skeleton h={40} w={300} className="rounded-[11px]" />
        <Skeleton h={36} w={130} className="rounded-full" />
      </div>
      <TableSkeleton rows={7} cols={7} />
    </section>
  );
}
