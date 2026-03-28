"use client";

import { useRouter } from "next/navigation";
import { Bell, Search, LogOut, User as UserIcon, Settings, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { useSidebarStore } from "@/store/use-sidebar-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const { toggle } = useSidebarStore();
  const supabase = createClient();

  // 角色翻译映射 - 使用更标准的主题色
  const roleMap: Record<string, { label: string; color: string }> = {
    admin: { label: "超级管理员", color: "bg-destructive/10 text-destructive border-destructive/20" },
    edu_admin: { label: "教务管理员", color: "bg-primary/10 text-primary border-primary/20" },
    teacher: { label: "教师", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
    student: { label: "学生", color: "bg-muted text-muted-foreground border-muted-foreground/20" },
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background/80 px-4 backdrop-blur-md">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={toggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {/* Search box placeholder or title */}
          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-muted-foreground">初中生管理平台</h2>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative group">
            <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
          </Button>

          <div className="flex items-center space-x-3 border-l pl-4">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end space-x-2">
                {profile?.role && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${roleMap[profile.role]?.color || ""}`}>
                    {roleMap[profile.role]?.label}
                  </span>
                )}
                <p className="text-sm font-semibold tracking-tight">{profile?.full_name || (loading ? "加载中..." : "未登录")}</p>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{profile?.email || "..."}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-secondary transition-all hover:ring-2 hover:ring-primary/20">
                  <Avatar className="h-9 w-9 border border-border transition-transform group-hover:scale-105">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuLabel className="font-bold text-xs text-muted-foreground px-2 py-1.5 uppercase tracking-widest">我的账户</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>个人中心</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>设置</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer">
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
