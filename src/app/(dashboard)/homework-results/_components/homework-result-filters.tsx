"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface HomeworkResultFiltersProps {
  students: { id: string, name: string, student_no: string }[];
  courses: { id: string, name: string }[];
}

export function HomeworkResultFilters({ students, courses }: HomeworkResultFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const student_id = searchParams.get("student_id") || "all";
  const course_id = searchParams.get("course_id") || "all";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/homework-results");
  };

  const hasFilters = searchParams.has("student_id") || searchParams.has("course_id");

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">按学生筛选:</span>
        <Select value={student_id} onValueChange={(v) => updateFilters("student_id", v)}>
          <SelectTrigger className="w-[180px] bg-white/50 dark:bg-zinc-950/50 rounded-xl border-zinc-200 dark:border-zinc-800">
            <SelectValue placeholder="所有学生" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">所有学生</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} ({s.student_no})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">按课程筛选:</span>
        <Select value={course_id} onValueChange={(v) => updateFilters("course_id", v)}>
          <SelectTrigger className="w-[180px] bg-white/50 dark:bg-zinc-950/50 rounded-xl border-zinc-200 dark:border-zinc-800">
            <SelectValue placeholder="所有课程" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">所有课程</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
        >
          <X className="mr-2 h-4 w-4" />
          清空重置
        </Button>
      )}
    </div>
  );
}
