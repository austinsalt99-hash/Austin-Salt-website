create table experience_gallery_items (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experience(id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  position integer not null default 0
);

alter table experience_gallery_items enable row level security;

create policy "public read experience_gallery_items" on experience_gallery_items for select using (true);
create policy "admin write experience_gallery_items" on experience_gallery_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table experience drop column image_url;
