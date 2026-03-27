import {
  Users,
  GraduationCap,
  UserRound,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Clock,
  History,
  Activity,
  Calculator,
  CalendarCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, getRecentActivities, getEnrollmentTrend } from "./actions";
import { EnrollmentChart } from "./_components/enrollment-chart";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default async function Home() {
  const [stats, recentActivities, trendData] = await Promise.all([
    getDashboardStats(),
    getRecentActivities(),
    getEnrollmentTrend()
  ]);

  const activityIcons: Record<string, any> = {
    student: Users,
    grade: Calculator,
    course: BookOpen,
    system: Activity,
    exam: CalendarCheck
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = [Users, GraduationCap, UserRound, BookOpen][stats.indexOf(stat)] || Users;
          return (
            <Card key={stat.label} className="relative overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${stat.bg}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-zinc-500">{stat.label}</CardTitle>
                <div className={`${stat.bg} ${stat.color} rounded-xl p-2.5 transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <span className={`font-semibold inline-flex items-center ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-zinc-400'}`}>
                    <TrendingUp className={`mr-1 h-3.5 w-3.5 ${stat.trend === '+0.0%' && 'hidden'}`} />
                    {stat.trend}
                  </span>
                  <span className="text-zinc-400">较上月同期</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-4 border-none shadow-md overflow-hidden bg-white/70 backdrop-blur-md dark:bg-zinc-900/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">入学趋势分析</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">过去六个月的新生注册人数统计</p>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-500 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <EnrollmentChart data={trendData} />
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="col-span-3 border-none shadow-md overflow-hidden bg-white/70 backdrop-blur-md dark:bg-zinc-900/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-lg font-bold">最近动态</CardTitle>
              </div>
              {/* <button className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-medium transition-all group">
                查看全部 <ArrowUpRight className="h-3 w-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </button> */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivities.map((activity, i) => {
                const Icon = activityIcons[activity.type] || Activity;
                return (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="mt-0.5 rounded-full p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 flex-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 group-last:border-0">
                      <p className="text-sm font-medium leading-relaxed group-hover:text-blue-600 transition-colors">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
              {recentActivities.length === 0 && (
                <div className="py-20 text-center text-muted-foreground">
                  暂无动态
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
