create table achievement_gallery_items (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references achievements(id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  position integer not null default 0
);

alter table achievement_gallery_items enable row level security;

create policy "public read achievement_gallery_items" on achievement_gallery_items for select using (true);
create policy "admin write achievement_gallery_items" on achievement_gallery_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create table achievement_sections (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references achievements(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0
);

alter table achievement_sections enable row level security;

create policy "public read achievement_sections" on achievement_sections for select using (true);
create policy "admin write achievement_sections" on achievement_sections for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
