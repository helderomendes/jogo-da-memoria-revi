-- ============================================================================
-- Premiação com SORTEIO ponderado por estoque quando há vários brindes na mesma
-- faixa de acertos. Continua atômica (lock de linha) pra múltiplos totens.
--
-- Regra:
--   1) nível alvo = maior `pairs` (<= correct_pairs) que tenha brinde ativo com
--      estoque; se o topo esgotou, faz downgrade pro nível abaixo.
--   2) entre os brindes desse nível, sorteia um com chance proporcional ao
--      estoque restante (estoque null = ilimitado, pesa 1).
--   3) dá baixa de 1 no escolhido.
--
-- Rode este arquivo INTEIRO no SQL Editor do Supabase. É idempotente.
-- ============================================================================

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
  -- 1) nível alvo (maior faixa alcançável com brinde disponível)
  select max(pairs) into lvl
  from public.prize_tiers
  where enabled = true
    and pairs is not null
    and pairs > 0
    and pairs <= correct_pairs
    and (stock is null or stock > 0);

  if lvl is null then
    return;  -- nenhum brinde disponível
  end if;

  -- soma dos pesos (estoque) dos candidatos nesse nível
  select sum(coalesce(stock, 1)) into total
  from public.prize_tiers
  where enabled = true and pairs = lvl and (stock is null or stock > 0);

  r := random() * total;

  -- 2) sorteio ponderado; trava as linhas candidatas pra baixa atômica
  for rec in
    select * from public.prize_tiers
    where enabled = true and pairs = lvl and (stock is null or stock > 0)
    order by id
    for update
  loop
    acc := acc + coalesce(rec.stock, 1);
    if r <= acc then
      chosen := rec;
      exit;
    end if;
  end loop;

  -- fallback defensivo (arredondamentos): pega o primeiro candidato
  if chosen.id is null then
    select * into chosen from public.prize_tiers
    where enabled = true and pairs = lvl and (stock is null or stock > 0)
    order by id
    limit 1
    for update;
  end if;

  if chosen.id is null then
    return;
  end if;

  -- 3) baixa de estoque (null = ilimitado, não mexe)
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
