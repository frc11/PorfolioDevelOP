'use client'

import { animate, useMotionTemplate, useMotionValue, useSpring, type MotionValue } from 'motion/react'
import { useEffect } from 'react'

import { FOCO_DE_LA_ESCENA_PX } from '../../_secciones/trabajos/tunel'

/**
 * [CIERRE] 2B · EL CONTACTO COMO PLACA — en el producto, desde la barra (escritorio y tablet) y con movimiento. Era la
 * prueba `?pruebas=contactofondo=blur|blanco` de AJUSTES FINALES B2: Valentino eligió el desenfoque; el fundido a blanco y
 * la bandera se borraron. Abajo de la barra (el teléfono, con el menú) y con movimiento reducido, la hoja deslizante de hoy.
 *
 *   1. El FONDO cambia primero (`MS_DEL_FONDO`): el sitio se desenfoca hasta `DESENFOQUE_DEL_FONDO_PX` mientras se oscurece.
 *   2. Llega la PLACA, un bloque con ESPESOR de verdad (`ESPESOR_DE_LA_PLACA_PX`: el frente es el formulario del DOM y las
 *      cuatro caras de los costados y la de atrás son cajas de CSS 3D, en tinta). Nace en un PUNTO del fondo
 *      (`ESCALA_AL_NACER` de su tamaño) y viaja hasta adelante como las fotos del túnel: su tamaño aparente crece casi en
 *      recta y se asienta al final (`viajeDesdeElFondo`).
 *   3. El puntero es la cámara, y exagerada: con el mouse a la izquierda se le ve el costado izquierdo, a la derecha el
 *      derecho, arriba la cara de arriba y abajo la de abajo (`paralajeDe`: la placa gira hasta `GIRO_DE_LA_PLACA` y el
 *      punto de vista se corre con el mouse). Con el dedo no gira. [EL ENCASTRE] 1D: mientras viaja desde el fondo no
 *      responde (el punto de vista, quieto en el centro: antes el que viajaba seguía al mouse); recién al llegar empieza,
 *      con una entrada suave desde quieta (`ENTRADA_DEL_PARALAJE`), y la sigue EN SENTIDO CONTRARIO: se corre al lado
 *      opuesto del mouse (`CORRIMIENTO_DE_LA_PLACA`, el paralaje inverso de lo que está delante de la cámara).
 *   4. Al cerrar (Esc, la cruz, el velo, después de enviar), primero la placa se ACUESTA hacia atrás sobre su base, como
 *      los títulos y los libros (`MS_DE_LA_SALIDA_DE_LA_PLACA`), y RECIÉN DESPUÉS se va el desenfoque del fondo.
 *
 * Lo interactivo es el DOM de siempre (los campos, la trampa de foco, Esc, el envío): girado en CSS 3D, el navegador lo
 * sigue tocando donde se ve. No hizo falta la placa de WebGL del pie: con las caras de CSS el espesor se ve.
 */
export const MS_DEL_FONDO = 500
export const MS_DE_LA_PLACA = 1000
export const MS_DE_LA_SALIDA_DE_LA_PLACA = 650
/** La perspectiva: el foco de la cámara de la sala (el mismo con que huye el cartel de Portfolio). */
export const PERSPECTIVA_DE_LA_PLACA = FOCO_DE_LA_ESCENA_PX
export const DESENFOQUE_DEL_FONDO_PX = 24
/** El espesor del bloque (px): lo que se le ve de costado. */
export const ESPESOR_DE_LA_PLACA_PX = 56
/** Cuánto mide al nacer, en el fondo: un punto. */
export const ESCALA_AL_NACER = 0.02
/** La cámara del puntero: cuánto gira la placa en cada eje (grados) y cuánto se corre el punto de vista (fracción del cuadro). */
export const GIRO_DE_LA_PLACA = { y: 22, x: 13 } as const
export const PUNTO_DE_VISTA = { x: 0.42, y: 0.3 } as const
/** [EL ENCASTRE] 1D · cuánto se corre la placa al revés del mouse (fracción del cuadro, en cada borde). */
export const CORRIMIENTO_DE_LA_PLACA = { x: 0.035, y: 0.03 } as const
/** [EL ENCASTRE] 1D · la entrada del paralaje al llegar: de quieta a seguir al mouse, en cuánto (s) y con qué curva. */
export const ENTRADA_DEL_PARALAJE = { duration: 0.8, ease: [0.45, 0, 0.55, 1] } as const

const CURVA = [0.77, 0, 0.175, 1] as const

/**
 * EL VIAJE DESDE EL FONDO: las posiciones en `z` (px, con la perspectiva de la placa) para que su tamaño aparente crezca de
 * `ESCALA_AL_NACER` a 1 casi en recta (1 − (1 − t)^1,35: el túnel crece en recta y su resorte lo asienta), en `pasos`
 * tramos iguales de tiempo. Con perspectiva `d`, una caja en `z` se ve `d / (d − z)` veces: para verse `s`, `z = d − d / s`.
 */
export function viajeDesdeElFondo(pasos = 16): readonly number[] {
  const d = PERSPECTIVA_DE_LA_PLACA
  return Array.from({ length: pasos + 1 }, (_, i) => {
    const t = i / pasos
    const s = ESCALA_AL_NACER + (1 - ESCALA_AL_NACER) * (1 - (1 - t) ** 1.35)
    return i === pasos ? 0 : d - d / s
  })
}

/**
 * La cámara para un puntero en `x`, `y` (fracciones del cuadro, 0 a 1): el giro de la placa, el punto de vista (%) y
 * ([EL ENCASTRE] 1D) el corrimiento al revés del mouse (fracción del cuadro).
 */
export function paralajeDe(x: number, y: number): { readonly rotateX: number; readonly rotateY: number; readonly origenX: number; readonly origenY: number; readonly corrimientoX: number; readonly corrimientoY: number } {
  const [dx, dy] = [Math.min(1, Math.max(0, x)) - 0.5, Math.min(1, Math.max(0, y)) - 0.5]
  // Mouse a la izquierda: la cara izquierda gira hacia adelante (rotateY > 0), el punto de vista se corre a la izquierda y
  // la placa, a la derecha (lo que está delante de la cámara se corre al revés de ella).
  return { rotateY: -dx * 2 * GIRO_DE_LA_PLACA.y, rotateX: dy * 2 * GIRO_DE_LA_PLACA.x, origenX: 50 + dx * 200 * PUNTO_DE_VISTA.x, origenY: 50 + dy * 200 * PUNTO_DE_VISTA.y, corrimientoX: -dx * 2 * CORRIMIENTO_DE_LA_PLACA.x, corrimientoY: -dy * 2 * CORRIMIENTO_DE_LA_PLACA.y }
}

/**
 * ¿Se ve la cara del costado izquierdo de una placa de `ancho` px, con el puntero en `x`? (la normal de la cara mira hacia
 * el ojo: d·sen(a) − ancho/2 − ox·cos(a) > 0, con el ojo corrido `ox` px y la placa girada `a`). Para el invariante.
 */
export function seVeElCostadoIzquierdo(x: number, ancho: number, anchoDelCuadro: number, paralaje: typeof paralajeDe = paralajeDe): boolean {
  const p = paralaje(x, 0.5)
  const a = (p.rotateY * Math.PI) / 180
  const ox = ((p.origenX - 50) / 100) * anchoDelCuadro
  return PERSPECTIVA_DE_LA_PLACA * Math.sin(a) - ancho / 2 - ox * Math.cos(a) > 0
}

/** Las transiciones: el fondo; el viaje de la placa (después de que el fondo arrancó); la salida (se acuesta) y el fondo después. */
export const TRANSICIONES = {
  fondo: { duration: MS_DEL_FONDO / 1000, ease: CURVA },
  fondoAlCerrar: { duration: MS_DEL_FONDO / 1000, ease: CURVA, delay: MS_DE_LA_SALIDA_DE_LA_PLACA / 1000 },
  viaje: { duration: MS_DE_LA_PLACA / 1000, ease: 'linear', delay: (MS_DEL_FONDO / 1000) * 0.6 },
  acostarse: { duration: MS_DE_LA_SALIDA_DE_LA_PLACA / 1000, ease: [0.55, 0, 0.8, 0.4] },
} as const

const RESORTE = { stiffness: 140, damping: 22, mass: 0.9 } as const

/**
 * La cámara del puntero, con resorte: el giro de la placa, el punto de vista y el corrimiento. Vuelve al centro al irse.
 * [EL ENCASTRE] 1D · todo multiplicado por la ganancia de la llegada: 0 mientras viaja (quieta, con el punto de vista en
 * el centro) y, al llegar, sube a 1 en `ENTRADA_DEL_PARALAJE` con el último puntero conocido (entra suave, desde quieta).
 */
export function useParalaje(activo: boolean, llego: boolean): { readonly rotateX: MotionValue<number>; readonly rotateY: MotionValue<number>; readonly origen: MotionValue<string>; readonly x: MotionValue<number>; readonly y: MotionValue<number> } {
  const rotateX = useSpring(0, RESORTE)
  const rotateY = useSpring(0, RESORTE)
  const origenX = useSpring(50, RESORTE)
  const origenY = useSpring(50, RESORTE)
  const x = useSpring(0, RESORTE)
  const y = useSpring(0, RESORTE)
  const ganancia = useMotionValue(0)
  const origen = useMotionTemplate`${origenX}% ${origenY}%`
  useEffect(() => {
    if (!activo) return undefined
    const puntero = { x: 0.5, y: 0.5 }
    const aplicar = (): void => {
      const g = ganancia.get()
      const p = paralajeDe(puntero.x, puntero.y)
      rotateX.set(p.rotateX * g)
      rotateY.set(p.rotateY * g)
      origenX.set(50 + (p.origenX - 50) * g)
      origenY.set(50 + (p.origenY - 50) * g)
      x.set(p.corrimientoX * g * window.innerWidth)
      y.set(p.corrimientoY * g * window.innerHeight)
    }
    const mover = (e: PointerEvent): void => {
      // Sólo el mouse (y el lápiz): con el dedo, deslizar el formulario no tiene que girar la placa.
      if (e.pointerType === 'touch') return
      puntero.x = e.clientX / window.innerWidth
      puntero.y = e.clientY / window.innerHeight
      aplicar()
    }
    window.addEventListener('pointermove', mover, { passive: true })
    const dejar = ganancia.on('change', aplicar)
    return () => {
      window.removeEventListener('pointermove', mover)
      dejar()
      for (const v of [rotateX, rotateY, x, y]) v.set(0)
      origenX.set(50)
      origenY.set(50)
    }
  }, [activo, ganancia, rotateX, rotateY, origenX, origenY, x, y])
  // La ganancia: 0 hasta que llega; después sube suave (y vuelve a 0 si la placa se apaga).
  useEffect(() => {
    if (!activo || !llego) {
      ganancia.set(0)
      return undefined
    }
    const entrada = animate(ganancia, 1, ENTRADA_DEL_PARALAJE)
    return () => entrada.stop()
  }, [activo, llego, ganancia])
  return { rotateX, rotateY, origen, x, y }
}
