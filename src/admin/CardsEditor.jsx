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
          {savedAt && <span className="text-sm text-emerald-600">Salvo!</span>}
          <button
            type="button"
            onClick={addCard}
            className="rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            + Adicionar par
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-crayola px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            Salvar alterações
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Frase / texto do card</th>
              <th className="px-4 py-2">URL da imagem (opcional)</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id} className="border-t border-slate-100">
                <td className="px-4 py-2 text-slate-400">{card.id}</td>
                <td className="px-4 py-2">
                  <input
                    value={card.text}
                    onChange={(e) => updateCard(card.id, 'text', e.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    value={card.image ?? ''}
                    onChange={(e) => updateCard(card.id, 'image', e.target.value || null)}
                    placeholder="/cards/exemplo.jpg"
                    className="w-full rounded border border-slate-300 px-2 py-1"
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
