import { Suspense } from "react";
import { BookOpen } from "lucide-react";
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
import { CourseDialog } from "./_components/course-dialog";
import { CourseFilters } from "./_components/course-filters";
import { DeleteButton } from "@/components/common/delete-button";
import { deleteCourse } from "./actions";

async function CoursesList({
  teachers,
  classes,
  keyword,
}: {
  teachers: any[];
  classes: any[];
  keyword?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select(`
      *,
      teachers (
        name
      ),
      course_classes (
        class_id,
        classes (
          id,
          name,
          grade
        )
      )
    `);

  if (keyword) {
    query = query.or(`name.ilike.%${keyword}%,code.ilike.%${keyword}%`);
  }

  const { data: courses, error } = await query.order("name", { ascending: true });

  if (error) {
    return (
      <div className="text-destructive font-medium p-4">
        加载失败: {error.message}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
        <BookOpen className="h-10 w-10 mb-3 opacity-30" />
        <p>{keyword ? "未找到符合条件的课程" : "暂无课程信息"}</p>
        {!keyword && (
          <CourseDialog
            teachers={teachers}
            classes={classes}
            trigger={
              <Button variant="link" className="mt-2">
                立即添加第一门课程
              </Button>
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white/50 backdrop-blur-sm overflow-hidden dark:bg-zinc-950/50 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>课程名称</TableHead>
            <TableHead>课程编码</TableHead>
            <TableHead>任课教师</TableHead>
            <TableHead>分值标准</TableHead>
            <TableHead>开课班级</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => {
            const linkedClasses = course.course_classes
              ?.map((cc: any) => cc.classes)
              .filter(Boolean) ?? [];

            return (
              <TableRow key={course.id}>
                <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">
                  {course.name}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {course.code}
                </TableCell>
                <TableCell>
                  {course.teachers?.name || (
                    <span className="text-muted-foreground italic">未指定</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground w-8">满分:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">{course.max_score}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground w-8">及格:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{course.pass_score}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground w-8">优秀:</span>
                      <span className="font-bold text-blue-700 dark:text-blue-400">{course.excellent_score}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {linkedClasses.length === 0 ? (
                    <span className="text-muted-foreground italic text-sm">
                      未关联
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {linkedClasses.slice(0, 3).map((cls: any) => (
                        <Badge
                          key={cls.id}
                          variant="secondary"
                          className="text-xs bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400"
                        >
                          {cls.grade}
                          {cls.name}
                        </Badge>
                      ))}
                      {linkedClasses.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{linkedClasses.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <CourseDialog
                      courseObj={{
                        ...course,
                        course_classes: course.course_classes,
                      }}
                      teachers={teachers}
                      classes={classes}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:text-primary"
                        >
                          编辑
                        </Button>
                      }
                    />
                    <DeleteButton
                      onDelete={async () => {
                        "use server";
                        await deleteCourse(course.id);
                      }}
                      title="确认删除课程？"
                      description={`确认删除课程「${course.name}」吗？如果已有关联的成绩记录，删除将被阻止。`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function CoursesSkeleton() {
  return <Skeleton className="h-64 w-full rounded-xl" />;
}

export default async function CoursesPage(props: {
  searchParams: Promise<{ keyword?: string }>
}) {
  const { keyword } = await props.searchParams;
  const supabase = await createClient();

  const [{ data: teachers }, { data: classes }] = await Promise.all([
    supabase.from("teachers").select("id, name, subject").order("name"),
    supabase
      .from("classes")
      .select("id, name, grade")
      .order("grade")
      .order("name"),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            课程管理
          </h1>
          <p className="text-muted-foreground mt-1">
            管理全校课程信息及各班级的开课设置。
          </p>
        </div>
        <CourseDialog 
          teachers={teachers || []} 
          classes={classes || []} 
        />
      </div>

      <CourseFilters />

      {/* List */}
      <Suspense key={keyword} fallback={<CoursesSkeleton />}>
        <CoursesList 
          teachers={teachers || []} 
          classes={classes || []} 
          keyword={keyword}
        />
      </Suspense>
    </div>
  );
}
