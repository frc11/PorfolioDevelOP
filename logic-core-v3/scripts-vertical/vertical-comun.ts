/**
 * BANCO DE VERTICAL-1 — la aritmética del encuadre a 390×844, sin navegador.
 *
 * ── Qué hereda y qué escribe ──────────────────────────────────────────────
 *
 * **No escribe una sola línea de geometría nueva.** El muestreador del logo, la
 * caja, la fracción que entra y la cobertura son los de `s10-logo` y
 * `s10-logo-lectura`, que son los que `s8-tinta`, `s16-encuadre` y `s10-logo`
 * ya usan. La cámara es `cameraAt` del arnés, que desde ENCUADRE-1 consume
 * `recorridoDeEncuadre` — la misma función que corre en producción.
 *
 * Lo propio son dos cosas y ninguna es una fórmula: **la ventana** (390×844) y
 * **la pista con un `frameX` cambiado**, que es cómo se prueba un valor sin
 * tocar el árbol.
 *
 * ── ⚠️ POR QUÉ ESTE BANCO NO USA EL NAVEGADOR ─────────────────────────────
 *
 * Porque la pregunta es geométrica y se contesta mejor sin él: el muestreador
 * evalúa la silueta del logo proyectada sobre una malla, así que puede mirar
 * **fuera del cuadro** —que es exactamente lo que hay que ver acá— y una captura
 * no puede. Las capturas van aparte, con `scripts-movil/d-captura.ts`, y sirven
 * para lo que sí es de mirar.
 */

import { CHOREO_KEYFRAMES } from '../src/app/v3/_lib/escena/choreography'
import { makeTrack, type Track } from '@/app/probe-escena/__tests__/harness'

/** La ventana del sprint. 390×844 es el viewport de layout del iPhone 14/15. */
export const VENTANA = { ancho: 390, alto: 844 } as const
export const ASPECTO = VENTANA.ancho / VENTANA.alto

/**
 * ⚠️ **EL CAMPO DE MUESTREO NO PUEDE SER ×1, Y SE APRENDIÓ FALLANDO.**
 *
 * `muestrearLogo` con `factor = 1` muestrea EXACTAMENTE el cuadro: la caja
 * envolvente queda recortada al borde y `fraccionDentro` devuelve 1,000 siempre
 * —un 100 % que no significa «el logo entra entero» sino «no miré afuera»—. En
 * MOVIL-1 eso hizo que **tres de los siete keyframes publicaran un centro de
 * 0,5000 exacto POR CONSTRUCCIÓN** (x0 = −0,9967, x1 = +0,9967: la primera y la
 * última celda de la malla).
 *
 * ×2,6 es el mismo factor con el que `s16-encuadre-soporte.ts` mide los aires
 * del hero: extiende el campo sin cambiar el tamaño de celda.
 */
export const FACTOR = 2.6

/** La malla fina, para las cifras que se publican. */
export const MALLA_FINA = { columnas: 300, filas: 220 } as const
/** La malla del barrido, más gruesa: 201 valores × 7 keyframes con la fina no cierra. */
export const MALLA_BARRIDO = { columnas: 150, filas: 110 } as const

/**
 * Una pista con el `frameX` de UN keyframe cambiado, sobre una COPIA del array.
 *
 * Es `pistaCon` de `s16-encuadre-soporte.ts` generalizada al nombre: aquélla
 * sólo sabe cambiar el hero porque era lo único que V3-E movía.
 */
export function pistaCon(cambios: Readonly<Record<string, number>>): Track {
  return makeTrack(
    CHOREO_KEYFRAMES.map((k) =>
      Object.hasOwn(cambios, k.name) ? { ...k, pose: { ...k.pose, frameX: cambios[k.name] } } : k,
    ),
  )
}

/** La pista de producción, sin tocar. */
export const PISTA_DE_HOY: Track = makeTrack(CHOREO_KEYFRAMES)

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/vertical'
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/vertical'

export const cuatro = (n: number): number => Number(n.toFixed(4))
