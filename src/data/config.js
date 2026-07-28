// Configuração geral do jogo. Editável no painel admin, persistida via dataStore.
export const DEFAULT_GAME_CONFIG = {
  pairsPerGame: 8,
  // 4x4 = 16 cartas. Board quadrado funciona bem em retrato.
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
}
