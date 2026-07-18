create table homepage_settings (
  id uuid primary key default gen_random_uuid(),
  is_singleton boolean not null default true unique,
  projects_cover_url text,
  achievements_cover_url text,
  about_cover_url text,
  experience_cover_url text,
  updated_at timestamptz not null default now()
);

insert into homepage_settings default values;

alter table homepage_settings enable row level security;

create policy "public read homepage_settings" on homepage_settings for select using (true);
create policy "admin write homepage_settings" on homepage_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
