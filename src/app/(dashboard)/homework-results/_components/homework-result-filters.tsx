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
import { Input } from "@/components/ui/input";
import { X, Search, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface HomeworkResultFiltersProps {
  students: { id: string, name: string, student_no: string }[];
  courses: { id: string, name: string }[];
  classes: { id: string, name: string, grade: string }[];
}

export function HomeworkResultFilters({ students, courses, classes }: HomeworkResultFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const student_id = searchParams.get("student_id") || "all";
  const course_id = searchParams.get("course_id") || "all";
  const class_id = searchParams.get("class_id") || "all";
  const [nameSearch, setNameSearch] = useState(searchParams.get("search_name") || "");

  const debouncedName = useDebounce(nameSearch, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedName) {
      params.set("search_name", debouncedName);
    } else {
      params.delete("search_name");
    }
    router.push(`?${params.toString()}`);
  }, [debouncedName, router]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`?${params.toString()}`);
  };

  const handleManualSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (nameSearch) {
      params.set("search_name", nameSearch);
    } else {
      params.delete("search_name");
    }
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setNameSearch("");
    router.push("/homework-results");
  };

  const hasFilters = searchParams.has("student_id") || 
                    searchParams.has("course_id") || 
                    searchParams.has("class_id") || 
                    searchParams.has("search_name");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">班级:</span>
        <Select value={class_id} onValueChange={(v) => updateFilters("class_id", v)}>
          <SelectTrigger className="w-[140px] h-10 border-zinc-200 focus:bg-white transition-all dark:border-zinc-800 shadow-sm">
            <SelectValue placeholder="所有班级" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有班级</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.grade} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">学生:</span>
        <Select value={student_id} onValueChange={(v) => updateFilters("student_id", v)}>
          <SelectTrigger className="w-[160px] h-10 border-zinc-200 focus:bg-white transition-all dark:border-zinc-800 shadow-sm">
            <SelectValue placeholder="所有学生" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有学生</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} ({s.student_no})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索学生姓名..."
          className="pl-10 h-10 border-zinc-200 focus:bg-white transition-all dark:border-zinc-800 shadow-sm"
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">课程:</span>
        <Select value={course_id} onValueChange={(v) => updateFilters("course_id", v)}>
          <SelectTrigger className="w-[160px] h-10 border-zinc-200 focus:bg-white transition-all dark:border-zinc-800 shadow-sm">
            <SelectValue placeholder="所有课程" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有课程</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleManualSearch} className="h-10 px-6 shadow-sm">
          查询
        </Button>
        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="h-10 px-6 border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          重置
        </Button>
      </div>
    </div>
  );
}
