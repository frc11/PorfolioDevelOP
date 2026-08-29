'use client'

import { useId, useState } from 'react'

import { NOMBRES_DE_CURVA, NOMBRE_EN_GSAP } from '../../_lib/motion/curvas'
import { AJUSTES_MEDIDOS, TOPES, type Ajustes } from './ajustes'

/**
 * LAS PERILLAS — calibrar sin recompilar.
 *
 * "La calibración final la hace el ojo, y sin perillas no se puede calibrar."
 *
 * ── Lo único de esta ruta que re-renderiza ─────────────────────────────────
 *
 * El sistema de motion no re-renderiza nunca: el scroll mueve `MotionValue`s y
 * esos escriben al DOM. Los únicos renders de `/v3/motion` los produce este
 * panel, y siempre por un gesto del usuario. Un deslizador arrastrado dispara un
 * render por evento de `input`, que es lo que hace cualquier control de React;
 * no es un `setState` por cuadro de animación.
 *
 * ── Accesibilidad ─────────────────────────────────────────────────────────
 *
 * Todos los controles son nativos y tienen `<label>` asociado por `id`. El panel
 * se puede plegar, y el botón que lo pliega dice qué hace con texto, no con un
 * ícono. El anillo de foco lo pone `theme-develop.css` para todo el árbol
 * `data-v3`.
 */

export interface ControlesProps {
  readonly ajustes: Ajustes
  readonly alCambiar: (ajustes: Ajustes) => void
}

const CLASE_ETIQUETA = 'font-codigo text-micro leading-micro tracking-micro uppercase'
const CLASE_BOTON =
  'font-codigo text-micro tracking-micro border-borde-fuerte hover:bg-superficie-3 border px-3 py-1 uppercase'

export function Controles({ ajustes, alCambiar }: ControlesProps): React.JSX.Element {
  const [plegado, setPlegado] = useState(false)
  const idDuracion = useId()
  const idEscalonado = useId()
  const idCurva = useId()
  const idInercia = useId()

  const enLoMedido =
    ajustes.factorDeDuracion === AJUSTES_MEDIDOS.factorDeDuracion &&
    ajustes.factorDeEscalonado === AJUSTES_MEDIDOS.factorDeEscalonado &&
    ajustes.curvaForzada === AJUSTES_MEDIDOS.curvaForzada

  return (
    <aside
      className="bg-fondo border-borde-fuerte fixed right-6 bottom-6 z-[var(--z-cabecera)] flex max-w-[var(--columna-lateral)] min-w-[var(--columna-lateral)] flex-col gap-3 border p-4"
      aria-label="Controles de calibración"
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`${CLASE_ETIQUETA} text-tinta-media`}>calibración</p>
        <button type="button" className={CLASE_BOTON} onClick={() => setPlegado(!plegado)}>
          {plegado ? 'abrir' : 'cerrar'}
        </button>
      </div>

      {!plegado && (
        <>
          <div className="flex flex-col gap-1">
            <label htmlFor={idDuracion} className={CLASE_ETIQUETA}>
              duración ×{ajustes.factorDeDuracion.toFixed(2)}
            </label>
            <input
              id={idDuracion}
              type="range"
              min={TOPES.duracion.min}
              max={TOPES.duracion.max}
              step={TOPES.duracion.paso}
              value={ajustes.factorDeDuracion}
              onChange={(e) =>
                alCambiar({ ...ajustes, factorDeDuracion: Number(e.target.value) })
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={idEscalonado} className={CLASE_ETIQUETA}>
              escalonado ×{ajustes.factorDeEscalonado.toFixed(2)}
            </label>
            <input
              id={idEscalonado}
              type="range"
              min={TOPES.escalonado.min}
              max={TOPES.escalonado.max}
              step={TOPES.escalonado.paso}
              value={ajustes.factorDeEscalonado}
              onChange={(e) =>
                alCambiar({ ...ajustes, factorDeEscalonado: Number(e.target.value) })
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={idCurva} className={CLASE_ETIQUETA}>
              curva
            </label>
            <select
              id={idCurva}
              className="border-borde bg-fondo font-codigo text-micro border px-2 py-1"
              value={ajustes.curvaForzada ?? ''}
              onChange={(e) =>
                alCambiar({
                  ...ajustes,
                  curvaForzada:
                    e.target.value === ''
                      ? null
                      : NOMBRES_DE_CURVA.find((n) => n === e.target.value) ?? null,
                })
              }
            >
              <option value="">la medida de cada patrón</option>
              {NOMBRES_DE_CURVA.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre} · {NOMBRE_EN_GSAP[nombre]}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="flex flex-col gap-1">
            <legend className={`${CLASE_ETIQUETA} text-tinta-media`}>avance</legend>
            {(['atado-al-scroll', 'tiempo-real'] as const).map((modo) => (
              <label key={modo} className="font-codigo text-micro flex items-center gap-2">
                <input
                  type="radio"
                  name="modo-de-avance"
                  value={modo}
                  checked={ajustes.modo === modo}
                  onChange={() => alCambiar({ ...ajustes, modo })}
                />
                {modo}
              </label>
            ))}
          </fieldset>

          <label htmlFor={idInercia} className="font-codigo text-micro flex items-center gap-2">
            <input
              id={idInercia}
              type="checkbox"
              checked={ajustes.conInercia}
              onChange={(e) => alCambiar({ ...ajustes, conInercia: e.target.checked })}
            />
            inercia del scrub
          </label>

          <button
            type="button"
            className={CLASE_BOTON}
            onClick={() => alCambiar(AJUSTES_MEDIDOS)}
            disabled={enLoMedido}
          >
            {enLoMedido ? 'en lo medido' : 'volver a lo medido'}
          </button>
        </>
      )}
    </aside>
  )
}
