'use client'

import { cn } from '@/lib/utils'

import { CAMPOS, INTERESES, PREGUNTAS, type Interes } from './contenido'
import type { CampoConError, DatosDeContacto, ErroresDeContacto } from './enviarContacto'

/**
 * LOS CAMPOS DEL CONTACTO — las tres preguntas numeradas, como las de nk: la pregunta en una
 * columna angosta y los campos al lado (apilados en móvil). Los chips son casillas de verdad
 * dentro de un `fieldset`, así la selección múltiple se anuncia como tal. **[CONTACTO]**
 */

type CampoDeTexto = 'presupuesto' | 'nombre' | 'medio' | 'empresa' | 'mensaje'

export interface CamposProps {
  readonly datos: DatosDeContacto
  readonly errores: ErroresDeContacto
  readonly alternarInteres: (id: Interes) => void
  readonly escribir: (campo: CampoDeTexto, valor: string) => void
}

/** En móvil el teclado tapa la mitad de abajo: el campo con foco se lleva al centro. */
const alEnfocar = (e: React.FocusEvent<HTMLElement>): void => {
  const el = e.currentTarget
  window.setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250)
}

const idDelError = (campo: CampoConError): string => `contacto-error-${campo}`

function Pregunta({ numero, texto, id }: { readonly numero: number; readonly texto: string; readonly id?: string }): React.JSX.Element {
  return (
    <p id={id} className="text-cuerpo font-medio leading-texto">
      <span aria-hidden="true" className="text-tinta-media">/ </span>
      {numero}. {texto}
    </p>
  )
}

function Error({ campo, errores }: { readonly campo: CampoConError; readonly errores: ErroresDeContacto }): React.JSX.Element | null {
  const texto = errores[campo]
  if (texto === undefined) return null
  return (
    <p id={idDelError(campo)} role="alert" className="text-micro leading-texto">
      {texto}
    </p>
  )
}

const FILA = 'grid gap-[var(--spacing-4)] tablet:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] tablet:gap-[var(--spacing-8)]'
const PILDORA = 'flex items-center gap-[var(--spacing-2)] rounded-[var(--radius-pastilla-s)] border border-borde-fuerte px-[var(--spacing-4)] py-[var(--spacing-2)] focus-within:border-tinta transition-colors'

function Pildora({
  campo,
  datos,
  errores,
  escribir,
  requerido = true,
}: {
  readonly campo: Exclude<CampoDeTexto, 'mensaje'>
  readonly datos: DatosDeContacto
  readonly errores: ErroresDeContacto
  readonly escribir: CamposProps['escribir']
  readonly requerido?: boolean
}): React.JSX.Element {
  const conError = campo !== 'empresa' && errores[campo] !== undefined
  return (
    <div className="flex flex-col gap-[var(--spacing-1)]">
      <label className={cn(PILDORA, conError && 'border-tinta')}>
        <span className="text-caption shrink-0 font-medio">{CAMPOS[campo].rotulo}</span>
        <input
          name={campo}
          type="text"
          inputMode={campo === 'medio' ? 'email' : undefined}
          autoComplete={campo === 'nombre' ? 'name' : campo === 'empresa' ? 'organization' : campo === 'medio' ? 'email' : 'off'}
          required={requerido}
          value={datos[campo]}
          onChange={(e) => escribir(campo, e.target.value)}
          onFocus={alEnfocar}
          placeholder={CAMPOS[campo].ejemplo}
          aria-invalid={conError || undefined}
          aria-describedby={conError ? idDelError(campo) : undefined}
          className="text-caption placeholder:text-tinta-tenue min-w-0 flex-1 bg-transparent outline-none"
        />
      </label>
      {campo !== 'empresa' && <Error campo={campo} errores={errores} />}
    </div>
  )
}

export function CamposDelContacto({ datos, errores, alternarInteres, escribir }: CamposProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-[var(--spacing-8)]">
      <fieldset className={FILA} aria-describedby={errores.intereses === undefined ? undefined : idDelError('intereses')}>
        {/* La `legend` no entra a la grilla: va para el lector, y la pregunta visible, aparte. */}
        <legend className="sr-only">{PREGUNTAS.intereses}</legend>
        <div aria-hidden="true">
          <Pregunta numero={1} texto={PREGUNTAS.intereses} />
        </div>
        <div className="flex flex-col gap-[var(--spacing-2)]">
          <div className="flex flex-wrap gap-[var(--spacing-2)]">
            {INTERESES.map((i) => {
              const marcado = datos.intereses.includes(i.id)
              return (
                <label
                  key={i.id}
                  data-pieza="chip-de-contacto"
                  data-marcado={marcado ? 'true' : 'false'}
                  className={cn(
                    'text-caption cursor-pointer rounded-[var(--radius-pastilla-s)] border px-[var(--spacing-4)] py-[var(--spacing-2)] transition-colors focus-within:ring-2 focus-within:ring-[var(--color-foco)]',
                    marcado ? 'border-tinta bg-tinta text-fondo' : 'border-borde-fuerte hover:border-tinta',
                  )}
                >
                  <input type="checkbox" name="intereses" value={i.id} checked={marcado} onChange={() => alternarInteres(i.id)} className="sr-only" />
                  {i.rotulo}
                </label>
              )
            })}
          </div>
          <Error campo="intereses" errores={errores} />
        </div>
      </fieldset>

      <div className={FILA}>
        <Pregunta numero={2} texto={PREGUNTAS.presupuesto} />
        <Pildora campo="presupuesto" datos={datos} errores={errores} escribir={escribir} />
      </div>

      <div className={FILA}>
        <Pregunta numero={3} texto={PREGUNTAS.persona} />
        <div className="flex flex-col gap-[var(--spacing-2)]">
          <div className="grid gap-[var(--spacing-2)] escritorio:grid-cols-3">
            <Pildora campo="nombre" datos={datos} errores={errores} escribir={escribir} />
            <Pildora campo="medio" datos={datos} errores={errores} escribir={escribir} />
            <Pildora campo="empresa" datos={datos} errores={errores} escribir={escribir} requerido={false} />
          </div>
          <div className="flex flex-col gap-[var(--spacing-1)]">
            <label className={cn(PILDORA, 'items-start rounded-[var(--radius-fuerte)] py-[var(--spacing-3)]', errores.mensaje !== undefined && 'border-tinta')}>
              <span className="text-caption shrink-0 font-medio">{CAMPOS.mensaje.rotulo}</span>
              <textarea
                name="mensaje"
                required
                rows={3}
                value={datos.mensaje}
                onChange={(e) => escribir('mensaje', e.target.value)}
                onFocus={alEnfocar}
                placeholder={CAMPOS.mensaje.ejemplo}
                aria-invalid={errores.mensaje !== undefined || undefined}
                aria-describedby={errores.mensaje === undefined ? undefined : idDelError('mensaje')}
                className="text-caption placeholder:text-tinta-tenue min-w-0 flex-1 resize-none bg-transparent outline-none"
              />
            </label>
            <Error campo="mensaje" errores={errores} />
          </div>
        </div>
      </div>
    </div>
  )
}
