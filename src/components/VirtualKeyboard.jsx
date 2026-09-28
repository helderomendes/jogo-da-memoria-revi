const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

const SYMBOLS_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '-', '/']

// `large`: teclas maiores pro layout horizontal (TV), ocupando a coluna toda.
export default function VirtualKeyboard({ value, onChange, maxLength = 40, withSymbols = false, large = false }) {
  const keyH = large ? 'h-[clamp(3.5rem,7.5vh,6rem)] text-[clamp(1.2rem,1.6vw,2rem)]' : 'h-14 text-xl'
  const symH = large ? 'h-[clamp(3rem,6.5vh,5rem)] text-[clamp(1rem,1.3vw,1.6rem)]' : 'h-14 text-lg'
  const maxKey = large ? 'max-w-none' : 'max-w-16'
  const maxSym = large ? 'max-w-none' : 'max-w-12'
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
    <div className={`w-full mx-auto select-none font-sans ${large ? '' : 'max-w-3xl'}`}>
      {withSymbols && (
        <div className="flex justify-center gap-1.5 mb-1.5">
          {SYMBOLS_ROW.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => pressKey(key)}
              className={`flex-1 ${maxSym} ${symH} rounded-md bg-white/10 text-white font-semibold border border-white/8 active:bg-lime-400 active:text-navy-950 transition-colors`}
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
              className={`flex-1 ${maxKey} ${keyH} rounded-md bg-white/6 text-white font-semibold border border-white/8 active:bg-lime-400 active:text-navy-950 transition-colors`}
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
          className={`flex-[3] ${symH} rounded-md bg-white/6 text-white font-semibold border border-white/8 active:bg-lime-400 active:text-navy-950 transition-colors`}
        >
          espaço
        </button>
        <button
          type="button"
          onClick={backspace}
          className={`flex-[1.4] ${symH} rounded-md bg-white/10 text-white font-semibold border border-white/8 active:bg-sky-500 transition-colors`}
        >
          ⌫ apagar
        </button>
      </div>
    </div>
  )
}
