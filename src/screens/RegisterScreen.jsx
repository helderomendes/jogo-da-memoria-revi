import { useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { formatPhoneBR } from '../utils/phoneMask'
import VirtualKeyboard from '../components/VirtualKeyboard'
import NumericKeypad from '../components/NumericKeypad'
import Button from '../components/Button'
import Logo from '../components/Logo'

export default function RegisterScreen() {
  const { submitRegistration } = useKiosk()
  const [name, setName] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [activeField, setActiveField] = useState('name')

  const phone = formatPhoneBR(phoneDigits)
  const canAdvance = name.trim().length > 0 && termsAccepted

  const handleAdvance = () => {
    if (!canAdvance) return
    submitRegistration({ name: name.trim(), phone })
  }

  return (
    <div className="flex h-full w-full flex-col items-center bg-revi-gradient px-8 py-10 text-white">
      <Logo className="h-7 mb-6" />

      <h1 className="text-4xl font-bold tracking-tight text-center mb-8">
        Antes de jogar, <span className="text-lime-400">como te chamamos?</span>
      </h1>

      <div className="w-full max-w-xl space-y-4">
        <button
          type="button"
          onClick={() => setActiveField('name')}
          className={`w-full rounded-xl border-[1.5px] px-6 py-5 text-left text-2xl font-semibold transition-colors ${
            activeField === 'name' ? 'border-lime-400 bg-white/6' : 'border-white/8 bg-white/4'
          }`}
        >
          {name || <span className="text-ink-300">Seu nome *</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveField('phone')}
          className={`w-full rounded-xl border-[1.5px] px-6 py-5 text-left text-2xl font-semibold transition-colors ${
            activeField === 'phone' ? 'border-sky-500 bg-white/6' : 'border-white/8 bg-white/4'
          }`}
        >
          {phone || <span className="text-ink-300">WhatsApp (opcional)</span>}
        </button>

        <label className="flex items-start gap-4 pt-2 text-lg text-ink-200">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-7 w-7 accent-lime-400 shrink-0"
          />
          Li e aceito os termos de uso e a política de privacidade (LGPD) da Revi. *
        </label>
      </div>

      <div className="mt-6 w-full max-w-xl flex-1 flex flex-col justify-center">
        {activeField === 'name' ? (
          <VirtualKeyboard value={name} onChange={setName} maxLength={40} />
        ) : (
          <NumericKeypad
            onDigit={(d) => setPhoneDigits((prev) => (prev + d).slice(0, 11))}
            onBackspace={() => setPhoneDigits((prev) => prev.slice(0, -1))}
          />
        )}
      </div>

      <Button onClick={handleAdvance} disabled={!canAdvance} className="mt-6 w-full max-w-xl">
        Avançar
      </Button>
    </div>
  )
}
