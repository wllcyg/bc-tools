"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
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
  Loader2,
  Calendar,
  X
} from "lucide-react";
import { format } from "date-fns";
import { getStudentGrades, getStudentGrowthData } from "../actions";
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
import html2canvas from "html2canvas";
import { pdf } from "@react-pdf/renderer";
import { GradeReportPDF } from "./report-pdf";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Grade {
  id: string;
  score: number;
  exams?: {
    id: string;
    name: string;
    exam_date: string;
  } | null;
  courses?: {
    name: string;
    max_score: number;
  } | null;
}

interface Student {
  id: string;
  name: string;
  student_no: string;
  status: string;
  gender: string;
  birth_date?: string;
  created_at?: string;
  parent_name?: string;
  parent_phone?: string;
  class_id?: string;
  classes?: {
    grade: string;
    name: string;
  } | null;
}

interface StudentDetailDrawerProps {
  student: Student;
  trigger?: React.ReactNode;
}

interface ExamTrendItem {
  name: string;
  date: string | undefined;
  totalScore: number;
  totalMax: number;
}

interface SubjectPerformanceItem {
  subject: string;
  scores: number[];
  maxScore: number;
}

export function StudentDetailDrawer({ student, trigger }: StudentDetailDrawerProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classAverages, setClassAverages] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!student) return;

    // 如果当前不在看板标签页，chartRef.current 为空（或者 html2canvas 无法捕获隐藏元素）
    if (!chartRef.current || activeTab !== "analytics") {
        setActiveTab("analytics");
        toast.loading("正在准备看板数据，请在数据加载后再次点击导出...", { duration: 2000 });
        return;
    }
    
    setExporting(true);
    const toastId = toast.loading("正在捕获图表并生成报告...");
    
    try {
      // 捕获图表
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true
      });
      const chartImage = canvas.toDataURL("image/png");

      // 生成 PDF
      const blob = await pdf(
        <GradeReportPDF student={student} grades={grades} chartImage={chartImage} />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${student.name}_学业成长报告_${format(new Date(), "yyyyMMdd")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("报告生成成功！", { id: toastId });
    } catch (error) {
      console.error("PDF Export error:", error);
      toast.error("生成报告失败，请重试", { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    async function loadGrowthData() {
      if (!student?.id || !student?.class_id) {
        const data = await getStudentGrades(student.id);
        setGrades(data);
        return;
      }
      setLoading(true);
      try {
        const result = await getStudentGrowthData(student.id, student.class_id);
        if (result) {
          setGrades(result.studentGrades);
          setClassAverages(result.classAverages);
        } else {
          setGrades([]);
          setClassAverages({});
        }
      } catch (error) {
        console.error("Failed to load growth data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (open && student?.id) {
      loadGrowthData();
    }
  }, [open, student?.id]);

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "在读", color: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400" },
    "在校": { label: "在读", color: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400" },
    leave: { label: "请假", color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400" },
    "请假": { label: "请假", color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400" },
    suspended: { label: "休学", color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400" },
    "休学": { label: "休学", color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400" },
    graduated: { label: "毕业", color: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400" },
    "毕业": { label: "毕业", color: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400" },
    dropped: { label: "退学", color: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400" },
    "退学": { label: "退学", color: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400" },
  };

  const examTrendData = Object.values(
    grades.reduce((acc: Record<string, ExamTrendItem>, g: Grade) => {
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
  ).map((item: ExamTrendItem) => {
    const examId = grades.find(g => g.exams?.name === item.name)?.exams?.id || "";
    return {
      name: item.name,
      date: item.date,
      percentage: parseFloat(((item.totalScore / item.totalMax) * 100).toFixed(1)),
      classAverage: classAverages[examId] || 0,
    };
  }).sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const subjectPerformanceData = Object.values(
    grades.reduce((acc: Record<string, SubjectPerformanceItem>, g: Grade) => {
      const subjectName = g.courses?.name || "未知科目";
      if (!acc[subjectName]) {
        acc[subjectName] = {
          subject: subjectName,
          scores: [] as number[],
          maxScore: g.courses?.max_score || 100,
        };
      }
      acc[subjectName].scores.push(g.score || 0);
      return acc;
    }, {})
  ).map((item: SubjectPerformanceItem) => ({
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
        <div className="bg-linear-to-br from-indigo-600 to-blue-700 p-8 text-white relative text-left">
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center p-1 group overflow-hidden shadow-2xl">
                        <Avatar className="w-full h-full rounded-2xl">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.gender === '男' ? 'male' : 'female'}_${student.name}`} />
                            <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-600 font-bold">{student.name[0]}</AvatarFallback>
                        </Avatar>
                    </div>
                        <div className="flex items-center gap-3 mb-2">
                            <SheetTitle className="text-3xl font-bold tracking-tight text-white m-0">
                                {student.name}
                            </SheetTitle>
                            <Badge className={cn("rounded-full px-3", statusMap[student.status?.toLowerCase() || 'active']?.color)}>
                                {statusMap[student.status?.toLowerCase() || 'active']?.label || "在读"}
                            </Badge>
                        </div>
                        <SheetDescription className="flex flex-wrap items-center gap-x-6 gap-y-2 text-indigo-100/80 text-sm">
                            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> 学号：{student.student_no}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> 班级：{student.classes ? `${student.classes.grade} ${student.classes.name}` : (student.class_id || "未分配")}</span>
                        </SheetDescription>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* 暂时隐藏导出按钮，待逻辑优化后再开启 */}
                    {/* 
                    <Button 
                        onClick={handleExportPDF} 
                        disabled={exporting || loading}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-md rounded-xl px-4 py-3 h-auto"
                    >
                        {exporting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <TrendingUp className="w-4 h-4 mr-2" />
                        )}
                        导出正式报告
                    </Button>
                    */}
                </div>
            </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-8 border-b bg-white dark:bg-zinc-950 sticky top-0 z-20">
            <TabsList className="bg-transparent border-none p-0 h-16 gap-8">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-1 font-bold transition-all"
              >
                基础档案
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-1 font-bold transition-all"
              >
                学业看板
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-1 font-bold transition-all"
              >
                考勤/成绩历史
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
            </TabsContent>

            <TabsContent value="performance" className="mt-0 space-y-8">
                <div className="grid grid-cols-1 gap-8 min-h-[500px]">
                    <div className="rounded-2xl border p-6 bg-white dark:bg-zinc-950 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-base mb-6 flex items-center gap-2">
                             <TrendingUp className="w-5 h-5 text-indigo-500" />
                             历史考评波动明细
                        </h3>
                        <div className="flex-1 min-h-0" ref={chartRef}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={examTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={11} tickMargin={10} axisLine={false} />
                                    <YAxis fontSize={11} domain={[0, 100]} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                                    <Line 
                                        name="我的表现"
                                        type="monotone" 
                                        dataKey="percentage" 
                                        stroke="#3b82f6" 
                                        strokeWidth={4}
                                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line 
                                        name="班级平均"
                                        type="monotone" 
                                        dataKey="classAverage" 
                                        stroke="#94a3b8" 
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={false}
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
                        <p className="leading-relaxed">
                            根据近期数据，「{student.name}」在各项评估中呈现
                            <span className="font-bold mx-1">
                                {examTrendData.length > 1 && (examTrendData[examTrendData.length-1].percentage >= examTrendData[examTrendData.length-2].percentage ? "稳步上升" : "波动")}
                            </span>
                            趋势。最新的综合得分率为 
                            <span className="font-bold text-blue-600 mx-1">
                                {examTrendData[examTrendData.length-1]?.percentage}%
                            </span>
                            ，{examTrendData[examTrendData.length-1]?.classAverage > 0 && (
                                <>
                                    比班级平均水平
                                    <span className={cn("font-bold mx-1", examTrendData[examTrendData.length-1].percentage >= examTrendData[examTrendData.length-1].classAverage ? "text-emerald-600" : "text-rose-600")}>
                                        {examTrendData[examTrendData.length-1].percentage >= examTrendData[examTrendData.length-1].classAverage ? "高出" : "低于"}
                                        {Math.abs(parseFloat((examTrendData[examTrendData.length-1].percentage - examTrendData[examTrendData.length-1].classAverage).toFixed(1)))}%
                                    </span>。
                                </>
                            )}
                            {subjectPerformanceData.length > 0 && `其中「${[...subjectPerformanceData].sort((a,b) => b.avgPercentage - a.avgPercentage)[0].subject}」科目表现最为突出。`}
                        </p>
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
                            grades.map((g: Grade) => {
                                const maxScore = g.courses?.max_score || 100;
                                const percentage = ((g.score / maxScore) * 100).toFixed(1);
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


