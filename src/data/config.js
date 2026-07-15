// Configuração geral do jogo. Editável no painel admin, persistida via dataStore.
export const DEFAULT_GAME_CONFIG = {
  pairsPerGame: 10,
  boardRows: 4,
  boardCols: 5,
  memorizeSeconds: 5,
  maxAttempts: 3,
  // Jogadas (flips de 2 cartas) disponíveis por rodada. Limita a rodada pra
  // que "não completar" seja um resultado possível mesmo sem pressa.
  movesPerRound: 10,
  standardPrizeMinPairs: 6,
  antiRepeatLastGames: 2,
  idleTimeoutMs: 25000,
  thanksScreenMs: 5000,
}
