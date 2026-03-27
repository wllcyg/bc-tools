"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Upload, FileText, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { bulkCreateStudents } from "../actions";

interface ImportStudentsDialogProps {
  classes: { id: string, name: string, grade: string }[];
}

export function ImportStudentsDialog({ classes }: ImportStudentsDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const statusMap: Record<string, string> = {
    "在读": "active",
    "在校": "active",
    "请假": "leave",
    "休学": "suspended",
    "毕业": "graduated",
    "退学": "dropped",
    "active": "active",
    "leave": "leave",
    "suspended": "suspended",
    "graduated": "graduated",
    "dropped": "dropped",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    setLoading(true);
    setErrors([]);
    setSuccessCount(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data as any[];
        const validRows: any[] = [];
        const rowErrors: string[] = [];

        parsedData.forEach((row, index) => {
          const rowNum = index + 2; // CSV headers are row 1
          const name = row["姓名"] || row["name"];
          const gender = row["性别"] || row["gender"];
          const birthDate = row["出生日期"] || row["birth_date"];
          const className = row["所在班级"] || row["class_name"];
          const parentName = row["家长姓名"] || row["parent_name"];
          const parentPhone = row["家长联系电话"] || row["家长电话"] || row["parent_phone"];
          const statusText = row["状态"] || row["status"] || "在读";

          if (!name) {
            rowErrors.push(`第 ${rowNum} 行: 姓名必填`);
            return;
          }
          if (!gender || !["男", "女"].includes(gender)) {
            rowErrors.push(`第 ${rowNum} 行: 性别必须为 "男" 或 "女"`);
            return;
          }
          if (!birthDate) {
            rowErrors.push(`第 ${rowNum} 行: 出生日期必填`);
            return;
          }

          // 匹配班级
          const targetClass = classes.find(
            (c) =>
              `${c.grade} ${c.name}` === className ||
              `${c.grade}${c.name}` === className ||
              c.id === className
          );

          if (!targetClass) {
            rowErrors.push(`第 ${rowNum} 行: 找不到名为 "${className}" 的班级`);
            return;
          }

          validRows.push({
            name,
            gender,
            birth_date: birthDate,
            class_id: targetClass.id,
            parent_name: parentName || "",
            parent_phone: parentPhone || "",
            status: statusMap[statusText] || "active",
          });
        });

        setData(validRows);
        setErrors(rowErrors);
        setLoading(false);
      },
      error: (error) => {
        setErrors([`解析文件失败: ${error.message}`]);
        setLoading(false);
      },
    });
  };

  const handleImport = async () => {
    if (data.length === 0) return;
    setLoading(true);
    try {
      await bulkCreateStudents(data);
      setSuccessCount(data.length);
      setData([]);
      setFile(null);
      // Wait a bit before closing
      setTimeout(() => setOpen(false), 2000);
    } catch (error: any) {
      setErrors([`导入失败: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = Papa.unparse([
      {
        "姓名": "张三",
        "性别": "男",
        "出生日期": "2018-01-01",
        "所在班级": "一年级 1班",
        "家长姓名": "张爸爸",
        "家长联系电话": "13800138000",
        "状态": "在读",
      },
    ]);
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "学生导入模板.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          导入学生
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>导入学生数据</DialogTitle>
          <DialogDescription>
            支持从 CSV 文件批量导入学生信息。请先下载模板按要求填写。
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-lg border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-zinc-400" />
              <div>
                <p className="text-sm font-medium">还没有准备好文件？</p>
                <p className="text-xs text-muted-foreground">下载标准模板开始录入数据</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              下载模板
            </Button>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm font-medium">
                {file ? file.name : "点击或拖拽 CSV 文件到此处"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">仅限 CSV 格式</p>
            </div>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>发现 {errors.length} 个错误</AlertTitle>
              <AlertDescription className="max-h-32 overflow-y-auto">
                <ul className="list-disc pl-4 text-xs space-y-1 mt-2">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {successCount !== null && (
            <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle>导入成功</AlertTitle>
              <AlertDescription>
                成功导入 {successCount} 位学生档案。
              </AlertDescription>
            </Alert>
          )}

          {data.length > 0 && errors.length === 0 && (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">姓名</TableHead>
                    <TableHead className="text-xs">性别</TableHead>
                    <TableHead className="text-xs">出生日期</TableHead>
                    <TableHead className="text-xs">所在班级ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs py-2">{row.name}</TableCell>
                      <TableCell className="text-xs py-2">{row.gender}</TableCell>
                      <TableCell className="text-xs py-2">{row.birth_date}</TableCell>
                      <TableCell className="text-xs py-2 truncate max-w-[100px]">{row.class_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.length > 5 && (
                <p className="text-center text-[10px] text-muted-foreground py-2 border-t">
                  ... 仅显示前 5 条预览 (共 {data.length} 条)
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            className="w-full"
            disabled={loading || data.length === 0 || errors.length > 0}
            onClick={handleImport}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            开始导入学生 ({data.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
