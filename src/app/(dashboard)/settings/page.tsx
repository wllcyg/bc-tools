"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  UserCog,
  UserCheck,
  UserMinus,
  Mail,
  Calendar,
  Loader2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getUsers, updateUserProfile } from "./actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data || []);
    } catch (err: any) {
      toast.error("加载用户失败: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserProfile(userId, { role: newRole });
      toast.success("角色已更新");
      fetchUsers();
    } catch (err: any) {
      toast.error("更新失败: " + err.message);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserProfile(userId, { is_active: !currentStatus });
      toast.success(currentStatus ? "账号已禁用" : "账号已启用");
      fetchUsers();
    } catch (err: any) {
      toast.error("更新失败: " + err.message);
    }
  };

  const roleLabels: Record<string, string> = {
    admin: "超级管理员",
    edu_admin: "教务管理",
    teacher: "任课教师",
    student: "普通学生"
  };

  const roleColors: Record<string, string> = {
    admin: "bg-rose-100 text-rose-700 border-rose-200",
    edu_admin: "bg-amber-100 text-amber-700 border-amber-200",
    teacher: "bg-blue-100 text-blue-700 border-blue-200",
    student: "bg-zinc-100 text-zinc-700 border-zinc-200"
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">系统设置</h1>
        <p className="text-muted-foreground">管理系统用户、角色分配及账号状态。</p>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-white/70 backdrop-blur-md dark:bg-zinc-900/70">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-blue-600" />
              <CardTitle>用户权限管理</CardTitle>
            </div>
            <Badge variant="outline" className="font-medium">
              共 {users.length} 个账号
            </Badge>
          </div>
          <CardDescription>
            在这里您可以对所有注册账号进行角色授权或停用操作。请谨慎修改管理员权限。
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-800/50">
                  <TableRow>
                    <TableHead className="w-[250px] font-bold">基本信息</TableHead>
                    <TableHead className="font-bold">系统角色</TableHead>
                    <TableHead className="font-bold text-center">当前状态</TableHead>
                    <TableHead className="font-bold">更新于</TableHead>
                    <TableHead className="w-[160px] text-right font-bold">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-700">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                              {user.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                              {user.full_name || "未命名用户"}
                            </span>
                            <span className="text-xs text-zinc-400 font-medium">#{user.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(val) => handleRoleChange(user.id, val)}
                          disabled={user.role === "admin"}
                        >
                          <SelectTrigger className={`w-[140px] h-9 border-none font-semibold ${roleColors[user.role]} ${user.role === "admin" ? "opacity-70 cursor-not-allowed" : ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">超级管理员</SelectItem>
                            <SelectItem value="edu_admin">教务管理</SelectItem>
                            <SelectItem value="teacher">任课教师</SelectItem>
                            <SelectItem value="student">普通学生</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={user.is_active !== false ? "default" : "secondary"}
                          className={`rounded-full px-3 py-1 font-bold ${user.is_active !== false
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-zinc-100 text-zinc-400 border-zinc-200"
                            }`}
                        >
                          {user.is_active !== false ? (
                            <div className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3" /> 正常运行
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <UserMinus className="h-3 w-3" /> 已停用
                            </div>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-zinc-500">
                          {format(new Date(user.updated_at), "yyyy-MM-dd HH:mm", { locale: zhCN })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleStatusToggle(user.id, user.is_active !== false)}
                          disabled={user.role === "admin"}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${user.is_active !== false
                              ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
                            } ${user.role === "admin" ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                        >
                          {user.is_active !== false ? "停用账号" : "恢复启用"}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        未检索到用户数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
