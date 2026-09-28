-- ============================================================================
-- Modelos de premiação + evento D2C Summit.
--
-- 1) prize_tiers.reward_mode: cada brinde pertence a um modelo —
--      'wheel'  = roleta por faixa de acertos (o que já existia)
--      'choice' = escolha do jogador (novo)
--    O modelo ativo fica em game_config.data.prizeMode.
-- 2) award_prize (roleta) passa a considerar só brindes 'wheel'.
-- 3) Seed dos 3 brindes à escolha: Gift Card, Massagem, Chopp (estoque ilimitado;
--    ajuste no /admin).
-- 4) Ativa pro evento: layout horizontal (TV), modelo 'choice', evento D2C Summit
--    (tag 'd2c-summit' em todo lead novo).
--
-- Rode INTEIRO no SQL Editor do Supabase. Idempotente.
-- ============================================================================

alter table public.prize_tiers
  add column if not exists reward_mode text not null default 'wheel';

alter table public.prize_tiers drop constraint if exists prize_tiers_reward_mode_check;
alter table public.prize_tiers
  add constraint prize_tiers_reward_mode_check check (reward_mode in ('wheel', 'choice'));

insert into public.prize_tiers (id, pairs, label, description, icon, enabled, stock_initial, stock, sort_order, reward_mode) values
  ('escolha-giftcard', null, 'Gift Card', 'Um gift card pra usar como quiser.', 'card', true, null, null, 10, 'choice'),
  ('escolha-massagem', null, 'Massagem', 'Uma sessão de massagem relaxante aqui no evento.', 'spa', true, null, null, 11, 'choice'),
  ('escolha-chopp',    null, 'Chopp', 'Um chopp gelado por conta da Revi.', 'beer', true, null, null, 12, 'choice')
on conflict (id) do update set
  reward_mode = excluded.reward_mode,
  updated_at  = now();

-- Roleta: mesma regra da 0006, restrita aos brindes do modelo 'wheel'.
create or replace function public.award_prize(correct_pairs int)
returns setof public.prize_tiers
language plpgsql
security definer
set search_path = public
as $$
declare
  lvl    int;
  total  numeric;
  r      numeric;
  acc    numeric := 0;
  rec    public.prize_tiers;
  chosen public.prize_tiers;
begin
  select max(pairs) into lvl
  from public.prize_tiers
  where enabled = true
    and reward_mode = 'wheel'
    and pairs is not null
    and pairs > 0
    and pairs <= correct_pairs
    and (stock is null or stock > 0);

  if lvl is null then
    return;
  end if;

  select sum(coalesce(stock, 1)) into total
  from public.prize_tiers
  where enabled = true and reward_mode = 'wheel' and pairs = lvl and (stock is null or stock > 0);

  r := random() * total;

  for rec in
    select * from public.prize_tiers
    where enabled = true and reward_mode = 'wheel' and pairs = lvl and (stock is null or stock > 0)
    order by id
    for update
  loop
    acc := acc + coalesce(rec.stock, 1);
    if r <= acc then
      chosen := rec;
      exit;
    end if;
  end loop;

  if chosen.id is null then
    select * into chosen from public.prize_tiers
    where enabled = true and reward_mode = 'wheel' and pairs = lvl and (stock is null or stock > 0)
    order by id
    limit 1
    for update;
  end if;

  if chosen.id is null then
    return;
  end if;

  if chosen.stock is not null then
    update public.prize_tiers
      set stock = stock - 1, updated_at = now()
      where id = chosen.id
      returning * into chosen;
  end if;

  return next chosen;
end;
$$;

grant execute on function public.award_prize(int) to anon, authenticated;

-- Ativa o setup do D2C Summit (mantém as demais chaves da config).
insert into public.game_config (id, data) values (1, '{}'::jsonb)
on conflict (id) do nothing;

update public.game_config
  set data = data || jsonb_build_object(
        'layout', 'landscape',
        'prizeMode', 'choice',
        'choiceMinPairs', 1,
        'eventName', 'D2C Summit',
        'eventTag', 'd2c-summit'
      ),
      updated_at = now()
  where id = 1;
