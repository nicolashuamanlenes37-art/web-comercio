-- =====================================================================
-- Accesorios N&D · Esquema de base de datos (Supabase)
--
-- Cómo usarlo:
--   1. Supabase → SQL Editor → New query
--   2. Pega TODO este archivo y pulsa "Run"
--   3. Luego ejecuta supabase/seed.sql para cargar el catálogo inicial
--   4. Crea el usuario del administrador en Authentication (ver README)
-- =====================================================================

-- ---------- Tablas ----------

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null check (char_length(name) between 1 and 60),
  tagline     text check (char_length(tagline) <= 80),
  cover_url   text,
  sort        integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references public.categories(id) on delete set null,
  name         text not null check (char_length(name) between 1 and 80),
  description  text check (char_length(description) <= 300),
  price        numeric(10, 2) check (price >= 0),          -- null = "Consultar precio"
  image_url    text,
  badge        text check (char_length(badge) <= 20),      -- "Nuevo", "Oferta", ...
  featured     boolean not null default false,             -- aparece en la portada
  active       boolean not null default true,              -- visible en la tienda
  sort         integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id);

-- Correos que pueden entrar al panel de administración
create table if not exists public.admins (
  email text primary key
);

-- Libro de Reclamaciones virtual
create table if not exists public.complaints (
  id          bigint generated always as identity primary key,
  code        text not null unique,
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('reclamo', 'queja')),
  full_name   text not null check (char_length(full_name) between 3 and 120),
  document    text not null check (char_length(document) between 6 and 20),
  address     text check (char_length(address) <= 200),
  phone       text check (char_length(phone) <= 20),
  email       text not null check (char_length(email) between 5 and 120),
  guardian    text check (char_length(guardian) <= 120),   -- padre/madre si es menor de edad
  item        text check (char_length(item) <= 200),       -- producto o servicio
  amount      numeric(10, 2) check (amount >= 0),
  detail      text not null check (char_length(detail) between 10 and 2000),
  request     text not null check (char_length(request) between 5 and 1000),
  status      text not null default 'pendiente' check (status in ('pendiente', 'en proceso', 'atendido')),
  response    text check (char_length(response) <= 2000),
  answered_at timestamptz
);

-- ---------- Funciones ----------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------- Seguridad (RLS) ----------

alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.admins     enable row level security;
alter table public.complaints enable row level security;

-- Categorías: todos ven las activas; solo administradores editan
drop policy if exists "categories_read" on public.categories;
create policy "categories_read" on public.categories
  for select to anon, authenticated
  using (active or (select public.is_admin()));

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Productos: todos ven los activos; solo administradores editan
drop policy if exists "products_read" on public.products;
create policy "products_read" on public.products
  for select to anon, authenticated
  using (active or (select public.is_admin()));

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Administradores: cada usuario solo puede comprobar su propio correo
drop policy if exists "admins_self" on public.admins;
create policy "admins_self" on public.admins
  for select to authenticated
  using (lower(email) = lower(coalesce((select auth.jwt()) ->> 'email', '')));

-- Reclamos: cualquiera registra uno nuevo; solo administradores los leen y responden
drop policy if exists "complaints_insert" on public.complaints;
create policy "complaints_insert" on public.complaints
  for insert to anon, authenticated
  with check (status = 'pendiente' and response is null and answered_at is null);

drop policy if exists "complaints_admin_read" on public.complaints;
create policy "complaints_admin_read" on public.complaints
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "complaints_admin_update" on public.complaints;
create policy "complaints_admin_update" on public.complaints
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------- Fotos (Storage) ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "productos_admin_insert" on storage.objects;
create policy "productos_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'productos' and (select public.is_admin()));

drop policy if exists "productos_admin_update" on storage.objects;
create policy "productos_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'productos' and (select public.is_admin()));

drop policy if exists "productos_admin_delete" on storage.objects;
create policy "productos_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'productos' and (select public.is_admin()));

-- ---------- Administrador ----------
-- Correo del dueño de la tienda. Para agregar otro administrador, añade otra fila.
insert into public.admins (email) values ('nicolashuamanlenes37@gmail.com')
on conflict do nothing;
