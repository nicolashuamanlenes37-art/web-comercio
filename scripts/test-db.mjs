// Prueba el esquema y las reglas de seguridad en un Postgres en memoria.
// Uso: npm run test:db
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
const db = new PGlite();
// Stubs mínimos del entorno Supabase
await db.exec(`
create role anon; create role authenticated;
create schema auth; create schema storage;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true),''),'{}')::jsonb $$;
create table storage.buckets (id text primary key, name text, public bool, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
grant usage on schema public, auth, storage to anon, authenticated;
`);
await db.exec(readFileSync(new URL('../supabase/schema.sql', import.meta.url),'utf8'));
await db.exec(readFileSync(new URL('../supabase/seed.sql', import.meta.url),'utf8'));
await db.exec(readFileSync(new URL('../supabase/seed.sql', import.meta.url),'utf8')); // idempotente
await db.exec(`grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;
update public.admins set email='admin@test.com';`);
const q = async (role, claims, sql) => {
  await db.exec(`reset role; set request.jwt.claims = '${JSON.stringify(claims)}'; set role ${role};`);
  try { const r = await db.query(sql); return r.rows ?? r.affectedRows; } catch (e) { return 'ERR: ' + e.message; } finally { await db.exec('reset role'); }
};
console.log('counts', (await db.query('select (select count(*) from categories) c, (select count(*) from products) p, (select count(*) from products where category_id is null) orphan')).rows);
console.log('anon read', (await q('anon', {}, 'select count(*) from products'))[0]);
console.log('anon insert product', await q('anon', {}, "insert into products(name) values ('x')"));
console.log('user update', await q('authenticated', {email:'otro@x.com'}, "update products set price=1 returning id"));
console.log('admin update', (await q('authenticated', {email:'Admin@Test.com'}, "update products set price=5 where name='Lejía' returning name, price")));
console.log('admin hide', (await q('authenticated', {email:'admin@test.com'}, "update products set active=false where name='Lejía' returning name")));
console.log('anon sees hidden?', await q('anon', {}, "select name from products where name='Lejía'"));
console.log('anon complaint', await q('anon', {}, "insert into complaints(code,kind,full_name,document,email,detail,request) values ('R-1','reclamo','Juan Perez','12345678','j@x.com','Producto llegó roto','Cambio del producto')"));
console.log('anon complaint forged status', await q('anon', {}, "insert into complaints(code,kind,full_name,document,email,detail,request,status) values ('R-2','queja','Juan Perez','12345678','j@x.com','Demora en la atención','Mejor servicio','atendido')"));
console.log('anon read complaints', await q('anon', {}, 'select * from complaints'));
console.log('admin read complaints', (await q('authenticated', {email:'admin@test.com'}, 'select code from complaints')));
console.log('admin self check', await q('authenticated', {email:'admin@test.com'}, 'select email from admins'));
console.log('user self check', await q('authenticated', {email:'otro@x.com'}, 'select email from admins'));
console.log('upload anon', await q('anon', {}, "insert into storage.objects(bucket_id,name) values ('productos','a.webp')"));
console.log('upload admin', await q('authenticated', {email:'admin@test.com'}, "insert into storage.objects(bucket_id,name) values ('productos','a.webp')"));
