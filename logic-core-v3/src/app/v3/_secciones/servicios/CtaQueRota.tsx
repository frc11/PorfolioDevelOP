'use client'

import { useMotionValueEvent, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { Cta } from '../../_componentes/chrome/Cta'
import { ROLLOVER_MEDIDO } from '../../_lib/cta'
import { ATRIBUTO_DE_SERVICIO, SERVICIOS } from '../_contrato/acento'
import { CTA_POR_SERVICIO } from './contenido'
import { CLASE_DE_LA_VENTANA_DEL_CTA, CLASE_DEL_FANTASMA_DEL_CTA } from './geometria'

/**
 * EL CTA QUE ROTA — y rota con el PROPIO intercambio del botón, no con uno nuevo.
 *
 * ── El hallazgo que hace que esto sea envolver y no modificar ─────────────
 *
 * `Cta` ya renderiza **dos copias del rótulo**: `copia-a`, que se lee en reposo
 * y es la que se anuncia, y `copia-b`, `aria-hidden`, que es la que ENTRA. El
 * hover las intercambia —la primera sale girando y recortada, la segunda llega
 * desde abajo— y hoy ese gesto intercambia **dos textos idénticos**: se ve el
 * movimiento y no se lee un cambio.
 *
 * O sea que el mecanismo de rotación de etiqueta ya estaba construido y sin
 * usar. Lo único que faltaba es que la copia que llega diga otra cosa. Y `Cta`
 * tiene `forzado="hover"`, que enciende ese mismo estado sin puntero.
 *
 * ── ⚠️ CÓMO SE LE DA OTRA CADENA SIN TOCAR `Cta` ─────────────────────────
 *
 * `Cta` toma UN `rotulo` y se lo da a las dos copias, así que no hay prop por
 * donde pasar la etiqueta entrante. Y `Cta.tsx` no se toca: lo comparten el Hero
 * y el Cierre. La secuencia es: escribirle a `copia-b` —y sólo a ella— la
 * etiqueta NUEVA por `ref`, encender el estado, y cuando el intercambio termina
 * pasar el `rotulo` al nuevo y apagarlo. El relevo final es invisible porque la
 * `transition` de las copias vive en la regla de ESTADO: al soltar, la duración
 * vuelve a `0s` y el reposo se repone en un cuadro.
 *
 * ⚠️ Se escribe `copia-b` y NUNCA `copia-a`: la primera es `aria-hidden`, así
 * que tocarla no cambia una letra de lo que se anuncia.
 *
 * ── ⚠️ HOVER Y CAMBIO NO PUEDEN CORRER A LA VEZ ──────────────────────────
 *
 * Si el servicio cambia con el puntero encima, el botón ya está en el estado de
 * hover: encender el intercambio encima no produce un gesto, produce un salto —
 * la copia entrante aparece en su lugar con el texto nuevo, sin haber viajado.
 *
 * El orden obligatorio es revertir, cambiar y recién entonces volver a correr.
 * Y revertir con el puntero encima parece imposible, porque `:hover` lo pone el
 * navegador y no hay prop que lo apague… salvo una: **`pointer-events: none`
 * hace que `:hover` deje de matchear**. Así que la reversión se consigue sin
 * tocar la hoja ni el componente, el botón vuelve a reposo animado, se le
 * escribe la etiqueta nueva a la copia entrante, y al devolverle los eventos el
 * `:hover` vuelve a matchear solo y **la animación que corre es la del relevo**.
 * El mismo gesto sirve para las dos cosas, que es lo que el punto pedía.
 *
 * ── ⚠️ EL COLOR SALE DEL DESTINO, NO DE LO QUE EL BOTÓN DICE ──────────────
 *
 * El contenedor lleva `[data-servicio]`, así que `--color-acento` se retiñe solo.
 * Y colgaba de `mostrado`, que es lo que el botón DICE: como `mostrado` recién se
 * mueve cuando el intercambio termina, el botón conservaba el acento viejo todo el
 * relevo —medido: el color cambiaba a los 1.600 ms de un traspaso que arranca a los
 * 200—. Cuelga de `destino`, que se escribe en el mismo cuadro en que se le escribe
 * la etiqueta nueva a la copia entrante y en que se enciende el relevo: una sola
 * fuente para las dos cosas, así que no se pueden volver a separar.
 * Y como el subrayado del botón resuelve `var(--color-tinta)` en su propia regla,
 * alcanza con **re-aliasar la tinta al acento en este contenedor**: es un
 * override de token acotado a esta caja, no un color escrito, y es la única
 * forma de reteñir un componente que no se puede tocar. El texto va aparte
 * porque el color se hereda por valor computado y no re-resuelve la variable.
 */

/** Cuál servicio manda, según la posición disparada. `null` en el estado 0. */
export function servicioDelCta(posicion: number): number | null {
  const indice = Math.round(posicion) - 1
  return indice >= 0 && indice < SERVICIOS.length ? indice : null
}

function etiquetaDe(indice: number): string {
  return CTA_POR_SERVICIO[SERVICIOS[indice].id]
}

/** Lo que tarda el subrayado en volver a reposo. Es el dato, no una copia. */
const REVERSION_MS = ROLLOVER_MEDIDO.subrayado.duracionMs
const INTERCAMBIO_MS = ROLLOVER_MEDIDO.duraciones.intercambioMs

export interface CtaQueRotaProps {
  readonly posicion: MotionValue<number>
  readonly className?: string
}

export function CtaQueRota({ posicion, className }: CtaQueRotaProps): React.JSX.Element | null {
  const caja = useRef<HTMLDivElement>(null)
  /** Lo que el botón DICE ahora. No se mueve hasta que el intercambio termina. */
  const [mostrado, setMostrado] = useState<number | null>(() => servicioDelCta(posicion.get()))
  /** A dónde va. Mientras difiera de `mostrado`, hay un relevo en curso. */
  const [destino, setDestino] = useState<number | null>(mostrado)
  /** Con el puntero encima: primero se revierte el hover, después se releva. */
  const [revirtiendo, setRevirtiendo] = useState(false)
  /**
   * Si este relevo arrancó con el puntero encima.
   *
   * ⚠️ Va como estado y no se lee del DOM en el render: un `ref` no se puede
   * consultar mientras se renderiza —React no re-renderiza cuando cambia— y el
   * dato hace falta para decidir si hay que FORZAR el estado o dejárselo al
   * `:hover` de verdad. Se anota en el momento del cambio, que es cuando la
   * respuesta importa.
   */
  const [porPuntero, setPorPuntero] = useState(false)

  const escribirEntrante = (indice: number): void => {
    const entrante = caja.current?.querySelector('[data-parte="copia-b"]')
    if (entrante instanceof HTMLElement) entrante.textContent = etiquetaDe(indice)
  }

  useMotionValueEvent(posicion, 'change', (v) => {
    const siguiente = servicioDelCta(v)
    if (siguiente === destino) return
    setDestino(siguiente)
    // Aparecer o desaparecer no es un relevo: no hay etiqueta que intercambiar.
    if (siguiente === null || mostrado === null) {
      setMostrado(siguiente)
      return
    }
    const boton = caja.current?.querySelector('[data-pieza="cta"]')
    const hayPuntero = boton instanceof HTMLElement && boton.matches(':hover')
    setPorPuntero(hayPuntero)
    if (hayPuntero) {
      setRevirtiendo(true)
      return
    }
    escribirEntrante(siguiente)
  })

  // La reversión, cuando había puntero: al terminar se escribe la etiqueta y se
  // devuelven los eventos, y ahí el `:hover` vuelve a encender el intercambio.
  useEffect(() => {
    if (!revirtiendo || destino === null) return
    const reloj = setTimeout(() => {
      escribirEntrante(destino)
      setRevirtiendo(false)
    }, REVERSION_MS)
    return () => clearTimeout(reloj)
  }, [revirtiendo, destino])

  const relevando = destino !== null && mostrado !== null && destino !== mostrado

  useEffect(() => {
    if (!relevando || revirtiendo) return
    const reloj = setTimeout(() => setMostrado(destino), INTERCAMBIO_MS)
    return () => clearTimeout(reloj)
  }, [relevando, revirtiendo, destino])

  if (mostrado === null) return null
  // El acento es el del DESTINO. `destino` sólo es `null` cuando `mostrado`
  // también lo es —desaparecer se aplica de una—, así que acá nunca cae al `??`.
  const teñido = destino ?? mostrado

  return (
    <div
      ref={caja}
      data-pieza="cta-que-rota"
      {...{ [ATRIBUTO_DE_SERVICIO]: SERVICIOS[teñido].id }}
      // El acento entra por el atributo; acá sólo se re-aliasa la tinta a él,
      // que es lo que el subrayado del botón resuelve en su propia regla.
      style={{ color: 'var(--color-acento)', ['--color-tinta' as string]: 'var(--color-acento)' }}
      className={className}
    >
      {/* ⚠️ LA VENTANA NO CAMBIA DE TAMAÑO AL CAMBIAR LA ETIQUETA. Las tres van
          como fantasmas en la MISMA celda de la grilla, así que el ancho de la
          celda es el de la más larga y no el de la que se está viendo. Medido y
          no adivinado: la más larga no es la de más caracteres en toda tipografía.
          Van `aria-hidden` porque no dicen nada que el botón no diga. */}
      <div className={CLASE_DE_LA_VENTANA_DEL_CTA} style={revirtiendo ? { pointerEvents: 'none' } : undefined}>
        {SERVICIOS.map((servicio) => (
          <span key={servicio.id} aria-hidden="true" className={CLASE_DEL_FANTASMA_DEL_CTA}>
            {CTA_POR_SERVICIO[servicio.id]}
          </span>
        ))}
        <Cta
          rotulo={etiquetaDe(mostrado)}
          forzado={relevando && !revirtiendo && !porPuntero ? 'hover' : undefined}
          className="col-start-1 row-start-1 w-full [&_[data-parte=ventana]]:min-w-full"
        />
      </div>
    </div>
  )
}
