-- 课程与班级多对多中间表
-- 补充 PRD 中定义但初始迁移中遗漏的 course_classes 表

CREATE TABLE IF NOT EXISTS public.course_classes (
  course_id   UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  class_id    UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (course_id, class_id)
);

-- 启用 RLS
ALTER TABLE public.course_classes ENABLE ROW LEVEL SECURITY;

-- 所有认证用户可查看（用于前端展示班级已开设的课程）
CREATE POLICY "Authenticated users can view course_classes" ON public.course_classes
  FOR SELECT TO authenticated
  USING (true);

-- 管理员/教务可增删
CREATE POLICY "Admins/EduAdmins have full access to course_classes" ON public.course_classes
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')));
