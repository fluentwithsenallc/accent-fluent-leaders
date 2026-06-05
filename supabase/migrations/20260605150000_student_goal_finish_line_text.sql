alter table public.student_goals
  add column if not exists finish_line_milestone_text text;

update public.student_goals
set finish_line_milestone_text = day_one_question
where finish_line_milestone_text is null
  and day_one_question is not null
  and position('?' in day_one_question) = 0
  and position('¿' in day_one_question) = 0;
