import { Users, GraduationCap, UserRound, BookOpen, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "../actions";

export async function StatsCards() {
  const stats = await getDashboardStats();
  const icons = [Users, GraduationCap, UserRound, BookOpen];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = icons[i] || Users;
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
  );
}
