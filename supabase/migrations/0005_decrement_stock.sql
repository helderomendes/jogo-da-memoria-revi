-- ============================================================================
-- Baixa de estoque avulsa, usada pela sincronização do modo OFFLINE.
-- Quando o totem premia sem internet, ele decide o brinde e dá baixa no estoque
-- LOCAL; ao reconectar, chama esta função pra refletir a baixa no servidor.
-- Rode este arquivo INTEIRO no SQL Editor do Supabase. É idempotente.
-- ============================================================================

create or replace function public.decrement_prize_stock(p_id text, p_qty int default 1)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.prize_tiers
    set stock = greatest(0, stock - p_qty), updated_at = now()
    where id = p_id
      and stock is not null;  -- estoque null = ilimitado, não mexe
end;
$$;

grant execute on function public.decrement_prize_stock(text, int) to anon, authenticated;
