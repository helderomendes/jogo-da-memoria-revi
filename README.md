# Jogo da Memória Revi

Totem touchscreen (kiosk, tela cheia) do Jogo da Memória da Revi. React + Vite + TailwindCSS, sem backend — persistência local em `localStorage` via uma camada de dados isolada (`src/utils/dataStore.js`) pensada para ser trocada por uma API depois.

## Rodando localmente

```bash
npm install
npm run dev      # totem em http://localhost:5173
```

Acesse `/admin` para o painel de administração (cartas, prêmios, configurações e log de partidas).

```bash
npm run build    # build de produção
npm run lint     # oxlint
```

## Estrutura

```
src/
  admin/        painel administrativo (rota /admin)
  components/   peças de UI reutilizáveis (Board, Card, VirtualKeyboard, ...)
  context/      KioskContext — máquina de estados do fluxo do totem
  data/         dados default: cartas, faixas de prêmio, configuração do jogo
  screens/      as 7 telas do fluxo (Idle → Cadastro → Instruções → Jogo → Resultado → Prêmio → Agradecimento)
  utils/        motor do jogo, storage, máscaras, timers
```

## Trocar localStorage por uma API

Toda leitura/escrita de dados passa por `src/utils/dataStore.js`. As funções já são assíncronas — basta trocar o corpo de cada uma por uma chamada `fetch`/`axios` sem alterar quem as consome (telas e painel admin).

## Regras do jogo

- Banco fixo de 25 pares (`src/data/cards.js`). Cada partida sorteia 10 pares, evitando repetir os pares usados nas últimas N partidas (`antiRepeatLastGames` em `src/data/config.js`); se o pool elegível ficar pequeno, libera tudo de novo.
- Até 3 tentativas com o mesmo conjunto de pares (posições reembaralhadas a cada tentativa). Cada tentativa começa com todas as cartas visíveis por alguns segundos (memorização) e tem um número limitado de jogadas (`movesPerRound`).
- Faixas de prêmio configuráveis em `src/data/prizes.js` / painel admin.

## Formato de tela e modelos de premiação

Tudo configurável no `/admin`, sem substituir o que já existia:

- **Formato da tela** (aba *Evento & configurações*): `Horizontal (TV)` — layout pra TV/monitor deitado (ex.: TV 43"), com título à esquerda e cartas girando à direita, placar lateral e cartas "deitadas" no jogo — ou `Vertical (totem)`, o formato original.
- **Modelo de premiação** (aba *Premiação & estoque*): os modelos convivem e cada brinde pertence a um deles.
  - `Roleta por faixa` — o jogo sorteia o brinde conforme os pares certos (modelo original).
  - `Escolha do jogador` — quem fecha o mínimo de pares (padrão 4) escolhe 1 entre as opções ativas (D2C Summit: Gift Card, Massagem ou Chopp). A partida é gravada com o brinde escolhido; se a pessoa sair sem escolher, o lead é gravado como "Não escolheu".
- **Evento** (aba *Evento & configurações*): nome + tag de origem (ex.: `d2c-summit`). Todo lead novo recebe a tag; na aba *Leads* dá pra filtrar por evento e usar **Exportar p/ HubSpot** (CSV de contatos com nome/sobrenome, telefone +55 e a coluna "Evento de origem").

Setup ativo agora: horizontal + escolha + D2C Summit (migration `0010_prize_modes_d2c.sql`).
