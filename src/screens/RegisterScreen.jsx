import { useState } from 'react'
import { Building2, Phone, User } from 'lucide-react'
import { useKiosk } from '../context/KioskContext'
import { formatPhoneBR } from '../utils/phoneMask'
import VirtualKeyboard from '../components/VirtualKeyboard'
import NumericKeypad from '../components/NumericKeypad'
import Button from '../components/Button'
import Logo from '../components/Logo'
import ScreenTransition from '../components/ScreenTransition'
import BackgroundGlow from '../components/BackgroundGlow'
import GlassPanel from '../components/GlassPanel'

const FIELD_STYLE = {
  name: 'border-lime-400',
  company: 'border-lime-400',
  phone: 'border-sky-500',
}

const FIELD_ICON = {
  name: User,
  phone: Phone,
  company: Building2,
}

// Definido fora do RegisterScreen — um componente novo a cada render faria o
// <input> remontar em toda tecla digitada e perder foco/valor.
function Field({ field, active, ...props }) {
  const Icon = FIELD_ICON[field]
  return (
    <div className="relative">
      <Icon
        size={22}
        className={`absolute left-5 top-1/2 -translate-y-1/2 ${
          active ? 'text-lime-400' : 'text-ink-300'
        }`}
      />
      <input
        {...props}
        className={`w-full rounded-xl border-[1.5px] bg-white/4 pl-14 pr-6 py-5 text-left text-2xl font-semibold text-white outline-none transition-colors placeholder:text-ink-300 focus:bg-white/6 ${
          active ? FIELD_STYLE[field] : 'border-white/8'
        }`}
      />
    </div>
  )
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

  return (
    <ScreenTransition className="relative flex min-h-full w-full flex-col items-center bg-revi-gradient px-6 py-10 text-white">
      <BackgroundGlow />
      <Logo className="h-10 mb-8 sm:h-12" />

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center mb-6">
        Antes de jogar, <span className="text-lime-400">como te chamamos?</span>
      </h1>

      <GlassPanel className="w-full max-w-xl space-y-4 p-6">
        <Field
          field="name"
          active={activeField === 'name'}
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          onFocus={() => setActiveField('name')}
          placeholder="Seu nome *"
          maxLength={40}
        />

        <Field
          field="phone"
          active={activeField === 'phone'}
          value={phone}
          onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 11))}
          onFocus={() => setActiveField('phone')}
          type="tel"
          inputMode="numeric"
          placeholder="WhatsApp *"
        />

        <Field
          field="company"
          active={activeField === 'company'}
          value={company}
          onChange={(e) => setCompany(e.target.value.slice(0, 60))}
          onFocus={() => setActiveField('company')}
          placeholder="Empresa / site *"
          maxLength={60}
        />

        <label className="flex items-start gap-4 pt-2 text-base text-ink-200">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-7 w-7 accent-lime-400 shrink-0"
          />
          Li e aceito os termos de uso e a política de privacidade (LGPD) da Revi. *
        </label>
      </GlassPanel>

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
