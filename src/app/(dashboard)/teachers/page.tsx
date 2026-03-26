import { Suspense } from "react";
import { Plus, Search, Mail, Phone, Book } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TeacherDialog } from "./_components/teacher-dialog";
import { DeleteButton } from "@/components/common/delete-button";
import { deleteTeacher } from "./actions";

async function TeachersList() {
  const supabase = await createClient();
  
  const { data: teachers, error } = await supabase
    .from("teachers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="text-destructive font-medium p-4">加载失败: {error.message}</div>;
  }

  if (!teachers || teachers.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
        <p>暂无教师信息</p>
        <Button variant="link" className="mt-2">添加第一位教师</Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white/50 backdrop-blur-sm overflow-hidden dark:bg-zinc-950/50 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>教师姓名</TableHead>
            <TableHead>工号</TableHead>
            <TableHead>教授科目</TableHead>
            <TableHead>联系方式</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell className="font-bold">{teacher.name}</TableCell>
              <TableCell className="font-mono text-xs">{teacher.teacher_no}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-medium bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400">
                  {teacher.subject}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="mr-1 h-3 w-3" /> {teacher.phone}
                  </div>
                </div>
              </TableCell>
                <div className="flex items-center justify-end gap-1">
                  <TeacherDialog
                    teacher={teacher}
                    trigger={
                      <Button variant="ghost" size="sm">编辑</Button>
                    }
                  />
                  <DeleteButton
                    onDelete={async () => {
                      "use server";
                      await deleteTeacher(teacher.id);
                    }}
                    title="确定删除教师？"
                    description={`删除教师 ${teacher.name} 将无法撤销，请确保该教师未关联任何班级。`}
                  />
                </div>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ListSkeleton() {
  return <div className="rounded-xl border h-64 animate-pulse bg-muted/20" />;
}

export default function TeachersPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">教师管理</h1>
          <p className="text-muted-foreground mt-1">管理全校教职工信息及其任教科目。</p>
        </div>
        <TeacherDialog />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="输入教师姓名或工号查询..." className="pl-10 h-10" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 text-xs shadow-sm">全学科</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs shadow-sm">语文</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs shadow-sm">数学</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs shadow-sm">英语</Button>
        </div>
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <TeachersList />
      </Suspense>
    </div>
  );
}
