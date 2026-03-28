"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
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
import { createClass, updateClass } from "../actions";

const classSchema = z.object({
  name: z.string().min(1, "班级名称不能为空"),
  grade: z.string().min(1, "请选择年级"),
  teacher_id: z.string().optional().nullable(),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface ClassDialogProps {
  className?: any;
  classObj?: any;
  teachers: any[];
  existingGrades?: string[];
  trigger?: React.ReactNode;
}

export function ClassDialog({ classObj, teachers, existingGrades = [], trigger }: ClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 标准年级列表
  const standardGrades = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级", "初一", "初二", "初三", "高一", "高二", "高三"];
  
  // 合并标准年级和数据库中的年级，去重
  const allGrades = Array.from(new Set([...standardGrades, ...existingGrades])).sort((a, b) => {
    const getOrder = (g: string) => {
      const idx = standardGrades.indexOf(g);
      return idx === -1 ? 999 : idx;
    };
    return getOrder(a) - getOrder(b);
  });

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: classObj?.name || "",
      grade: classObj?.grade || "初一",
      teacher_id: classObj?.teacher_id || null,
    },
  });

  async function onSubmit(values: ClassFormValues) {
    setLoading(true);
    try {
      // 转换 "none" 为 null
      const processedValues = {
        ...values,
        teacher_id: values.teacher_id === "none" ? null : values.teacher_id,
      };

      if (classObj) {
        await updateClass(classObj.id, processedValues);
      } else {
        await createClass(processedValues);
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
        {trigger || <Button>新建班级</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{classObj ? "编辑班级" : "创建新班级"}</DialogTitle>
              <DialogDescription>
                填写班级名称并指定年级与班主任。
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>班级名称</FormLabel>
                    <FormControl>
                      <Input placeholder="1 班" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年级</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择年级" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allGrades.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
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
                name="teacher_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>班主任</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择班主任（可选）" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">暂无</SelectItem>
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name} ({t.subject})
                          </SelectItem>
                        ))}
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
                {classObj ? "保存修改" : "确认创建"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
