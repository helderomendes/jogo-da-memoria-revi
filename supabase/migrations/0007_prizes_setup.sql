-- ============================================================================
-- Reconfiguração dos brindes por faixa de acertos (pode haver vários no mesmo
-- `pairs` — o jogo sorteia um, com peso pelo estoque). Faixas com gaps fazem
-- downgrade (ex.: 5 acertos leva a faixa de 4).
--
--   1 acerto  -> Squeeze Revi  OU  Chocolate GoldKo   (sorteio)
--   2 acertos -> Magnésio da Equaliv
--   3 acertos -> Brinde do Parceiro  OU  Chaveiro ROI (sorteio)
--   4 acertos -> Sacola Revi
--   6 acertos -> Gift Card (email ou WhatsApp)
--
-- Faz UPSERT: atualiza faixa/nome/estoque, mas PRESERVA a foto (image) que você
-- já tiver enviado no admin. Rode INTEIRO no SQL Editor. Idempotente.
-- ============================================================================

-- Garante a coluna de foto (caso a 0004 ainda não tenha rodado).
alter table public.prize_tiers add column if not exists image text;

insert into public.prize_tiers (id, pairs, label, description, icon, enabled, stock_initial, stock, sort_order) values
  ('bottle',    1, 'Squeeze Revi',        '1 par certo. Leve um squeeze da Revi.',                            'bottle', true, 50, 50, 1),
  ('chocolate', 1, 'Chocolate GoldKo',    '1 par certo. Um docinho pra comemorar.',                           'candy',  true, 50, 50, 2),
  ('magnesio',  2, 'Magnésio da Equaliv', '2 pares certos. Magnésio da Equaliv.',                             'pill',   true, 50, 50, 3),
  ('parceiro',  3, 'Brinde do Parceiro',  '3 pares certos. Brinde especial do parceiro.',                     'gift',   true, 50, 50, 4),
  ('chaveiro',  3, 'Chaveiro ROI',        '3 pares certos. Leve o chaveiro do ROI.',                          'key',    true, 50, 50, 5),
  ('sacola',    4, 'Sacola Revi',         '4 pares certos. Leve a sacola pra casa.',                          'bag',    true, 50, 50, 6),
  ('giftcard',  6, 'Gift Card',           '6 pares certos — resultado máximo! Gift card por email/WhatsApp.', 'card',   true, 20, 20, 7)
on conflict (id) do update set
  pairs         = excluded.pairs,
  label         = excluded.label,
  description   = excluded.description,
  icon          = excluded.icon,
  enabled       = excluded.enabled,
  stock_initial = excluded.stock_initial,
  stock         = excluded.stock,
  sort_order    = excluded.sort_order,
  image         = coalesce(public.prize_tiers.image, excluded.image),  -- mantém foto já enviada
  updated_at    = now();

-- Remove brindes antigos que não fazem mais parte do conjunto (se existirem).
delete from public.prize_tiers
where id not in ('bottle','chocolate','magnesio','parceiro','chaveiro','sacola','giftcard');
