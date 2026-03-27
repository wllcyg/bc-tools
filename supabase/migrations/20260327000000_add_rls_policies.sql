-- 1. 为主要业务表增加管理员全权限 (admin / edu_admin)

-- 班级表
CREATE POLICY "Admins/EduAdmins have full access to classes" ON public.classes
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')));

-- 教师表
CREATE POLICY "Admins/EduAdmins have full access to teachers" ON public.teachers
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')));

-- 课程表
CREATE POLICY "Admins/EduAdmins have full access to courses" ON public.courses
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')));

-- 考试场次表
CREATE POLICY "Admins/EduAdmins have full access to exams" ON public.exams
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')));

-- 成绩表
CREATE POLICY "Admins/EduAdmins have full access to grades" ON public.grades
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'edu_admin')));


-- 2. 增加必要的角色视图权限

-- 班级列表对所有认证用户可见（或仅限教师）
CREATE POLICY "Authenticated users can view classes" ON public.classes
  FOR SELECT TO authenticated
  USING (true);

-- 教师信息对所有认证用户可见（用于下拉选择等）
CREATE POLICY "Authenticated users can view teachers" ON public.teachers
  FOR SELECT TO authenticated
  USING (true);

-- 课程信息对所有认证用户可见
CREATE POLICY "Authenticated users can view courses" ON public.courses
  FOR SELECT TO authenticated
  USING (true);
