"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { successResponse, errorResponse } from "@/lib/actions-utils";
import { z } from "zod";

const gradeSchema = z.object({
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  exam_id: z.string().uuid(),
  score: z.number().min(0).max(150),
});

const gradesSchema = z.array(gradeSchema);

export async function saveGrades(rawGrades: any[]) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse("未登录");

    // 1. 过滤和转换数据
    const validGrades = rawGrades.filter(g => !isNaN(g.score) && g.score !== null);
    const validated = gradesSchema.parse(validGrades);
    
    const toDelete = rawGrades.filter(g => isNaN(g.score) || g.score === null);

    // 2. 执行删除
    if (toDelete.length > 0) {
      await Promise.all(toDelete.map(record => 
        supabase
          .from("grades")
          .delete()
          .eq("exam_id", record.exam_id)
          .eq("student_id", record.student_id)
          .eq("course_id", record.course_id)
      ));
    }

    // 3. 执行 Upsert
    if (validated.length > 0) {
      const toUpsert = validated.map(g => ({
        ...g,
        entered_by: user.id,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from("grades")
        .upsert(toUpsert, { 
          onConflict: 'exam_id,student_id,course_id' 
        });

      if (error) throw new Error(error.message);

      // 4. 模拟审计日志 (建议在数据库侧通过 Trigger 实现)
      console.log(`[AUDIT] User ${user.email} updated ${validated.length} grade records at ${new Date().toISOString()}`);
      
      // 如果有 audit_logs 表，可以增加如下逻辑:
      // await supabase.from("audit_logs").insert([...]);
    }

    revalidatePath("/grades");
    return successResponse({ count: validated.length });
  } catch (err: any) {
    console.error("Save grades error:", err);
    return errorResponse(err instanceof z.ZodError ? err.issues[0].message : err.message);
  }
}

export async function deleteGrade(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("grades").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/grades");
    return successResponse(null);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
