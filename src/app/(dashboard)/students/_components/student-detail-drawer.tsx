"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  Info,
  Calendar as CalendarIcon,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { getStudentGrades } from "../actions";
import { cn } from "@/utils/cn";
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

interface StudentDetailDrawerProps {
  student: any;
  trigger?: React.ReactNode;
}

export function StudentDetailDrawer({ student, trigger }: StudentDetailDrawerProps) {
  const [open, setOpen] = useState(false);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && student?.id) {
      loadGrades();
    }
  }, [open, student?.id]);

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

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "在读", color: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400" },
    leave: { label: "请假", color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400" },
    suspended: { label: "休学", color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400" },
    graduated: { label: "毕业", color: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400" },
    dropped: { label: "退学", color: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400" },
  };

  // 处理图表数据 - 趋势图
  const examTrendData = Object.values(
    grades.reduce((acc: any, g: any) => {
      const examName = g.exams?.name || "未知考试";
      if (!acc[examName]) {
        acc[examName] = {
          name: examName,
          date: g.exams?.exam_date,
          totalScore: 0,
          totalMax: 0,
        };
      }
      acc[examName].totalScore += g.score || 0;
      acc[examName].totalMax += g.courses?.max_score || 100;
      return acc;
    }, {})
  ).map((item: any) => ({
    name: item.name,
    date: item.date,
    percentage: parseFloat(((item.totalScore / item.totalMax) * 100).toFixed(1)),
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 处理图表数据 - 科目表现
  const subjectPerformanceData = Object.values(
    grades.reduce((acc: any, g: any) => {
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
  ).map((item: any) => ({
    subject: item.subject,
    avgPercentage: parseFloat(((item.scores.reduce((a: number, b: number) => a + b, 0) / item.scores.length / item.maxScore) * 100).toFixed(1)),
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || <Button variant="outline" size="sm">详情</Button>}
      </SheetTrigger>
      <SheetContent side="right" className="p-0 gap-0 border-none sm:max-w-3xl md:max-w-4xl overflow-y-auto overflow-x-hidden flex flex-col">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white relative">
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <SheetTitle className="text-3xl font-bold tracking-tight text-white">{student.name}</SheetTitle>
                            <Badge className={cn("bg-white/20 text-white border-white/30 hover:bg-white/30 px-3")}>
                                {statusMap[student.status]?.label || student.status}
                            </Badge>
                        </div>
                        <SheetDescription className="text-white/80 font-mono text-base mt-1 tracking-wider">
                            {student.student_no}
                        </SheetDescription>
                    </div>
                </div>
                
                <div className="flex items-center gap-8 text-sm">
                    <div className="flex flex-col items-center md:items-end">
                        <span className="text-white/60 text-xs uppercase tracking-widest font-bold mb-1">所属班级</span>
                        <span className="font-bold text-lg flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-blue-200" />
                            {student.classes ? `${student.classes.grade} ${student.classes.name}` : "未分配"}
                        </span>
                    </div>
                    <div className="w-px h-10 bg-white/20 hidden md:block" />
                    <div className="flex flex-col items-center md:items-end">
                        <span className="text-white/60 text-xs uppercase tracking-widest font-bold mb-1">联系家长</span>
                        <span className="font-bold text-lg flex items-center gap-2">
                            <Phone className="w-5 h-5 text-emerald-200" />
                            {student.parent_name || "未填写"}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="px-8 border-b bg-white dark:bg-zinc-950 sticky top-0 z-20">
            <TabsList className="h-16 bg-transparent gap-8">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none px-0 h-16 text-base font-bold transition-all"
              >
                <Info className="w-5 h-5 mr-2" />
                个人档案
              </TabsTrigger>
              <TabsTrigger 
                value="performance" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none px-0 h-16 text-base font-bold transition-all"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                学业看板
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none px-0 h-16 text-base font-bold transition-all"
              >
                <History className="w-5 h-5 mr-2" />
                成绩详情
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-8">
            <TabsContent value="overview" className="mt-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded-2xl border p-6 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-6 shadow-sm">
                    <h3 className="font-bold text-base flex items-center gap-2">
                        <div className="w-2 h-5 bg-blue-600 rounded-full" />
                        详细信息
                    </h3>
                    <div className="grid grid-cols-2 gap-y-6 text-sm">
                        <DetailItem label="性别" value={student.gender} />
                        <DetailItem label="学号" value={student.student_no} className="font-mono" />
                        <DetailItem 
                            label="出生日期" 
                            value={student.birth_date ? format(new Date(student.birth_date), "yyyy-MM-dd") : "未填写"} 
                        />
                        <DetailItem 
                            label="入学日期" 
                            value={student.created_at ? format(new Date(student.created_at), "yyyy-MM-dd") : "-"} 
                        />
                    </div>
                </div>

                <div className="rounded-2xl border p-6 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-6 shadow-sm">
                    <h3 className="font-bold text-base flex items-center gap-2">
                        <div className="w-2 h-5 bg-emerald-600 rounded-full" />
                        监护人信息
                    </h3>
                    <div className="space-y-5 text-sm">
                        <div className="flex items-center justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                            <span className="text-muted-foreground font-medium">姓名</span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{student.parent_name || "未填写"}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                            <span className="text-muted-foreground font-medium">电话</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono tracking-widest">
                                {student.parent_phone || "未填写"}
                            </span>
                        </div>
                        <div className="pt-2">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md">
                                <Phone className="w-4 h-4 mr-2" />
                                立即通话
                            </Button>
                        </div>
                    </div>
                </div>
              </div>
              
                    <div className="rounded-2xl border p-6 bg-white dark:bg-zinc-950 space-y-6 shadow-md border-zinc-200/60 dark:border-zinc-800/60 transition-all hover:shadow-lg w-full overflow-hidden">
                 <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        核心成绩趋势
                    </h3>
                    <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-blue-200 text-blue-800 bg-blue-50/50">
                        平均得分率 (%)
                    </Badge>
                 </div>
                 <div className="h-[250px] w-full">
                    {loading ? (
                        <div className="h-full w-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : examTrendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={examTrendData} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" fontSize={12} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} hide />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`${value}%`, '综合得分率']}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="percentage" 
                                    stroke="#3b82f6" 
                                    strokeWidth={4} 
                                    dot={{ r: 6, strokeWidth: 3, fill: '#fff', stroke: '#3b82f6' }}
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#1e40af' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground text-sm italic border-2 border-dashed rounded-xl border-zinc-100 dark:border-zinc-800">
                            暂无历史考核数据，趋势图将在录入成绩后显示
                        </div>
                    )}
                 </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-0 space-y-8">
                <div className="grid grid-cols-1 gap-8 min-h-[500px]">
                    <div className="rounded-2xl border p-6 bg-white dark:bg-zinc-950 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-base mb-6 flex items-center gap-2">
                             <TrendingUp className="w-5 h-5 text-indigo-500" />
                             历史考评波动明细
                        </h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={examTrendData} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={11} tickMargin={10} axisLine={false} />
                                    <YAxis fontSize={11} domain={[0, 100]} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                                    <Line 
                                        name="全科平均水平"
                                        type="monotone" 
                                        dataKey="percentage" 
                                        stroke="#6366f1" 
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-2xl border p-6 bg-white dark:bg-zinc-950 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-base mb-6 flex items-center gap-2">
                             <BarChart3 className="w-5 h-5 text-emerald-500" />
                             分科实力对比
                        </h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={subjectPerformanceData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis 
                                        dataKey="subject" 
                                        type="category" 
                                        fontSize={12} 
                                        width={80} 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{fontWeight: 600}}
                                    />
                                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                                    <Bar dataKey="avgPercentage" radius={[0, 8, 8, 0]} barSize={24}>
                                        {subjectPerformanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                
                <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 p-5 border border-indigo-100 dark:border-indigo-800 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center shrink-0">
                        <Info className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-sm text-indigo-900 dark:text-indigo-300">
                        <p className="font-bold text-base mb-1">学情智能分析</p>
                        <p className="leading-relaxed">根据近期数据，「{student.name}」在各项评估中呈现{examTrendData.length > 1 && (examTrendData[examTrendData.length-1].percentage >= examTrendData[examTrendData.length-2].percentage ? "稳步上升" : "波动")}趋势。{subjectPerformanceData.length > 0 && `其中「${[...subjectPerformanceData].sort((a,b) => b.avgPercentage - a.avgPercentage)[0].subject}」科目表现最为突出。`}建议在薄弱科目上多加关注，保持目前的学习势头。</p>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0 w-full overflow-x-hidden">
                <div className="rounded-2xl border overflow-x-auto shadow-lg border-zinc-200 dark:border-zinc-800 w-full">
                    <Table>
                        <TableHeader>
                        <TableRow className="bg-zinc-100/50 dark:bg-zinc-900/50">
                            <TableHead className="font-bold py-4">考试日期</TableHead>
                            <TableHead className="font-bold py-4">考试名称</TableHead>
                            <TableHead className="font-bold py-4">科目</TableHead>
                            <TableHead className="font-bold py-4">得分</TableHead>
                            <TableHead className="font-bold py-4 text-center">学分占比</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-80 text-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-zinc-300 inline-block" />
                                </TableCell>
                            </TableRow>
                        ) : grades.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-80 text-center text-muted-foreground italic font-medium">
                                    暂无相关考试成绩记录
                                </TableCell>
                            </TableRow>
                        ) : (
                            grades.map((g) => {
                                const percentage = ((g.score / g.courses?.max_score) * 100).toFixed(1);
                                return (
                                    <TableRow key={g.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border-zinc-100 dark:border-zinc-900">
                                        <TableCell className="text-zinc-500 font-mono text-xs">
                                            {g.exams?.exam_date ? format(new Date(g.exams.exam_date), "yyyy-MM-dd") : "-"}
                                        </TableCell>
                                        <TableCell className="font-bold">{g.exams?.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-bold px-2 py-0.5 border-zinc-200 dark:border-zinc-800">
                                                {g.courses?.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-black text-blue-600 dark:text-blue-400 text-base">{g.score}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <Badge 
                                                    className={cn(
                                                        "font-mono font-bold",
                                                        Number(percentage) >= 90 ? "bg-emerald-500 hover:bg-emerald-600" :
                                                        Number(percentage) >= 60 ? "bg-blue-500 hover:bg-blue-600" :
                                                        "bg-rose-500 hover:bg-rose-600"
                                                    )}
                                                >
                                                    {percentage}%
                                                </Badge>
                                                <div className="w-16 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className={cn(
                                                            "h-full transition-all",
                                                            Number(percentage) >= 90 ? "bg-emerald-500" :
                                                            Number(percentage) >= 60 ? "bg-blue-500" :
                                                            "bg-rose-500"
                                                        )}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
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
      </SheetContent>
    </Sheet>
  );
}

function DetailItem({ label, value, className }: { label: string; value: string; className?: string }) {
    return (
        <div>
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-1">{label}</p>
            <p className={cn("font-bold text-zinc-900 dark:text-zinc-100", className)}>{value || "-"}</p>
        </div>
    );
}


