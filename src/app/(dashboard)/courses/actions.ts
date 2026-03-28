"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function createCourse(formData: {
  name: string;
  teacher_id?: string | null;
  max_score?: number;
  pass_score?: number;
  excellent_score?: number;
  class_ids?: string[];
}) {
  const supabase = await createClient();

  // 生成课程编码 C + 年份 + 4位随机
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  const code = `C${year}${random}`;

  const { class_ids, ...courseData } = formData;

  const { data, error } = await supabase
    .from("courses")
    .insert([{ ...courseData, code }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // 关联班级（如有选择）
  if (class_ids && class_ids.length > 0) {
    const relations = class_ids.map((class_id) => ({
      course_id: data.id,
      class_id,
    }));
    const { error: relError } = await supabase
      .from("course_classes")
      .insert(relations);
    if (relError) throw new Error(relError.message);
  }

  revalidatePath("/courses");
  return data;
}

export async function updateCourse(
  id: string,
  formData: {
    name?: string;
    teacher_id?: string | null;
    max_score?: number;
    pass_score?: number;
    excellent_score?: number;
    class_ids?: string[];
  }
) {
  const supabase = await createClient();

  const { class_ids, ...courseData } = formData;

  // 更新课程基本信息
  const { data, error } = await supabase
    .from("courses")
    .update(courseData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // 同步更新班级关联：先删除旧的，再插入新的
  const { error: delError } = await supabase
    .from("course_classes")
    .delete()
    .eq("course_id", id);
  if (delError) throw new Error(delError.message);

  if (class_ids && class_ids.length > 0) {
    const relations = class_ids.map((class_id) => ({
      course_id: id,
      class_id,
    }));
    const { error: relError } = await supabase
      .from("course_classes")
      .insert(relations);
    if (relError) throw new Error(relError.message);
  }

  revalidatePath("/courses");
  return data;
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();

  // 检查是否有成绩引用该课程
  const { data: grades } = await supabase
    .from("grades")
    .select("id")
    .eq("course_id", id)
    .limit(1);

  if (grades && grades.length > 0) {
    throw new Error("该课程已有关联成绩记录，无法删除。请先删除相关成绩。");
  }

  // course_classes 中间表已设置级联删除，无需手动处理
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/courses");
}
