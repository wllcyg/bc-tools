"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Calendar as CalendarIcon, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { createExam, updateExam } from "../actions";
import { toast } from "sonner";

const examSchema = z.object({
  name: z.string().min(1, "考试名称不能为空"),
  exam_type: z.enum(["期中", "期末", "月考"]),
  semester: z.string().min(1, "学期不能为空"),
  exam_date: z.date().optional(),
  course_ids: z.array(z.string()),
});

type ExamFormValues = z.infer<typeof examSchema>;

interface ExamDialogProps {
  examObj?: any;
  courses: any[];
  trigger?: React.ReactNode;
}

export function ExamDialog({ examObj, courses, trigger }: ExamDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 生成近三年的学期选项
  const currentYear = new Date().getFullYear();
  const semesters: string[] = [];
  for (let i = -1; i <= 1; i++) {
    const year = currentYear + i;
    semesters.push(`${year}-${year + 1}-1`);
    semesters.push(`${year}-${year + 1}-2`);
  }

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      name: examObj?.name || "",
      exam_type: examObj?.exam_type || "月考",
      semester: examObj?.semester || semesters[2],
      exam_date: examObj?.exam_date ? new Date(examObj.exam_date) : new Date(),
      course_ids: examObj?.course_ids || [],
    },
  });

  async function onSubmit(values: ExamFormValues) {
    setLoading(true);
    const toastId = toast.loading("处理中...");
    try {
      const formattedValues = {
        ...values,
        exam_date: values.exam_date ? format(values.exam_date, "yyyy-MM-dd") : undefined,
      };

      if (examObj) {
        await updateExam(examObj.id, formattedValues as any);
        toast.success("更新成功", { id: toastId });
      } else {
        await createExam(formattedValues as any);
        toast.success("创建成功", { id: toastId });
      }
      setOpen(false);
      if (!examObj) form.reset();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "操作失败", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <ClipboardList className="mr-2 h-4 w-4" />
            创建考试场次
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{examObj ? "编辑考试场次" : "创建新考试场次"}</DialogTitle>
              <DialogDescription>
                设置考试基础信息，并勾选本次考试包含的课程科目。
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>考试名称</FormLabel>
                    <FormControl>
                      <Input placeholder="如：2024秋季期中考试" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="exam_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>类型</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="月考">月考</SelectItem>
                          <SelectItem value="期中">期中</SelectItem>
                          <SelectItem value="期末">期末</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>所属学期</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择学期" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {semesters.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="exam_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>考试日期</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: zhCN })
                            ) : (
                              <span>选择日期</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 包含课程 (多选) */}
              <FormField
                control={form.control}
                name="course_ids"
                render={() => (
                  <FormItem>
                    <FormLabel>包含课程 (多选)</FormLabel>
                    <div className="grid grid-cols-2 gap-2 rounded-md border p-3 bg-muted/30">
                      {courses.length === 0 ? (
                        <p className="text-sm text-muted-foreground col-span-2 text-center py-2">
                          暂无课程，请先添加课程
                        </p>
                      ) : (
                        courses.map((course) => (
                          <FormField
                            key={course.id}
                            control={form.control}
                            name="course_ids"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(course.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, course.id]);
                                      } else {
                                        field.onChange(
                                          current.filter((id) => id !== course.id)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <span className="text-sm font-medium leading-none">
                                  {course.name}
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
                {examObj ? "保存修改" : "确认创建"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
