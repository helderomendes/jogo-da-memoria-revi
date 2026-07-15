import logoUrl from '../assets/logo-revi-dark.svg'

export default function Logo({ className = 'h-8' }) {
  return <img src={logoUrl} alt="Revi" className={`w-auto ${className}`} />
}
