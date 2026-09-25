'use client'

import { useMotionValueEvent, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { Cta } from '../../_componentes/chrome/Cta'
import { acotar01 } from '../../_lib/acotar'
import { ROLLOVER_MEDIDO } from '../../_lib/cta'
import { ATRIBUTO_DE_SERVICIO, SERVICIOS } from '../_contrato/acento'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { CTA_POR_SERVICIO } from './contenido'
import {
  CLASE_DE_LA_VENTANA_DEL_CTA,
  CLASE_DEL_BOTON_ROTATIVO,
  CLASE_DEL_FANTASMA_DEL_CTA,
} from './geometria'

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
 * ── ⚠️ EL COLOR CAMBIA EN EL CRUCE DE LAS COPIAS, NI ANTES NI DESPUÉS ─────
 *
 * El contenedor lleva `[data-servicio]`, así que `--color-acento` se retiñe solo.
 * De QUÉ estado cuelga ese atributo es todo el asunto, y los dos extremos ya se
 * probaron y los dos se ven mal:
 *
 *   · de `mostrado` —lo que el botón DICE—, el color llega **al final**: medido,
 *     cambiaba a los 1.600 ms de un traspaso que arranca a los 200;
 *   · de `destino`, llega **al principio**, antes de que la animación corra, y el
 *     cartel viejo se queda un rato pintado del color nuevo.
 *
 * El instante correcto es el del medio: aquel en que el cartel cambia, que es
 * cuando las dos copias se cruzan. Por eso el color tiene su propio estado y su
 * propio reloj —`MS_DEL_CRUCE_DE_COPIAS`, derivado de la curva del sistema y
 * verificado en el navegador—, colgado del MISMO disparador que la etiqueta.
 *
 * ── Y el alto del botón no se mueve ───────────────────────────────────────
 *
 * La ventana del botón crece al relevar, y eso corría la torta 2 px. Se arregla
 * desde afuera, con los tokens del propio botón: ver `CLASE_DEL_BOTON_ROTATIVO`.
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

/**
 * EL BOTON NO APARECE DE LA NADA: LLEGA DESDE ABAJO, Y CON UN PATRON DE LA CASA.
 *
 * Hasta acá el CTA se montaba puesto. El estado 00 no lo tiene, el 01 sí, y en
 * el cuadro del cambio aparecía entero en su lugar — el único gesto de la
 * sección que no viajaba.
 *
 * ── Cuál primitiva, y por qué ésta ────────────────────────────────────────
 *
 * `P4`, «lista frenada»: `y` de 100 px a 0 y `opacity` de 0 a 1, con la curva
 * `salida-fuerte`. Es literalmente «entra desde 100 px abajo, muy frenado al
 * final», que es lo que el punto pide, y no hace falta inventar nada: entra por
 * `CanalDeUnaPieza`, el mismo envoltorio que los tres bloques de contenido ya
 * usan para P2.
 *
 * Las otras dos candidatas se descartaron con motivo. `P2` sube media altura
 * propia pero NO apaga, así que el botón se vería entero en el estado 00, que es
 * justo lo que no puede pasar. `P1` —el efecto de la casa para tipografía— sube
 * una altura entera, pero su invisibilidad de antes la pone la ventana recortada
 * que `LineasDeTexto` abre por línea, y acá el contenido es un `<a>`: recortar
 * la caja de un focalizable se come su anillo de foco, que es exactamente lo que
 * `s5-compacto` vigila. P4 no recorta nada porque apaga de verdad.
 *
 * ── Y va scrubbeado, no con un reloj propio ───────────────────────────────
 *
 * La llegada cuelga de `posicion`, el MISMO disparo que mueve al rodillo, a la
 * torta y a la etiqueta. Subiendo el botón llega; bajando se va por el mismo
 * camino y a la misma velocidad. No hay un segundo `animate(` —§14 lo prohíbe—
 * ni un `setTimeout` que pueda desincronizarse del traspaso.
 *
 * ⚠️ El nacimiento no es un número elegido: `servicioDelCta` REDONDEA, así que
 * el CTA empieza a existir medio estado antes de que el 01 quede puesto. La
 * ventana de la llegada es exactamente ese medio estado, así que el botón
 * termina de llegar en el mismo instante en que el rodillo termina de relevar.
 * §19 vuelve a preguntárselo a `servicioDelCta` en vez de confiar en la resta.
 */
export const PATRON_DE_LA_LLEGADA_DEL_CTA = 'P4'

/** Dónde da vuelta el redondeo de `servicioDelCta`. */
const MEDIO_ESTADO = 0.5
/** La posición del 01, que es el primer estado con servicio. */
export const POSICION_DEL_PRIMER_SERVICIO = 1
/** Y la del nacimiento: medio estado antes, por el redondeo. */
export const POSICION_DEL_NACIMIENTO_DEL_CTA = POSICION_DEL_PRIMER_SERVICIO - MEDIO_ESTADO

/** Cuánto de la llegada lleva recorrido el botón en esta posición. */
export function llegadaDelCta(posicion: number): number {
  return acotar01((posicion - POSICION_DEL_NACIMIENTO_DEL_CTA) / MEDIO_ESTADO)
}

/** Lo que tarda el subrayado en volver a reposo. Es el dato, no una copia. */
const REVERSION_MS = ROLLOVER_MEDIDO.subrayado.duracionMs
const INTERCAMBIO_MS = ROLLOVER_MEDIDO.duraciones.intercambioMs

/**
 * DÓNDE, DENTRO DEL INTERCAMBIO, SE CRUZAN LAS DOS COPIAS.
 *
 * Las dos corren la MISMA duración y la MISMA curva —`--ease-salida`, que es
 * `cubic-bezier(0.64, 0.1, 0, 1)`— en sentidos opuestos: la que sale va de
 * opacidad 1 a 0 y la que entra de 0 a 1. O sea que el instante en que se
 * cambia el cartel es aquel en el que la curva vale **0,5**, y eso no es la
 * mitad del tiempo: esta curva arranca plana y después se apura.
 *
 * Resolviendo la cúbica para `y = 0,5` sale el parámetro 0,4737, y su `x` —que
 * es la fracción de TIEMPO— vale **0,3582**. Sobre los 1.300 ms del
 * intercambio, el cruce cae a los 466 ms.
 *
 * ⚠️ **Medido en el navegador, y coincide.** Muestreando por cuadro las dos
 * opacidades computadas durante un relevo: el intercambio arranca a los 777 ms
 * del salto de scroll y las dos se cruzan a los 1.242 —**465 ms después**—,
 * contra los 465,7 que da la cuenta. `s6-servicios` §18 vuelve a resolver la
 * cúbica leyendo el token de `theme-develop.css`, así que mover la curva del
 * sistema pone esta constante en rojo en vez de desincronizar el color.
 */
export const FRACCION_DEL_CRUCE_DE_COPIAS = 0.3582
const MS_DEL_CRUCE_DE_COPIAS = Math.round(INTERCAMBIO_MS * FRACCION_DEL_CRUCE_DE_COPIAS)

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
  /**
   * De qué color está el botón. No sigue a `destino` ni a `mostrado`: cambia en
   * el CRUCE de las dos copias, que es el instante en que el cartel cambia.
   */
  const [tenido, setTenido] = useState<number | null>(mostrado)
  /** Cuánto de la llegada lleva recorrido. Cuelga del disparo, no de un reloj. */
  const llegada = useTransform(posicion, llegadaDelCta)

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
      setTenido(siguiente)
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
  /** El intercambio de copias está corriendo: el reloj del color cuelga de acá. */
  const intercambiando = relevando && !revirtiendo

  useEffect(() => {
    if (!intercambiando) return
    const reloj = setTimeout(() => setMostrado(destino), INTERCAMBIO_MS)
    return () => clearTimeout(reloj)
  }, [intercambiando, destino])

  // El color, en el cruce. Mismo disparador que la etiqueta y el mismo reloj:
  // si el intercambio se corta antes, el `clearTimeout` se lleva los dos.
  useEffect(() => {
    if (!intercambiando) return
    const reloj = setTimeout(() => setTenido(destino), MS_DEL_CRUCE_DE_COPIAS)
    return () => clearTimeout(reloj)
  }, [intercambiando, destino])

  if (mostrado === null) return null
  // `tenido` sólo es `null` cuando `mostrado` también lo es —aparecer y
  // desaparecer se aplican de una—, así que acá nunca cae al `??`.
  const acento = tenido ?? mostrado

  return (
    <div
      ref={caja}
      data-pieza="cta-que-rota"
      {...{ [ATRIBUTO_DE_SERVICIO]: SERVICIOS[acento].id }}
      // CONTACTO: abre el formulario con el servicio que está a la vista.
      data-abre-contacto=""
      data-precarga={SERVICIOS[mostrado].id}
      // El acento entra por el atributo; acá sólo se re-aliasa la tinta a él,
      // que es lo que el subrayado del botón resuelve en su propia regla.
      style={{ color: 'var(--color-acento)', ['--color-tinta' as string]: 'var(--color-acento)' }}
      className={className}
    >
      {/* La llegada envuelve a la ventana y no al contenedor: el contenedor es
          quien lleva `[data-servicio]`, y de ese atributo cuelga `--color-acento`
          para todo lo de adentro. Moverlo adentro del canal no cambiaría el
          color, pero sí dejaría al teñido colgando de un nodo que se traslada. */}
      <CanalDeUnaPieza progreso={llegada} patron={PATRON_DE_LA_LLEGADA_DEL_CTA}>
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
            className={CLASE_DEL_BOTON_ROTATIVO}
          />
        </div>
      </CanalDeUnaPieza>
    </div>
  )
}
