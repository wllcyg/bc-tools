import { 
  Users, 
  GraduationCap, 
  UserRound, 
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const stats = [
    { label: "学生总数", value: "2,543", icon: Users, color: "text-[#409EFF]", bg: "bg-[#ecf5ff]" },
    { label: "活跃班级", value: "48", icon: GraduationCap, color: "text-[#67c23a]", bg: "bg-[#f0f9eb]" },
    { label: "教师队伍", value: "126", icon: UserRound, color: "text-[#e6a23c]", bg: "bg-[#fdf6ec]" },
    { label: "在设课程", value: "85", icon: BookOpen, color: "text-[#f56c6c]", bg: "bg-[#fef0f0]" },
  ];

  const recentActivities = [
    { title: "张三 加入了 计算机科学1班", time: "10分钟前", type: "student" },
    { title: "李四 提交了 数学期末成绩", time: "45分钟前", type: "grade" },
    { title: "王五 修改了 物理课程大纲", time: "2小时前", type: "course" },
    { title: "系统维护已完成", time: "5小时前", type: "system" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">控制面板</h1>
          <p className="text-muted-foreground">欢迎回来，管理员。这是今天的系统概况。</p>
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2 rounded-lg border bg-white px-3 py-1.5 text-sm dark:bg-zinc-900">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>2026年3月26日</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <div className={`${stat.bg} rounded-full p-2`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 font-medium inline-flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +4.5%
                </span>{" "}
                较上月
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart Placeholder */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>入学趋势分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg bg-zinc-50 text-muted-foreground dark:bg-zinc-900/50">
              [ 趋势图表占位符 ]
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>最近动态</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
