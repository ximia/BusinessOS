-- Optional seed data to populate a fresh Supabase project so the admin
-- dashboard and marketing site have content immediately. Safe to skip.

insert into employees (full_name, email, role, active) values
  ('Elena Ruiz', 'elena@example.com', 'admin', true),
  ('Jordan Pierce', 'jordan@example.com', 'staff', true),
  ('Sam Okafor', 'sam@example.com', 'staff', true)
on conflict (email) do nothing;

insert into leads (name, email, phone, message, status, source, assigned_to, tags, value) values
  ('Marcus Bell', 'marcus@example.com', '555-0111', 'Paint correction for my Model 3.', 'new', 'website', 'Elena Ruiz', '{paint-correction}', 549),
  ('Priya Nadella', 'priya@example.com', '555-0122', 'Full interior detail.', 'contacted', 'google', 'Jordan Pierce', '{interior}', 219),
  ('Devin Cho', 'devin@example.com', '555-0133', 'Ceramic coating quote.', 'quoted', 'referral', 'Sam Okafor', '{ceramic}', 1250);

insert into reviews (name, rating, quote, service, approved, featured) values
  ('Marcus Bell', 5, 'Paint looks better than new. Worth every penny.', 'Paint Correction', true, true),
  ('Priya Nadella', 5, 'Extracted things I''d given up on. Fantastic.', 'Interior Detail', true, true);

insert into posts (slug, title, excerpt, content, category, status, author, published_at) values
  ('why-automatic-car-washes-ruin-paint',
   'Why automatic car washes quietly ruin your paint',
   'What those spinning brushes are actually doing to your clear coat.',
   'Automatic washes are built for speed, not care.',
   'Paint Care', 'published', 'Elena Ruiz', now());
