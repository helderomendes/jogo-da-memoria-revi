const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

export default function NumericKeypad({ onDigit, onBackspace, large = false }) {
  const handlePress = (key) => {
    if (key === '') return
    if (key === '⌫') onBackspace()
    else onDigit(key)
  }

  return (
    <div className={`grid grid-cols-3 gap-2 w-full mx-auto select-none ${large ? 'max-w-md' : 'max-w-xs'}`}>
      {KEYS.map((key, i) => (
        <button
          key={`${key}-${i}`}
          type="button"
          onClick={() => handlePress(key)}
          disabled={key === ''}
          className={`${large ? 'h-[clamp(4rem,9vh,7rem)] text-[clamp(1.6rem,2.2vw,2.8rem)]' : 'h-16 text-2xl'} rounded-md font-semibold border border-white/8 transition-colors ${
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
