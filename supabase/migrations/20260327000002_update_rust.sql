CREATE OR REPLACE VIEW public.grade_rankings AS
SELECT 
    g.*,
    RANK() OVER (PARTITION BY g.exam_id, g.course_id ORDER BY g.score DESC) as calculated_rank_grade,
    RANK() OVER (PARTITION BY g.exam_id, g.course_id, s.class_id ORDER BY g.score DESC) as calculated_rank_class
FROM 
    public.grades g
JOIN 
    public.students s ON g.student_id = s.id;
