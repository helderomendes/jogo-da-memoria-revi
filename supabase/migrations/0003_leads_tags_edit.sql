-- ============================================================================
-- Jogo da Memória Revi — leads editáveis + tags
-- Rode este arquivo INTEIRO no SQL Editor do projeto Supabase (jogo-da-memoria).
-- Ele é idempotente: pode rodar de novo sem quebrar.
--
-- O que faz:
--   1) Adiciona a coluna `tags` (text[]) em game_logs, com a tag de origem
--      'jogo-da-memoria' como padrão e no final de qualquer conjunto de tags.
--   2) Preenche as linhas existentes com a tag de origem.
--   3) Libera UPDATE de game_logs para o admin (edição manual dos campos).
-- ============================================================================

-- 1) Coluna de tags. Toda partida nasce marcada como 'jogo-da-memoria'.
alter table public.game_logs
  add column if not exists tags text[] not null default '{jogo-da-memoria}';

-- 2) Backfill: garante a tag de origem no final das linhas antigas.
update public.game_logs
  set tags = case
    when tags is null or array_length(tags, 1) is null then array['jogo-da-memoria']
    when not ('jogo-da-memoria' = any(tags)) then tags || array['jogo-da-memoria']
    else tags
  end
  where tags is null
     or array_length(tags, 1) is null
     or not ('jogo-da-memoria' = any(tags));

-- 3) Permite ao admin (autenticado) editar leads. O totem anônimo continua
--    só inserindo (policy logs_insert_all já existente).
drop policy if exists logs_update_auth on public.game_logs;
create policy logs_update_auth on public.game_logs for update
  to authenticated using (true) with check (true);
