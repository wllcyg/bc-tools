"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type ExamFormData = {
  name: string;
  exam_type: '期中' | '期末' | '月考';
  semester: string;
  exam_date?: string;
  course_ids?: string[];
};

export async function createExam(formData: ExamFormData) {
  const supabase = await createClient();
  const { course_ids, ...examData } = formData;

  const { data, error } = await supabase
    .from("exams")
    .insert([examData])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // 关联课程
  if (course_ids && course_ids.length > 0) {
    const examCourses = course_ids.map(course_id => ({
      exam_id: data.id,
      course_id
    }));
    const { error: ecError } = await supabase.from("exam_courses").insert(examCourses);
    if (ecError) throw new Error(ecError.message);
  }

  revalidatePath("/exams");
  return data;
}

export async function updateExam(id: string, formData: Partial<ExamFormData>) {
  const supabase = await createClient();
  const { course_ids, ...examData } = formData;

  const { data, error } = await supabase
    .from("exams")
    .update(examData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // 同步关联课程
  if (course_ids !== undefined) {
    // 先删除
    await supabase.from("exam_courses").delete().eq("exam_id", id);
    
    // 后插入
    if (course_ids.length > 0) {
      const examCourses = course_ids.map(course_id => ({
        exam_id: id,
        course_id
      }));
      const { error: ecError } = await supabase.from("exam_courses").insert(examCourses);
      if (ecError) throw new Error(ecError.message);
    }
  }

  revalidatePath("/exams");
  return data;
}

export async function deleteExam(id: string) {
  const supabase = await createClient();

  // 检查是否有成绩关联
  const { data: grades, error: checkError } = await supabase
    .from("grades")
    .select("id")
    .eq("exam_id", id)
    .limit(1);

  if (grades && grades.length > 0) {
    throw new Error("该考试场次已有成绩录入，无法删除。请先清除相关成绩。");
  }

  const { error } = await supabase.from("exams").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/exams");
}
