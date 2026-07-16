import { useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { formatPhoneBR } from '../utils/phoneMask'
import VirtualKeyboard from '../components/VirtualKeyboard'
import NumericKeypad from '../components/NumericKeypad'
import Button from '../components/Button'
import Logo from '../components/Logo'
import ScreenTransition from '../components/ScreenTransition'
import BackgroundGlow from '../components/BackgroundGlow'

const FIELD_STYLE = {
  name: 'border-lime-400',
  company: 'border-lime-400',
  phone: 'border-sky-500',
}

export default function RegisterScreen() {
  const { submitRegistration } = useKiosk()
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [activeField, setActiveField] = useState('name')

  const phone = formatPhoneBR(phoneDigits)
  const canAdvance =
    name.trim().length > 0 &&
    company.trim().length > 0 &&
    phoneDigits.length >= 10 &&
    termsAccepted

  const handleAdvance = () => {
    if (!canAdvance) return
    submitRegistration({ name: name.trim(), phone, company: company.trim() })
  }

  const preventKeyboardFocusSteal = (e) => e.preventDefault()

  const fieldClass = (field) =>
    `w-full rounded-xl border-[1.5px] bg-white/4 px-6 py-5 text-left text-2xl font-semibold text-white outline-none transition-colors placeholder:text-ink-300 focus:bg-white/6 ${
      activeField === field ? FIELD_STYLE[field] : 'border-white/8'
    }`

  return (
    <ScreenTransition className="relative flex h-full w-full flex-col items-center overflow-hidden bg-revi-gradient px-8 py-10 text-white">
      <BackgroundGlow />
      <Logo className="h-7 mb-6" />

      <h1 className="text-4xl font-bold tracking-tight text-center mb-8">
        Antes de jogar, <span className="text-lime-400">como te chamamos?</span>
      </h1>

      <div className="w-full max-w-xl space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          onFocus={() => setActiveField('name')}
          placeholder="Seu nome *"
          maxLength={40}
          className={fieldClass('name')}
        />

        <input
          value={phone}
          onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 11))}
          onFocus={() => setActiveField('phone')}
          type="tel"
          inputMode="numeric"
          placeholder="WhatsApp *"
          className={fieldClass('phone')}
        />

        <input
          value={company}
          onChange={(e) => setCompany(e.target.value.slice(0, 60))}
          onFocus={() => setActiveField('company')}
          placeholder="Empresa / site *"
          maxLength={60}
          className={fieldClass('company')}
        />

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

      <div
        className="mt-6 w-full max-w-xl flex-1 flex flex-col justify-center"
        onMouseDown={preventKeyboardFocusSteal}
      >
        {activeField === 'phone' ? (
          <NumericKeypad
            onDigit={(d) => setPhoneDigits((prev) => (prev + d).slice(0, 11))}
            onBackspace={() => setPhoneDigits((prev) => prev.slice(0, -1))}
          />
        ) : activeField === 'company' ? (
          <VirtualKeyboard value={company} onChange={setCompany} maxLength={60} withSymbols />
        ) : (
          <VirtualKeyboard value={name} onChange={setName} maxLength={40} />
        )}
      </div>

      <Button onClick={handleAdvance} disabled={!canAdvance} className="mt-6 w-full max-w-xl">
        Avançar
      </Button>
    </ScreenTransition>
  )
}
