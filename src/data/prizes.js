// Faixas de prêmio. `pairs` = número exato de pares certos que libera a faixa.
// Com 3 chances totais, o jogador fecha no máximo 3 pares — por isso as faixas
// vão de 1 a 3. A faixa `bottle` fica sem `pairs` (reserva): defina no admin
// a regra de quando ela deve ser liberada.
//
// Campos de estoque (editáveis no admin):
//   stockInitial = quantidade cadastrada de brindes dessa faixa (referência).
//   stock        = quantidade ainda disponível; dá baixa a cada prêmio entregue.
//                  `null` = estoque ilimitado (nunca esgota).
//   enabled      = se false, a faixa é ignorada na premiação (reserva/desativada).
//   icon         = nome do ícone (ver src/data/prizeIcons.js).
export const DEFAULT_PRIZE_TIERS = [
  {
    id: 'chocolate',
    pairs: 1,
    label: 'Chocolate GoldKo',
    description: '1 par certo. Um docinho pra comemorar.',
    icon: 'candy',
    enabled: true,
    stockInitial: 100,
    stock: 100,
  },
  {
    id: 'sacola',
    pairs: 2,
    label: 'Sacola Revi',
    description: '2 pares certos. Leve a sacola pra casa.',
    icon: 'bag',
    enabled: true,
    stockInitial: 50,
    stock: 50,
  },
  {
    id: 'giftcard',
    pairs: 3,
    label: 'Gift Card',
    description: '3 de 3 pares certos — resultado máximo!',
    icon: 'card',
    enabled: true,
    stockInitial: 20,
    stock: 20,
  },
  {
    id: 'bottle',
    pairs: null,
    label: 'Squeeze Revi',
    description: 'Prêmio reserva — ainda sem regra de liberação definida.',
    icon: 'bottle',
    enabled: false,
    stockInitial: 30,
    stock: 30,
  },
]
