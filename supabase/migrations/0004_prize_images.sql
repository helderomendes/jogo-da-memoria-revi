-- ============================================================================
-- Fotos dos brindes: coluna `image` em prize_tiers + bucket de Storage próprio.
-- Rode este arquivo INTEIRO no SQL Editor do Supabase. É idempotente.
-- ============================================================================

-- Foto do brinde (URL pública). null = usa o ícone como fallback.
alter table public.prize_tiers add column if not exists image text;

-- ----------------------------------------------------------------------------
-- Storage: bucket público para as fotos dos brindes (crop circular na tela).
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('prize-images', 'prize-images', true)
on conflict (id) do nothing;

drop policy if exists prize_images_read  on storage.objects;
drop policy if exists prize_images_write on storage.objects;
create policy prize_images_read on storage.objects for select
  using (bucket_id = 'prize-images');
create policy prize_images_write on storage.objects for all
  to authenticated
  using (bucket_id = 'prize-images')
  with check (bucket_id = 'prize-images');
