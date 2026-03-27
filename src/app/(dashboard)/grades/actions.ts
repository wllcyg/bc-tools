"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type GradeEntry = {
  student_id: string;
  course_id: string;
  exam_id: string;
  score: number;
};

/**
 * 批量保存成绩
 * 使用 upsert 逻辑：如果已存在则更新，不存在则插入
 */
export async function saveGrades(grades: GradeEntry[]) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("未登录");

  // 分离需要更新的和需要删除的记录
  const toUpsert = grades
    .filter(g => !isNaN(g.score) && g.score !== null)
    .map(g => ({
      ...g,
      entered_by: user.id,
      updated_at: new Date().toISOString()
    }));

  const toDelete = grades.filter(g => isNaN(g.score) || g.score === null);

  // 执行删除操作
  if (toDelete.length > 0) {
    for (const record of toDelete) {
      await supabase
        .from("grades")
        .delete()
        .eq("exam_id", record.exam_id)
        .eq("student_id", record.student_id)
        .eq("course_id", record.course_id);
    }
  }

  // 执行保存/更新操作
  if (toUpsert.length > 0) {
    const { error } = await supabase
      .from("grades")
      .upsert(toUpsert, { 
        onConflict: 'exam_id,student_id,course_id' 
      });

    if (error) {
      console.error("Save grades error:", error);
      throw new Error(error.message);
    }
  }

  revalidatePath("/grades");
  return { success: true };
}

export async function deleteGrade(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("grades").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/grades");
}
