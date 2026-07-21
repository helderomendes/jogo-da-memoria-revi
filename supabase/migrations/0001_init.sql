-- ============================================================================
-- Jogo da Memória Revi — schema inicial
-- Rode este arquivo INTEIRO no SQL Editor do projeto Supabase (jogo-da-memoria).
-- Ele é idempotente: pode rodar de novo sem quebrar.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabelas
-- ----------------------------------------------------------------------------

-- Cartas: cada linha é um par. `mode` = 'text' (título) OU 'image' (capa).
create table if not exists public.cards (
  id          text primary key,
  text        text not null default '',
  image       text,
  mode        text not null default 'text' check (mode in ('text', 'image')),
  sort_order  int  not null default 0,
  updated_at  timestamptz not null default now()
);

-- Faixas de prêmio / brindes, com estoque.
create table if not exists public.prize_tiers (
  id            text primary key,
  pairs         int,                       -- pares certos que liberam a faixa (null = reserva)
  label         text not null default '',
  description   text not null default '',
  icon          text not null default 'gift',
  enabled       boolean not null default true,
  stock_initial int,                       -- referência (null = ilimitado)
  stock         int,                       -- disponível; dá baixa a cada entrega (null = ilimitado)
  sort_order    int not null default 0,
  updated_at    timestamptz not null default now()
);

-- Configuração do jogo: uma única linha (id = 1), guardada como JSON.
create table if not exists public.game_config (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Log de partidas = base de leads.
create table if not exists public.game_logs (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  name            text,
  phone           text,
  company         text,
  pairs_sorteados text[],
  chances_usadas  int,
  pares_certos    int,
  premio_ganho    text,
  codigo_retirada text
);

create index if not exists game_logs_created_at_idx on public.game_logs (created_at desc);

-- ----------------------------------------------------------------------------
-- Função atômica de premiação (evita "vender" o mesmo último brinde 2x quando
-- houver mais de um totem). Escolhe a melhor faixa alcançável COM estoque e dá
-- baixa de 1 unidade, tudo numa transação com lock de linha.
-- ----------------------------------------------------------------------------
create or replace function public.award_prize(correct_pairs int)
returns setof public.prize_tiers
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen public.prize_tiers;
begin
  select * into chosen
  from public.prize_tiers
  where enabled = true
    and pairs is not null
    and pairs > 0
    and pairs <= correct_pairs
    and (stock is null or stock > 0)
  order by pairs desc
  limit 1
  for update;

  if not found then
    return;  -- nenhum brinde disponível
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

-- ----------------------------------------------------------------------------
-- Row Level Security
--   Leitura pública (totem sem login): cards, prize_tiers, game_config.
--   Escrita de config/cartas/brindes: só usuários autenticados (admin).
--   game_logs: totem só INSERE; admin lê/edita/apaga. Anônimo NÃO lê leads.
-- ----------------------------------------------------------------------------
alter table public.cards       enable row level security;
alter table public.prize_tiers enable row level security;
alter table public.game_config enable row level security;
alter table public.game_logs   enable row level security;

-- cards
drop policy if exists cards_read_all   on public.cards;
drop policy if exists cards_write_auth on public.cards;
create policy cards_read_all   on public.cards for select using (true);
create policy cards_write_auth on public.cards for all
  to authenticated using (true) with check (true);

-- prize_tiers
drop policy if exists tiers_read_all   on public.prize_tiers;
drop policy if exists tiers_write_auth on public.prize_tiers;
create policy tiers_read_all   on public.prize_tiers for select using (true);
create policy tiers_write_auth on public.prize_tiers for all
  to authenticated using (true) with check (true);

-- game_config
drop policy if exists config_read_all   on public.game_config;
drop policy if exists config_write_auth on public.game_config;
create policy config_read_all   on public.game_config for select using (true);
create policy config_write_auth on public.game_config for all
  to authenticated using (true) with check (true);

-- game_logs: qualquer um (totem anônimo) insere; só admin lê/edita/apaga.
drop policy if exists logs_insert_all  on public.game_logs;
drop policy if exists logs_select_auth on public.game_logs;
drop policy if exists logs_modify_auth on public.game_logs;
create policy logs_insert_all  on public.game_logs for insert with check (true);
create policy logs_select_auth on public.game_logs for select to authenticated using (true);
create policy logs_modify_auth on public.game_logs for delete to authenticated using (true);

-- Permite o totem anônimo chamar a função de premiação.
grant execute on function public.award_prize(int) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Storage: bucket público para imagens de capa dos cards.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('card-images', 'card-images', true)
on conflict (id) do nothing;

drop policy if exists card_images_read   on storage.objects;
drop policy if exists card_images_write  on storage.objects;
create policy card_images_read on storage.objects for select
  using (bucket_id = 'card-images');
create policy card_images_write on storage.objects for all
  to authenticated
  using (bucket_id = 'card-images')
  with check (bucket_id = 'card-images');
