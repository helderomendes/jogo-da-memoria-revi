// Brindes. Cada brinde pertence a um MODELO de premiação (`rewardMode`):
//   'wheel'  → roleta por faixa de acertos (sorteio automático).
//   'choice' → escolha do jogador (quem atinge o mínimo escolhe 1 opção).
// O modelo ativo é definido em game_config.prizeMode (painel admin).
//
// Campos (editáveis no admin):
//   pairs        = (roleta) pares certos que liberam a faixa. Ignorado na escolha.
//   stock        = null = ilimitado (nunca esgota). Número = dá baixa a cada entrega.
//   enabled      = se false, o brinde é ignorado.
//   icon         = nome do ícone (ver src/data/prizeIcons.js).
//   image        = URL da foto do brinde. null = usa o ícone.
//   rewardMode   = 'wheel' | 'choice'.

// Roleta: brinde SURPRESA por faixa. Só ganha quem fecha 4 pares OU MAIS.
const surprise = (pairs) => ({
  id: `surpresa${pairs}`,
  pairs,
  label: 'Surpresa',
  description: `${pairs} ${pairs === 1 ? 'par certo' : 'pares certos'}. Você ganhou um brinde surpresa!`,
  icon: 'gift',
  image: null,
  enabled: true,
  stockInitial: null,
  stock: null,
  rewardMode: 'wheel',
})

// Escolha (D2C Summit): 3 opções à escolha do jogador.
const choice = (id, label, description, icon) => ({
  id,
  pairs: null,
  label,
  description,
  icon,
  image: null,
  enabled: true,
  stockInitial: null,
  stock: null,
  rewardMode: 'choice',
})

export const DEFAULT_PRIZE_TIERS = [
  surprise(4),
  surprise(5),
  surprise(6),
  choice('escolha-giftcard', 'Gift Card', 'Um gift card pra usar como quiser.', 'card'),
  choice('escolha-massagem', 'Massagem', 'Uma sessão de massagem relaxante aqui no evento.', 'spa'),
  choice('escolha-chopp', 'Chopp', 'Um chopp gelado por conta da Revi.', 'beer'),
]

export const REWARD_MODES = ['wheel', 'choice']

export const tierMode = (tier) => (tier?.rewardMode === 'choice' ? 'choice' : 'wheel')
