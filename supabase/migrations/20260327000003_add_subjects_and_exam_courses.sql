-- 1. 创建科目表
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  default_max_score NUMERIC(5,1) DEFAULT 100,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 数据迁移：从现有课程表中提取科目
INSERT INTO public.subjects (name, default_max_score)
SELECT DISTINCT name, max_score FROM public.courses
ON CONFLICT (name) DO NOTHING;

-- 3. 修改课程表以关联科目
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id);

-- 更新现有课程的 subject_id
UPDATE public.courses c
SET subject_id = s.id
FROM public.subjects s
WHERE c.name = s.name;

-- 4. 修改教师表以关联科目
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id);

-- 更新现有教师的 subject_id (尽力匹配)
UPDATE public.teachers t
SET subject_id = s.id
FROM public.subjects s
WHERE t.subject = s.name;

-- 5. 创建考试-课程关联表 (支持单场考试自定义满分)
CREATE TABLE IF NOT EXISTS public.exam_courses (
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  max_score NUMERIC(5,1), -- 若为空则继承课程默认满分
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (exam_id, course_id)
);

-- 6. RLS 策略
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_courses ENABLE ROW LEVEL SECURITY;

-- 基础查询权限
CREATE POLICY "Everyone can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can view exam_courses" ON public.exam_courses FOR SELECT TO authenticated USING (true);

-- 管理员编辑权限
CREATE POLICY "Admins can manage subjects" ON public.subjects
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')));

CREATE POLICY "Admins can manage exam_courses" ON public.exam_courses
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')));

-- 7. 触发器
CREATE TRIGGER update_subjects_modtime BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
