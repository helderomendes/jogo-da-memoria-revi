import { useEffect, useRef, useState } from 'react'
import { ImageIcon, Type, Trash2, Upload, Plus } from 'lucide-react'
import { getCards, saveCards, uploadCardImage } from '../utils/dataStore'

let nextTempId = 1

// Imagens vão pro Supabase Storage. Limite defensivo por arquivo.
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 // 2 MB por imagem

// Miniatura do card do jeito que ele aparece no tabuleiro (verso claro, frente).
function CardPreview({ card }) {
  const showImage = card.mode === 'image' && card.image
  return (
    <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg border border-line-light bg-navy-800 p-2 text-center">
      {showImage ? (
        <img src={card.image} alt={card.text || ''} className="h-full w-full rounded-md object-cover" />
      ) : (
        <p className="text-[0.72rem] font-semibold leading-tight text-white">
          {card.text || <span className="text-white/40">sem título</span>}
        </p>
      )}
    </div>
  )
}

function CardRow({ card, onUpdate, onRemove }) {
  const fileRef = useRef(null)
  const [uploadError, setUploadError] = useState(null)
  const [uploading, setUploading] = useState(false)

  const setMode = (mode) => onUpdate(card.id, { mode })

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
      const url = await uploadCardImage(file)
      onUpdate(card.id, { image: url, mode: 'image' })
    } catch (err) {
      setUploadError('Falha no upload: ' + (err?.message ?? 'erro desconhecido'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line-light bg-card-light p-4 sm:flex-row">
      <div className="w-full shrink-0 sm:w-28">
        <CardPreview card={card} />
        <p className="mt-1 text-center text-[0.7rem] text-ink-dim">{card.id}</p>
      </div>

      <div className="flex-1 space-y-3">
        {/* Toggle: título OU imagem */}
        <div className="inline-flex rounded-full border border-line-light bg-page-light p-1">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              card.mode !== 'image' ? 'bg-brand-navy text-white' : 'text-ink-medium'
            }`}
          >
            <Type size={15} /> Título
          </button>
          <button
            type="button"
            onClick={() => setMode('image')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              card.mode === 'image' ? 'bg-brand-navy text-white' : 'text-ink-medium'
            }`}
          >
            <ImageIcon size={15} /> Imagem de capa
          </button>
        </div>

        {card.mode === 'image' ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-md border border-line-light bg-card-light px-3 py-2 text-sm font-semibold hover:bg-chip-light disabled:opacity-50"
              >
                <Upload size={15} /> {uploading ? 'Enviando...' : 'Enviar imagem'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <span className="text-xs text-ink-dim">ou cole uma URL abaixo</span>
            </div>
            <input
              value={card.image ?? ''}
              onChange={(e) => onUpdate(card.id, { image: e.target.value || null })}
              placeholder="https://... ou /cards/exemplo.jpg"
              className="w-full rounded-md border border-line-light px-3 py-2 text-sm"
            />
            {uploadError && <p className="text-xs font-semibold text-red-500">{uploadError}</p>}
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-semibold">Título do card</label>
            <input
              value={card.text ?? ''}
              onChange={(e) => onUpdate(card.id, { text: e.target.value })}
              placeholder="Ex: 34x de ROI"
              className="w-full rounded-md border border-line-light px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRemove(card.id)}
        className="inline-flex h-9 items-center gap-1.5 self-start rounded-md px-3 text-sm font-semibold text-red-500 hover:bg-red-50"
      >
        <Trash2 size={15} /> Remover
      </button>
    </div>
  )
}

export default function CardsEditor() {
  const [cards, setCards] = useState(null)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    getCards().then(setCards)
  }, [])

  if (!cards) return <p>Carregando...</p>

  const updateCard = (id, patch) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    setSavedAt(null)
  }

  const removeCard = (id) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
    setSavedAt(null)
  }

  const addCard = () => {
    setCards((prev) => [...prev, { id: `novo-${nextTempId++}`, text: '', image: null, mode: 'text' }])
    setSavedAt(null)
  }

  const handleSave = async () => {
    await saveCards(cards)
    setSavedAt(Date.now())
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Cartas ({cards.length} pares)</h2>
          <p className="text-sm text-ink-dim">
            Cada card é <strong>um título</strong> ou <strong>uma imagem de capa</strong> — escolha no botão de cada linha.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-sm font-semibold text-lime-500">Salvo!</span>}
          <button
            type="button"
            onClick={addCard}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-light bg-card-light px-4 py-2 text-sm font-semibold hover:bg-chip-light"
          >
            <Plus size={16} /> Adicionar par
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

      <div className="mt-4 space-y-3">
        {cards.map((card) => (
          <CardRow key={card.id} card={card} onUpdate={updateCard} onRemove={removeCard} />
        ))}
      </div>
    </div>
  )
}
