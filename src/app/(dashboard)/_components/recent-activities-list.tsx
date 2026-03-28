import { History, Clock, Users, Calculator, BookOpen, Activity, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentActivities } from "../actions";

const activityIcons: Record<string, any> = {
  student: Users,
  grade: Calculator,
  course: BookOpen,
  system: Activity,
  exam: CalendarCheck
};

export async function RecentActivitiesList() {
  const recentActivities = await getRecentActivities();

  return (
    <Card className="col-span-3 border-none shadow-md overflow-hidden bg-white/70 backdrop-blur-md dark:bg-zinc-900/70">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-lg font-bold">最近动态</CardTitle>
          </div>
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
  );
}
