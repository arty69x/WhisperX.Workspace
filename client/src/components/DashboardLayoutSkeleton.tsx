import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLayoutSkeleton() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(114,92,255,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(32,212,201,0.08),transparent_20%)]" />
      <div className="relative z-10 hidden w-[280px] shrink-0 border-r border-white/8 bg-sidebar/82 p-4 backdrop-blur-2xl md:block">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Skeleton className="h-9 w-9 rounded-xl bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-28 bg-white/10" />
              <Skeleton className="h-4 w-36 bg-white/10" />
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/8 bg-white/5 p-4">
            <Skeleton className="h-3 w-24 bg-white/10" />
            <Skeleton className="mt-4 h-4 w-36 bg-white/10" />
            <Skeleton className="mt-3 h-12 w-full bg-white/10" />
          </div>

          <div className="space-y-2 px-1">
            <Skeleton className="h-16 rounded-2xl bg-white/10" />
            <Skeleton className="h-16 rounded-2xl bg-white/10" />
            <Skeleton className="h-16 rounded-2xl bg-white/10" />
            <Skeleton className="h-16 rounded-2xl bg-white/10" />
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-[1.4rem] border border-white/8 bg-white/5 px-3 py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24 bg-white/10" />
                <Skeleton className="h-3 w-32 bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 p-4 md:p-8">
        <div className="space-y-6">
          <div className="rounded-[1.9rem] border border-white/8 bg-white/5 p-5 backdrop-blur-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-3 w-24 bg-white/10" />
                <Skeleton className="h-7 w-64 bg-white/10" />
                <Skeleton className="h-4 w-[28rem] max-w-full bg-white/10" />
              </div>
              <Skeleton className="hidden h-10 w-40 rounded-full bg-white/10 md:block" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-40 rounded-[1.7rem] bg-white/10" />
            <Skeleton className="h-40 rounded-[1.7rem] bg-white/10" />
            <Skeleton className="h-40 rounded-[1.7rem] bg-white/10" />
            <Skeleton className="h-40 rounded-[1.7rem] bg-white/10" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <Skeleton className="h-[420px] rounded-[1.9rem] bg-white/10" />
            <div className="grid gap-4">
              <Skeleton className="h-48 rounded-[1.7rem] bg-white/10" />
              <Skeleton className="h-56 rounded-[1.7rem] bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
