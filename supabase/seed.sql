-- InfoHub baseline reference data.
-- Safe to run repeatedly; no external services or secrets required.

insert into public.categories (slug, name, description, sort_order)
values
  ('news', 'ข่าว', 'ข่าวสารและเหตุการณ์ล่าสุด', 10),
  ('technology', 'เทคโนโลยี', 'เทคโนโลยี นวัตกรรม และดิจิทัล', 20),
  ('economy', 'เศรษฐกิจ', 'เศรษฐกิจ ธุรกิจ และการเงิน', 30),
  ('society', 'สังคม', 'ประเด็นสังคมและชีวิตประจำวัน', 40),
  ('knowledge', 'ความรู้', 'บทความความรู้และคำอธิบายเชิงลึก', 50),
  ('data', 'ข้อมูล', 'สถิติ ตัวเลข และข้อมูลเชิงโครงสร้าง', 60)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = now();
