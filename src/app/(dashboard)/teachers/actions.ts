"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function createTeacher(formData: {
  name: string;
  subject: string;
  phone?: string;
  gender?: string;
}) {
  const supabase = await createClient();

  // 1. 生成工号 (T + 年份 + 4位随机)
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  const teacher_no = `T${year}${random}`;

  const { data, error } = await supabase
    .from("teachers")
    .insert([
      {
        ...formData,
        teacher_no,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/teachers");
  revalidatePath("/classes"); // 班级列表也可能受影响
  return data;
}

export async function updateTeacher(id: string, formData: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teachers")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/teachers");
  revalidatePath("/classes");
  return data;
}

export async function deleteTeacher(id: string) {
  const supabase = await createClient();

  // 检查是否有班级正在使用该老师
  const { data: classes } = await supabase
    .from("classes")
    .select("id")
    .eq("teacher_id", id);

  if (classes && classes.length > 0) {
    throw new Error("该教师正担任班主任，请先在相应班级中解除其职务。");
  }

  const { error } = await supabase.from("teachers").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/teachers");
  revalidatePath("/classes");
}
