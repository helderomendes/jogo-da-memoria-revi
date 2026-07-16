import { useEffect, useState } from 'react'
import { getGameConfig, getPrizeTiers, savePrizeTiers } from '../utils/dataStore'

export default function PrizesEditor() {
  const [tiers, setTiers] = useState(null)
  const [totalChances, setTotalChances] = useState(null)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    getPrizeTiers().then(setTiers)
    getGameConfig().then((cfg) => setTotalChances(cfg.totalChances))
  }, [])

  if (!tiers || totalChances === null) return <p>Carregando...</p>

  const updateTier = (id, field, value) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
  }

  const updatePairs = (id, rawValue) => {
    const pairs = rawValue === '' ? null : Number(rawValue)
    updateTier(id, 'pairs', pairs)
  }

  const handleSave = async () => {
    await savePrizeTiers(tiers)
    setSavedAt(Date.now())
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Faixas de prêmio</h2>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-sm font-semibold text-lime-500">Salvo!</span>}
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            Salvar alterações
          </button>
        </div>
      </div>

      <p className="mb-4 text-sm text-ink-dim">
        "Pares certos" define quantos pares fechados liberam essa faixa (0 a {totalChances}, já
        que o jogo tem {totalChances} chances — ajustável em Configurações). Deixe vazio pra
        faixas sem regra automática ainda.
      </p>

      <div className="space-y-4">
        {tiers.map((tier) => (
          <div key={tier.id} className="rounded-lg border border-line-light bg-card-light p-4">
            <div className="mb-3 flex items-center gap-3">
              <label className="text-sm font-semibold">Pares certos</label>
              <input
                type="number"
                min={0}
                max={totalChances}
                value={tier.pairs ?? ''}
                onChange={(e) => updatePairs(tier.id, e.target.value)}
                placeholder="—"
                className="w-20 rounded-md border border-line-light px-3 py-2 text-center"
              />
            </div>
            <label className="mb-2 block text-sm font-semibold">Nome do prêmio</label>
            <input
              value={tier.label}
              onChange={(e) => updateTier(tier.id, 'label', e.target.value)}
              className="mb-3 w-full rounded-md border border-line-light px-3 py-2"
            />
            <label className="mb-2 block text-sm font-semibold">Descrição</label>
            <textarea
              value={tier.description}
              onChange={(e) => updateTier(tier.id, 'description', e.target.value)}
              rows={2}
              className="w-full rounded-md border border-line-light px-3 py-2"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
