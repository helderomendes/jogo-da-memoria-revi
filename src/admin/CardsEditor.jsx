import { useEffect, useState } from 'react'
import { getCards, saveCards } from '../utils/dataStore'

let nextTempId = 1

export default function CardsEditor() {
  const [cards, setCards] = useState(null)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    getCards().then(setCards)
  }, [])

  if (!cards) return <p>Carregando...</p>

  const updateCard = (id, field, value) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const removeCard = (id) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  const addCard = () => {
    setCards((prev) => [...prev, { id: `novo-${nextTempId++}`, text: '', image: null }])
  }

  const handleSave = async () => {
    await saveCards(cards)
    setSavedAt(Date.now())
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Pares de cartas ({cards.length})</h2>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-sm font-semibold text-lime-500">Salvo!</span>}
          <button
            type="button"
            onClick={addCard}
            className="rounded-full border border-line-light bg-card-light px-4 py-2 text-sm font-semibold hover:bg-chip-light"
          >
            + Adicionar par
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

      <div className="overflow-hidden rounded-lg border border-line-light bg-card-light">
        <table className="w-full text-sm">
          <thead className="bg-chip-light text-left text-ink-dim">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Frase / texto do card</th>
              <th className="px-4 py-2">URL da imagem (opcional)</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id} className="border-t border-line-light">
                <td className="px-4 py-2 text-ink-dim">{card.id}</td>
                <td className="px-4 py-2">
                  <input
                    value={card.text}
                    onChange={(e) => updateCard(card.id, 'text', e.target.value)}
                    className="w-full rounded-md border border-line-light px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    value={card.image ?? ''}
                    onChange={(e) => updateCard(card.id, 'image', e.target.value || null)}
                    placeholder="/cards/exemplo.jpg"
                    className="w-full rounded-md border border-line-light px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => removeCard(card.id)}
                    className="text-red-500 hover:underline"
                  >
                    remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
