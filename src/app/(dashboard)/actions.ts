"use server";

import { createClient } from "@/utils/supabase/server";
import { startOfMonth, subMonths, format } from "date-fns";

export async function getDashboardStats() {
  const supabase = await createClient();

  // 1. 获取各项总数
  const [
    { count: studentCount },
    { count: classCount },
    { count: teacherCount },
    { count: courseCount },
  ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("classes").select("*", { count: "exact", head: true }),
    supabase.from("teachers").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
  ]);

  // 2. 模拟增长率（实际开发中可以根据历史快照计算）
  return [
    { label: "学生总数", value: (studentCount || 0).toLocaleString(), trend: "+12.5%", color: "text-blue-500", bg: "bg-blue-50/50" },
    { label: "活跃班级", value: (classCount || 0).toString(), trend: "+2.1%", color: "text-green-500", bg: "bg-green-50/50" },
    { label: "教师队伍", value: (teacherCount || 0).toString(), trend: "+5.4%", color: "text-amber-500", bg: "bg-amber-50/50" },
    { label: "在设课程", value: (courseCount || 0).toString(), trend: "+0.0%", color: "text-rose-500", bg: "bg-rose-50/50" },
  ];
}

export async function getRecentActivities() {
  const supabase = await createClient();

  // 获取最近的学生加入
  const { data: students } = await supabase
    .from("students")
    .select("name, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  // 获取最近的成绩录入
  const { data: grades } = await supabase
    .from("grades")
    .select(`
      score, 
      updated_at,
      students (name),
      courses (name)
    `)
    .order("updated_at", { ascending: false })
    .limit(3);

  // 获取最近的课程创建
  const { data: courses } = await supabase
    .from("courses")
    .select("name, created_at")
    .order("created_at", { ascending: false })
    .limit(2);

  const activities: any[] = [];

  students?.forEach(s => {
    activities.push({
      title: `${s.name} 加入了学校`,
      time: new Date(s.created_at),
      type: "student",
    });
  });

  grades?.forEach((g: any) => {
    activities.push({
      title: `${g.students?.name} 的 ${g.courses?.name} 成绩已录入: ${g.score}`,
      time: new Date(g.updated_at),
      type: "grade",
    });
  });

  courses?.forEach(c => {
    activities.push({
      title: `新开设课程: ${c.name}`,
      time: new Date(c.created_at),
      type: "course",
    });
  });

  // 按时间降序排列
  return activities
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 6)
    .map(act => ({
      ...act,
      time: formatDistanceToNow(act.time),
    }));
}

function formatDistanceToNow(date: Date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "刚刚";
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}小时前`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}天前`;
}

export async function getEnrollmentTrend() {
  const supabase = await createClient();
  
  // 获取过去 6 个月的入学数据
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return {
      month: format(d, "MMM"),
      start: startOfMonth(d).toISOString(),
      end: startOfMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1)).toISOString(),
      count: 0
    };
  });

  // 这里的统计逻辑在 Supabase 中通过 count 配合范围查询实现
  // 为了性能，实际生产环境建议使用 RPC 或预聚合表
  // 使用 Promise.all 并行化查询，大幅提升加载速度
  const counts = await Promise.all(
    months.map(m => 
      supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .gte("created_at", m.start)
        .lt("created_at", m.end)
    )
  );

  counts.forEach((res, i) => {
    months[i].count = res.count || 0;
  });

  return months.map(m => ({ name: m.month, students: m.count }));
}
