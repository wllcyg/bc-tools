"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClassFilterProps {
  classes: any[];
}

export function ClassFilter({ classes }: ClassFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentClassId = searchParams.get("class_id") || "all";

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("class_id");
    } else {
      params.set("class_id", value);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={currentClassId} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[200px] h-10 border-zinc-200 dark:border-zinc-800 shadow-sm transition-all focus:bg-white">
        <SelectValue placeholder="所有班级" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">所有班级</SelectItem>
        {classes.map((cls) => (
          <SelectItem key={cls.id} value={cls.id}>
            {cls.grade} {cls.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
