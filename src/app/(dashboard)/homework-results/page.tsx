import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { HomeworkResultDialog } from "./_components/homework-result-dialog";
import { HomeworkResultFilters } from "./_components/homework-result-filters";
import { getHomeworkResults } from "./actions";
import { HomeworkResultCard } from "./_components/homework-result-card";

interface SearchParams {
  student_id?: string;
  course_id?: string;
  class_id?: string;
  search_name?: string;
}

interface HomeworkResult {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  record_date: string;
  students: { name: string, student_no: string, class_id: string } | null;
  courses: { name: string } | null;
}

async function ResultsList({
  student_id,
  course_id,
  class_id,
  search_name
}: {
  student_id?: string,
  course_id?: string,
  class_id?: string,
  search_name?: string
}) {
  const results = await getHomeworkResults({ student_id, course_id, class_id, search_name });

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 text-muted-foreground">
        <ImageIcon className="h-10 w-10 mb-4 opacity-20" />
        <p>暂无作业记录</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((result: any) => (
        <HomeworkResultCard key={result.id} result={result} />
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default async function HomeworkResultsPage(props: {
  searchParams: Promise<SearchParams>
}) {
  const { student_id, course_id, class_id, search_name } = await props.searchParams;
  const supabase = await createClient();

  const [
    { data: students },
    { data: rawCourses },
    { data: classes }
  ] = await Promise.all([
    supabase.from("students").select("id, name, student_no").order("name"),
    supabase.from("courses").select(`
      id, 
      name,
      course_classes (
        classes (
          grade
        )
      )
    `).order("name"),
    supabase.from("classes").select("id, name, grade").order("grade")
  ]);

  // 处理课程数据，附加年级信息
  const courses = rawCourses?.map((c: any) => {
    const grades = Array.from(new Set(c.course_classes?.map((cc: any) => cc.classes?.grade).filter(Boolean)));
    return {
      id: c.id,
      name: grades.length > 0 ? `${c.name} (${grades.join(", ")})` : c.name
    };
  }) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            作业库
          </h1>
          <p className="text-muted-foreground mt-1">记录并展示学生的作业实物成果与教师点评。</p>
        </div>
        <HomeworkResultDialog
          students={students || []}
          courses={courses || []}
        />
      </div>

      <HomeworkResultFilters
        students={students || []}
        courses={courses || []}
        classes={classes || []}
      />

      <Suspense key={`${student_id}-${course_id}-${class_id}-${search_name}`} fallback={<ListSkeleton />}>
        <ResultsList 
          student_id={student_id} 
          course_id={course_id} 
          class_id={class_id}
          search_name={search_name}
        />
      </Suspense>
    </div>
  );
}
