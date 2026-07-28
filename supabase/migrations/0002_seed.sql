-- ============================================================================
-- Seed inicial. Rode UMA vez, depois do 0001_init.sql.
-- Usa ON CONFLICT DO NOTHING: não sobrescreve o que você já editou no admin.
-- ============================================================================

-- Cartas (25 pares) — todas em modo título até você subir as imagens de capa.
insert into public.cards (id, text, image, mode, sort_order) values
  ('p01', '34x de ROI',                    null, 'text',  1),
  ('p02', '95% de abertura no WhatsApp',   null, 'text',  2),
  ('p03', 'Payback em 2,4 meses',          null, 'text',  3),
  ('p04', 'WhatsApp + Email + SMS',        null, 'text',  4),
  ('p05', 'Inbox do Instagram',            null, 'text',  5),
  ('p06', 'Claude + Revi',                 null, 'text',  6),
  ('p07', 'ROI, a raposa',                 null, 'text',  7),
  ('p08', 'ROI Makers Club',               null, 'text',  8),
  ('p09', 'Muito além do Inbox',           null, 'text',  9),
  ('p10', 'A Revi vende por você',         null, 'text', 10),
  ('p11', 'Vendas no WhatsApp',            null, 'text', 11),
  ('p12', 'ROI acima de 100x',             null, 'text', 12),
  ('p13', 'Wellness e Fitness',            null, 'text', 13),
  ('p14', 'Alimentação e Suplementos',     null, 'text', 14),
  ('p15', 'Moda e Beleza',                 null, 'text', 15),
  ('p16', 'Joias e Acessórios',            null, 'text', 16),
  ('p17', '400+ e-commerces',              null, 'text', 17),
  ('p18', 'Revi Tag',                      null, 'text', 18),
  ('p19', 'Carrinho recuperado',           null, 'text', 19),
  ('p20', 'Segmentação RFM',               null, 'text', 20),
  ('p21', 'Fluxos de Conversa',            null, 'text', 21),
  ('p22', 'CRM pra e-commerce',            null, 'text', 22),
  ('p23', 'Parceiro Meta',                 null, 'text', 23),
  ('p24', 'Modo ROI ativado',              null, 'text', 24),
  ('p25', 'Revi 3 Anos',                   null, 'text', 25)
on conflict (id) do nothing;

-- Brindes por faixa de acertos + estoque. Vários brindes no mesmo `pairs` =
-- o jogo sorteia um (peso pelo estoque). Faixas com gaps fazem downgrade.
insert into public.prize_tiers (id, pairs, label, description, icon, enabled, stock_initial, stock, sort_order) values
  ('chocolate', 1, 'Chocolate GoldKo',    '1 par certo. Um docinho pra comemorar.',                       'candy',  true, 50, 50, 1),
  ('bottom',    1, 'Bottom',              '1 par certo. Leve um Bottom.',                                 'star',   true, 50, 50, 2),
  ('magnesio',  2, 'Magnésio da Equaliv', '2 pares certos. Magnésio da Equaliv.',                         'pill',   true, 50, 50, 3),
  ('parceiro',  3, 'Brinde do Parceiro',  '3 pares certos. Brinde especial do parceiro.',                 'gift',   true, 50, 50, 4),
  ('chaveiro',  3, 'Chaveiro ROI',        '3 pares certos. Leve o chaveiro do ROI.',                      'key',    true, 50, 50, 5),
  ('sacola',    4, 'Sacola Revi',         '4 pares certos. Leve a sacola pra casa.',                      'bag',    true, 50, 50, 6),
  ('giftcard',  6, 'Gift Card',           '6 pares certos — resultado máximo! Gift card por email/WhatsApp.', 'card', true, 20, 20, 7)
on conflict (id) do nothing;

-- Configuração do jogo (linha única).
insert into public.game_config (id, data) values (
  1,
  '{
    "pairsPerGame": 8,
    "boardRows": 4,
    "boardCols": 4,
    "getReadySeconds": 3,
    "memorizeSeconds": 3,
    "totalChances": 3,
    "guessSeconds": 40,
    "antiRepeatLastGames": 2,
    "idleTimeoutMs": 25000,
    "thanksScreenMs": 5000
  }'::jsonb
)
on conflict (id) do nothing;
