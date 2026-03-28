"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Shield, Calendar, User as UserIcon, KeyRound, UploadCloud, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/use-profile";
import { updateProfile, updatePassword, uploadAvatar, sendResetPasswordEmail } from "./actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const roleMap: Record<string, { label: string; color: string; icon: any }> = {
    admin: { label: "超级管理员", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400", icon: Shield },
    edu_admin: { label: "教务管理员", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400", icon: KeyRound },
    teacher: { label: "教师", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400", icon: UserIcon },
    student: { label: "学生", color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/10 dark:text-slate-400", icon: UserIcon },
  };

  const currentRole = roleMap[profile?.role || "student"];

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      toast.error("用户名不能为空");
      return;
    }

    setUpdating(true);
    try {
      await updateProfile({ full_name: fullName });
      toast.success("个人信息已更新");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "更新失败");
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("请选择图片文件");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("图片大小不能超过 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const result = await uploadAvatar(formData);
      if (result.success) {
        setAvatarUrl(result.url || "");
        toast.success("头像上传成功");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "头像上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("请填写所有密码字段");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("两次输入的新密码不一致");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("新密码至少需要6个字符");
      return;
    }

    setChangingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast.success("密码已更新");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "密码更新失败");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!profile?.email) return;

    setSendingReset(true);
    try {
      await sendResetPasswordEmail(profile.email);
      toast.success("重置邮件已发送，请查收您的邮箱");
    } catch (error: any) {
      toast.error(error.message || "发送失败");
    } finally {
      setSendingReset(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">个人设置</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">管理您的账号信息、头像及安全首选项</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("px-3 py-1 text-xs font-medium border shadow-none", currentRole?.color)}>
            {currentRole && <currentRole.icon className="mr-1.5 h-3.5 w-3.5" />}
            {currentRole?.label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardContent className="pt-8 flex flex-col items-center">
              <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-32 w-32 ring-4 ring-white dark:ring-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                  <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-3xl">
                    {fullName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <UploadCloud className="h-6 w-6 text-white mb-1" />
                  <span className="text-[10px] text-white font-medium uppercase tracking-wider">更换头像</span>
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/80 z-10">
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
              
              <div className="text-center w-full pb-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{fullName || "未设置名称"}</h3>
                <p className="text-sm text-slate-500 mt-1">{profile?.email}</p>
              </div>

              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> 注册时间
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">2024.03.28</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Shield className="h-4 w-4" /> 账号状态
                  </span>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400 font-medium">运行正常</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-900/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">提示</p>
                  <p className="text-xs text-blue-800/70 dark:text-blue-300/60 leading-relaxed">
                    定期更换密码并完善个人信息可以有效提升账号的安全系数。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
              <CardTitle className="text-lg font-bold">基本信息</CardTitle>
              <CardDescription>更新您的姓名及公开头像</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="fullName" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">用户名</Label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="请输入真实姓名或昵称"
                    className="pl-10 h-11 bg-slate-50/50 focus:bg-white dark:bg-slate-950/50 transition-all border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="px-8 h-10 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  保存个人信息
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-6 border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-bold">账号安全</CardTitle>
              <CardDescription>管理登录凭据及密码安全</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 dark:border-blue-900/20 dark:bg-blue-900/5 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-bold text-sm flex items-center justify-center sm:justify-start gap-2 text-slate-900 dark:text-white">
                    <Mail className="h-4 w-4 text-blue-600" />
                    邮箱安全重置
                  </h4>
                  <p className="text-xs text-slate-500">我们将向您的邮箱发送重置链接，这通常是最安全的找回方式。</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleSendResetEmail}
                  disabled={sendingReset}
                  className="font-bold h-9 px-6 text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/20"
                >
                  {sendingReset ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "发送重置邮件"}
                </Button>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">修改登录密码</h4>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 mb-6 max-w-md">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword" className="text-xs font-medium text-slate-500">当前密码</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 border-slate-200 dark:border-slate-800 bg-slate-50/30"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword" className="text-xs font-medium text-slate-500">新密码</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="新登录密码"
                      className="h-10 border-slate-200 dark:border-slate-800 bg-slate-50/30"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-500">确认新密码</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="重复输入新密码"
                      className="h-10 border-slate-200 dark:border-slate-800 bg-slate-50/30"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="font-bold px-8 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  更新密码
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
