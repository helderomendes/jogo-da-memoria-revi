import { useEffect, useState } from 'react'
import { getGameConfig, saveGameConfig } from '../utils/dataStore'

const FIELDS = [
  { key: 'pairsPerGame', label: 'Pares sorteados por partida', hint: 'define quantas cartas entram no tabuleiro (2x este valor)' },
  { key: 'boardCols', label: 'Colunas do tabuleiro' },
  { key: 'boardRows', label: 'Linhas do tabuleiro' },
  { key: 'thinkSeconds', label: 'Segundos pra pensar antes do board aparecer' },
  { key: 'memorizeSeconds', label: 'Segundos com o board virado pra memorizar' },
  { key: 'totalChances', label: 'Chances totais no jogo', hint: 'cada jogada (certa ou errada) gasta 1 chance' },
  { key: 'antiRepeatLastGames', label: 'Nº de partidas anteriores sem repetir pares' },
  { key: 'idleTimeoutMs', label: 'Tempo de inatividade até voltar ao início (ms)' },
  { key: 'thanksScreenMs', label: 'Duração da tela de agradecimento (ms)' },
]

export default function ConfigEditor() {
  const [config, setConfig] = useState(null)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    getGameConfig().then(setConfig)
  }, [])

  if (!config) return <p>Carregando...</p>

  const updateField = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: Number(value) }))
  }

  const handleSave = async () => {
    await saveGameConfig(config)
    setSavedAt(Date.now())
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Configurações do jogo</h2>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key} className="rounded-lg border border-line-light bg-card-light p-4">
            <label className="mb-1 block text-sm font-semibold">{field.label}</label>
            {field.hint && <p className="mb-2 text-xs text-ink-dim">{field.hint}</p>}
            <input
              type="number"
              value={config[field.key]}
              onChange={(e) => updateField(field.key, e.target.value)}
              className="w-full rounded-md border border-line-light px-3 py-2"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
