"use client";

import { useRouter } from "next/navigation";
import { Bell, Search, LogOut, User as UserIcon, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const supabase = createClient();

  // 角色翻译映射
  const roleMap: Record<string, { label: string; color: string }> = {
    admin: { label: "超级管理员", color: "bg-red-500/10 text-red-600 border-red-200" },
    edu_admin: { label: "教务管理员", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
    teacher: { label: "教师", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
    student: { label: "学生", color: "bg-zinc-500/10 text-zinc-600 border-zinc-200" },
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-white/80 px-4 backdrop-blur-md dark:bg-zinc-950/80">
      <div className="ml-64 flex w-full items-center justify-between">
        {/* Search */}
        <div className="relative w-96 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="搜索学生、老师或课程..." 
            className="pl-10 focus-visible:ring-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
          </Button>
          
          <div className="flex items-center space-x-3 border-l pl-4">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end space-x-2">
                {profile?.role && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${roleMap[profile.role]?.color || ""}`}>
                    {roleMap[profile.role]?.label}
                  </span>
                )}
                <p className="text-sm font-medium leading-none">{profile?.full_name || (loading ? "加载中..." : "未登录")}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{profile?.email || "..."}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-secondary transition-transform hover:scale-105">
                  <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>个人中心</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>设置</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
