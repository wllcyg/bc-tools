"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function createClass(formData: {
  name: string;
  grade: string;
  teacher_id?: string | null;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .insert([formData])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/classes");
  return data;
}

export async function updateClass(id: string, formData: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/classes");
  return data;
}

export async function deleteClass(id: string) {
  const supabase = await createClient();

  // 检查是否有学生在该班级
  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", id)
    .limit(1);

  if (students && students.length > 0) {
    throw new Error("该班级尚有在读学生，无法删除。");
  }

  const { error } = await supabase.from("classes").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/classes");
}

export async function getUniqueGrades() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select("grade");

  if (error) throw new Error(error.message);

  // 获取去重后的年级列表并排序
  const uniqueGrades = Array.from(new Set(data.map((item: any) => item.grade))).sort();
  return uniqueGrades;
}
