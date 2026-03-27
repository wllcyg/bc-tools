"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function getUsers() {
  const supabase = await createClient();

  // 获取所有 Profile
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function updateUserProfile(id: string, updateData: { role?: string; is_active?: boolean }) {
  const supabase = await createClient();

  // 1. 验证操作者权限 (必须是 admin)
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) throw new Error("未登录");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (currentProfile?.role !== "admin") {
    throw new Error("权限不足，只有超级管理员可以执行此操作");
  }

  // 2. 执行更新
  const { data: updatedData, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Update profile error:", error);
    throw new Error(error.message);
  }

  // 如果没有返回数据，说明可能被 RLS 拦截了或记录未找到
  if (!updatedData || updatedData.length === 0) {
    throw new Error("更新失败：未找到记录或被数据库安全策略 (RLS) 拦截。请确保您拥有管理员权限，并已运行最新的 RLS 迁移脚本。");
  }

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}

