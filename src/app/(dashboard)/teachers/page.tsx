import { Suspense } from "react";
import { Phone } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeacherDialog } from "./_components/teacher-dialog";
import { TeacherFilters } from "./_components/teacher-filters";
import { DeleteButton } from "@/components/common/delete-button";
import { deleteTeacher } from "./actions";

async function TeachersList({ 
  keyword, 
  subject 
}: { 
  keyword?: string, 
  subject?: string 
}) {
  const supabase = await createClient();
  
  let query = supabase.from("teachers").select("*");

  if (keyword) {
    query = query.or(`name.ilike.%${keyword}%,teacher_no.ilike.%${keyword}%`);
  }

  if (subject && subject !== "all") {
    query = query.eq("subject", subject);
  }

  const { data: teachers, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return <div className="text-destructive font-medium p-4">加载失败: {error.message}</div>;
  }

  if (!teachers || teachers.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground bg-white/30 backdrop-blur-sm dark:bg-zinc-950/30">
        <p>{keyword || subject ? "未找到符合条件的教师" : "暂无教师信息"}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white/50 backdrop-blur-sm overflow-hidden dark:bg-zinc-950/50 shadow-sm border-zinc-200 dark:border-zinc-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
            <TableHead className="font-bold">教师姓名</TableHead>
            <TableHead className="font-bold">工号</TableHead>
            <TableHead className="font-bold">教授科目</TableHead>
            <TableHead className="font-bold">联系方式</TableHead>
            <TableHead className="text-right font-bold">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors">
              <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">
                {teacher.name}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground uppercase">{teacher.teacher_no}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-medium bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400">
                  {teacher.subject || "未设置"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Phone className="mr-1 h-3 w-3 opacity-50" /> {teacher.phone || "-"}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <TeacherDialog
                    teacher={teacher}
                    trigger={
                      <Button variant="ghost" size="sm" className="hover:text-primary text-xs h-8">编辑</Button>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ListSkeleton() {
  return <Skeleton className="h-64 w-full rounded-xl" />;
}

export default async function TeachersPage(props: {
  searchParams: Promise<{ keyword?: string, subject?: string }>
}) {
  const { keyword, subject } = await props.searchParams;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            教师管理
          </h1>
          <p className="text-muted-foreground mt-1">管理全校教职工信息及其任教科目。</p>
        </div>
        <TeacherDialog />
      </div>

      <TeacherFilters />

      <Suspense key={`${keyword}-${subject}`} fallback={<ListSkeleton />}>
        <TeachersList keyword={keyword} subject={subject} />
      </Suspense>
    </div>
  );
}
