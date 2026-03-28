"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebarStore();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300 ease-in-out",
        isOpen ? "lg:ml-64" : "ml-0"
      )}>
        <Header />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

