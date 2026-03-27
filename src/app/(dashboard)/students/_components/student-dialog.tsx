"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns/format";
import { zhCN } from "date-fns/locale/zh-CN";
import { cn } from "@/utils/cn";
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
import { createStudent, updateStudent } from "../actions";

const studentSchema = z.object({
  name: z.string().min(1, "学生姓名不能为空"),
  gender: z.enum(["男", "女"]),
  birth_date: z.string().min(1, "请选择出生日期"),
  class_id: z.string().min(1, "请选择所在班级"),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  status: z.enum(["active", "leave", "suspended", "graduated", "dropped"]),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentDialogProps {
  student?: any;
  classes: any[];
  trigger?: React.ReactNode;
}

export function StudentDialog({ student, classes, trigger }: StudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.name || "",
      gender: student?.gender || "男",
      birth_date: student?.birth_date || "",
      class_id: student?.class_id || "",
      parent_name: student?.parent_name || "",
      parent_phone: student?.parent_phone || "",
      status: student?.status || "active",
    },
  });

  async function onSubmit(values: StudentFormValues) {
    setLoading(true);
    try {
      if (student) {
        await updateStudent(student.id, values);
      } else {
        await createStudent(values);
      }
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>添加学生</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{student ? "编辑学生信息" : "添加新学生"}</DialogTitle>
              <DialogDescription>
                填写学生的基本信息、出生日期及班级归属。
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl>
                      <Input placeholder="张三" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>性别</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择性别" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="男">男</SelectItem>
                        <SelectItem value="女">女</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>出生日期</FormLabel>
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
                              format(new Date(field.value), "PPP", { locale: zhCN })
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
                          locale={zhCN}
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date: Date | undefined) => field.onChange(date?.toISOString())}
                          disabled={(date: Date | undefined) =>
                            date && (date > new Date() || date < new Date("1900-01-01"))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="class_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所在班级</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择班级" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.grade} {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parent_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>家长姓名</FormLabel>
                    <FormControl>
                      <Input placeholder="家长姓名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parent_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>家长联系电话</FormLabel>
                    <FormControl>
                      <Input placeholder="联系电话" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>状态</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择状态" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">在读/在校</SelectItem>
                        <SelectItem value="leave">请假</SelectItem>
                        <SelectItem value="suspended">休学</SelectItem>
                        <SelectItem value="graduated">毕业</SelectItem>
                        <SelectItem value="dropped">退学</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {student ? "保存修改" : "确认添加"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
