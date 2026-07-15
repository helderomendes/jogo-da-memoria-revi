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
    <div className="flex h-full w-full flex-col items-center bg-navy px-8 py-10 text-white">
      <Logo className="text-2xl mb-6" />

      <h1 className="font-headline text-4xl text-center mb-8">
        Antes de jogar, <span className="text-electric">como te chamamos?</span>
      </h1>

      <div className="w-full max-w-xl space-y-4">
        <button
          type="button"
          onClick={() => setActiveField('name')}
          className={`w-full rounded-2xl border-2 px-6 py-5 text-left text-2xl font-semibold transition-colors ${
            activeField === 'name' ? 'border-electric bg-white/10' : 'border-white/20 bg-white/5'
          }`}
        >
          {name || <span className="text-white/40">Seu nome *</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveField('phone')}
          className={`w-full rounded-2xl border-2 px-6 py-5 text-left text-2xl font-semibold transition-colors ${
            activeField === 'phone' ? 'border-crayola bg-white/10' : 'border-white/20 bg-white/5'
          }`}
        >
          {phone || <span className="text-white/40">WhatsApp (opcional)</span>}
        </button>

        <label className="flex items-start gap-4 pt-2 text-lg text-white/80">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-7 w-7 accent-electric shrink-0"
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
