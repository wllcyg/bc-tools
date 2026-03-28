import {
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Suspense } from "react";
import { StatsCards } from "./_components/stats-cards";
import { EnrollmentTrendChart } from "./_components/enrollment-trend-chart";
import { RecentActivitiesList } from "./_components/recent-activities-list";
import { StatsSkeleton, ChartSkeleton, ActivitySkeleton } from "./_components/dashboard-skeleton";

export default async function Home() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            控制面板
          </h1>
          <p className="text-muted-foreground mt-1">
            欢迎回来，管理员。系统运行正常，这是当前的实时概览。
          </p>
        </div>
        <div className="flex items-center space-x-2 rounded-xl border border-zinc-200 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm shadow-sm dark:bg-zinc-900/50 dark:border-zinc-800">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{format(new Date(), "yyyy年MM月dd日 EEEE", { locale: zhCN })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Suspense fallback={<ChartSkeleton />}>
          <EnrollmentTrendChart />
        </Suspense>

        {/* Recent Activities */}
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivitiesList />
        </Suspense>
      </div>
    </div>
  );
}
