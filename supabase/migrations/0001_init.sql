create extension if not exists "pgcrypto";

create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_photo_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table project_gallery_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  position integer not null default 0
);

create table project_sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0
);

create table achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  organization text not null,
  date_range text,
  description text,
  image_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table about (
  id uuid primary key default gen_random_uuid(),
  is_singleton boolean not null default true unique,
  photo_url text,
  bio text,
  updated_at timestamptz not null default now()
);

insert into about (bio) values ('Mechanical engineering student.');

create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  submitted_at timestamptz not null default now()
);

alter table projects enable row level security;
alter table project_gallery_items enable row level security;
alter table project_sections enable row level security;
alter table achievements enable row level security;
alter table experience enable row level security;
alter table about enable row level security;
alter table contact_submissions enable row level security;

create policy "public read projects" on projects for select using (true);
create policy "public read project_gallery_items" on project_gallery_items for select using (true);
create policy "public read project_sections" on project_sections for select using (true);
create policy "public read achievements" on achievements for select using (true);
create policy "public read experience" on experience for select using (true);
create policy "public read about" on about for select using (true);

create policy "admin write projects" on projects for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write project_gallery_items" on project_gallery_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write project_sections" on project_sections for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write achievements" on achievements for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write experience" on experience for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write about" on about for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "anyone can submit contact form" on contact_submissions for insert with check (true);
create policy "admin read contact_submissions" on contact_submissions for select using (auth.role() = 'authenticated');
create policy "admin delete contact_submissions" on contact_submissions for delete using (auth.role() = 'authenticated');
