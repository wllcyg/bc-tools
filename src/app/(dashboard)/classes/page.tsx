import { Suspense } from "react";
import { Search, Filter } from "lucide-react";
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
import { ClassDialog } from "./_components/class-dialog";
import { DeleteButton } from "@/components/common/delete-button";
import { deleteClass } from "./actions";

async function ClassesList({ teachers }: { teachers: any[] }) {
  const supabase = await createClient();
  
  // 级联查询班主任信息
  const { data: classes, error } = await supabase
    .from("classes")
    .select(`
      *,
      teachers (
        name
      )
    `)
    .order("grade", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return <div className="text-destructive font-medium p-4">加载失败: {error.message}</div>;
  }

  if (!classes || classes.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
        <p>暂无班级信息</p>
        <ClassDialog teachers={teachers} trigger={<Button variant="link" className="mt-2">立即添加第一个班级</Button>} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white/50 backdrop-blur-sm overflow-hidden dark:bg-zinc-950/50 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>班级名称</TableHead>
            <TableHead>年级</TableHead>
            <TableHead>班主任</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((cls) => (
            <TableRow key={cls.id}>
              <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">{cls.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30">
                  {cls.grade}
                </Badge>
              </TableCell>
              <TableCell>{cls.teachers?.name || <span className="text-muted-foreground italic">未指定</span>}</TableCell>
              <TableCell className="text-zinc-500 text-xs text-nowrap">
                {new Date(cls.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <ClassDialog
                    classObj={cls}
                    teachers={teachers}
                    trigger={<Button variant="ghost" size="sm" className="hover:text-primary">编辑</Button>}
                  />
                  <DeleteButton
                    onDelete={async () => {
                      "use server";
                      await deleteClass(cls.id);
                    }}
                    title="确认删除班级？"
                    description={`确认删除 ${cls.grade}${cls.name} 吗？如果该班级下已有学生，删除操作将被阻止。`}
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

function ClassesSkeleton() {
  return <div className="rounded-xl border h-64 animate-pulse bg-muted/20" />;
}

export default async function ClassesPage() {
  const supabase = await createClient();
  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, name, subject")
    .order("name");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">班级管理</h1>
          <p className="text-muted-foreground mt-1">创建和维护学校所有教学班级及班主任分配。</p>
        </div>
        <ClassDialog teachers={teachers || []} />
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="输入班级名称搜索..." className="pl-10 h-10 border-zinc-200 focus:bg-white transition-all dark:border-zinc-800" />
        </div>
        <Button variant="outline" className="h-10 border-zinc-200 dark:border-zinc-800">
          <Filter className="mr-2 h-4 w-4" />
          年级筛选
        </Button>
      </div>

      {/* List Section */}
      <Suspense fallback={<ClassesSkeleton />}>
        <ClassesList teachers={teachers || []} />
      </Suspense>
    </div>
  );
}
