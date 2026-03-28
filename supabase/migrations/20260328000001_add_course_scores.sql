-- 增加及格分与优秀分字段
ALTER TABLE courses 
ADD COLUMN pass_score NUMERIC(5,1) DEFAULT 60,
ADD COLUMN excellent_score NUMERIC(5,1) DEFAULT 90;

-- 为现有数据根据满分比例初始化（默认 60% 为及格，90% 为优秀）
UPDATE courses SET 
  pass_score = max_score * 0.6,
  excellent_score = max_score * 0.9
WHERE pass_score = 60 AND excellent_score = 90; -- 虽然默认是这个，但这里显示表达下更新逻辑
