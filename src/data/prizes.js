// Faixas de prêmio. `pairs` = número exato de pares certos que libera a faixa.
// Com 3 chances totais, o jogador fecha no máximo 3 pares — por isso as faixas
// vão de 1 a 3. A faixa `bottle` fica sem `pairs` (reserva): defina no admin
// a regra de quando ela deve ser liberada.
export const DEFAULT_PRIZE_TIERS = [
  {
    id: 'chocolate',
    pairs: 1,
    label: 'Chocolate GoldKo',
    description: '1 par certo. Um docinho pra comemorar.',
  },
  {
    id: 'sacola',
    pairs: 2,
    label: 'Sacola Revi',
    description: '2 pares certos. Leve a sacola pra casa.',
  },
  {
    id: 'giftcard',
    pairs: 3,
    label: 'Gift Card',
    description: '3 de 3 pares certos — resultado máximo!',
  },
  {
    id: 'bottle',
    pairs: null,
    label: 'Squeeze Revi',
    description: 'Prêmio reserva — ainda sem regra de liberação definida.',
  },
]
