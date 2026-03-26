-- Init Schema: Student Management System
-- Version: v0.1.0

-- 1. 角色枚举
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'edu_admin', 'teacher', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. 用户 Profiles 表 (扩展 auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role DEFAULT 'student',
  full_name   TEXT,
  avatar_url  TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. 教师表
CREATE TABLE IF NOT EXISTS public.teachers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_no  TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  gender      TEXT CHECK (gender IN ('男','女')),
  phone       TEXT,
  subject     TEXT,
  user_id     UUID REFERENCES auth.users(id),  -- 关联登录账号
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 4. 班级表
CREATE TABLE IF NOT EXISTS public.classes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,          -- 如"1班"
  grade       TEXT NOT NULL,          -- 如"初一"
  teacher_id  UUID REFERENCES public.teachers(id),  -- 班主任
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 5. 学生表
CREATE TABLE IF NOT EXISTS public.students (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_no  TEXT NOT NULL UNIQUE,   -- 学号
  name        TEXT NOT NULL,
  gender      TEXT CHECK (gender IN ('男','女')),
  birth_date  DATE,
  class_id    UUID REFERENCES public.classes(id),
  phone       TEXT,
  address     TEXT,
  enrolled_at DATE NOT NULL DEFAULT CURRENT_DATE,
  status      TEXT DEFAULT '在校' CHECK (status IN ('在校','请假','休学','毕业','退学')),
  avatar_url  TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 6. 课程表
CREATE TABLE IF NOT EXISTS public.courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  teacher_id  UUID REFERENCES public.teachers(id),
  max_score   NUMERIC(5,1) NOT NULL DEFAULT 100,
  hours       INTEGER,
  semester    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 7. 考试场次表
CREATE TABLE IF NOT EXISTS public.exams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,   -- 如"2024-2025第一学期期中考试"
  exam_type   TEXT CHECK (exam_type IN ('期中','期末','月考')),
  semester    TEXT NOT NULL,   -- 如"2024-2025-1"
  exam_date   DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 8. 成绩明细表
CREATE TABLE IF NOT EXISTS public.grades (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id     UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
  course_id   UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  score       NUMERIC(5,2),
  rank_class  INTEGER,
  rank_grade  INTEGER,
  entered_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (exam_id, student_id, course_id)
);

-- 9. 自动化处理 (Triggers)

-- 自动设置 updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_teachers_modtime BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_classes_modtime BEFORE UPDATE ON classes FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_students_modtime BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_courses_modtime BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_exams_modtime BEFORE UPDATE ON exams FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_grades_modtime BEFORE UPDATE ON grades FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 10. RLS 安全策略

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- 策略示例 (Profiles)
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 策略示例 (Students) - 管理员/教务全权限，教师只读
CREATE POLICY "Admins/EduAdmins have full access to students" ON public.students
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'edu_admin')
    )
  );

CREATE POLICY "Teachers can view all students" ON public.students
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'teacher'
    )
  );

-- 11. Auth 触发器：注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
