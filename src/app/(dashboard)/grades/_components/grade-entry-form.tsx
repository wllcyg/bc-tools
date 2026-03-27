"use client";

import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Clock, Edit3, Loader2, Save, AlertCircle, TrendingUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveGrades } from "../actions";
import { cn } from "@/lib/utils";
import { ImportGradesDialog } from "./import-grades-dialog";

interface Student {
  id: string;
  name: string;
  student_no: string;
}

interface Grade {
  student_id: string;
  score: number;
}

interface GradeEntryFormProps {
  students: Student[];
  existingGrades: Grade[];
  exam_id: string;
  course_id: string;
  maxScore: number;
}

export function GradeEntryForm({
  students,
  existingGrades,
  exam_id,
  course_id,
  maxScore
}: GradeEntryFormProps) {
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // 初始化已有成绩
  useEffect(() => {
    const initialScores: Record<string, string> = {};
    existingGrades.forEach((g) => {
      initialScores[g.student_id] = g.score.toString();
    });
    setScores(initialScores);
  }, [existingGrades]);

  // 场景切换后自动聚焦第一个输入框
  useEffect(() => {
    if (students.length > 0) {
      setTimeout(() => {
        const firstStudentId = students[0].id;
        inputRefs.current[firstStudentId]?.focus();
      }, 100);
    }
  }, [exam_id, course_id, students]);

  const handleScoreChange = (studentId: string, value: string) => {
    // 基础输入过滤 (允许数字和小数点)
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;

    setScores(prev => ({ ...prev, [studentId]: value }));

    // 校验满分
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > maxScore) {
      setErrors(prev => ({ ...prev, [studentId]: `分数不能超过满分 ${maxScore}` }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[studentId];
        return newErrors;
      });
    }
  };

  // 键盘导航处理器
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextStudent = students[index + 1];
      if (nextStudent) {
        inputRefs.current[nextStudent.id]?.focus();
        inputRefs.current[nextStudent.id]?.select(); // 全选方便快速覆盖
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevStudent = students[index - 1];
      if (prevStudent) {
        inputRefs.current[prevStudent.id]?.focus();
        inputRefs.current[prevStudent.id]?.select();
      }
    }
  };

  const handleDeleteScore = (studentId: string) => {
    setScores(prev => ({ ...prev, [studentId]: "" }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[studentId];
      return newErrors;
    });
  };

  const hasErrors = Object.keys(errors).length > 0;
  const isModified = students.some(s => {
    const original = existingGrades.find(g => g.student_id === s.id)?.score.toString() || "";
    const current = scores[s.id] || "";
    return original !== current;
  });

  const handleImportGrades = (importedScores: Record<string, string>) => {
    setScores(prev => ({ ...prev, ...importedScores }));
    
    // 清除被导入学生的错误状态
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(importedScores).forEach(studentId => {
        delete newErrors[studentId];
      });
      return newErrors;
    });

    toast.success(`成功导入 ${Object.keys(importedScores).length} 条成绩数据`);
  };

  async function handleSave() {
    setLoading(true);
    const toastId = toast.loading("正在保存成绩...");

    try {
      const gradesToSave = students
        .filter(s => {
          const original = existingGrades.find(g => g.student_id === s.id)?.score.toString() || "";
          const current = scores[s.id] || "";
          return original !== current;
        })
        .map(s => ({
          student_id: s.id,
          exam_id,
          course_id,
          score: scores[s.id] === "" ? NaN : parseFloat(scores[s.id]),
        }));

      if (gradesToSave.length === 0) {
        toast.info("数据未发生变化", { id: toastId });
        return;
      }

      await saveGrades(gradesToSave);
      toast.success("成绩保存成功", { id: toastId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存失败";
      console.error(error);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  // 计算统计数据
  const validScores = Object.values(scores).map(v => parseFloat(v)).filter(n => !isNaN(n));
  const avgScore = validScores.length > 0
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-4 pb-20">
      {/* 粘性操作栏 */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md p-4 rounded-xl border shadow-sm transition-all">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">满分:</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 font-bold dark:bg-amber-900/20">{maxScore}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">进度:</span>
            <span className="font-bold">{validScores.length} / {students.length}</span>
            <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800 hidden sm:block">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${(validScores.length / students.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground font-medium">平均分:</span>
            <span className="font-bold text-emerald-600">{avgScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isModified && (
            <span className="hidden md:inline-flex items-center text-xs text-blue-500 animate-pulse">
              ● 有未保存的修改
            </span>
          )}
          <ImportGradesDialog 
            students={students} 
            maxScore={maxScore} 
            onImport={handleImportGrades} 
          />
          <Button
            onClick={handleSave}
            disabled={loading || hasErrors || !isModified}
            className="shadow-md transition-all hover:shadow-lg active:scale-95"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {loading ? "提交中..." : "保存数据"}
          </Button>
        </div>
      </div>

      {hasErrors && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>输入错误</AlertTitle>
          <AlertDescription>
            列表中存在超过满分的分数，请修正后再保存。
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border bg-white/50 backdrop-blur-sm overflow-hidden dark:bg-zinc-950/50 shadow-sm border-zinc-200 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <TableHead className="w-[120px] font-bold">学号</TableHead>
              <TableHead className="font-bold">姓名</TableHead>
              <TableHead className="w-[180px] font-bold">考试得分</TableHead>
              <TableHead className="w-[180px] font-bold text-right">状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => {
              const error = errors[student.id];
              const currentScore = scores[student.id] || "";
              const originalScore = existingGrades.find(g => g.student_id === student.id)?.score.toString() || "";
              const changed = currentScore !== originalScore;

              return (
                <TableRow
                  key={student.id}
                  className={cn(
                    "transition-colors group",
                    changed ? "bg-blue-50/20 dark:bg-blue-900/5" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  )}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {student.student_no}
                  </TableCell>
                  <TableCell className="font-medium">
                    {student.name}
                  </TableCell>
                  <TableCell>
                    <div className="relative pt-1 pb-1">
                      <Input
                        ref={el => { inputRefs.current[student.id] = el; }}
                        type="text"
                        value={currentScore}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        placeholder="--"
                        className={cn(
                          "w-32 bg-white dark:bg-zinc-900 text-center font-bold text-lg h-9 transition-all focus:ring-2 focus:ring-blue-500/20",
                          error && "border-destructive focus-visible:ring-destructive",
                          changed && "border-blue-200 dark:border-blue-900 shadow-sm"
                        )}
                      />
                      {error && (
                        <div className="absolute -bottom-3 left-0 text-[9px] text-destructive whitespace-nowrap bg-destructive/10 px-1 rounded">
                          {error}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {originalScore && !changed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteScore(student.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {changed ? (
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 gap-1 animate-pulse"
                        >
                          <Clock className="h-3 w-3" />
                          待保存
                        </Badge>
                      ) : originalScore ? (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 gap-1"
                        >
                          <Check className="h-3 w-3" />
                          已存
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-zinc-400 border-dashed gap-1 font-normal opacity-60"
                        >
                          <Edit3 className="h-3 w-3" />
                          待录入
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* 底部小提示 */}
      <div className="text-[11px] text-muted-foreground text-center">
        提示：使用 Enter 或方向键 ↑ ↓ 可快速切换学生进行录入。
      </div>
    </div>
  );
}
