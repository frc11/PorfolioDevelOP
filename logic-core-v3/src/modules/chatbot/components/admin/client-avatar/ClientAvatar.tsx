import { Building2 } from 'lucide-react'

interface ClientAvatarProps {
  companyName: string
  avatarImageUrl: string | null
  avatarEmoji: string | null
  avatarInitials: string | null
  size?: number
  className?: string
}

// Identificación visual del cliente (Organization). Fallback: imagen > emoji >
// iniciales > ícono neutro. NUNCA deriva iniciales del nombre: avatarInitials es
// lo que el humano escribió a mano (máx 2 chars) o nada. Componente puro (sirve
// en server y client). La imagen es un data URL base64 (sin loader remoto): <img>.
export function ClientAvatar({
  companyName,
  avatarImageUrl,
  avatarEmoji,
  avatarInitials,
  size = 40,
  className = '',
}: ClientAvatarProps) {
  const base = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl ${className}`
  const dims = { width: size, height: size }

  if (avatarImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarImageUrl}
        alt={`Avatar de ${companyName}`}
        style={dims}
        className={`${base} object-cover`}
      />
    )
  }

  if (avatarEmoji) {
    return (
      <span
        style={{ ...dims, fontSize: Math.round(size * 0.55) }}
        className={`${base} bg-cyan-400/10 leading-none`}
        role="img"
        aria-label={`Avatar de ${companyName}`}
      >
        {avatarEmoji}
      </span>
    )
  }

  if (avatarInitials) {
    return (
      <span
        style={{ ...dims, fontSize: Math.round(size * 0.4) }}
        className={`${base} bg-cyan-400/10 font-semibold uppercase leading-none text-cyan-200`}
        aria-label={`Avatar de ${companyName}`}
      >
        {avatarInitials}
      </span>
    )
  }

  return (
    <span
      style={dims}
      className={`${base} bg-cyan-400/10 text-cyan-300`}
      aria-label={`Avatar de ${companyName}`}
    >
      <Building2
        style={{ width: Math.round(size * 0.5), height: Math.round(size * 0.5) }}
        strokeWidth={1.5}
      />
    </span>
  )
}
