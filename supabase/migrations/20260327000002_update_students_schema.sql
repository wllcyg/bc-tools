-- 修复学生表字段缺失和状态值不匹配问题

-- 1. 添加缺失的家长信息字段
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS parent_name TEXT,
ADD COLUMN IF NOT EXISTS parent_phone TEXT;

-- 2. 更新状态约束以支持前端传值 (active, suspended, graduated)
ALTER TABLE public.students 
DROP CONSTRAINT IF EXISTS students_status_check;

ALTER TABLE public.students 
ADD CONSTRAINT students_status_check 
CHECK (status IN ('active', 'leave', 'suspended', 'graduated', 'dropped', '在校', '请假', '休学', '毕业', '退学'));

-- 3. 将现有中文状态数据转换为英文格式（保持与前端一致）
UPDATE public.students SET status = 'active' WHERE status = '在校';
UPDATE public.students SET status = 'suspended' WHERE status = '休学';
UPDATE public.students SET status = 'graduated' WHERE status = '毕业';

-- 4. 如果有 enrolled_at 为空的情况（虽然已有默认值，但为了安全起见）
-- ALTER TABLE public.students ALTER COLUMN enrolled_at SET DEFAULT CURRENT_DATE;
