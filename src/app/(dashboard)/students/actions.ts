"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

import { successResponse, errorResponse } from "@/lib/actions-utils";
import { z } from "zod";

const studentSchema = z.object({
  name: z.string().min(1, "名称必填"),
  gender: z.string().min(1, "性别必填"),
  birth_date: z.string().min(1, "出生日期必填"),
  class_id: z.string().min(1, "班级必填"),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  status: z.string().default("在校"),
});

export async function createStudent(rawFormData: any) {
  try {
    // 1. 服务端校验
    const validated = studentSchema.parse(rawFormData);
    const supabase = await createClient();

    // 2. 生成学号 S + YEAR + 4位序列 (e.g., S20260001)
    const year = new Date().getFullYear();
    const prefix = `S${year}`;

    const { data: lastStudent } = await supabase
      .from("students")
      .select("student_no")
      .like("student_no", `${prefix}%`)
      .order("student_no", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextSeq = 1;
    if (lastStudent) {
      const lastSeq = parseInt(lastStudent.student_no.replace(prefix, ""));
      nextSeq = lastSeq + 1;
    }
    const student_no = `${prefix}${nextSeq.toString().padStart(4, "0")}`;

    // 3. 插入数据
    const { data, error } = await supabase
      .from("students")
      .insert([{ ...validated, student_no }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/students");
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err instanceof z.ZodError ? err.issues[0].message : err.message);
  }
}

export async function updateStudent(id: string, formData: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/students");
  return data;
}

export async function deleteStudent(id: string) {
  const supabase = await createClient();

  // 检查是否有成绩关联（Phase 3 之后需要）
  const { data: grades } = await supabase
    .from("grades")
    .select("id")
    .eq("student_id", id)
    .limit(1);

  if (grades && grades.length > 0) {
    throw new Error("该学生已有成绩记录，无法删除。如需注销请修改状态为“毕业”或“休学”。");
  }

  const { error } = await supabase.from("students").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/students");
}

export async function bulkCreateStudents(students: any[]) {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  const prefix = `S${year}`;

  // 1. 获取当前年份最高学号
  const { data: lastStudent } = await supabase
    .from("students")
    .select("student_no")
    .like("student_no", `${prefix}%`)
    .order("student_no", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextSeq = 1;
  if (lastStudent) {
    const lastSeq = parseInt(lastStudent.student_no.replace(prefix, ""));
    nextSeq = lastSeq + 1;
  }

  // 2. 批量生成学号并准备插入数据
  const studentsToInsert = students.map((s, index) => ({
    ...s,
    student_no: `${prefix}${(nextSeq + index).toString().padStart(4, "0")}`,
  }));

  // 3. 批量插入
  const { data, error } = await supabase
    .from("students")
    .insert(studentsToInsert)
    .select();

  if (error) throw new Error(error.message);

  revalidatePath("/students");
  return data;
}

export async function getStudentGrades(studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grades")
    .select(`
      *,
      exams (
        name,
        exam_date
      ),
      courses (
        name,
        max_score
      )
    `)
    .eq("student_id", studentId);

  if (error) throw new Error(error.message);
  
  // 按考试日期和课程名称排序
  return (data || []).sort((a: any, b: any) => {
    const dateA = new Date(a.exams?.exam_date || 0).getTime();
    const dateB = new Date(b.exams?.exam_date || 0).getTime();
    if (dateA !== dateB) return dateB - dateA;
    return (a.courses?.name || "").localeCompare(b.courses?.name || "");
  });
}
