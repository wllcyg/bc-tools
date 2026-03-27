"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradeFiltersProps {
  exams: any[];
  classes: any[];
  courses: any[];
}

export function GradeFilters({ exams, classes, courses }: GradeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 本地状态
  const [localExamId, setLocalExamId] = useState(searchParams.get("exam_id") || "");
  const [localClassId, setLocalClassId] = useState(searchParams.get("class_id") || "");
  const [localCourseId, setLocalCourseId] = useState(searchParams.get("course_id") || "");

  // 根据选中的考试过滤可选课程
  const filteredCourses = localExamId 
    ? (() => {
        const selectedExam = exams.find(e => e.id === localExamId);
        const allowedIds = selectedExam?.exam_courses?.map((ec: any) => ec.course_id) || [];
        // 如果该考试设置了关联科目，则过滤；否则显示全部（兼容旧数据或未设置的情况）
        return allowedIds.length > 0 
          ? courses.filter(c => allowedIds.includes(c.id))
          : courses;
      })()
    : courses;

  // 当考试变化时，如果当前选中的课程不在新考试范围内，则清空课程选择
  useEffect(() => {
    if (localExamId && localCourseId) {
      const isStillValid = filteredCourses.some(c => c.id === localCourseId);
      if (!isStillValid) setLocalCourseId("");
    }
  }, [localExamId, filteredCourses, localCourseId]);

  // 当 URL 参数变化时同步
  useEffect(() => {
    setLocalExamId(searchParams.get("exam_id") || "");
    setLocalClassId(searchParams.get("class_id") || "");
    setLocalCourseId(searchParams.get("course_id") || "");
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (localExamId) params.set("exam_id", localExamId);
    if (localClassId) params.set("class_id", localClassId);
    if (localCourseId) params.set("course_id", localCourseId);
    
    router.push(`/grades?${params.toString()}`);
  };

  const isSearchDisabled = !localExamId || !localClassId || !localCourseId;

  return (
    <div className="flex flex-col gap-6 p-6 rounded-xl border bg-white/50 backdrop-blur-sm dark:bg-zinc-950/50 shadow-sm border-zinc-200 dark:border-zinc-800">
      <div className="grid gap-6 sm:grid-cols-3">
        {/* 选择考试 */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">选择考试</Label>
          <Select 
            value={localExamId} 
            onValueChange={setLocalExamId}
          >
            <SelectTrigger className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 focus:ring-primary/20">
              <SelectValue placeholder="请选择考试场次" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 选择班级 */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">选择班级</Label>
          <Select 
            value={localClassId} 
            onValueChange={setLocalClassId}
          >
            <SelectTrigger className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 focus:ring-primary/20">
              <SelectValue placeholder="请选择班级" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.grade}{cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 选择课程 */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">选择课程</Label>
          <Select 
            value={localCourseId} 
            onValueChange={setLocalCourseId}
            disabled={!localExamId}
          >
            <SelectTrigger className={cn(
              "bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 focus:ring-primary/20",
              !localExamId && "opacity-50 cursor-not-allowed"
            )}>
              <SelectValue placeholder={localExamId ? "请选择课程" : "请先选择考试"} />
            </SelectTrigger>
            <SelectContent>
              {filteredCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {localExamId && filteredCourses.length === 0 && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">该考试未配置关联科目</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
        <Button 
          onClick={handleSearch}
          disabled={isSearchDisabled}
          className="w-full sm:w-auto px-10 h-10 shadow-sm"
        >
          <Search className="mr-2 h-4 w-4" />
          开始录入成绩
        </Button>
      </div>
    </div>
  );
}
