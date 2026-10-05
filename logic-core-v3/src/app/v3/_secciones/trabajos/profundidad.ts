import { entornoDeLaEscena, type Pruebas } from '../../_lib/escena/entorno'

import { primeraFotoTapa, pxDelTunelEn } from './geometria'
import { CAPAS_DEL_TUNEL, ORIGEN_DEL_TUNEL, PX_DEL_TUNEL, poseDelTunel, pxParaQueElProyectoMida, type PoseDelTunel } from './tunel'

/**
 * [AJUSTES FINALES] B1 · EL TÚNEL CON LA PROFUNDIDAD LINEAL CON EL SCROLL — dos pruebas, apagadas en el producto:
 *
 *   · `?pruebas=tunel=constante` · la tabla de la referencia (`tunel.ts`) hace crecer cada capa en RECTA de escala: en
 *     profundidad eso es una cámara que frena al acercarse a cada proyecto (la escala es f / z: recta en escala, hipérbola
 *     en z). Acá la cámara avanza a VELOCIDAD CONSTANTE: 1 / ancho es recta en el scroll. Y como a velocidad constante lo
 *     lejano tarda, cada proyecto nace en el ARRANQUE del túnel (lejos, apenas visible: `SEMILLA_DE_LA_PROFUNDIDAD` de su
 *     tamaño final) y llega a su tope en el MISMO píxel y con el MISMO tamaño que en la tabla — así el CTA, el vacío y la
 *     llegada de los demos, que viven después, no cambian un bit, y la sección no cambia de alto (REGLA DE ALTURAS). Más
 *     recorrido por proyecto: 910 / 1.173 / 1.426 px de la regla en vez de 910 / 680 / 600.
 *   · `?pruebas=tunel=tope` · lo mismo, y lo MOSTRADO persigue al scroll sin resortes, a lo sumo a la velocidad máxima
 *     del efecto (`regulador.ts`): como el amanecer (`escena/amanecer/linea.ts`, `perseguir`).
 *
 * Las capas siguen anidadas: la escala PROPIA de cada proyecto sale de dividir su cadena por la de su padre. La ley se lee
 * una vez por carga (la bandera no cambia) y en el servidor es la tabla.
 */
export type LeyDelTunel = 'tabla' | 'profundidad'

/** Cuánto de su tamaño final mide un proyecto al nacer, en el arranque del túnel (2 %: 42 px del más grande a 1440). */
export const SEMILLA_DE_LA_PROFUNDIDAD = 0.02

export function leyDeLaPrueba(prueba: Pruebas['tunel']): LeyDelTunel {
  return prueba === 'no' ? 'tabla' : 'profundidad'
}

export const sinResortesLaPrueba = (prueba: Pruebas['tunel']): boolean => prueba === 'tope'

/** La cadena final de cada proyecto —lo que mide en pantalla en su tope, en anchos de cuadro—: la de la tabla. */
export const CADENA_FINAL: readonly number[] = CAPAS_DEL_TUNEL.proyectos.map((_, i) =>
  CAPAS_DEL_TUNEL.proyectos.slice(0, i + 1).reduce((producto: number, capa) => producto * capa.a, CAPAS_DEL_TUNEL.escenario.a),
)

/** Lo que mide el proyecto `indice` en pantalla (anchos de cuadro) en el píxel `y` de la regla: 1 / ancho, recta en `y`. */
export function anchoEnProfundidad(indice: number, y: number): number {
  const capa = CAPAS_DEL_TUNEL.proyectos[indice]
  if (capa === undefined) throw new Error(`proyecto inválido: ${String(indice)}`)
  if (y <= ORIGEN_DEL_TUNEL) return 0
  if (y >= capa.topa) return CADENA_FINAL[indice]
  const lejos = 1 / SEMILLA_DE_LA_PROFUNDIDAD - 1
  return CADENA_FINAL[indice] / (1 + (lejos * (capa.topa - y)) / (capa.topa - ORIGEN_DEL_TUNEL))
}

/** La pose con la profundidad lineal: el escenario y el CTA, los de la tabla; los proyectos, por su cadena. */
export function poseEnProfundidad(pxDelTunel: number, pxDelEscenario: number = pxDelTunel): PoseDelTunel {
  const base = poseDelTunel(pxDelTunel, pxDelEscenario)
  const y = pxDelTunel + ORIGEN_DEL_TUNEL
  const anchos = CAPAS_DEL_TUNEL.proyectos.map((_, i) => anchoEnProfundidad(i, y))
  const proyectos = anchos.map((ancho, i) => {
    const padre = i === 0 ? base.escenario : anchos[i - 1]
    return padre > 0 ? ancho / padre : 0
  })
  const ultimo = anchos[anchos.length - 1]
  return { ...base, proyectos, anchos, fraccionDelCta: (ultimo / CADENA_FINAL[CADENA_FINAL.length - 1]) * (base.cta / CAPAS_DEL_TUNEL.cta.a) }
}

/** En qué píxel del túnel el proyecto llega a medir `ancho` con la profundidad lineal (la inversa, cerrada). */
export function pxParaQueMidaEnProfundidad(indice: number, ancho: number): number {
  const capa = CAPAS_DEL_TUNEL.proyectos[indice]
  if (capa === undefined) throw new Error(`proyecto inválido: ${String(indice)}`)
  const final = CADENA_FINAL[indice]
  if (ancho >= final) return ancho > final ? PX_DEL_TUNEL : capa.topa - ORIGEN_DEL_TUNEL
  if (!(ancho > 0)) return 0
  const lejos = 1 / SEMILLA_DE_LA_PROFUNDIDAD - 1
  return capa.topa - ((capa.topa - ORIGEN_DEL_TUNEL) * (final / ancho - 1)) / lejos - ORIGEN_DEL_TUNEL
}

// ── La ley de esta carga: se lee una vez; en el servidor, la tabla ────────────────────────────────────────────────────
let ley: LeyDelTunel | null = null
let directo = false

function leerLaPrueba(): void {
  if (ley !== null || typeof window === 'undefined') return
  const prueba = entornoDeLaEscena().pruebas.tunel
  ley = leyDeLaPrueba(prueba)
  directo = sinResortesLaPrueba(prueba)
}

export function leyMostrada(): LeyDelTunel {
  leerLaPrueba()
  return ley ?? 'tabla'
}

/** `tunel=tope`: lo mostrado va derecho al objetivo regulado, sin los dos resortes. */
export function sinResortesMostrado(): boolean {
  leerLaPrueba()
  return directo
}

export function poseMostrada(pxDelTunel: number, pxDelEscenario: number = pxDelTunel): PoseDelTunel {
  return leyMostrada() === 'tabla' ? poseDelTunel(pxDelTunel, pxDelEscenario) : poseEnProfundidad(pxDelTunel, pxDelEscenario)
}

export function pxParaQueMidaMostrado(indice: number, ancho: number): number {
  return leyMostrada() === 'tabla' ? pxParaQueElProyectoMida(indice, ancho) : pxParaQueMidaEnProfundidad(indice, ancho)
}

/** [RETOQUE 3D] B1 · ¿la primera foto ya tapa el cuadro? (el título de Portfolio se esconde recién ahí), con la ley de la carga. */
export function primeraFotoTapaMostrada(progreso: number): boolean {
  return leyMostrada() === 'tabla' ? primeraFotoTapa(progreso) : anchoEnProfundidad(0, pxDelTunelEn(progreso) + ORIGEN_DEL_TUNEL) >= 1.02
}
