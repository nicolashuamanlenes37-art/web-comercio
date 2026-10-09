-- Catálogo inicial de Accesorios N&D (generado con `npm run seed:sql`).
-- Ejecutar una sola vez, después de schema.sql.

insert into public.categories (slug, name, tagline, cover_url, sort) values
  ('tecnologia', 'Tecnología', 'Celular, computadora y TV', 'https://images.unsplash.com/photo-1586254116951-5263e2cdb44c?w=900&h=900&fit=crop&auto=format&q=75', 1),
  ('hogar', 'Hogar', 'Para tu casa', 'https://images.unsplash.com/photo-1577576223085-3eb295cd414f?w=900&h=900&fit=crop&auto=format&q=75', 2),
  ('limpieza', 'Limpieza y cuidado personal', 'Casa limpia, todo en un solo lugar', 'https://images.unsplash.com/photo-1626379481874-3dc5678fa8ca?w=900&h=900&fit=crop&auto=format&q=75', 3),
  ('bebidas', 'Bebidas', 'Siempre frías', 'https://images.unsplash.com/photo-1624896276654-2eb0c7e8247c?w=900&h=900&fit=crop&auto=format&q=75', 4),
  ('harinas', 'Harinas y superalimentos', 'Naturales del Perú', 'https://images.unsplash.com/photo-1760445528355-19c965df8d4d?w=900&h=900&fit=crop&auto=format&q=75', 5)
on conflict (slug) do nothing;

insert into public.products (category_id, name, description, price, image_url, badge, featured, sort)
select c.id, v.name, v.description, v.price, v.image_url, v.badge, v.featured, v.sort
from (values
  ('tecnologia', 'Cable USB tipo C', 'Carga y transferencia de datos. Compatible con la mayoría de celulares Android.', null::numeric, 'https://images.unsplash.com/photo-1492107376256-4026437926cd?w=800&h=800&fit=crop&auto=format&q=75', 'Más vendido', true, 1),
  ('tecnologia', 'Cable micro USB (V8)', 'Para celulares, parlantes y accesorios con entrada micro USB.', null::numeric, 'https://images.unsplash.com/photo-1595756630452-736bc8ef3693?w=800&h=800&fit=crop&auto=format&q=75', null, false, 2),
  ('tecnologia', 'Cargador de pared USB', 'Cabezal cargador para enchufe. Úsalo con tu cable tipo C o V8.', null::numeric, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&h=800&fit=crop&auto=format&q=75', null, true, 3),
  ('tecnologia', 'Audífonos inalámbricos ZYNC', 'Audífonos bluetooth con estuche de carga.', null::numeric, 'https://images.unsplash.com/photo-1632200004922-bc18602c79fc?w=800&h=800&fit=crop&auto=format&q=75', 'Nuevo', true, 4),
  ('tecnologia', 'Case para iPhone', 'Fundas protectoras en varios colores y modelos.', null::numeric, 'https://images.unsplash.com/photo-1535157412991-2ef801c1748b?w=800&h=800&fit=crop&auto=format&q=75', null, true, 5),
  ('tecnologia', 'Teclado para computadora', 'Teclado USB para PC y laptop.', null::numeric, 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=800&fit=crop&auto=format&q=75', null, false, 6),
  ('tecnologia', 'Antena para TV', 'Antena para señal digital de televisión.', null::numeric, 'https://images.unsplash.com/photo-1636230837680-478e71305f22?w=800&h=800&fit=crop&auto=format&q=75', null, false, 7),
  ('hogar', 'Platos hondos', 'Platos hondos para sopas y cremas.', null::numeric, 'https://images.unsplash.com/photo-1523367438061-01c055ce790c?w=800&h=800&fit=crop&auto=format&q=75', null, false, 8),
  ('hogar', 'Almohada', 'Almohada suave para descansar mejor.', null::numeric, 'https://images.unsplash.com/photo-1629949009710-2df14c41a72e?w=800&h=800&fit=crop&auto=format&q=75', null, true, 9),
  ('limpieza', 'Lejía', 'Desinfecta y blanquea. Varias presentaciones.', null::numeric, 'https://images.unsplash.com/photo-1649005011845-ef225c89da86?w=800&h=800&fit=crop&auto=format&q=75', null, false, 10),
  ('limpieza', 'Limpiatodo', 'Limpiador multiusos para pisos y superficies.', null::numeric, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=800&fit=crop&auto=format&q=75', null, false, 11),
  ('limpieza', 'Lavavajillas', 'Para dejar tu vajilla limpia y sin grasa.', null::numeric, 'https://images.unsplash.com/photo-1590610994353-7b0e7546e681?w=800&h=800&fit=crop&auto=format&q=75', null, false, 12),
  ('limpieza', 'Detergente', 'Detergente para ropa blanca y de color.', null::numeric, 'https://images.unsplash.com/photo-1624372635310-01d078c05dd9?w=800&h=800&fit=crop&auto=format&q=75', null, true, 13),
  ('limpieza', 'Papel toalla', 'Rollos de papel toalla absorbente.', null::numeric, 'https://images.unsplash.com/photo-1583496597467-d968d2fa33a8?w=800&h=800&fit=crop&auto=format&q=75', null, false, 14),
  ('limpieza', 'Jabón de tocador', 'Jabones para el cuidado diario.', null::numeric, 'https://images.unsplash.com/photo-1650189608237-db034f45e552?w=800&h=800&fit=crop&auto=format&q=75', null, false, 15),
  ('limpieza', 'Pasta dental', 'Cuidado bucal para toda la familia.', null::numeric, 'https://images.unsplash.com/photo-1612705166160-97d3b2e8e212?w=800&h=800&fit=crop&auto=format&q=75', null, false, 16),
  ('bebidas', 'Gaseosas y bebidas', 'Gaseosas, aguas y refrescos. Consulta marcas y tamaños disponibles.', null::numeric, 'https://images.unsplash.com/photo-1533007716222-4b465613a984?w=800&h=800&fit=crop&auto=format&q=75', null, false, 17),
  ('harinas', 'Harina de cúrcuma', 'Cúrcuma en polvo, ideal para golden milk y guisos.', null::numeric, 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&h=800&fit=crop&auto=format&q=75', null, true, 18),
  ('harinas', 'Cacao en polvo', 'Cacao peruano para bebidas y postres.', null::numeric, 'https://images.unsplash.com/photo-1640958899669-12f9b327d38f?w=800&h=800&fit=crop&auto=format&q=75', null, false, 19),
  ('harinas', 'Maca amarilla', 'Maca andina en polvo.', null::numeric, 'https://images.unsplash.com/photo-1595414902678-862fe51c9f27?w=800&h=800&fit=crop&auto=format&q=75', null, false, 20),
  ('harinas', 'Maca negra', 'Maca negra andina en polvo.', null::numeric, 'https://images.unsplash.com/photo-1565498971161-42ae3dbcca75?w=800&h=800&fit=crop&auto=format&q=75', null, false, 21),
  ('harinas', 'Harina de camote', 'Para panes, tortillas y repostería.', null::numeric, 'https://images.unsplash.com/photo-1741112480266-62def497fa27?w=800&h=800&fit=crop&auto=format&q=75', null, false, 22)
) as v(category, name, description, price, image_url, badge, featured, sort)
join public.categories c on c.slug = v.category
where not exists (select 1 from public.products p where p.name = v.name);
