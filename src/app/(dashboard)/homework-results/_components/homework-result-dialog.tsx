"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  Upload,
  Loader2,
  Calendar as CalendarIcon,
  Plus,
} from "lucide-react";
import { createHomeworkResult } from "../actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { useDropzone } from "react-dropzone";

interface Student {
  id: string;
  name: string;
  student_no: string;
}

interface Course {
  id: string;
  name: string;
}

interface HomeworkResultDialogProps {
  students: Student[];
  courses: Course[];
  trigger?: React.ReactNode;
  defaultStudentId?: string;
}

export function HomeworkResultDialog({
  students,
  courses,
  trigger,
  defaultStudentId,
}: HomeworkResultDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setMounted(true);
    setCurrentDate(format(new Date(), "yyyy-MM-dd"));
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFilePicker,
  } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    noClick: false,
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    if (!imageFile) {
      toast.error("请上传成果照片");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("image", imageFile);

    try {
      const result = await createHomeworkResult(formData);
      if (result.success) {
        toast.success("记录发布成功");
        setOpen(false);
        resetForm();
      }
    } catch (error: unknown) {
      console.error("Submit error:", error);
      const message = error instanceof Error ? error.message : "操作失败";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  if (!mounted) {
    return (
      <div className="h-11 w-[140px] flex items-center justify-center rounded-xl bg-zinc-100 animate-pulse" />
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className="h-10 px-6 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" />
            记录作业
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-3xl border-none shadow-2xl p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="p-8 pb-4 text-left">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              记录作业
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              为学生建立作业档案，上传照片并记录点评。
            </DialogDescription>
          </DialogHeader>

          <div className="px-8 py-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="student_id"
                  className="text-sm font-semibold text-zinc-700"
                >
                  关联学生
                </Label>
                <Select name="student_id" required defaultValue={defaultStudentId}>
                  <SelectTrigger
                    id="student_id"
                    className="rounded-xl bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
                  >
                    <SelectValue placeholder="选择学生" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl overflow-hidden">
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.student_no})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="course_id"
                  className="text-sm font-semibold text-zinc-700"
                >
                  课程科目
                </Label>
                <Select name="course_id" required>
                  <SelectTrigger
                    id="course_id"
                    className="rounded-xl bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
                  >
                    <SelectValue placeholder="选择课程" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-zinc-700"
              >
                标题 / 主题
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="例如：第一单元书法临摹成果"
                className="rounded-xl bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="record_date"
                className="text-sm font-semibold text-zinc-700"
              >
                记录日期
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  id="record_date"
                  name="record_date"
                  defaultValue={currentDate}
                  className="rounded-xl bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 pl-10"
                  required
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="content"
                className="text-sm font-semibold text-zinc-700"
              >
                作业说明 / 教师点评
              </Label>
              <Textarea
                id="content"
                name="content"
                placeholder="详细记录学生的表现、亮点或改进建议..."
                className="rounded-xl bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">
                成果照片 <span className="text-red-500">*</span>
              </Label>
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-3xl transition-all group overflow-hidden cursor-pointer ${isDragActive
                  ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 bg-zinc-50/50 dark:bg-zinc-900/50"
                  }`}
              >
                <input {...getInputProps()} />

                {imagePreview ? (
                  <div className="relative aspect-video w-full group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFilePicker();
                        }}
                        className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors cursor-pointer"
                      >
                        <Upload className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        className="p-3 bg-red-500/20 backdrop-blur-md rounded-full text-red-100 hover:bg-red-500/40 transition-colors"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-6 w-full pointer-events-none">
                    <div
                      className={`p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-transform duration-300 ${isDragActive ? "scale-110" : "group-hover:scale-110"}`}
                    >
                      <Upload className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                        {isDragActive
                          ? "松开以上传图片"
                          : "点击或拖拽上传作品图片"}
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">
                        支持 JPG, PNG, WEBP (最大 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl h-11 px-8 text-zinc-500"
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="rounded-xl h-11 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl transition-all active:scale-95 border-0"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在保存...
                </>
              ) : (
                "确认发布"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
