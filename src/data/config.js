// Configuração geral do jogo. Editável no painel admin, persistida via dataStore.
export const DEFAULT_GAME_CONFIG = {
  pairsPerGame: 8,
  // 4x4 = 16 cartas. No layout vertical as cartas ficam "em pé"; no horizontal
  // (TV) ficam "deitadas" — o mesmo 4x4 preenche bem os dois formatos.
  boardRows: 4,
  boardCols: 4,
  // Contagem "PENSE, 3, 2, 1" antes das cartas virarem pra memorizar.
  getReadySeconds: 3,
  // Segundos com todas as cartas viradas pra memorizar, antes de virar pra baixo.
  memorizeSeconds: 3,
  // Chances totais do jogo (não por rodada). Cada jogada — vire 2 cartas,
  // acerte ou erre — consome 1 chance. Zerou as chances, acabou o jogo.
  // 6 chances = até 6 acertos, cobrindo todas as faixas de brinde (1 a 6).
  totalChances: 6,
  // Cronômetro da fase de jogo: corre em paralelo com as chances. Zerou o
  // tempo OU as chances (o que vier primeiro), o jogo termina.
  guessSeconds: 40,
  antiRepeatLastGames: 2,
  idleTimeoutMs: 25000,
  thanksScreenMs: 5000,

  // --- Formato de tela ---
  // 'landscape' = horizontal (TV/monitor deitado) · 'portrait' = vertical (totem).
  layout: 'landscape',

  // --- Modelo de premiação ---
  // 'wheel'  = roleta: brinde por faixa de acertos, sorteado automaticamente.
  // 'choice' = escolha: quem atinge o mínimo escolhe 1 entre os brindes do modelo.
  prizeMode: 'choice',
  // Mínimo de pares certos pra poder escolher um brinde (modelo 'choice').
  choiceMinPairs: 4,

  // --- Evento ---
  // Nome exibido e usado como "Evento de origem" no export pro HubSpot.
  eventName: 'D2C Summit',
  // Tag gravada em todo lead do evento (identifica a origem no CRM).
  eventTag: 'd2c-summit',
}

export const LAYOUTS = [
  { id: 'landscape', label: 'Horizontal (TV)', hint: 'TV/monitor deitado — ex.: TV 43"' },
  { id: 'portrait', label: 'Vertical (totem)', hint: 'Totem/tablet em pé' },
]

export const PRIZE_MODES = [
  {
    id: 'wheel',
    label: 'Roleta por faixa',
    hint: 'O jogo sorteia o brinde conforme os pares certos (faixas com estoque).',
  },
  {
    id: 'choice',
    label: 'Escolha do jogador',
    hint: 'Quem atinge o mínimo de pares escolhe 1 brinde entre as opções.',
  },
]
