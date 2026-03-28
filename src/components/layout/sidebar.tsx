"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserRound,
  Settings,
  BookOpen,
  BookMarked,
  FileText,
  BarChart,
  X,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/use-sidebar-store";

import { useProfile, type Role } from "@/hooks/use-profile";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  roles?: Role[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "仪表盘", href: "/" },
  { icon: Users, label: "学生管理", href: "/students", roles: ["admin", "edu_admin", "teacher"] },
  { icon: GraduationCap, label: "班级管理", href: "/classes", roles: ["admin", "edu_admin", "teacher"] },
  { icon: UserRound, label: "教师管理", href: "/teachers", roles: ["admin", "edu_admin"] },
  { icon: BookMarked, label: "课程管理", href: "/courses", roles: ["admin", "edu_admin"] },
  { icon: FileText, label: "考试管理", href: "/exams", roles: ["admin", "edu_admin"] },
  { icon: BarChart, label: "成绩管理", href: "/grades", roles: ["admin", "edu_admin", "teacher"] },
  { icon: BookOpen, label: "作业", href: "/homework-results", roles: ["admin", "edu_admin", "teacher"] },
  { icon: Settings, label: "系统设置", href: "/settings", roles: ["admin"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useProfile();
  const { isOpen, close } = useSidebarStore();

  // 根据角色过滤菜单项
  const filteredItems = menuItems.filter(item => {
    if (!item.roles) return true; // 所有角色可见
    if (!profile) return false;
    return item.roles.includes(profile.role);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden" 
          onClick={close}
        />
      )}

      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform duration-300",
          !isOpen && "-translate-x-full lg:translate-x-0" // 在大屏始终显示（或根据后续需求也支持大屏折叠）
        )}
      >
        <div className="flex h-full flex-col px-3 py-4">
          {/* Logo */}
          <div className="mb-10 flex items-center justify-between px-2">
            <div className="flex items-center">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">学生管理系统</span>
            </div>
            {/* Mobile Close Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden" 
              onClick={close}
            >
              <X size={20} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 font-medium">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-lg px-2 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-primary"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) close();
                  }}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer info (optional) */}
          <div className="mt-auto border-t pt-4">
            <div className="flex items-center px-2 py-2 text-xs text-muted-foreground opacity-60">
              <span>版本 v1.1.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
