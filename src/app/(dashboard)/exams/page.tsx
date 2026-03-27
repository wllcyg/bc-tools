import { Suspense } from "react";
import { FileText, CalendarDays, BarChart } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ExamDialog } from "./_components/exam-dialog";
import { DeleteButton } from "@/components/common/delete-button";
import { deleteExam } from "./actions";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

async function ExamsList({ allCourses }: { allCourses: any[] }) {
  const supabase = await createClient();

  const { data: exams, error } = await supabase
    .from("exams")
    .select(`
      *,
      exam_courses (
        course_id,
        courses (
          id,
          name
        )
      )
    `)
    .order("exam_date", { ascending: false });

  if (error) {
    return (
      <div className="text-destructive font-medium p-4">
        加载失败: {error.message}
      </div>
    );
  }

  if (!exams || exams.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
        <FileText className="h-10 w-10 mb-3 opacity-30" />
        <p>暂无考试场次信息</p>
        <ExamDialog
          courses={allCourses}
          trigger={
            <Button variant="link" className="mt-2 text-primary font-medium">
              立即创建第一个考试场次
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white/50 backdrop-blur-sm overflow-hidden dark:bg-zinc-950/50 shadow-sm border-zinc-200 dark:border-zinc-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
            <TableHead className="font-bold">考试名称</TableHead>
            <TableHead className="font-bold">类型</TableHead>
            <TableHead className="font-bold">所属学期</TableHead>
            <TableHead className="font-bold">包含科目</TableHead>
            <TableHead className="font-bold">考试日期</TableHead>
            <TableHead className="text-right font-bold">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => {
            const linkedCourses = exam.exam_courses?.map((ec: any) => ec.courses).filter(Boolean) || [];
            
            return (
              <TableRow key={exam.id} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors">
                <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">
                  {exam.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-bold px-2.5 py-0.5 shadow-sm transition-all hover:shadow-md active:scale-95",
                      exam.exam_type === "期末" ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" :
                      exam.exam_type === "期中" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800" :
                      exam.exam_type === "月考" ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800" :
                      "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                    )}
                  >
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse",
                      exam.exam_type === "期末" ? "bg-red-500" :
                      exam.exam_type === "期中" ? "bg-amber-500" :
                      exam.exam_type === "月考" ? "bg-indigo-500" : "bg-zinc-400"
                    )} />
                    {exam.exam_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {exam.semester}
                </TableCell>
                <TableCell>
                  {linkedCourses.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">未关联科目</span>
                  ) : (
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {linkedCourses.slice(0, 3).map((c: any) => (
                        <Badge key={c.id} variant="secondary" className="text-[10px] py-0 px-1.5 h-5">
                          {c.name}
                        </Badge>
                      ))}
                      {linkedCourses.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{linkedCourses.length - 3}</span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    <CalendarDays className="mr-1.5 h-3.5 w-3.5 opacity-50" />
                    {exam.exam_date ? format(new Date(exam.exam_date), "PP", { locale: zhCN }) : "未设置"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/grades?exam_id=${exam.id}`}>
                      <Button variant="ghost" size="sm" className="hover:text-primary text-xs h-8">
                        <BarChart className="mr-1 h-3.5 w-3.5" />
                        成绩录入
                      </Button>
                    </Link>
                    <ExamDialog
                      examObj={{
                        ...exam,
                        course_ids: linkedCourses.map((c: any) => c.id)
                      }}
                      courses={allCourses}
                      trigger={
                        <Button variant="ghost" size="sm" className="hover:text-primary text-xs h-8">
                          编辑
                        </Button>
                      }
                    />
                    <DeleteButton
                      onDelete={async () => {
                        "use server";
                        await deleteExam(exam.id);
                      }}
                      title="确认删除考试场次？"
                      description={`确认删除「${exam.name}」吗？如果已有关联成绩，删除将被阻止。`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ExamsSkeleton() {
  return <Skeleton className="h-64 w-full rounded-xl" />;
}

export default async function ExamsPage() {
  const supabase = await createClient();
  const { data: allCourses } = await supabase.from("courses").select("id, name").order("name");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            考试管理
          </h1>
          <p className="text-muted-foreground mt-1">
            发布新的考试场次，并设置本次考试包含的科目。
          </p>
        </div>
        <ExamDialog courses={allCourses || []} />
      </div>

      <Suspense fallback={<ExamsSkeleton />}>
        <ExamsList allCourses={allCourses || []} />
      </Suspense>
    </div>
  );
}

