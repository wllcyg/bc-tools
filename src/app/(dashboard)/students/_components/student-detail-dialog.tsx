"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  User, 
  Phone, 
  GraduationCap, 
  BarChart3, 
  History,
  TrendingUp,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { getStudentGrades } from "../actions";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";

interface StudentBlock {
  id: string;
  name: string;
  student_no: string;
  gender: string;
  birth_date?: string;
  avatar_url?: string | null;
  status: string;
  parent_name?: string;
  parent_phone?: string;
  created_at?: string;
  classes?: {
    grade: string;
    name: string;
  };
}

interface ExamGrade {
  id: string;
  score: number;
  exams?: {
    name: string;
    exam_date: string;
  } | null;
  courses?: {
    name: string;
    max_score: number;
  } | null;
}

interface StudentDetailDialogProps {
  student: StudentBlock;
  trigger?: React.ReactNode;
}

interface AccData {
  [key: string]: {
    name: string;
    date: string;
    totalScore: number;
    totalMax: number;
  };
}

interface SubjectAcc {
  [key: string]: {
    subject: string;
    scores: number[];
    maxScore: number;
  };
}

export function StudentDetailDialog({ student, trigger }: StudentDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [grades, setGrades] = useState<ExamGrade[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadGrades() {
      setLoading(true);
      try {
        const data = await getStudentGrades(student.id);
        setGrades(data);
      } catch (error) {
        console.error("Failed to load grades:", error);
      } finally {
        setLoading(false);
      }
    }
    if (open && student?.id) {
      loadGrades();
    }
  }, [open, student?.id]);

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "在读", color: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400" },
    leave: { label: "请假", color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400" },
    suspended: { label: "休学", color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400" },
    graduated: { label: "毕业", color: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400" },
    dropped: { label: "退学", color: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400" },
  };

  // 处理图表数据 - 趋势图
  const examTrendData = Object.values(
    grades.reduce((acc: AccData, g: ExamGrade) => {
      const examName = g.exams?.name || "未知考试";
      if (!acc[examName]) {
        acc[examName] = {
          name: examName,
          date: g.exams?.exam_date || "",
          totalScore: 0,
          totalMax: 0,
        };
      }
      acc[examName].totalScore += g.score || 0;
      acc[examName].totalMax += g.courses?.max_score || 100;
      return acc;
    }, {})
  ).map((item) => ({
    name: item.name,
    date: item.date,
    percentage: parseFloat(((item.totalScore / item.totalMax) * 100).toFixed(1)),
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 处理图表数据 - 科目表现
  const subjectPerformanceData = Object.values(
    grades.reduce((acc: SubjectAcc, g: ExamGrade) => {
      const subjectName = g.courses?.name || "未知科目";
      if (!acc[subjectName]) {
        acc[subjectName] = {
          subject: subjectName,
          scores: [],
          maxScore: g.courses?.max_score || 100,
        };
      }
      acc[subjectName].scores.push(g.score || 0);
      return acc;
    }, {})
  ).map((item) => ({
    subject: item.subject,
    avgPercentage: parseFloat(((item.scores.reduce((a: number, b: number) => a + b, 0) / item.scores.length / item.maxScore) * 100).toFixed(1)),
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm">详情</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none shadow-2xl">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white overflow-hidden relative">
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold tracking-tight">{student.name}</h2>
                            <Badge className={cn("bg-white/20 text-white border-white/30 hover:bg-white/30")}>
                                {statusMap[student.status]?.label || student.status}
                            </Badge>
                        </div>
                        <p className="text-white/80 font-mono text-sm mt-0.5">{student.student_no}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex flex-col items-center md:items-end">
                        <span className="text-white/60 text-xs uppercase tracking-wider font-semibold">所属班级</span>
                        <span className="font-bold flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4 text-blue-200" />
                            {student.classes ? `${student.classes.grade} ${student.classes.name}` : "未分配"}
                        </span>
                    </div>
                    <div className="w-px h-8 bg-white/20 hidden md:block" />
                    <div className="flex flex-col items-center md:items-end">
                        <span className="text-white/60 text-xs uppercase tracking-wider font-semibold">联系家长</span>
                        <span className="font-bold flex items-center gap-1.5">
                            <Phone className="w-4 h-4 text-emerald-200" />
                            {student.parent_name || "未填写"}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="px-6 border-b bg-white dark:bg-zinc-950 sticky top-0 z-20">
            <TabsList className="h-14 bg-transparent gap-6">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 h-14 font-semibold"
              >
                <Info className="w-4 h-4 mr-2" />
                基本概况
              </TabsTrigger>
              <TabsTrigger 
                value="performance" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 h-14 font-semibold"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                学业表现
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 h-14 font-semibold"
              >
                <History className="w-4 h-4 mr-2" />
                成绩历史
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border p-4 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-4">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                        详细档案
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div>
                            <p className="text-muted-foreground text-xs">性别</p>
                            <p className="font-medium">{student.gender}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">学号</p>
                            <p className="font-medium font-mono">{student.student_no}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">出生日期</p>
                            <p className="font-medium">
                                {student.birth_date ? format(new Date(student.birth_date), "yyyy-MM-dd") : "未填写"}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">入学日期</p>
                            <p className="font-medium">
                                {student.created_at ? format(new Date(student.created_at), "yyyy-MM-dd") : "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border p-4 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-4">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                        家长联系信息
                    </h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-muted-foreground text-xs">监护人姓名</p>
                            <p className="font-bold">{student.parent_name || "未填写"}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-muted-foreground text-xs">联系电话</p>
                            <p className="font-bold text-blue-600 dark:text-blue-400 font-mono tracking-wider">
                                {student.parent_phone || "未填写"}
                            </p>
                        </div>
                        <div className="pt-2">
                            <Button variant="outline" size="sm" className="w-full text-xs h-8">
                                <Phone className="w-3 h-3 mr-2" />
                                立即联系
                            </Button>
                        </div>
                    </div>
                </div>
              </div>
              
              <div className="rounded-xl border p-4 bg-white dark:bg-zinc-950 space-y-4 shadow-sm">
                 <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        近期学业概览
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-normal">得分率 (%)</Badge>
                 </div>
                 <div className="h-[200px] w-full">
                    {loading ? (
                        <div className="h-full w-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
                        </div>
                    ) : examTrendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={examTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" hide />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`${value}%`, '综合得分率']}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="percentage" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground text-xs italic opacity-50">
                            暂无成绩历史数据以生成趋势图
                        </div>
                    )}
                 </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                    <div className="rounded-xl border p-5 bg-white dark:bg-zinc-950 shadow-sm flex flex-col">
                        <h3 className="font-bold text-sm mb-4">成绩波动趋势 (得分率 %)</h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={examTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={10} tickMargin={10} />
                                    <YAxis fontSize={10} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                    <Legend fontSize={10} />
                                    <Line name="总体水平" type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-xl border p-5 bg-white dark:bg-zinc-950 shadow-sm flex flex-col">
                        <h3 className="font-bold text-sm mb-4">科目表现对比 (平均百分制)</h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={subjectPerformanceData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis 
                                        dataKey="subject" 
                                        type="category" 
                                        fontSize={11} 
                                        width={60} 
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="avgPercentage" radius={[0, 4, 4, 0]} barSize={20}>
                                        {subjectPerformanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800 dark:text-blue-300">
                        <p className="font-bold mb-1">学情分析小助手</p>
                        <p>该生在多次考试中表现稳健。{subjectPerformanceData.length > 0 && `其中「${[...subjectPerformanceData].sort((a,b) => b.avgPercentage - a.avgPercentage)[0].subject}」科目表现最为突出，建议继续保持。`}趋势图中展示的是学生在该次考试中所有科目得分相对于满分的总百分比。</p>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
                <div className="rounded-xl border overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                        <TableRow className="bg-zinc-50 dark:bg-zinc-900/50">
                            <TableHead className="font-bold">考试日期</TableHead>
                            <TableHead className="font-bold">考试名称</TableHead>
                            <TableHead className="font-bold">科目</TableHead>
                            <TableHead className="font-bold">得分</TableHead>
                            <TableHead className="font-bold">满分</TableHead>
                            <TableHead className="font-bold text-right">计算百分比</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <p className="text-xs">加载中...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : grades.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center text-muted-foreground italic">
                                    暂无考试成绩记录
                                </TableCell>
                            </TableRow>
                        ) : (
                            grades.map((g) => {
                                const maxScore = g.courses?.max_score || 100;
                                const percentage = ((g.score / maxScore) * 100).toFixed(1);
                                return (
                                    <TableRow key={g.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <TableCell className="text-zinc-500 text-xs font-mono">
                                            {g.exams?.exam_date ? format(new Date(g.exams.exam_date), "yyyy-MM-dd") : "-"}
                                        </TableCell>
                                        <TableCell className="font-medium">{g.exams?.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-normal">{g.courses?.name}</Badge>
                                        </TableCell>
                                        <TableCell className="font-bold text-blue-600 dark:text-blue-400">{g.score}</TableCell>
                                        <TableCell className="text-muted-foreground">{g.courses?.max_score || 100}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge 
                                                variant="outline" 
                                                className={cn(
                                                    "font-mono",
                                                    Number(percentage) >= 90 ? "border-emerald-200 text-emerald-700 bg-emerald-50" :
                                                    Number(percentage) >= 60 ? "border-blue-200 text-blue-700 bg-blue-50" :
                                                    "border-red-200 text-red-700 bg-rose-50"
                                                )}
                                            >
                                                {percentage}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Loader2({ className }: { className?: string }) {
    return <TrendingUp className={cn("animate-pulse", className)} />;
}
