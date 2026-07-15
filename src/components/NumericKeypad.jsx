const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

export default function NumericKeypad({ onDigit, onBackspace }) {
  const handlePress = (key) => {
    if (key === '') return
    if (key === '⌫') onBackspace()
    else onDigit(key)
  }

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto select-none">
      {KEYS.map((key, i) => (
        <button
          key={`${key}-${i}`}
          type="button"
          onClick={() => handlePress(key)}
          disabled={key === ''}
          className={`h-16 rounded-md text-2xl font-semibold border border-white/8 transition-colors ${
            key === ''
              ? 'invisible'
              : 'bg-white/6 text-white active:bg-lime-400 active:text-navy-950'
          }`}
        >
          {key}
        </button>
      ))}
    </div>
  )
}
