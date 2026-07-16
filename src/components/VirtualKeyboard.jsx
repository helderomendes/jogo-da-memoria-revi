const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

const SYMBOLS_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '-', '/']

export default function VirtualKeyboard({ value, onChange, maxLength = 40, withSymbols = false }) {
  const pressKey = (key) => {
    if (value.length >= maxLength) return
    onChange(value + key)
  }

  const backspace = () => onChange(value.slice(0, -1))
  const space = () => {
    if (value.length >= maxLength) return
    onChange(`${value} `)
  }

  return (
    <div className="w-full max-w-3xl mx-auto select-none font-sans">
      {withSymbols && (
        <div className="flex justify-center gap-1.5 mb-1.5">
          {SYMBOLS_ROW.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => pressKey(key)}
              className="flex-1 max-w-12 h-14 rounded-md bg-white/10 text-white text-lg font-semibold border border-white/8 active:bg-lime-400 active:text-navy-950 transition-colors"
            >
              {key}
            </button>
          ))}
        </div>
      )}
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5 mb-1.5">
          {row.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => pressKey(key)}
              className="flex-1 max-w-16 h-14 rounded-md bg-white/6 text-white text-xl font-semibold border border-white/8 active:bg-lime-400 active:text-navy-950 transition-colors"
            >
              {key}
            </button>
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-1.5">
        <button
          type="button"
          onClick={space}
          className="flex-[3] h-14 rounded-md bg-white/6 text-white text-lg font-semibold border border-white/8 active:bg-lime-400 active:text-navy-950 transition-colors"
        >
          espaço
        </button>
        <button
          type="button"
          onClick={backspace}
          className="flex-[1.4] h-14 rounded-md bg-white/10 text-white text-lg font-semibold border border-white/8 active:bg-sky-500 transition-colors"
        >
          ⌫ apagar
        </button>
      </div>
    </div>
  )
}
