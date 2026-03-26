import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col transition-all duration-300">
        <Header />
        <main className="p-6">
          <div className="ml-64">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

