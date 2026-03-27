import { Suspense } from "react";
import { Search, Filter, MoreVertical, User, GraduationCap } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { StudentDialog } from "./_components/student-dialog";
import { ImportStudentsDialog } from "./_components/import-students-dialog";
import { DeleteButton } from "@/components/common/delete-button";
import { deleteStudent } from "./actions";

async function StudentsList({ classes }: { classes: any[] }) {
  const supabase = await createClient();

  // 级联查询班级信息
  const { data: students, error } = await supabase
    .from("students")
    .select(`
      *,
      classes (
        name,
        grade
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="text-destructive font-medium p-4">加载失败: {error.message}</div>;
  }

  if (!students || students.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground bg-white/50 backdrop-blur-sm dark:bg-zinc-950/50">
        <GraduationCap className="h-10 w-10 mb-2 opacity-20" />
        <p>暂无学生数据</p>
        <StudentDialog classes={classes} trigger={<Button variant="link">添加第一位学生</Button>} />
      </div>
    );
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "在读", color: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400" },
    leave: { label: "请假", color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400" },
    suspended: { label: "休学", color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400" },
    graduated: { label: "毕业", color: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400" },
    dropped: { label: "退学", color: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400" },
  };

  return (
    <div className="rounded-xl border bg-white/50 backdrop-blur-sm overflow-hidden dark:bg-zinc-950/50 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[120px]">学号</TableHead>
            <TableHead>姓名</TableHead>
            <TableHead>性别</TableHead>
            <TableHead>班级</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>联系人</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id} className="group transition-colors">
              <TableCell className="font-mono text-xs text-muted-foreground">{student.student_no}</TableCell>
              <TableCell className="font-bold">{student.name}</TableCell>
              <TableCell>{student.gender}</TableCell>
              <TableCell>
                {student.classes ? (
                  <span className="text-sm font-medium">
                    {student.classes.grade} {student.classes.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs italic">未分配</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusMap[student.status]?.color || ""}>
                  {statusMap[student.status]?.label || student.status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                <div className="flex flex-col">
                  <span>{student.parent_name}</span>
                  <span>{student.parent_phone}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <StudentDialog
                    student={student}
                    classes={classes}
                    trigger={<Button variant="ghost" size="sm">编辑</Button>}
                  />
                  <DeleteButton
                    onDelete={async () => {
                      "use server";
                      await deleteStudent(student.id);
                    }}
                    title="确定删除学生？"
                    description={`删除学生 ${student.name} (${student.student_no}) 将清除其所有关联数据。`}
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
  return <Skeleton className="h-[400px] w-full rounded-xl" />;
}

export default async function StudentsPage() {
  const supabase = await createClient();
  
  // 获取班级列表供 Dialog 使用
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, grade")
    .order("grade")
    .order("name");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">学生管理</h1>
          <p className="text-muted-foreground mt-1">维护全校学生档案、学籍状态及家长联系信息。</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportStudentsDialog classes={classes || []} />
          <StudentDialog classes={classes || []} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="输入学生姓名或学号..." className="pl-10 h-10 border-zinc-200 focus:bg-white transition-all dark:border-zinc-800 shadow-sm" />
        </div>
        <Button variant="outline" className="h-10 border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:bg-zinc-50">
          <Filter className="mr-2 h-4 w-4" />
          多条件筛选
        </Button>
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <StudentsList classes={classes || []} />
      </Suspense>
    </div>
  );
}
