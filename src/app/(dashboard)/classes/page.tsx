import { Suspense } from "react";
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
import { ClassDialog } from "./_components/class-dialog";
import { ClassFilters } from "./_components/class-filters";
import { DeleteButton } from "@/components/common/delete-button";
import { deleteClass, getUniqueGrades } from "./actions";

async function ClassesList({ 
  teachers, 
  keyword, 
  grade,
  existingGrades
}: { 
  teachers: { id: string, name: string, subject: string | null }[], 
  keyword?: string, 
  grade?: string,
  existingGrades?: string[]
}) {
  const supabase = await createClient();
  
  // 构建查询
  let query = supabase
    .from("classes")
    .select(`
      *,
      teachers (
        name
      )
    `);

  if (keyword) {
    query = query.ilike("name", `%${keyword}%`);
  }

  if (grade && grade !== "all") {
    query = query.eq("grade", grade);
  }

  const { data: classes, error } = await query
    .order("grade", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return <div className="text-destructive font-medium p-4">加载失败: {error.message}</div>;
  }

  if (!classes || classes.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
        <p>{keyword || grade ? "未找到符合条件的班级" : "暂无班级信息"}</p>
        {!keyword && !grade && (
          <ClassDialog teachers={teachers} trigger={<Button variant="link" className="mt-2">立即添加第一个班级</Button>} />
        )}
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
                    existingGrades={existingGrades}
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
  return <Skeleton className="h-64 w-full rounded-xl" />;
}

export default async function ClassesPage(props: {
  searchParams: Promise<{ keyword?: string, grade?: string }>
}) {
  const { keyword, grade } = await props.searchParams;
  const supabase = await createClient();
  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, name, subject")
    .order("name");

  const uniqueGrades = (await getUniqueGrades()) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">班级管理</h1>
          <p className="text-muted-foreground mt-1">创建和维护学校所有教学班级及班主任分配。</p>
        </div>
        <ClassDialog teachers={teachers || []} existingGrades={uniqueGrades} />
      </div>

      <ClassFilters grades={uniqueGrades} />

      <Suspense key={`${keyword}-${grade}`} fallback={<ClassesSkeleton />}>
        <ClassesList 
          teachers={teachers || []} 
          keyword={keyword} 
          grade={grade} 
          existingGrades={uniqueGrades}
        />
      </Suspense>
    </div>
  );
}
