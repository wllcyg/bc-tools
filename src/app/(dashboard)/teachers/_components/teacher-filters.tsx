"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeacherFiltersProps {
  // 暂时移除科目列表，后续可改为从教师数据中提取唯一值
}

export function TeacherFilters({}: TeacherFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [subject, setSubject] = useState(searchParams.get("subject") || "all");

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (keyword) {
      params.set("keyword", keyword);
    } else {
      params.delete("keyword");
    }
    
    if (subject !== "all") {
      params.set("subject", subject);
    } else {
      params.delete("subject");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setKeyword("");
    setSubject("all");
    router.push(pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="输入教师姓名或工号查询..."
          className="pl-10 h-10 border-zinc-200 focus:bg-white transition-all dark:border-zinc-800 shadow-sm"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>

      <Select value={subject} onValueChange={setSubject}>
        <SelectTrigger className="w-[150px] h-10 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <SelectValue placeholder="所有科目" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">所有科目</SelectItem>
          {/* 计划：此处可改为从教师数据中提取唯一科目名称 */}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Button onClick={handleSearch} className="h-10 px-6">
          查询
        </Button>
        <Button variant="outline" onClick={handleReset} className="h-10 px-6 border-zinc-200 dark:border-zinc-800">
          重置
        </Button>
      </div>
    </div>
  );
}
