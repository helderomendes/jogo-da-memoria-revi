-- ============================================================================
-- D2C Summit: no modelo "escolha", 1 par certo ou mais já leva o prêmio.
-- Rode no SQL Editor do Supabase (depois da 0010). Idempotente.
-- ============================================================================

update public.game_config
  set data = data || jsonb_build_object('choiceMinPairs', 1),
      updated_at = now()
  where id = 1;
