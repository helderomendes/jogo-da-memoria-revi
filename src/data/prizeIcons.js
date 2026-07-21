// Registry de ícones dos brindes. Compartilhado entre o admin (seleção) e a
// tela de prêmio (renderização), pra que um tier criado no painel sempre tenha
// um ícone válido — mesmo com id novo. O tier guarda o `icon` por nome (string).
import {
  Candy,
  ShoppingBag,
  CreditCard,
  CupSoda,
  Gift,
  Coffee,
  Shirt,
  Ticket,
  Star,
  Trophy,
  Cookie,
  Headphones,
} from 'lucide-react'

export const PRIZE_ICONS = {
  candy: Candy,
  bag: ShoppingBag,
  card: CreditCard,
  bottle: CupSoda,
  gift: Gift,
  coffee: Coffee,
  shirt: Shirt,
  ticket: Ticket,
  star: Star,
  trophy: Trophy,
  cookie: Cookie,
  headphones: Headphones,
}

export const PRIZE_ICON_OPTIONS = Object.keys(PRIZE_ICONS)

export const DEFAULT_PRIZE_ICON = 'gift'

// Resolve o componente de ícone a partir do nome salvo no tier, com fallback.
export function resolvePrizeIcon(iconName) {
  return PRIZE_ICONS[iconName] ?? PRIZE_ICONS[DEFAULT_PRIZE_ICON]
}
