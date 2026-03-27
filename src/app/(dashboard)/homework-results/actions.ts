"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getHomeworkResults(filters?: { student_id?: string, course_id?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("student_homework_results")
    .select(`
      *,
      students (name, student_no),
      courses (name)
    `)
    .order("record_date", { ascending: false });

  if (filters?.student_id) {
    query = query.eq("student_id", filters.student_id);
  }
  if (filters?.course_id) {
    query = query.eq("course_id", filters.course_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createHomeworkResult(formData: FormData) {
  const supabase = await createClient();
  
  const student_id = formData.get("student_id") as string;
  const course_id = formData.get("course_id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const record_date = formData.get("record_date") as string;
  const imageFile = formData.get("image") as File;

  console.log("Creating homework result:", { student_id, course_id, title, record_date, imageSize: imageFile?.size });

  let image_url = "";

  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop() || 'png';
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    // 直接存储在根目录，减少路径层级问题
    const filePath = `${fileName}`;

    console.log("Uploading image to storage:", filePath);

    const { error: uploadError } = await supabase.storage
      .from("homework-results")
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Storage Upload Error:", uploadError);
      throw new Error(`图片上传到存储空间失败: ${uploadError.message}。请确认 'homework-results' 存储桶已创建且为公开状态。`);
    }

    const { data: urlData } = supabase.storage
      .from("homework-results")
      .getPublicUrl(filePath);
    
    image_url = urlData.publicUrl;
    console.log("Image uploaded successfully, public URL:", image_url);
  }

  const { data: userData } = await supabase.auth.getUser();
  
  const { error: insertError } = await supabase.from("student_homework_results").insert({
    student_id,
    course_id,
    title,
    content,
    record_date,
    image_url,
    created_by: userData.user?.id
  });

  if (insertError) {
    console.error("Database Insert Error:", insertError);
    throw new Error(`数据库记录保存失败: ${insertError.message}`);
  }

  console.log("Homework result created successfully");
  revalidatePath("/homework-results");
  return { success: true };
}

export async function deleteHomeworkResult(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("student_homework_results").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/homework-results");
  return { success: true };
}
