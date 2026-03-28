-- Migration: Add Student Homework Results Module (Consolidated)
-- Version: v0.1.2

-- 1. 学生作业记录表
CREATE TABLE IF NOT EXISTS public.student_homework_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID REFERENCES public.students(id) ON DELETE CASCADE,
  course_id     UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  content       TEXT,           -- 成果描述或评价
  image_url     TEXT,           -- 作品照片链接
  record_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. 自动化
CREATE TRIGGER update_homework_results_modtime BEFORE UPDATE ON student_homework_results FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 3. RLS 安全策略
ALTER TABLE public.student_homework_results ENABLE ROW LEVEL SECURITY;

-- 策略：管理员/教务全权限
CREATE POLICY "Admins have full access to homework_results" ON public.student_homework_results
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'edu_admin'))
  );

-- 策略：教师可以查看/操作自己授课学生的记录
CREATE POLICY "Teachers can manage homework_results for students in their classes" ON public.student_homework_results
  FOR ALL TO authenticated USING (
    EXISTS (
      -- 教师关联逻辑：该学生所属班级的班主任，或者该课程的授课老师
      SELECT 1 FROM public.students s
      LEFT JOIN public.classes c ON s.class_id = c.id
      LEFT JOIN public.courses cr ON cr.id = student_homework_results.course_id
      WHERE s.id = student_homework_results.student_id
      AND (
        c.teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
        OR cr.teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
      )
    )
  );

-- 策略：学生查看自己的记录
CREATE POLICY "Students can view own homework_results" ON public.student_homework_results
  FOR SELECT TO authenticated USING (true);

-- 4. Storage 配置 (可选，建议手动在控制台确认)
-- 此部分如果执行失败可能是权限不足，建议在 Supabase 控制台手动创建 'homework-results' 存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('homework-results', 'homework-results', true)
ON CONFLICT (id) DO NOTHING;

-- 允许公开查看成果图片
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'homework-results');

-- 仅允许登录用户上传图片
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'homework-results' AND auth.role() = 'authenticated');
