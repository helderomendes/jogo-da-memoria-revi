# Backend Supabase — Jogo da Memória Revi

O totem e o painel admin agora leem/gravam no Supabase. O totem roda sem login
(chave anônima) e só consegue ler cartas/config/brindes e gravar partidas. O
painel `/admin` exige login e gerencia tudo (cartas, brindes, estoque, leads).

## Setup (uma vez)

### 1. Rodar as migrations

No painel do Supabase do projeto **jogo-da-memoria** → **SQL Editor** → New query,
cole e rode, nesta ordem:

1. `supabase/migrations/0001_init.sql`  — tabelas, RLS, função de estoque, bucket
2. `supabase/migrations/0002_seed.sql`  — dados iniciais (25 cartas, 4 brindes, config)
3. `supabase/migrations/0003_leads_tags_edit.sql` — tags/edição de leads
4. `supabase/migrations/0004_prize_images.sql` — foto dos brindes (coluna `image` + bucket `prize-images`)
5. `supabase/migrations/0005_decrement_stock.sql` — baixa de estoque avulsa (usada pela sync do modo offline)
6. `supabase/migrations/0006_award_weighted.sql` — premiação com sorteio ponderado por estoque quando há vários brindes na mesma faixa
7. `supabase/migrations/0007_prizes_setup.sql` — reconfigura os brindes por faixa (1/2/3/4/6 acertos), preservando fotos já enviadas

## Modo offline (PWA)

O totem é uma PWA com Service Worker: o app abre 100% offline (app shell em
precache) e as leituras (cartas, config, brindes) ficam em cache local. Sem
internet, o jogo roda normal — as partidas e as baixas de estoque dos brindes
premiados entram numa fila no navegador (`localStorage`) e sobem
automaticamente quando a conexão volta:

- Partidas → `insert` em `game_logs`.
- Brinde premiado offline → baixa local no estoque + `decrement_prize_stock`
  no servidor ao reconectar (por isso a migration `0005`).

Ideal para **1 totem por evento** — o dispositivo é a fonte de verdade do
estoque enquanto está offline.

### 2. Configurar as chaves no app

Copie `.env.example` para `.env` e preencha:

```
VITE_SUPABASE_URL=https://vxgflmlyrajoadokjyqj.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key do projeto>
```

A `anon key` está em **Project Settings → API → Project API keys → `anon` / `public`**.
Reinicie o `npm run dev` depois de mexer no `.env`.

### 3. Criar o usuário admin

No painel Supabase → **Authentication → Users → Add user** → informe email e senha.
Esse é o login que você usará em `/admin`.

> Dica: em **Authentication → Providers → Email**, deixe "Confirm email" desligado
> se quiser que o usuário criado já entre direto, sem confirmação por email.

## Como a segurança funciona (RLS)

| Tabela        | Totem (anônimo)      | Admin (logado)        |
|---------------|----------------------|-----------------------|
| `cards`       | ler                  | ler + editar          |
| `prize_tiers` | ler                  | ler + editar          |
| `game_config` | ler                  | ler + editar          |
| `game_logs`   | **só inserir**       | ler + apagar          |

A lista de leads (`game_logs`) **não pode ser lida** por quem não está logado.

A baixa de estoque acontece na função `award_prize(correct_pairs)` — uma
transação atômica com lock de linha, para não entregar o mesmo último brinde
duas vezes quando houver mais de um totem.

## Deploy

Ao publicar (Vercel/Netlify), defina as mesmas variáveis `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY` no ambiente do projeto. O `/admin` fica acessível pela
web e você entra com o usuário criado no passo 3.
