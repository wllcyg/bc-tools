import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollmentChart } from "./enrollment-chart";
import { getEnrollmentTrend } from "../actions";

export async function EnrollmentTrendChart() {
  const trendData = await getEnrollmentTrend();

  return (
    <Card className="col-span-4 border-none shadow-md overflow-hidden bg-white/70 backdrop-blur-md dark:bg-zinc-900/70">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">入学趋势分析</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">过去六个月的新生注册人数统计</p>
          </div>
          <TrendingUp className="h-5 w-5 text-blue-500 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <EnrollmentChart data={trendData} />
      </CardContent>
    </Card>
  );
}
