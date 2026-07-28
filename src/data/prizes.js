// Faixas de prêmio. `pairs` = número de pares certos que libera a faixa.
// Pode haver VÁRIOS brindes no mesmo `pairs` — nesse caso o jogo sorteia um
// (peso proporcional ao estoque). Faixas com gaps (ex.: 4 e 6) fazem downgrade:
// quem faz 5 acertos leva a faixa 4.
//
// Campos de estoque (editáveis no admin):
//   stockInitial = quantidade cadastrada de brindes dessa faixa (referência).
//   stock        = quantidade ainda disponível; dá baixa a cada prêmio entregue.
//                  `null` = estoque ilimitado (nunca esgota).
//   enabled      = se false, a faixa é ignorada na premiação (reserva/desativada).
//   icon         = nome do ícone (ver src/data/prizeIcons.js).
//   image        = URL da foto do brinde (crop circular). null = usa o ícone.
export const DEFAULT_PRIZE_TIERS = [
  // 1 acerto — sorteio entre Chocolate e Bombom
  {
    id: 'chocolate',
    pairs: 1,
    label: 'Chocolate GoldKo',
    description: '1 par certo. Um docinho pra comemorar.',
    icon: 'candy',
    image: null,
    enabled: true,
    stockInitial: 50,
    stock: 50,
  },
  {
    id: 'bombom',
    pairs: 1,
    label: 'Bombom',
    description: '1 par certo. Um bombom pra adoçar.',
    icon: 'cookie',
    image: null,
    enabled: true,
    stockInitial: 50,
    stock: 50,
  },
  // 2 acertos — Magnésio da Equaliv
  {
    id: 'magnesio',
    pairs: 2,
    label: 'Magnésio da Equaliv',
    description: '2 pares certos. Magnésio da Equaliv.',
    icon: 'pill',
    image: null,
    enabled: true,
    stockInitial: 50,
    stock: 50,
  },
  // 3 acertos — sorteio entre Brinde do Parceiro e Chaveiro ROI
  {
    id: 'parceiro',
    pairs: 3,
    label: 'Brinde do Parceiro',
    description: '3 pares certos. Brinde especial do parceiro.',
    icon: 'gift',
    image: null,
    enabled: true,
    stockInitial: 50,
    stock: 50,
  },
  {
    id: 'chaveiro',
    pairs: 3,
    label: 'Chaveiro ROI',
    description: '3 pares certos. Leve o chaveiro do ROI.',
    icon: 'key',
    image: null,
    enabled: true,
    stockInitial: 50,
    stock: 50,
  },
  // 4 acertos — Sacola Revi
  {
    id: 'sacola',
    pairs: 4,
    label: 'Sacola Revi',
    description: '4 pares certos. Leve a sacola pra casa.',
    icon: 'bag',
    image: null,
    enabled: true,
    stockInitial: 50,
    stock: 50,
  },
  // 6 acertos — Gift Card (entregue por email ou WhatsApp)
  {
    id: 'giftcard',
    pairs: 6,
    label: 'Gift Card',
    description: '6 pares certos — resultado máximo! Gift card por email ou WhatsApp.',
    icon: 'card',
    image: null,
    enabled: true,
    stockInitial: 20,
    stock: 20,
  },
]
