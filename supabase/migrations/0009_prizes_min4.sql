-- ============================================================================
-- Só ganha quem fecha 4 pares OU MAIS. De 1 a 3 acertos não há brinde.
-- Mantém apenas as faixas 4, 5 e 6 (Surpresa) e remove todo o resto.
-- Rode INTEIRO no SQL Editor do Supabase. Idempotente.
-- ============================================================================

alter table public.prize_tiers add column if not exists image text;

insert into public.prize_tiers (id, pairs, label, description, icon, enabled, stock_initial, stock, sort_order) values
  ('surpresa4', 4, 'Surpresa', '4 pares certos. Você ganhou um brinde surpresa!', 'gift', true, null, null, 4),
  ('surpresa5', 5, 'Surpresa', '5 pares certos. Você ganhou um brinde surpresa!', 'gift', true, null, null, 5),
  ('surpresa6', 6, 'Surpresa', '6 pares certos. Você ganhou um brinde surpresa!', 'gift', true, null, null, 6)
on conflict (id) do update set
  pairs         = excluded.pairs,
  label         = excluded.label,
  description   = excluded.description,
  icon          = excluded.icon,
  enabled       = excluded.enabled,
  stock_initial = excluded.stock_initial,
  stock         = excluded.stock,
  sort_order    = excluded.sort_order,
  updated_at    = now();

-- Remove faixas de 1 a 3 (e quaisquer brindes antigos).
delete from public.prize_tiers
where id not in ('surpresa4','surpresa5','surpresa6');
