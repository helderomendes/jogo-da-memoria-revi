-- ============================================================================
-- Brinde SURPRESA por faixa de acertos (1 a 6). Remove todos os brindes
-- nomeados; o prêmio real é definido na hora pela equipe. Estoque ilimitado
-- (null): quem fecha pelo menos 1 par ganha uma surpresa.
-- Rode INTEIRO no SQL Editor do Supabase. Idempotente.
-- ============================================================================

alter table public.prize_tiers add column if not exists image text;

insert into public.prize_tiers (id, pairs, label, description, icon, enabled, stock_initial, stock, sort_order) values
  ('surpresa1', 1, 'Surpresa', '1 par certo. Você ganhou um brinde surpresa!',    'gift', true, null, null, 1),
  ('surpresa2', 2, 'Surpresa', '2 pares certos. Você ganhou um brinde surpresa!', 'gift', true, null, null, 2),
  ('surpresa3', 3, 'Surpresa', '3 pares certos. Você ganhou um brinde surpresa!', 'gift', true, null, null, 3),
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

-- Remove qualquer brinde antigo (nomeados: chocolate, bottom, magnesio, etc.)
delete from public.prize_tiers
where id not in ('surpresa1','surpresa2','surpresa3','surpresa4','surpresa5','surpresa6');
