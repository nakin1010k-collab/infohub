-- InfoHub preview content for the Supabase-backed news experience.
-- Safe to re-run: all records use stable slugs/domains and upserts.

insert into public.categories (slug, name, description, sort_order, is_active)
values
  ('news', 'ข่าวเด่น', 'ประเด็นข่าวและเหตุการณ์ที่น่าสนใจ', 1, true),
  ('technology', 'เทคโนโลยี', 'เทคโนโลยี นวัตกรรม และการเปลี่ยนแปลงในชีวิตประจำวัน', 2, true),
  ('data', 'ข้อมูล', 'ข้อมูล สถิติ และตัวเลขที่ควรรู้', 3, true),
  ('knowledge', 'ความรู้', 'บทความอธิบายและความรู้รอบตัว', 4, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.sources (name, domain, homepage_url, is_active)
values ('InfoHub Demo', 'demo.infohub.local', 'https://demo.infohub.local', true)
on conflict (domain) do update set
  name = excluded.name,
  homepage_url = excluded.homepage_url,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.articles (
  slug, title, excerpt, content, canonical_url, source_id, author_name,
  published_at, status, reading_minutes
)
select
  data.slug,
  data.title,
  data.excerpt,
  data.content,
  data.canonical_url,
  s.id,
  'InfoHub Editorial',
  data.published_at::timestamptz,
  'published',
  data.reading_minutes
from (
  values
    (
      'infohub-demo-daily-brief',
      'สรุปประเด็นข่าวสำคัญประจำวัน',
      'ต้นแบบการจัดข่าวแบบอ่านง่าย พร้อมบริบทที่ช่วยให้เห็นภาพรวมของประเด็น',
      'บทความตัวอย่างของ InfoHub ที่ออกแบบเพื่อทดสอบระบบข่าวจากฐานข้อมูลจริง เนื้อหานี้จะแสดงโครงสร้างบทความ แหล่งที่มา และ metadata ที่พร้อมต่อยอดเป็นระบบเผยแพร่จริง',
      'https://infohub.local/news/infohub-demo-daily-brief',
      '2026-09-30 10:30:00+07',
      5
    ),
    (
      'technology-close-to-life',
      'เทคโนโลยีใกล้ตัวที่กำลังเปลี่ยนชีวิตเรา',
      'ทำความเข้าใจแนวโน้มเทคโนโลยีผ่านตัวอย่างที่พบได้ในชีวิตประจำวัน',
      'บทความตัวอย่างเกี่ยวกับเทคโนโลยีและนวัตกรรม โดยเน้นการอธิบายให้เข้าใจง่ายและเชื่อมโยงกับการใช้งานจริง ข้อมูลชุดนี้เป็นเนื้อหาสำหรับทดสอบระบบ ไม่ใช่รายงานข่าวจากสำนักข่าวภายนอก',
      'https://infohub.local/news/technology-close-to-life',
      '2026-09-30 09:45:00+07',
      4
    ),
    (
      'data-story-of-the-day',
      'ข้อมูลใหม่ที่น่าจับตา',
      'ต้นแบบบทความข้อมูลที่เน้นตัวเลข ข้อเท็จจริง และแหล่งที่มาอย่างเป็นระบบ',
      'บทความตัวอย่างสำหรับส่วนข้อมูลของ InfoHub แสดงรูปแบบการนำตัวเลข สถิติ และบริบทมาประกอบเรื่องราว โดยจะสามารถเปลี่ยนเป็นข้อมูลจากแหล่งจริงได้ในขั้นต่อไป',
      'https://infohub.local/news/data-story-of-the-day',
      '2026-09-30 08:20:00+07',
      6
    ),
    (
      'knowledge-explained',
      'เรื่องน่ารู้ที่อธิบายด้วยข้อมูล',
      'เชื่อมเหตุการณ์ ข่าว และข้อมูลเพื่อช่วยให้เข้าใจเรื่องเดียวกันจากหลายมุม',
      'บทความตัวอย่างสำหรับฐานความรู้ของ InfoHub เน้นการอธิบายบริบทและเชื่อมโยงข้อมูลหลายประเภท เพื่อให้โครงสร้างหน้าอ่านรองรับบทความจริงในอนาคต',
      'https://infohub.local/news/knowledge-explained',
      '2026-09-30 07:50:00+07',
      6
    )
) as data(slug, title, excerpt, content, canonical_url, published_at, reading_minutes)
cross join public.sources s
where s.domain = 'demo.infohub.local'
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  canonical_url = excluded.canonical_url,
  source_id = excluded.source_id,
  author_name = excluded.author_name,
  published_at = excluded.published_at,
  status = excluded.status,
  reading_minutes = excluded.reading_minutes,
  updated_at = now();

insert into public.article_categories (article_id, category_id)
select a.id, c.id
from public.articles a
join public.categories c
  on c.slug = case
    when a.slug = 'technology-close-to-life' then 'technology'
    when a.slug = 'data-story-of-the-day' then 'data'
    when a.slug = 'knowledge-explained' then 'knowledge'
    else 'news'
  end
where a.slug in (
  'infohub-demo-daily-brief',
  'technology-close-to-life',
  'data-story-of-the-day',
  'knowledge-explained'
)
on conflict do nothing;

insert into public.tags (slug, name)
values
  ('daily-news', 'ข่าวประจำวัน'),
  ('news-brief', 'สรุปข่าว'),
  ('context', 'บริบท'),
  ('technology', 'เทคโนโลยี'),
  ('innovation', 'นวัตกรรม'),
  ('daily-life', 'ชีวิตประจำวัน'),
  ('data', 'ข้อมูล'),
  ('statistics', 'สถิติ'),
  ('numbers', 'ตัวเลข'),
  ('knowledge', 'ความรู้'),
  ('explained', 'อธิบายง่าย')
on conflict (slug) do update set name = excluded.name;

insert into public.article_tags (article_id, tag_id)
select a.id, t.id
from public.articles a
join public.tags t on (
  (a.slug = 'infohub-demo-daily-brief' and t.slug in ('daily-news', 'news-brief', 'context'))
  or (a.slug = 'technology-close-to-life' and t.slug in ('technology', 'innovation', 'daily-life'))
  or (a.slug = 'data-story-of-the-day' and t.slug in ('data', 'statistics', 'numbers'))
  or (a.slug = 'knowledge-explained' and t.slug in ('knowledge', 'explained', 'data'))
)
on conflict do nothing;
