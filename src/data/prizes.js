// Faixas de prêmio. `pairs` = número de pares certos que libera a faixa.
// Agora cada faixa é um BRINDE SURPRESA — o prêmio real é definido na hora pela
// equipe. Estoque ilimitado (null): todo mundo que fecha pelo menos 1 par ganha.
//
// Campos (editáveis no admin):
//   pairs        = pares certos que liberam a faixa.
//   stock        = null = ilimitado (nunca esgota). Número = dá baixa a cada entrega.
//   enabled      = se false, a faixa é ignorada na premiação.
//   icon         = nome do ícone (ver src/data/prizeIcons.js).
//   image        = URL da foto do brinde (crop circular). null = usa o ícone.
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
})

export const DEFAULT_PRIZE_TIERS = [
  surprise(1),
  surprise(2),
  surprise(3),
  surprise(4),
  surprise(5),
  surprise(6),
]
