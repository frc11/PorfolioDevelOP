'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { CLASE_DE_LA_PILDORA } from '../../_componentes/formularios/Campos'
import { ROTULOS_DEL_INGRESO } from './contenido'
import { LARGOS_DEL_INGRESO } from './envio'

/**
 * [B7] LAS PIEZAS DEL FORMULARIO DEL LOGIN QUE LOS FORMULARIOS DEL SITIO NO TENÍAN — con la misma arquitectura: la píldora
 * (`CLASE_DE_LA_PILDORA`, de `_componentes/formularios/Campos.tsx`), su foco (`data-foco="pastilla"`, `foco.css`) y el error en
 * borde punteado. El email es la píldora común (`CampoDePildora`); acá van:
 *
 *   · **la contraseña**: la píldora con `type="password"` y el ojo del login de siempre (muestra u oculta, sin tocar el campo). El
 *     rótulo nombra al campo con `for` (no lo envuelve: un botón adentro de un `label` es un segundo control rotulable). El ojo va
 *     fuera del orden del Tab, como en el login de siempre: el foco de la píldora es uno y no se confunde;
 *   · **la marca de Google** del botón «Continuar con Google»: la G de cuatro colores es la marca de Google (sus pautas piden la
 *     G de colores), no una paleta del sitio. Copiada del login de siempre (`src/app/login/page.tsx`, que no se toca).
 */

export function CampoDeClave({
  id,
  valor,
  alEscribir,
  idDelError,
  conError,
}: {
  readonly id: string
  readonly valor: string
  readonly alEscribir: (valor: string) => void
  readonly idDelError: string
  readonly conError: boolean
}): React.JSX.Element {
  const [visible, setVisible] = useState(false)
  return (
    <div data-foco="pastilla" className={cn(CLASE_DE_LA_PILDORA, conError && 'border-tinta border-dashed')}>
      <label htmlFor={id} className="text-caption shrink-0 font-medio">
        {ROTULOS_DEL_INGRESO.clave}
      </label>
      <input
        id={id}
        name="password"
        type={visible ? 'text' : 'password'}
        autoComplete="current-password"
        required
        maxLength={LARGOS_DEL_INGRESO.claveMaximo}
        value={valor}
        onChange={(e) => alEscribir(e.target.value)}
        aria-invalid={conError || undefined}
        aria-describedby={conError ? idDelError : undefined}
        className="text-caption min-w-0 flex-1 bg-transparent"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? ROTULOS_DEL_INGRESO.ocultarClave : ROTULOS_DEL_INGRESO.mostrarClave}
        aria-pressed={visible}
        className="text-tinta-tenue hover:text-tinta flex size-[var(--spacing-6)] shrink-0 items-center justify-center transition-colors"
      >
        {visible ? <Eye aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-4)]" /> : <EyeOff aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-4)]" />}
      </button>
    </div>
  )
}

/** La G de Google (la marca: sus colores son los de la marca, no del sitio). */
export function MarcaDeGoogle(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[var(--spacing-4)] shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
