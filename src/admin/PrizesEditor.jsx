import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, RotateCcw, Upload, X } from 'lucide-react'
import { getPrizeTiers, savePrizeTiers, resetPrizeStock, uploadPrizeImage } from '../utils/dataStore'
import { PRIZE_ICON_OPTIONS, DEFAULT_PRIZE_ICON, resolvePrizeIcon } from '../data/prizeIcons'

let nextTempId = 1

// Fotos vão pro Supabase Storage. Limite defensivo por arquivo.
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 // 2 MB por imagem

function StockBar({ tier }) {
  if (typeof tier.stock !== 'number') {
    return <span className="text-xs font-semibold text-sky-500">Ilimitado</span>
  }
  const initial = tier.stockInitial || 0
  const pct = initial > 0 ? Math.round((tier.stock / initial) * 100) : 0
  const out = tier.stock <= 0
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className={`font-semibold ${out ? 'text-red-500' : 'text-ink-medium'}`}>
          {out ? 'Esgotado' : `${tier.stock} de ${initial} restantes`}
        </span>
        <span className="text-ink-dim">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-chip-light">
        <div
          className={`h-full rounded-full ${out ? 'bg-red-400' : 'bg-lime-400'}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  )
}

// Foto do brinde: preview em crop circular (como aparece na roleta/tela de
// prêmio) + upload pro Storage ou URL. Sem foto, o ícone é usado como fallback.
function PrizePhotoField({ tier, onUpdate }) {
  const fileRef = useRef(null)
  const [uploadError, setUploadError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const Icon = resolvePrizeIcon(tier.icon)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError('Imagem muito grande (máx. 2 MB). Otimize ou use uma URL.')
      e.target.value = ''
      return
    }
    try {
      setUploading(true)
      const url = await uploadPrizeImage(file)
      onUpdate(tier.id, { image: url })
    } catch (err) {
      setUploadError('Falha no upload: ' + (err?.message ?? 'erro desconhecido'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="flex gap-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-line-light bg-brand-navy">
        {tier.image ? (
          <img src={tier.image} alt={tier.label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lime-400">
            <Icon size={28} />
          </div>
        )}
        {tier.image && (
          <button
            type="button"
            onClick={() => onUpdate(tier.id, { image: null })}
            title="Remover foto"
            className="absolute right-0 top-0 rounded-full bg-red-500 p-0.5 text-white hover:brightness-110"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-md border border-line-light bg-card-light px-3 py-2 text-sm font-semibold hover:bg-chip-light disabled:opacity-50"
          >
            <Upload size={15} /> {uploading ? 'Enviando...' : 'Enviar foto'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <span className="text-xs text-ink-dim">ou cole uma URL</span>
        </div>
        <input
          value={tier.image ?? ''}
          onChange={(e) => onUpdate(tier.id, { image: e.target.value || null })}
          placeholder="https://... foto do brinde (crop circular)"
          className="w-full rounded-md border border-line-light px-3 py-2 text-sm"
        />
        {uploadError && <p className="text-xs font-semibold text-red-500">{uploadError}</p>}
      </div>
    </div>
  )
}

export default function PrizesEditor() {
  const [tiers, setTiers] = useState(null)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    getPrizeTiers().then(setTiers)
  }, [])

  if (!tiers) return <p>Carregando...</p>

  const updateTier = (id, patch) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    setSavedAt(null)
  }

  const numOrNull = (raw) => (raw === '' ? null : Number(raw))

  const addTier = () => {
    setTiers((prev) => [
      ...prev,
      {
        id: `tier-${nextTempId++}`,
        pairs: null,
        label: 'Novo brinde',
        description: '',
        icon: DEFAULT_PRIZE_ICON,
        image: null,
        enabled: true,
        stockInitial: 0,
        stock: 0,
      },
    ])
    setSavedAt(null)
  }

  const removeTier = (id) => {
    setTiers((prev) => prev.filter((t) => t.id !== id))
    setSavedAt(null)
  }

  const handleSave = async () => {
    await savePrizeTiers(tiers)
    setSavedAt(Date.now())
  }

  const handleResetStock = async () => {
    const updated = await resetPrizeStock()
    setTiers(updated)
    setSavedAt(Date.now())
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Brindes por acerto ({tiers.length})</h2>
          <p className="text-sm text-ink-dim">
            "Pares certos" define a faixa (1 a 3). O estoque dá baixa a cada entrega; esgotou,
            o jogo entrega a faixa imediatamente abaixo que ainda tenha brinde.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-sm font-semibold text-lime-500">Salvo!</span>}
          <button
            type="button"
            onClick={handleResetStock}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-light bg-card-light px-4 py-2 text-sm font-semibold hover:bg-chip-light"
          >
            <RotateCcw size={15} /> Repor estoque
          </button>
          <button
            type="button"
            onClick={addTier}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-light bg-card-light px-4 py-2 text-sm font-semibold hover:bg-chip-light"
          >
            <Plus size={16} /> Novo brinde
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            Salvar alterações
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`rounded-xl border p-4 ${
              tier.enabled === false ? 'border-line-light bg-page-light opacity-70' : 'border-line-light bg-card-light'
            }`}
          >
            <div className="mb-3 flex items-start gap-3">
              <input
                value={tier.label}
                onChange={(e) => updateTier(tier.id, { label: e.target.value })}
                className="w-full rounded-md border border-line-light px-3 py-2 font-semibold"
                placeholder="Nome do brinde"
              />
              <button
                type="button"
                onClick={() => removeTier(tier.id)}
                className="shrink-0 rounded-md p-2 text-red-500 hover:bg-red-50"
                title="Remover brinde"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <textarea
              value={tier.description}
              onChange={(e) => updateTier(tier.id, { description: e.target.value })}
              rows={2}
              placeholder="Descrição mostrada ao jogador"
              className="mb-3 w-full rounded-md border border-line-light px-3 py-2 text-sm"
            />

            {/* Foto do brinde (crop circular na roleta e na tela de prêmio) */}
            <div className="mb-3">
              <label className="mb-1 block text-xs font-semibold text-ink-medium">Foto do brinde</label>
              <PrizePhotoField tier={tier} onUpdate={updateTier} />
            </div>

            <div className="mb-3 grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-medium">Pares certos</label>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={tier.pairs ?? ''}
                  onChange={(e) => updateTier(tier.id, { pairs: numOrNull(e.target.value) })}
                  placeholder="—"
                  className="w-full rounded-md border border-line-light px-3 py-2 text-center"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-medium">Estoque inicial</label>
                <input
                  type="number"
                  min={0}
                  value={tier.stockInitial ?? ''}
                  onChange={(e) => updateTier(tier.id, { stockInitial: numOrNull(e.target.value) })}
                  placeholder="∞"
                  className="w-full rounded-md border border-line-light px-3 py-2 text-center"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-medium">Estoque atual</label>
                <input
                  type="number"
                  min={0}
                  value={tier.stock ?? ''}
                  onChange={(e) => updateTier(tier.id, { stock: numOrNull(e.target.value) })}
                  placeholder="∞"
                  className="w-full rounded-md border border-line-light px-3 py-2 text-center"
                />
              </div>
            </div>

            <div className="mb-3">
              <StockBar tier={tier} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-medium">
                  Ícone <span className="font-normal text-ink-dim">(usado sem foto)</span>
                </label>
                <select
                  value={tier.icon ?? DEFAULT_PRIZE_ICON}
                  onChange={(e) => updateTier(tier.id, { icon: e.target.value })}
                  className="rounded-md border border-line-light px-3 py-2 text-sm"
                >
                  {PRIZE_ICON_OPTIONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={tier.enabled !== false}
                  onChange={(e) => updateTier(tier.id, { enabled: e.target.checked })}
                  className="h-5 w-5 accent-lime-500"
                />
                Ativo no jogo
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
