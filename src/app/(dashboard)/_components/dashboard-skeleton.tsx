import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="col-span-4 border-none shadow-md overflow-hidden bg-white/70 backdrop-blur-md dark:bg-zinc-900/70">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="h-[350px] flex items-end gap-2 pb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="w-full" style={{ height: `${Math.random() * 60 + 20}%` }} />
        ))}
      </CardContent>
    </Card>
  );
}

export function ActivitySkeleton() {
  return (
    <Card className="col-span-3 border-none shadow-md overflow-hidden bg-white/70 backdrop-blur-md dark:bg-zinc-900/70">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-start">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1 pb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
