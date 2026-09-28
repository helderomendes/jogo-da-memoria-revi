import { useEffect, useState } from 'react'
import { MonitorSmartphone, Tv, Tag } from 'lucide-react'
import { getGameConfig, saveGameConfig, slugifyTag } from '../utils/dataStore'
import { LAYOUTS } from '../data/config'

const FIELDS = [
  { key: 'pairsPerGame', label: 'Pares sorteados por partida', hint: 'define quantas cartas entram no tabuleiro (2x este valor)' },
  { key: 'boardCols', label: 'Colunas do tabuleiro' },
  { key: 'boardRows', label: 'Linhas do tabuleiro' },
  { key: 'getReadySeconds', label: 'Contagem "PENSE, 3, 2, 1" antes de memorizar' },
  { key: 'memorizeSeconds', label: 'Segundos com o board virado pra memorizar' },
  { key: 'totalChances', label: 'Chances totais no jogo', hint: 'cada jogada (certa ou errada) gasta 1 chance' },
  { key: 'guessSeconds', label: 'Cronômetro da fase de jogo (segundos)', hint: 'corre em paralelo com as chances — o que acabar primeiro encerra o jogo' },
  { key: 'antiRepeatLastGames', label: 'Nº de partidas anteriores sem repetir pares' },
  { key: 'idleTimeoutMs', label: 'Tempo de inatividade até voltar ao início (ms)' },
  { key: 'thanksScreenMs', label: 'Duração da tela de agradecimento (ms)' },
]

const LAYOUT_ICONS = { landscape: Tv, portrait: MonitorSmartphone }

export default function ConfigEditor() {
  const [config, setConfig] = useState(null)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    getGameConfig().then(setConfig)
  }, [])

  if (!config) return <p>Carregando...</p>

  const patch = (p) => {
    setConfig((prev) => ({ ...prev, ...p }))
    setSavedAt(null)
  }

  const updateField = (key, value) => patch({ [key]: Number(value) })

  const handleSave = async () => {
    const clean = { ...config, eventTag: slugifyTag(config.eventTag) }
    await saveGameConfig(clean)
    setConfig(clean)
    setSavedAt(Date.now())
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Evento & configurações</h2>
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

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Evento: nome + tag de origem gravada em todo lead */}
        <div className="rounded-xl border border-line-light bg-card-light p-5 lg:col-span-1">
          <div className="mb-3 flex items-center gap-2">
            <Tag size={18} className="text-brand-navy" />
            <h3 className="font-bold">Evento atual</h3>
          </div>
          <label className="mb-1 block text-sm font-semibold">Nome do evento</label>
          <input
            value={config.eventName ?? ''}
            onChange={(e) => {
              const name = e.target.value
              // Tag acompanha o nome enquanto o admin não a personaliza.
              const autoTag = slugifyTag(config.eventName) === config.eventTag
              patch({ eventName: name, ...(autoTag ? { eventTag: slugifyTag(name) } : {}) })
            }}
            placeholder="ex.: D2C Summit"
            className="mb-3 w-full rounded-md border border-line-light px-3 py-2"
          />
          <label className="mb-1 block text-sm font-semibold">Tag de origem do lead</label>
          <input
            value={config.eventTag ?? ''}
            onChange={(e) => patch({ eventTag: e.target.value })}
            placeholder="ex.: d2c-summit"
            className="w-full rounded-md border border-line-light px-3 py-2 font-mono text-sm"
          />
          <p className="mt-2 text-xs text-ink-dim">
            Toda partida nova recebe essa tag. No export pro HubSpot ela vira a coluna "Evento de origem".
          </p>
        </div>

        {/* Formato de tela */}
        <div className="rounded-xl border border-line-light bg-card-light p-5 lg:col-span-2">
          <h3 className="mb-3 font-bold">Formato da tela do totem</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LAYOUTS.map((l) => {
              const Icon = LAYOUT_ICONS[l.id]
              const active = (config.layout ?? 'landscape') === l.id
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => patch({ layout: l.id })}
                  className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors ${
                    active ? 'border-brand-navy bg-chip-light' : 'border-line-light hover:bg-chip-light'
                  }`}
                >
                  <Icon size={28} className={active ? 'text-brand-navy' : 'text-ink-dim'} />
                  <div>
                    <p className="font-bold">
                      {l.label} {active && <span className="ml-1 text-xs font-bold text-lime-500">• ativo</span>}
                    </p>
                    <p className="text-xs text-ink-dim">{l.hint}</p>
                  </div>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-ink-dim">
            O modelo de premiação (roleta ou escolha) fica na aba "Premiação & estoque".
          </p>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-bold">Regras do jogo</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
      </section>
    </div>
  )
}
