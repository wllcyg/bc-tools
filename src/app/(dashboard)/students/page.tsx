import { 
  Search,
  Plus,
  MoreVertical,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentsPage() {
  const students = [
    { id: "2024001", name: "张三", gender: "男", class: "计算机科学1班", status: "在校" },
    { id: "2024002", name: "李四", gender: "女", class: "电子信息2班", status: "在校" },
    { id: "2024003", name: "王五", gender: "男", class: "软件工程3班", status: "请假" },
    { id: "2024004", name: "赵六", gender: "女", class: "人工智能1班", status: "在校" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">学生管理</h1>
          <p className="text-muted-foreground">在这里管理您的所有学生信息。</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> 添加学生
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>学生列表</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="搜索姓名或学号..." className="pl-10" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">学号</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">姓名</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">性别</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">班级</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">状态</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {students.map((student) => (
                  <tr key={student.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{student.id}</td>
                    <td className="p-4 align-middle">{student.name}</td>
                    <td className="p-4 align-middle">{student.gender}</td>
                    <td className="p-4 align-middle">{student.class}</td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        student.status === "在校" ? "bg-[#f0f9eb] text-[#67c23a] border border-[#e1f3d8]" : "bg-[#fdf6ec] text-[#e6a23c] border border-[#faecd8]"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
