// Faixas de prêmio. `rule` é usado pelo gameEngine para decidir qual faixa se aplica.
export const PRIZE_RULES = {
  FULL_FIRST_ATTEMPT: 'full_first_attempt',
  FULL_LATER_ATTEMPT: 'full_later_attempt',
  PARTIAL_STANDARD: 'partial_standard',
  BASIC: 'basic',
}

export const DEFAULT_PRIZE_TIERS = [
  {
    id: 'topo',
    rule: PRIZE_RULES.FULL_FIRST_ATTEMPT,
    label: 'Prêmio Topo',
    description: '10 de 10 pares na primeira tentativa. Resultado máximo.',
  },
  {
    id: 'intermediario',
    rule: PRIZE_RULES.FULL_LATER_ATTEMPT,
    label: 'Prêmio Intermediário',
    description: '10 de 10 pares fechados na 2ª ou 3ª tentativa.',
  },
  {
    id: 'padrao',
    rule: PRIZE_RULES.PARTIAL_STANDARD,
    label: 'Prêmio Padrão',
    description: '6 pares ou mais na melhor tentativa.',
  },
  {
    id: 'basico',
    rule: PRIZE_RULES.BASIC,
    label: 'Brinde Básico',
    description: 'Menos de 6 pares na melhor tentativa.',
  },
]
