import { Suspense } from "react";
import { BarChart, SearchX } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { GradeFilters } from "./_components/grade-filters";
import { GradeEntryForm } from "./_components/grade-entry-form";
import { Skeleton } from "@/components/ui/skeleton";

interface GradesPageProps {
  searchParams: Promise<{
    exam_id?: string;
    class_id?: string;
    course_id?: string;
  }>;
}

export default async function GradesPage(props: GradesPageProps) {
  const { exam_id, class_id, course_id } = await props.searchParams;
  const supabase = await createClient();

  // 获取基础数据用于筛选
  const [
    { data: exams },
    { data: classes },
    { data: courses }
  ] = await Promise.all([
    supabase
      .from("exams")
      .select("id, name, exam_date, exam_courses(course_id)")
      .order("exam_date", { ascending: false }),
    supabase.from("classes").select("id, name, grade").order("grade"),
    supabase.from("courses").select("id, name, max_score").order("name"),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            成绩管理
          </h1>
          <p className="text-muted-foreground mt-1">
            按考试场次、班级和课程批量录入或修改学生成绩。
          </p>
        </div>
      </div>

      <GradeFilters 
        exams={exams || []} 
        classes={classes || []} 
        courses={courses || []} 
      />

      <Suspense key={`${exam_id}-${class_id}-${course_id}`} fallback={<GradeSkeleton />}>
        {exam_id && class_id && course_id ? (
          <GradeEntryWrapper 
            exam_id={exam_id} 
            class_id={class_id} 
            course_id={course_id} 
          />
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-white/30 backdrop-blur-sm text-muted-foreground dark:bg-zinc-950/30">
            <BarChart className="h-10 w-10 mb-3 opacity-20" />
            <p>请选择考试、班级和课程以开始录入成绩</p>
          </div>
        )}
      </Suspense>
    </div>
  );
}

async function GradeEntryWrapper({ exam_id, class_id, course_id }: { 
  exam_id: string; 
  class_id: string; 
  course_id: string; 
}) {
  const supabase = await createClient();

  // 1. 获取该班级所有学生
  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id, name, student_no")
    .eq("class_id", class_id)
    .order("student_no");

  // 2. 获取已有的成绩记录
  const { data: existingGrades } = await supabase
    .from("grades")
    .select("*")
    .eq("exam_id", exam_id)
    .eq("course_id", course_id)
    .in("student_id", students?.map(s => s.id) || []);

  // 3. 获取课程满分（优先使用考试特定的满分，否则使用课程默认满分）
  const [
    { data: examCourse },
    { data: course }
  ] = await Promise.all([
    supabase
      .from("exam_courses")
      .select("max_score")
      .eq("exam_id", exam_id)
      .eq("course_id", course_id)
      .single(),
    supabase
      .from("courses")
      .select("max_score")
      .eq("id", course_id)
      .single()
  ]);

  const effectiveMaxScore = examCourse?.max_score || course?.max_score || 100;

  if (studentError) {
    return <div className="text-destructive font-medium p-4">加载学生列表失败: {studentError.message}</div>;
  }

  if (!students || students.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-white/30 backdrop-blur-sm dark:bg-zinc-950/30">
        <SearchX className="h-10 w-10 mb-3 opacity-30" />
        <p>该班级暂无学生</p>
      </div>
    );
  }

  return (
    <GradeEntryForm 
      students={students} 
      existingGrades={existingGrades || []} 
      exam_id={exam_id}
      course_id={course_id}
      maxScore={effectiveMaxScore}
    />
  );
}

function GradeSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
