import { cn } from '@/lib/utils'

import type { EstadoForzado } from './Cta'

/**
 * EL FORMULARIO DE NOVEDADES DEL PIE — la estructura y sus cuatro estados.
 *
 * Reposo, foco, hover del botón y **deshabilitado**. Es la única pieza del
 * sprint donde "deshabilitado" aplica de verdad: un enlace no se deshabilita y
 * un CTA deshabilitado es un caso de borde, pero un envío sin dirección escrita
 * es el estado inicial normal de este formulario.
 *
 * ── Sin `action`, sin `onSubmit`, sin estado ──────────────────────────────
 *
 * No hay a dónde enviarlo: no hay backend de novedades y este sprint no toca
 * base de datos. El `<form>` existe porque la SEMÁNTICA es parte de la pieza —
 * un campo de email suelto no da el comportamiento de Enter ni el teclado
 * correcto en mobile— pero no manda nada. Quien lo conecte agrega la acción.
 *
 * ── El nombre del campo no puede ser el `placeholder` ─────────────────────
 *
 * Un `placeholder` desaparece al escribir y muchos lectores de pantalla no lo
 * anuncian como nombre. La etiqueta va en un `<label>` real, asociado por
 * `htmlFor`, y se oculta visualmente con `sr-only` cuando el diseño no la
 * quiere ver. Ocultar visualmente no es lo mismo que no tener.
 *
 * ── El anillo de foco queda en el campo, no en el envoltorio ──────────────
 *
 * El envoltorio marca `:focus-within` cambiando su borde —que es la señal de
 * "acá adentro está el foco"— pero el anillo del sistema lo sigue pintando
 * `:focus-visible` sobre el `<input>`. Mover el anillo al envoltorio haría que
 * el campo y el botón compartieran indicador y no se distinguiera cuál de los
 * dos tiene el foco.
 */

export interface NovedadesProps {
  readonly id?: string
  readonly rotulo?: string
  readonly textoDeAyuda?: string
  readonly placeholder?: string
  readonly rotuloDeEnvio: string
  readonly icono: React.ReactNode
  readonly deshabilitado?: boolean
  readonly forzado?: EstadoForzado
  readonly className?: string
}

export function FormularioDeNovedades({
  id = 'novedades',
  rotulo = 'Tu correo',
  textoDeAyuda,
  placeholder,
  rotuloDeEnvio,
  icono,
  deshabilitado = false,
  forzado,
  className,
}: NovedadesProps) {
  const idDelCampo = `${id}-campo`
  const idDeAyuda = `${id}-ayuda`

  return (
    <form
      // Sin `action`: no hay a dónde. `noValidate` no se pone — la validación
      // nativa de `type="email"` es gratis y es mejor que ninguna.
      data-pieza="novedades-forma"
      className={cn('flex flex-col gap-[var(--spacing-2)]', className)}
    >
      <label htmlFor={idDelCampo} className="text-micro leading-micro tracking-micro font-medio uppercase">
        {rotulo}
      </label>

      <div data-pieza="novedades" data-forzado={forzado}>
        <input
          id={idDelCampo}
          type="email"
          name="correo"
          autoComplete="email"
          placeholder={placeholder}
          aria-describedby={textoDeAyuda === undefined ? undefined : idDeAyuda}
          data-parte="campo"
          className="text-caption leading-texto tracking-texto font-normal"
        />
        <button
          type="submit"
          data-pieza="novedades-envio"
          data-forzado={forzado}
          disabled={deshabilitado}
          aria-label={rotuloDeEnvio}
        >
          <span data-parte="icono" aria-hidden="true">
            {icono}
          </span>
        </button>
      </div>

      {textoDeAyuda !== undefined && (
        <p id={idDeAyuda} className="text-micro leading-micro tracking-micro text-tinta-tenue">
          {textoDeAyuda}
        </p>
      )}
    </form>
  )
}
