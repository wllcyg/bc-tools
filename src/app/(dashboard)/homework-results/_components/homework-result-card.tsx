"use client";

import { useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { 
  Calendar, 
  User, 
  Trash2, 
  Maximize2,
  Image as ImageIcon,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { deleteHomeworkResult } from "../actions";
import { toast } from "sonner";

interface HomeworkResult {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  record_date: string;
  students: { name: string, student_no: string } | null;
  courses: { name: string } | null;
}

export function HomeworkResultCard({ result }: { result: HomeworkResult }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("确定要删除这条成果记录吗？")) return;
    setDeleting(true);
    try {
      await deleteHomeworkResult(result.id);
      toast.success("记录已删除");
    } catch {
      toast.error("删除失败");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="group overflow-hidden rounded-2xl border-none shadow-md hover:shadow-xl transition-all duration-500 bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden">
          {result.image_url ? (
            <>
              <img 
                src={result.image_url} 
                alt={result.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm" className="w-full rounded-xl backdrop-blur-md bg-white/20 border-white/20 text-white hover:bg-white/40">
                      <Maximize2 className="mr-2 h-4 w-4" />
                      查看原图
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-black/90">
                    <img src={result.image_url} alt={result.title} className="w-full h-auto max-h-[80vh] object-contain" />
                  </DialogContent>
                </Dialog>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
              <ImageIcon className="h-12 w-12 opacity-20" />
            </div>
          )}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-md shadow-sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除记录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="space-y-1">
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border-none mb-2">
            {result.courses?.name || "未知课程"}
          </Badge>
          <h3 className="text-xl font-bold leading-tight group-hover:text-indigo-600 transition-colors">
            {result.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {result.content || "暂无评语记录内容。"}
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center text-sm">
            <User className="mr-2 h-4 w-4 text-zinc-400" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{result.students?.name}</span>
            <span className="ml-2 text-xs text-muted-foreground font-mono">({result.students?.student_no})</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-2 h-3.5 w-3.5" />
            {format(new Date(result.record_date), "yyyy年MM月dd日", { locale: zhCN })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
