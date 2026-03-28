"use client";

import { useState, useEffect } from "react";
import { getAnalysisFilters, getAnalysisData } from "./actions";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Target, 
  Loader2,
  Users,
  Award,
  CircleCheck,
  AlertCircle,
  Trophy,
  User as UserIcon
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AnalysisPage() {
  const [filters, setFilters] = useState<{ exams: any[]; classes: any[] } | null>(null);
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const f = await getAnalysisFilters();
      setFilters(f);
      if (f.exams.length > 0) {
        setSelectedExam(f.exams[0].id);
      } else {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!selectedExam) return;
      setLoading(true);
      const res = await getAnalysisData(
        selectedExam === "all" ? undefined : selectedExam,
        selectedClass === "all" ? undefined : selectedClass
      );
      setData(res);
      setLoading(false);
    }
    loadData();
  }, [selectedExam, selectedClass]);

  if (!filters) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 mb-8 text-white shadow-2xl shadow-blue-500/20">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <BarChart3 className="w-10 h-10" />
              学情深度分析中心
            </h1>
            <p className="text-blue-100 mt-2 text-lg font-medium opacity-90">
              数据驱动决策 · AI 辅助评估 · 洞察学年趋势
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
             <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 flex gap-2">
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                    <SelectTrigger className="w-[180px] bg-white/20 border-none text-white focus:ring-0 placeholder:text-white/70 rounded-xl hover:bg-white/30 transition-all font-bold">
                    <SelectValue placeholder="选择考试" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">全部考试</SelectItem>
                    {filters.exams.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>

                <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-[160px] bg-white/20 border-none text-white focus:ring-0 placeholder:text-white/70 rounded-xl hover:bg-white/30 transition-all font-bold">
                    <SelectValue placeholder="选择班级" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">全校年级</SelectItem>
                    {filters.classes.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.grade}级 {c.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
             </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[500px] flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        </div>
      ) : !data ? (
        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] text-muted-foreground bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800">
            <AlertCircle className="w-16 h-16 mb-4 opacity-10 text-blue-500" />
            <p className="text-xl font-bold tracking-tight opacity-50">当前筛选范围内暂无有效考核数据</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlossyCard 
                label="平均得分" 
                value={data.summary.avgScore} 
                icon={<Target className="w-6 h-6" />} 
                color="text-blue-500"
                gradient="from-blue-500/10 to-transparent"
                subtext={`基于 ${data.summary.totalCount} 条录入成绩`}
            />
            <GlossyCard 
                label="整体及格率" 
                value={`${data.summary.passRate}%`} 
                icon={<CircleCheck className="w-6 h-6" />} 
                color="text-emerald-500"
                gradient="from-emerald-500/10 to-transparent"
                subtext="得分率 ≥ 60%"
            />
            <GlossyCard 
                label="优秀人才比" 
                value={`${data.summary.excellentRate}%`} 
                icon={<Award className="w-6 h-6" />} 
                color="text-amber-500"
                gradient="from-amber-500/10 to-transparent"
                subtext="得分率 ≥ 90%"
            />
            <GlossyCard 
                label="受评估学生" 
                value={data.summary.studentCount} 
                icon={<Users className="w-6 h-6" />} 
                color="text-indigo-500"
                gradient="from-indigo-500/10 to-transparent"
                subtext="当前选定范围总数"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Subject radar - Left 2/3 */}
            <Card className="xl:col-span-2 rounded-[2.5rem] border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden">
                <CardHeader className="px-8 pt-8 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-indigo-500" />
                                多维学科均衡分析
                            </CardTitle>
                            <CardDescription className="text-base font-medium mt-1">评估各科目在全球视角的相对强度</CardDescription>
                        </div>
                        <Badge variant="outline" className="h-8 px-4 rounded-full border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400 font-bold bg-indigo-50/50">
                          学科得分率 (%)
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="h-[450px] px-2 py-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={data.subjectAverages} cx="50%" cy="50%" outerRadius="80%">
                            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                            <PolarAngleAxis 
                                dataKey="subject" 
                                tick={{fill: '#64748b', fontWeight: 600, fontSize: 13}} 
                            />
                            <PolarRadiusAxis domain={[0, 100]} angle={30} hide />
                            <Radar
                                name="得分率"
                                dataKey="percentage"
                                stroke="#6366f1"
                                strokeWidth={4}
                                fill="url(#radarGradient)"
                                fillOpacity={0.6}
                                dot={{r: 5, fill: '#fff', strokeWidth: 3, stroke: '#6366f1'}}
                            />
                            <defs>
                                <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.4}/>
                                </linearGradient>
                            </defs>
                            <Tooltip 
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }} 
                                formatter={(v) => [`${v}%`, '综合得分率']} 
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Distribution - Right 1/3 */}
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden">
                <CardHeader className="px-8 pt-8 pb-0">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                        <PieChartIcon className="w-6 h-6 text-emerald-500" />
                        成绩阶梯看板
                    </CardTitle>
                    <CardDescription className="text-base font-medium mt-1">全体参与者的水平分层统计</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] p-6 flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={115}
                                paddingAngle={6}
                                dataKey="value"
                                labelLine={false}
                                label={({name, percent = 0}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {data.distribution.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                            />
                            <Legend 
                                iconType="circle" 
                                verticalAlign="bottom" 
                                height={60} 
                                wrapperStyle={{paddingTop: '20px', fontSize: '13px', fontWeight: 600}}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top Students Table - Bottom Full Width or Column */}
            <Card className="xl:col-span-3 rounded-[2.5rem] border-none shadow-2xl shadow-zinc-200/20 dark:shadow-none bg-white dark:bg-zinc-950 overflow-hidden border border-zinc-100 dark:border-zinc-800">
                <div className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div>
                        <CardTitle className="text-xl font-black flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-amber-500" />
                            学霸名人堂 (Top 5)
                        </CardTitle>
                        <CardDescription className="text-base font-medium mt-1">当前考核批次中表现最杰出的佼佼者</CardDescription>
                   </div>
                   <div className="flex items-center gap-2 text-sm font-bold text-zinc-400">
                        <UserIcon className="w-4 h-4" />
                        总参与人数: {data.summary.studentCount}
                   </div>
                </div>
                <CardContent className="px-8 pb-8">
                    <div className="rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/10">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-zinc-100/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 border-none h-14">
                                    <TableHead className="w-16 text-center font-black">排名</TableHead>
                                    <TableHead className="font-black">姓名</TableHead>
                                    <TableHead className="font-black">学号</TableHead>
                                    <TableHead className="text-right font-black">总成绩</TableHead>
                                    <TableHead className="text-right font-black">均分</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.topStudents.map((s: any) => (
                                    <TableRow key={s.rank} className="border-zinc-100 dark:border-zinc-800 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/30 h-16">
                                        <TableCell className="text-center font-bold">
                                            {s.rank === 1 ? <div className="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30">1</div> :
                                             s.rank === 2 ? <div className="w-8 h-8 rounded-full bg-zinc-300 text-white flex items-center justify-center mx-auto shadow-lg shadow-zinc-300/30">2</div> :
                                             s.rank === 3 ? <div className="w-8 h-8 rounded-full bg-amber-700/50 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-700/30">3</div> : 
                                             s.rank}
                                        </TableCell>
                                        <TableCell className="font-bold text-lg">{s.name}</TableCell>
                                        <TableCell className="font-mono text-muted-foreground">{s.student_no}</TableCell>
                                        <TableCell className="text-right font-black text-blue-600 dark:text-blue-400 text-xl">{s.totalScore}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge className="font-bold px-3 py-1 bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-200">
                                              {s.avgScore} / 100
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function GlossyCard({ label, value, icon, color, gradient, subtext }: { label: string; value: string | number; icon: React.ReactNode; color: string; gradient: string; subtext: string }) {
    return (
        <Card className="group relative rounded-4xl border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-950 overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
            <div className={cn("absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", gradient)} />
            <CardContent className="p-7 relative z-10 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12", "bg-zinc-50 dark:bg-zinc-900", color)}>
                        {icon}
                    </div>
                    <div className="text-right">
                        <p className={cn("text-3xl font-black tracking-tight", color)}>{value}</p>
                    </div>
                </div>
                <div>
                   <p className="text-zinc-400 dark:text-zinc-500 text-sm font-bold uppercase tracking-wider">{label}</p>
                   <p className="text-zinc-400 dark:text-zinc-600 text-[10px] font-bold mt-0.5">{subtext}</p>
                </div>
            </CardContent>
        </Card>
    );
}
