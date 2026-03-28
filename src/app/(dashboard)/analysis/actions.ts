"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAnalysisFilters() {
  const supabase = await createClient();

  const [examsRes, classesRes] = await Promise.all([
    supabase.from("exams").select("id, name").order("exam_date", { ascending: false }),
    supabase.from("classes").select("id, name, grade").order("grade", { ascending: false }),
  ]);

  return {
    exams: examsRes.data || [],
    classes: classesRes.data || [],
  };
}

export async function getAnalysisData(examId?: string, classId?: string) {
  const supabase = await createClient();

  // 1. 获取基础成绩数据
  let query = supabase
    .from("grades")
    .select(`
      score,
      student_id,
      course_id,
      courses (id, name, max_score, pass_score, excellent_score),
      students (id, name, student_no, class_id)
    `);

  if (examId) {
    query = query.eq("exam_id", examId);
  }

  const { data: grades, error } = await query;

  if (error || !grades) {
    console.error("Fetch grades error:", error);
    return null;
  }

  // 如果指定了班级，过滤数据
  const filteredGrades = classId 
    ? grades.filter((g: any) => g.students?.class_id === classId)
    : grades;

  if (filteredGrades.length === 0) return null;

  // 2. 聚合统计
  const totalScoreCount = filteredGrades.reduce((sum, g) => sum + (g.score || 0), 0);
  const avgScore = totalScoreCount / filteredGrades.length;

  // 按科目聚合
  const subMap: Record<string, { total: number; count: number; max: number }> = {};
  filteredGrades.forEach((g: any) => {
    const sName = g.courses?.name || "未知";
    if (!subMap[sName]) {
      subMap[sName] = { total: 0, count: 0, max: g.courses?.max_score || 100 };
    }
    subMap[sName].total += g.score || 0;
    subMap[sName].count += 1;
  });

  const subjectAverages = Object.entries(subMap).map(([name, data]) => ({
    subject: name,
    average: parseFloat((data.total / data.count).toFixed(1)),
    maxScore: data.max,
    percentage: parseFloat(((data.total / data.count / data.max) * 100).toFixed(1)),
  }));

  // 3. 成绩分布
  const distribution = [
    { name: "优秀", value: 0, color: "#10b981" },
    { name: "良好", value: 0, color: "#3b82f6" },
    { name: "及格", value: 0, color: "#f59e0b" },
    { name: "不及格", value: 0, color: "#ef4444" },
  ];

  let passCount = 0;
  let excellentCount = 0;

  filteredGrades.forEach((g: any) => {
    const score = g.score || 0;
    const pass = g.courses?.pass_score || (g.courses?.max_score * 0.6) || 60;
    const excellent = g.courses?.excellent_score || (g.courses?.max_score * 0.9) || 90;
    const good = (pass + excellent) / 2;

    if (score >= excellent) {
      distribution[0].value++;
      excellentCount++;
      passCount++;
    } else if (score >= good) {
      distribution[1].value++;
      passCount++;
    } else if (score >= pass) {
      distribution[2].value++;
      passCount++;
    } else {
      distribution[3].value++;
    }
  });

  // 4. 统计学生总分排行
  const studentMap: Record<string, { name: string; student_no: string; totalScore: number; count: number }> = {};
  filteredGrades.forEach((g: any) => {
    const sId = g.student_id;
    if (!studentMap[sId]) {
      studentMap[sId] = { 
        name: g.students?.name || "未知", 
        student_no: g.students?.student_no || "-", 
        totalScore: 0, 
        count: 0 
      };
    }
    studentMap[sId].totalScore += g.score || 0;
    studentMap[sId].count += 1;
  });

  const topStudents = Object.values(studentMap)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5)
    .map((s, index) => ({
      rank: index + 1,
      name: s.name,
      student_no: s.student_no,
      totalScore: parseFloat(s.totalScore.toFixed(1)),
      avgScore: parseFloat((s.totalScore / s.count).toFixed(1)),
    }));

  // 已在循环中统计

  return {
    summary: {
      avgScore: parseFloat(avgScore.toFixed(1)),
      passRate: parseFloat(((passCount / filteredGrades.length) * 100).toFixed(1)),
      excellentRate: parseFloat(((excellentCount / filteredGrades.length) * 100).toFixed(1)),
      totalCount: filteredGrades.length,
      studentCount: Object.keys(studentMap).length,
    },
    subjectAverages,
    distribution,
    topStudents,
  };
}
