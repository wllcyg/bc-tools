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
import { Badge } from "@/components/ui/badge";

interface ImportGradesDialogProps {
  students: any[];
  maxScore: number;
  onImport: (importedScores: Record<string, string>) => void;
}

export function ImportGradesDialog({ students, maxScore, onImport }: ImportGradesDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data as any[];
        const validRows: any[] = [];
        const rowErrors: string[] = [];

        parsedData.forEach((row, index) => {
          const rowNum = index + 2; // CSV headers are row 1
          const studentNo = row["学号"] || row["student_no"];
          const name = row["姓名"] || row["name"];
          const scoreStr = row["成绩"] || row["score"];

          if (!studentNo) {
            rowErrors.push(`第 ${rowNum} 行: 学号必填`);
            return;
          }

          if (!scoreStr) {
            rowErrors.push(`第 ${rowNum} 行: 成绩必填`);
            return;
          }

          const score = parseFloat(scoreStr);
          if (isNaN(score)) {
            rowErrors.push(`第 ${rowNum} 行: 成绩格式不正确 ("${scoreStr}")`);
            return;
          }

          if (score > maxScore) {
            rowErrors.push(`第 ${rowNum} 行: 成绩 (${score}) 超过了满分 (${maxScore})`);
            return;
          }

          // 匹配学生
          const targetStudent = students.find(
            (s) => s.student_no === studentNo || (name && s.name === name)
          );

          if (!targetStudent) {
            rowErrors.push(`第 ${rowNum} 行: 找不到学号为 "${studentNo}"${name ? ` 名字为 "${name}"` : ""} 的学生`);
            return;
          }

          validRows.push({
            student_id: targetStudent.id,
            student_no: targetStudent.student_no,
            name: targetStudent.name,
            score: score.toString(),
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

  const handleConfirm = () => {
    if (data.length === 0) return;
    
    const importedScores: Record<string, string> = {};
    data.forEach(row => {
      importedScores[row.student_id] = row.score;
    });

    onImport(importedScores);
    setSuccess(true);
    
    // Wait a bit before closing
    setTimeout(() => {
      setOpen(false);
      // Reset state for next use
      setFile(null);
      setData([]);
      setSuccess(false);
    }, 1500);
  };

  const downloadTemplate = () => {
    // 根据当前学生列表生成模板，带上姓名方便核对
    const templateData = students.map(s => ({
      "学号": s.student_no,
      "姓名": s.name,
      "成绩": "",
    }));

    const csv = Papa.unparse(templateData);
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "成绩导入模板.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 px-3">
          <Upload className="mr-2 h-4 w-4" />
          导入成绩
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>导入成绩数据</DialogTitle>
          <DialogDescription>
            支持从 CSV 文件批量导入学生成绩。建议先下载模板填写。
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-lg border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-zinc-400" />
              <div>
                <p className="text-sm font-medium">还没有准备好文件？</p>
                <p className="text-xs text-muted-foreground">下载带学生名单的模板开始录入</p>
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

          {success && (
            <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle>导入成功</AlertTitle>
              <AlertDescription>
                成绩已成功加载到表单中，请点击“保存数据”提交。
              </AlertDescription>
            </Alert>
          )}

          {data.length > 0 && !success && (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">学号</TableHead>
                    <TableHead className="text-xs">姓名</TableHead>
                    <TableHead className="text-xs">成绩</TableHead>
                    <TableHead className="text-xs text-right">状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs py-2 font-mono">{row.student_no}</TableCell>
                      <TableCell className="text-xs py-2">{row.name}</TableCell>
                      <TableCell className="text-xs py-2 font-bold">{row.score}</TableCell>
                      <TableCell className="text-xs py-2 text-right">
                        <Badge variant="secondary" className="text-[10px] h-5">就绪</Badge>
                      </TableCell>
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
            disabled={loading || data.length === 0 || errors.length > 0 || success}
            onClick={handleConfirm}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            确认导入并预览 ({data.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
