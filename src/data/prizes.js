// Faixas de prêmio. `pairs` = número de pares certos que libera a faixa.
// Cada faixa é um BRINDE SURPRESA — o prêmio real é definido na hora pela
// equipe. Só ganha quem fecha 4 pares OU MAIS; de 1 a 3 acertos não ganha nada.
// Estoque ilimitado (null): não esgota.
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

// Só 4+ acertos ganham. De 1 a 3 pares o jogador não recebe brinde.
export const DEFAULT_PRIZE_TIERS = [surprise(4), surprise(5), surprise(6)]
