-- 20260327000004_merge_subjects_to_courses.sql
-- 简化架构：合并科目到课程，移除独立的科目表

-- 1. 恢复教师表的科目文本字段
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS subject TEXT;

-- 2. 将现有科目名称迁移回教师表
UPDATE public.teachers t
SET subject = s.name
FROM public.subjects s
WHERE t.subject_id = s.id;

-- 3. 移除教师表对科目的 UUID 关联
ALTER TABLE public.teachers DROP COLUMN IF EXISTS subject_id;

-- 4. 移除课程表对科目的 UUID 关联
-- 注：courses.name 已经在之前的迁移中填充为科目名称，无需额外处理
ALTER TABLE public.courses DROP COLUMN IF EXISTS subject_id;

-- 5. 删除科目表及其相关策略
DROP TABLE IF EXISTS public.subjects CASCADE;

-- 6. 更新 RLS 策略（如果有引用到 subjects 的地方）
-- 目前 exam_courses 只引用了 exams 和 courses，无需修改。
