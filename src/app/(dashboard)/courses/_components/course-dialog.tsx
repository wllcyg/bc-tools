"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCourse, updateCourse } from "../actions";

const courseSchema = z.object({
  name: z.string().min(1, "课程名称不能为空"),
  teacher_id: z.string().optional().nullable(),
  max_score: z
    .number({ invalid_type_error: "请输入有效数字" })
    .min(1, "满分不能为空")
    .default(100),
  class_ids: z.array(z.string()).optional().default([]),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseDialogProps {
  courseObj?: any;
  teachers: any[];
  classes: any[];
  trigger?: React.ReactNode;
}

export function CourseDialog({
  courseObj,
  teachers,
  classes,
  trigger,
}: CourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: courseObj?.name || "",
      teacher_id: courseObj?.teacher_id || null,
      max_score: courseObj?.max_score ?? 100,
      class_ids: courseObj?.course_classes?.map((cc: any) => cc.class_id) || [],
    },
  });

  async function onSubmit(values: CourseFormValues) {
    setLoading(true);
    try {
      const processed = {
        ...values,
        teacher_id: values.teacher_id === "none" ? null : values.teacher_id,
      };
      if (courseObj) {
        await updateCourse(courseObj.id, processed);
      } else {
        await createCourse(processed);
      }
      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "操作失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <BookOpen className="mr-2 h-4 w-4" />
            新建课程
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{courseObj ? "编辑课程" : "创建新课程"}</DialogTitle>
              <DialogDescription>
                填写课程信息并选择开课班级。
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              {/* 课程名称 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>课程名称</FormLabel>
                    <FormControl>
                      <Input placeholder="如：语文、数学、英语" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 任课教师 */}
              <FormField
                control={form.control}
                name="teacher_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>任课教师</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择任课教师（可选）" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">暂无</SelectItem>
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                            {t.subject ? ` (${t.subject})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 满分 */}
              <FormField
                control={form.control}
                name="max_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>满分</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="默认 100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 关联班级（多选 Checkbox） */}
              <FormField
                control={form.control}
                name="class_ids"
                render={() => (
                  <FormItem>
                    <FormLabel>开课班级</FormLabel>
                    <div className="grid grid-cols-2 gap-2 rounded-md border p-3 bg-muted/30">
                      {classes.length === 0 ? (
                        <p className="text-sm text-muted-foreground col-span-2 text-center py-2">
                          暂无班级，请先添加班级
                        </p>
                      ) : (
                        classes.map((cls) => (
                          <FormField
                            key={cls.id}
                            control={form.control}
                            name="class_ids"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(cls.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, cls.id]);
                                      } else {
                                        field.onChange(
                                          current.filter((id) => id !== cls.id)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <span className="text-sm font-medium leading-none">
                                  {cls.grade}
                                  {cls.name}
                                </span>
                              </FormItem>
                            )}
                          />
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {courseObj ? "保存修改" : "确认创建"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
