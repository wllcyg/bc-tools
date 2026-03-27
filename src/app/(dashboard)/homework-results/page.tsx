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
}

interface HomeworkResult {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  record_date: string;
  students: { name: string, student_no: string } | null;
  courses: { name: string } | null;
}

async function ResultsList({ 
  student_id, 
  course_id 
}: { 
  student_id?: string, 
  course_id?: string 
}) {
  const results = await getHomeworkResults({ student_id, course_id });

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 text-muted-foreground">
        <ImageIcon className="h-10 w-10 mb-4 opacity-20" />
        <p>暂无作业成果记录</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((result: HomeworkResult) => (
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
  const { student_id, course_id } = await props.searchParams;
  const supabase = await createClient();

  const [
    { data: students },
    { data: courses }
  ] = await Promise.all([
    supabase.from("students").select("id, name, student_no").order("name"),
    supabase.from("courses").select("id, name").order("name")
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            作业成果库
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
      />

      <Suspense key={`${student_id}-${course_id}`} fallback={<ListSkeleton />}>
        <ResultsList student_id={student_id} course_id={course_id} />
      </Suspense>
    </div>
  );
}
