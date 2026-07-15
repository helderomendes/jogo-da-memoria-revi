import { useEffect, useState } from 'react'
import { getPrizeTiers, savePrizeTiers } from '../utils/dataStore'

export default function PrizesEditor() {
  const [tiers, setTiers] = useState(null)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    getPrizeTiers().then(setTiers)
  }, [])

  if (!tiers) return <p>Carregando...</p>

  const updateTier = (id, field, value) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
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
          {savedAt && <span className="text-sm text-emerald-600">Salvo!</span>}
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-crayola px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            Salvar alterações
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {tiers.map((tier) => (
          <div key={tier.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              Regra: {tier.rule}
            </p>
            <label className="mb-2 block text-sm font-semibold">Nome do prêmio</label>
            <input
              value={tier.label}
              onChange={(e) => updateTier(tier.id, 'label', e.target.value)}
              className="mb-3 w-full rounded border border-slate-300 px-3 py-2"
            />
            <label className="mb-2 block text-sm font-semibold">Descrição</label>
            <textarea
              value={tier.description}
              onChange={(e) => updateTier(tier.id, 'description', e.target.value)}
              rows={2}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
