'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Button } from '@/components/ui'
import type { ButtonVariant } from '@/components/ui/Button'
import { zIndex } from '@/lib/design-tokens'

/**
 * LA BARRA DE ACCIÓN del manual (P18) — un solo mecanismo para las catorce.
 *
 * El problema que resuelve: la acción estaba SIEMPRE al final. En la ficha,
 * después del formulario entero; en el chequeo, después de catorce controles.
 * Medido con el instrumento de P17 sobre las once pantallas de trabajo, la
 * acción principal se veía sin scrollear en 2/11 a 1440 y en 0/11 a 390 — el
 * setter recorría la pantalla entera para poder actuar, y después volvía a
 * subir.
 *
 * Y arrastraba un segundo defecto: un botón deshabilitado no decía por qué. La
 * barra muestra el motivo AL LADO del control apagado. El motivo no se calcula
 * acá: lo pasa la pantalla, desde el mismo dato que ya apaga el botón. Donde no
 * existe como dato, no se muestra nada — «falta algo» sin decir qué es peor que
 * no decir nada.
 *
 * ── Por qué un contexto y no mover el botón en el JSX ────────────────────────
 * Para que la acción se vea en CUALQUIER posición del scroll, el elemento tiene
 * que ser `sticky bottom-0` con su bloque contenedor abarcando todo el alto del
 * contenido — o sea, hijo directo de la raíz de `PantallaManual`. Pero el
 * `disabled` de tres pantallas (m4 por el link en el opener, m5 por el
 * resultado elegido, m14 por los obligatorios en rojo) depende de estado LOCAL
 * del formulario. Mover el botón en el JSX habría obligado a subir ese estado
 * —o sea, a tocar la lógica de cuándo una acción está habilitada—, que es
 * exactamente lo que este sprint prohíbe.
 *
 * Con el contexto, cada formulario sigue siendo dueño de su estado, de su
 * handler y de su expresión de `disabled`: sólo DECLARA su acción, y el botón
 * se pinta en la barra. La expresión de bloqueo viaja copiada tal cual.
 *
 * Costo aceptado: la barra se puebla en la hidratación (el botón ya no viaja en
 * el HTML del server). No hay salto de layout —vive al final del contenido y no
 * empuja nada de lo de arriba—, pero sí un instante sin barra en la carga fría.
 */

export type AccionPrincipal = {
  /** El texto del botón — el MISMO que tenía al final del formulario. */
  etiqueta: string
  onClick: () => void
  /** La expresión de bloqueo de la pantalla, copiada tal cual. */
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  variant?: ButtonVariant
  /**
   * Qué falta, en idioma del setter. Se muestra SÓLO cuando está bloqueada. Si
   * la pantalla no tiene el motivo como dato, pasa `null` y la barra calla.
   */
  motivo?: string | null
}

/** Caja de identidad estable con la acción de ahora — ver `useAccionPrincipal`. */
type CajaAccion = { current: AccionPrincipal | null }

type Declarador = (caja: CajaAccion | null, clave: string) => void

const DeclararCtx = createContext<Declarador | null>(null)
const AccionCtx = createContext<{ caja: CajaAccion; clave: string } | null>(null)

/**
 * Envuelve el contenido de la pantalla. Va en `PantallaManual`, no en cada
 * pantalla: el mecanismo es uno solo para las catorce.
 *
 * Dos contextos y no uno: los formularios consumen `DeclararCtx` (estable — no
 * se re-renderizan cuando cambia la acción) y sólo la barra consume `AccionCtx`.
 */
export function ProveedorAccion({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<{ caja: CajaAccion; clave: string } | null>(null)

  const declarar = useCallback<Declarador>((caja, clave) => {
    setEstado((previo) => {
      if (!caja) return previo === null ? previo : null
      if (previo && previo.caja === caja && previo.clave === clave) return previo
      return { caja, clave }
    })
  }, [])

  return (
    <DeclararCtx.Provider value={declarar}>
      <AccionCtx.Provider value={estado}>{children}</AccionCtx.Provider>
    </DeclararCtx.Provider>
  )
}

/**
 * Declara la acción principal de la pantalla. La llama el formulario que ya era
 * dueño del botón, con los MISMOS valores que le pasaba.
 *
 * El `onClick` se re-crea en cada render del formulario (captura estado local),
 * así que no puede entrar en las dependencias del efecto sin armar un ciclo:
 * se guarda en una caja de identidad estable, y la barra la desreferencia recién
 * al hacer click para no llamar nunca a un closure viejo. Lo que sí dispara el
 * re-render de la barra es la CLAVE: las partes que se VEN — la etiqueta, si
 * está bloqueada, si está cargando, el motivo.
 */
export function useAccionPrincipal(accion: AccionPrincipal | null) {
  const declarar = useContext(DeclararCtx)
  const caja = useRef<AccionPrincipal | null>(null)

  // Sin deps: la caja queda al día después de CADA render del formulario.
  useEffect(() => {
    caja.current = accion
  })

  const clave = accion
    ? [
        accion.etiqueta,
        accion.disabled ? '1' : '0',
        accion.loading ? '1' : '0',
        accion.variant ?? '',
        accion.motivo ?? '',
      ].join('|')
    : ''

  useEffect(() => {
    if (!declarar) return
    if (!clave) {
      declarar(null, '')
      return
    }
    // El efecto de arriba está declarado ANTES, así que en este mismo ciclo ya
    // dejó la caja al día: la barra nunca lee una acción vieja ni vacía.
    declarar(caja, clave)
    return () => declarar(null, '')
    // `accion` queda fuera a propósito: su identidad cambia en cada render y la
    // clave ya representa todo lo que la barra pinta.
  }, [declarar, clave])
}

/**
 * La banda. Sólo se renderiza si hay acción declarada: una pantalla sin acción
 * principal —los tres estados terminales, y m13 en su rama de consulta— no
 * muestra una barra vacía ni un botón apagado por defecto.
 *
 * `sticky bottom-0` y no `fixed`: al llegar al final del scroll la barra
 * aterriza en su lugar del flujo en vez de quedar flotando encima, así el
 * último campo de la pantalla siempre se alcanza. El `-mb-8` cancela el `py-8`
 * del scroller para que quede al ras del borde también en esa última posición.
 */
export function BarraAccion() {
  const estado = useContext(AccionCtx)
  const idMotivo = useId()
  const accion = estado?.caja.current ?? null
  if (!accion) return null

  const bloqueada = Boolean(accion.disabled)
  const motivo = bloqueada ? (accion.motivo?.trim() ?? '') || null : null

  return (
    <div
      data-slot="barra-accion"
      style={{ zIndex: zIndex.sticky }}
      className="sticky bottom-0 -mb-8 border-t border-white/[0.08] bg-zinc-950/85 px-1 py-2.5 backdrop-blur-[20px] backdrop-saturate-[180%]"
    >
      <div className="flex items-center justify-end gap-3">
        {motivo && (
          <p
            id={idMotivo}
            className="min-w-0 flex-1 text-[11px] leading-snug text-amber-200/85"
          >
            {motivo}
          </p>
        )}
        <Button
          data-accion="principal"
          onClick={() => estado?.caja.current?.onClick()}
          disabled={bloqueada}
          loading={accion.loading}
          icon={accion.icon}
          variant={accion.variant ?? 'primary'}
          aria-describedby={motivo ? idMotivo : undefined}
          className="shrink-0 rounded-xl px-4 py-2 text-sm"
        >
          {accion.etiqueta}
        </Button>
      </div>
    </div>
  )
}
