'use client'

import { cn } from '@/lib/utils'

import { CampoDePildora, CampoDeTextoLargo, ErrorDelCampo } from '../../_componentes/formularios/Campos'
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
  // [INTERFAZ 1] T3: sin `role="alert"` por campo: el aviso es UNO, al enviar (`FormularioDeContacto`). [B1.2d B] La pieza es común.
  return <ErrorDelCampo id={idDelError(campo)} texto={errores[campo]} />
}

const FILA = 'grid grid-cols-1 gap-[var(--spacing-4)] tablet:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] tablet:gap-[var(--spacing-8)]'
/** [NAVBAR] T4 · en el teléfono la pregunta va pegada a sus campos. */
const FILA_COMPACTA = 'grid grid-cols-1 gap-[var(--spacing-2)]'
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
    <div className="flex min-w-0 flex-col gap-[var(--spacing-1)]">
      {/* [B1.2d B] B4/B5 · la píldora es la común de los formularios (`_componentes/formularios/Campos.tsx`): la usa también «la tuya». */}
      <CampoDePildora
        rotulo={CAMPOS[campo].rotulo}
        nombre={campo}
        valor={datos[campo]}
        alEscribir={(v) => escribir(campo, v)}
        ejemplo={CAMPOS[campo].ejemplo}
        maximo={MAXIMO_DE[campo]}
        idDelError={campo === 'empresa' ? null : idDelError(campo)}
        conError={conError}
        alEnfocar={alEnfocar}
        requerido={requerido}
        compacto={compacto}
        autocompletar={campo === 'nombre' ? 'name' : campo === 'empresa' ? 'organization' : campo === 'medio' ? 'email' : 'off'}
        modoDeEntrada={campo === 'medio' ? 'email' : undefined}
      />
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
          <div className="grid grid-cols-1 gap-[var(--spacing-2)] escritorio:grid-cols-3">
            <Pildora campo="nombre" datos={datos} errores={errores} escribir={escribir} compacto={compacto} />
            {/* [EL ENCASTRE] 1E · el único obligatorio: el email o el teléfono. */}
            <Pildora campo="medio" datos={datos} errores={errores} escribir={escribir} requerido compacto={compacto} />
            <Pildora campo="empresa" datos={datos} errores={errores} escribir={escribir} compacto={compacto} />
          </div>
          <div className="flex flex-col gap-[var(--spacing-1)]">
            {/* [PULIDO 10] J9 · en el teléfono angosto el rótulo va en su renglón (al lado, el mensaje quedaba en una columna flaca) y
                el mensaje crece con lo que se escribe, de dos a ocho renglones (`field-sizing`; sin él, los renglones de siempre). */}
            <CampoDeTextoLargo
              rotulo={CAMPOS.mensaje.rotulo}
              nombre="mensaje"
              valor={datos.mensaje}
              alEscribir={(v) => escribir('mensaje', v)}
              ejemplo={CAMPOS.mensaje.ejemplo}
              maximo={MAXIMOS.mensaje}
              idDelError={idDelError('mensaje')}
              conError={errores.mensaje !== undefined}
              alEnfocar={alEnfocar}
              compacto={compacto}
            />
            <Error campo="mensaje" errores={errores} />
          </div>
        </div>
      </div>
    </div>
  )
}
