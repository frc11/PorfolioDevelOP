'use client'

import { cn } from '@/lib/utils'

import { MAXIMOS } from '../../_lib/formularios/validar'
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
  /** [NAVBAR] T4 · la hoja del teléfono, entera en una pantalla: menos aire y letra más chica, los mismos campos. */
  readonly compacto?: boolean
}

/** En móvil el teclado tapa la mitad de abajo: el campo con foco se lleva al centro. */
const alEnfocar = (e: React.FocusEvent<HTMLElement>): void => {
  const el = e.currentTarget
  window.setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250)
}

const idDelError = (campo: CampoConError): string => `contacto-error-${campo}`

function Pregunta({ numero, texto, id, compacto = false }: { readonly numero: number; readonly texto: string; readonly id?: string; readonly compacto?: boolean }): React.JSX.Element {
  return (
    // [EL ENCASTRE] 1E · sin la barra «/» delante (era un recurso de nk).
    <p id={id} className={cn(compacto ? 'text-caption' : 'text-cuerpo', 'font-medio leading-texto')}>
      {numero}. {texto}
    </p>
  )
}

function Error({ campo, errores }: { readonly campo: CampoConError; readonly errores: ErroresDeContacto }): React.JSX.Element | null {
  const texto = errores[campo]
  if (texto === undefined) return null
  return (
    // [INTERFAZ 1] T3: sin `role="alert"` por campo (sonaban hasta cinco a la vez, y otra vez con cada tecla): el aviso es
    // UNO, al enviar (`FormularioDeContacto`); éste lo lee el lector al llegar al campo (`aria-describedby`).
    <p id={idDelError(campo)} className="text-micro leading-texto">
      {texto}
    </p>
  )
}

const FILA = 'grid gap-[var(--spacing-4)] tablet:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] tablet:gap-[var(--spacing-8)]'
/** [EL ENCASTRE] 1E · el foco lo dibuja la píldora (`data-foco="pastilla"`, en `foco.css`): su borde, más oscuro y más grueso. */
const PILDORA = 'flex items-center gap-[var(--spacing-2)] rounded-[var(--radius-pastilla-s)] border border-borde-fuerte px-[var(--spacing-4)] py-[var(--spacing-2)]'
/** [NAVBAR] T4 · en el teléfono la pregunta va pegada a sus campos. */
const FILA_COMPACTA = 'grid gap-[var(--spacing-2)]'
/** [EL ENCASTRE] 1E · lo máximo de cada campo (lo mismo exige el servidor): con todo opcional, el largo lo frena el campo. */
const MAXIMO_DE: Record<Exclude<CampoDeTexto, 'mensaje'>, number> = { presupuesto: MAXIMOS.presupuesto, nombre: MAXIMOS.nombre, medio: MAXIMOS.contacto, empresa: MAXIMOS.empresa }

function Pildora({
  campo,
  datos,
  errores,
  escribir,
  requerido = false,
  compacto = false,
}: {
  readonly campo: Exclude<CampoDeTexto, 'mensaje'>
  readonly datos: DatosDeContacto
  readonly errores: ErroresDeContacto
  readonly escribir: CamposProps['escribir']
  readonly requerido?: boolean
  readonly compacto?: boolean
}): React.JSX.Element {
  const conError = campo !== 'empresa' && errores[campo] !== undefined
  return (
    <div className="flex flex-col gap-[var(--spacing-1)]">
      {/* [INTERFAZ 1] T3: el error con borde punteado (el foco es liso: no se confunden). */}
      <label data-foco="pastilla" className={cn(PILDORA, compacto && 'py-[var(--spacing-1)]', conError && 'border-tinta border-dashed')}>
        <span className="text-caption shrink-0 font-medio">{CAMPOS[campo].rotulo}</span>
        <input
          name={campo}
          type="text"
          inputMode={campo === 'medio' ? 'email' : undefined}
          autoComplete={campo === 'nombre' ? 'name' : campo === 'empresa' ? 'organization' : campo === 'medio' ? 'email' : 'off'}
          required={requerido}
          maxLength={MAXIMO_DE[campo]}
          value={datos[campo]}
          onChange={(e) => escribir(campo, e.target.value)}
          onFocus={alEnfocar}
          placeholder={CAMPOS[campo].ejemplo}
          aria-invalid={conError || undefined}
          aria-describedby={conError ? idDelError(campo) : undefined}
          className="text-caption placeholder:text-tinta-tenue min-w-0 flex-1 bg-transparent"
        />
      </label>
      {campo !== 'empresa' && <Error campo={campo} errores={errores} />}
    </div>
  )
}

export function CamposDelContacto({ datos, errores, alternarInteres, escribir, compacto = false }: CamposProps): React.JSX.Element {
  const fila = compacto ? FILA_COMPACTA : FILA
  return (
    <div className={cn('flex flex-col', compacto ? 'gap-[var(--spacing-4)]' : 'gap-[var(--spacing-8)]')}>
      <fieldset className={fila} aria-describedby={errores.intereses === undefined ? undefined : idDelError('intereses')}>
        {/* La `legend` no entra a la grilla: va para el lector, y la pregunta visible, aparte. */}
        <legend className="sr-only">{PREGUNTAS.intereses}</legend>
        <div aria-hidden="true">
          <Pregunta numero={1} texto={PREGUNTAS.intereses} compacto={compacto} />
        </div>
        <div className="flex flex-col gap-[var(--spacing-2)]">
          <div className={cn('flex flex-wrap', compacto ? 'gap-[var(--spacing-1)]' : 'gap-[var(--spacing-2)]')}>
            {INTERESES.map((i) => {
              const marcado = datos.intereses.includes(i.id)
              return (
                <label
                  key={i.id}
                  data-pieza="chip-de-contacto"
                  data-marcado={marcado ? 'true' : 'false'}
                  className={cn(
                    'text-caption cursor-pointer rounded-[var(--radius-pastilla-s)] border transition-colors',
                    compacto ? 'px-[var(--spacing-3)] py-[var(--spacing-1)]' : 'px-[var(--spacing-4)] py-[var(--spacing-2)]',
                    marcado ? 'border-tinta bg-tinta text-fondo' : 'border-borde-fuerte hover:border-tinta',
                  )}
                >
                  <input
                    type="checkbox"
                    name="intereses"
                    value={i.id}
                    checked={marcado}
                    onChange={() => alternarInteres(i.id)}
                    aria-invalid={errores.intereses !== undefined || undefined}
                    aria-describedby={errores.intereses === undefined ? undefined : idDelError('intereses')}
                    className="sr-only"
                  />
                  {i.rotulo}
                </label>
              )
            })}
          </div>
          <Error campo="intereses" errores={errores} />
        </div>
      </fieldset>

      <div className={fila}>
        <Pregunta numero={2} texto={PREGUNTAS.presupuesto} compacto={compacto} />
        <Pildora campo="presupuesto" datos={datos} errores={errores} escribir={escribir} compacto={compacto} />
      </div>

      <div className={fila}>
        <Pregunta numero={3} texto={PREGUNTAS.persona} compacto={compacto} />
        <div className="flex flex-col gap-[var(--spacing-2)]">
          <div className="grid gap-[var(--spacing-2)] escritorio:grid-cols-3">
            <Pildora campo="nombre" datos={datos} errores={errores} escribir={escribir} compacto={compacto} />
            {/* [EL ENCASTRE] 1E · el único obligatorio: el email o el teléfono. */}
            <Pildora campo="medio" datos={datos} errores={errores} escribir={escribir} requerido compacto={compacto} />
            <Pildora campo="empresa" datos={datos} errores={errores} escribir={escribir} compacto={compacto} />
          </div>
          <div className="flex flex-col gap-[var(--spacing-1)]">
            <label data-foco="pastilla" className={cn(PILDORA, 'items-start rounded-[var(--radius-fuerte)]', compacto ? 'py-[var(--spacing-2)]' : 'py-[var(--spacing-3)]', errores.mensaje !== undefined && 'border-tinta border-dashed')}>
              <span className="text-caption shrink-0 font-medio">{CAMPOS.mensaje.rotulo}</span>
              <textarea
                name="mensaje"
                rows={compacto ? 2 : 3}
                maxLength={MAXIMOS.mensaje}
                value={datos.mensaje}
                onChange={(e) => escribir('mensaje', e.target.value)}
                onFocus={alEnfocar}
                placeholder={CAMPOS.mensaje.ejemplo}
                aria-invalid={errores.mensaje !== undefined || undefined}
                aria-describedby={errores.mensaje === undefined ? undefined : idDelError('mensaje')}
                className="text-caption placeholder:text-tinta-tenue min-w-0 flex-1 resize-none bg-transparent"
              />
            </label>
            <Error campo="mensaje" errores={errores} />
          </div>
        </div>
      </div>
    </div>
  )
}
