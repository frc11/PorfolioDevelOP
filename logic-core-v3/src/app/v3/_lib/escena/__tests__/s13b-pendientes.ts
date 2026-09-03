/**
 * LO QUE V3-B DEJÓ ROJO O FALSO EN ARCHIVOS QUE NO PODÍA TOCAR — con su arreglo
 * exacto, y DETECTADO en vez de escrito.
 *
 * ── Por qué esto es una lista viva y no un párrafo del reporte ─────────────
 *
 * V3-B sacó `hero · sostén` de la coreografía y cambió de dónde sale el
 * progreso. Las dos cosas rompen o vacían comprobaciones que viven **fuera de la
 * zona del lane** —`/probe-escena`, que la regla 4 prohíbe tocar, y
 * `_lib/__tests__/`, que comparten los cuatro lanes—. Un reporte que las
 * enumera envejece el día que alguien las arregla y nadie lo nota; peor, deja
 * pensando que siguen rotas.
 *
 * Así que cada pendiente se **detecta sobre el fuente**: si la marca sigue ahí,
 * se publica con su arreglo; si ya no está, se afirma en verde que se aplicó.
 * La lista se vacía sola.
 *
 * ⚠ **No se afirma que el pendiente EXISTE.** Un invariante que se pone en rojo
 * porque alguien arregló algo es peor que ninguno. Lo que se afirma es que el
 * **detector discrimina** —encuentra una marca que está y no encuentra una que
 * no— y lo demás se publica. Es la regla 13: un defecto no arreglado no se
 * escribe en rojo.
 */

import { afirmar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { fuenteDe } from './s13b-soporte'

export interface Pendiente {
  /** Dónde vive el arreglo. */
  readonly archivo: string
  /** La marca que dice que TODAVÍA no se aplicó. */
  readonly marca: string
  /** Qué se rompe o se vacía mientras siga ahí. */
  readonly sintoma: string
  /** El arreglo, escrito para poder aplicarlo sin volver a medir nada. */
  readonly arreglo: string
}

/**
 * LOS CINCO ROJOS DE `/probe-escena` Y LOS DOS VACÍOS DE `_lib/__tests__/`.
 *
 * Los tres primeros son el mismo hecho —el keyframe ya no está— visto por tres
 * comprobaciones distintas del mismo archivo; se listan por separado porque cada
 * una se arregla en su propio bloque y quien aplique el patch los necesita uno
 * por uno.
 */
export const PENDIENTES: readonly Pendiente[] = [
  {
    archivo: 'src/app/probe-escena/_components/choreographyNotes.ts',
    marca: "'hero · sostén': [",
    sintoma:
      'ROJO en `test:s7e-variantes` — «definitiva: ninguna nota apunta a un keyframe que no existe · hero · sostén»',
    arreglo:
      "borrar la entrada `'hero · sostén': [ … ],` entera de `CHOREO_NOTES` (son 11 líneas, entre la nota de `hero` y la de `quiénes somos`)",
  },
  {
    archivo: 'src/app/probe-escena/_components/choreographyNotes.ts',
    marca: 'Ninguna de estas ocho se capturó con el',
    sintoma:
      'NINGÚN rojo, y es peor: `CHOREO_ARRAY_DOC` sigue diciendo «"8 capturados"», «estas ocho» y «dos son sostenes» mientras la coreografía tiene siete y un sostén. El exportador emite ese texto, así que la mentira volvería al archivo en el próximo pegado',
    arreglo:
      'copiar a `CHOREO_ARRAY_DOC` las líneas que ya quedaron corregidas en el docblock del array de `choreography.ts` (censo en siete, «una es un sostén», y la frase del hero reescrita)',
  },
  {
    archivo: 'src/app/probe-escena/__tests__/s9-recorrido.invariant.ts',
    marca: 'CHOREO_KEYFRAMES.length === 8',
    sintoma: 'ROJO — «ocho entradas en el array», con 7 keyframes',
    arreglo:
      'cambiar el 8 por 7 y el título de la sección («Seis poses, ocho entradas» → «siete entradas»)',
  },
  {
    archivo: 'src/app/probe-escena/__tests__/s9-recorrido.invariant.ts',
    marca: "['hero', 'hero · sostén'],",
    sintoma:
      'DOS ROJOS — «"hero · sostén" es una copia exacta de "hero"» (falta uno de los dos) y «cada tramo termina exactamente en su pose» (el tramo `hero` se queda sin keyframe que lo cierre)',
    arreglo:
      "sacar la fila `['hero', 'hero · sostén']` de `SOSTENES`, y en `CIERRA_TRAMO` cambiar la del hero por `['hero', 'hero']` — el tramo `hero` va de 0 a 0,125 y ahora ningún keyframe cae en su `to`, así que esa comprobación pasa a ser sobre los CINCO tramos que sí cierran en una pose",
  },
  {
    archivo: 'src/app/probe-escena/__tests__/s9-recorrido.invariant.ts',
    marca: 'la cámara no se mueve en toda la pantalla del hero',
    sintoma:
      'ROJO — la velocidad máxima en [0, 0,1245] pasó de 0,0e+0 a 2,8e+1 contra un umbral de 1e-6. Es la comprobación que V3-B vino a invalidar: la escena TIENE que moverse ahí',
    arreglo:
      'borrar esa comprobación y el comentario de las 6 líneas que justifica muestrear hasta 0,1245. Lo que la reemplaza ya está medido en `s13b-escena.invariant.ts` §1, con las dos unidades y el perfil de los seis segmentos',
  },
  {
    archivo: 'src/app/v3/_lib/__tests__/s8-montaje-soporte.ts',
    marca: 'scrollHeight` (`EscenaDelHome.tsx`)',
    sintoma:
      'NINGÚN rojo, y es el modo de falla que este repo persigue: §4b (`afirmarQueNadaSumaAltoAfueraDelMain`) sigue en VERDE y ya no protege nada. Su docblock dice que el progreso sale de `scrollHeight`; desde V3-B sale de la extensión de las secciones, así que «coinciden mientras» pasó a ser «coinciden siempre, por construcción»',
    arreglo:
      'reescribir el docblock de §4b contra lo que hoy protege —que ninguna pieza fuera del `<main>` sume alto es una propiedad de LAYOUT, no la condición del anclaje— o borrar la sección. Dejarla como está entrena a confiar en un control muerto',
  },
  {
    archivo: 'src/app/v3/_lib/__tests__/s10-acceso-landmarks.ts',
    marca: 'el progreso de la escena sale de',
    sintoma:
      'NINGÚN rojo: el hallazgo 5 (`contentinfo`, gravedad alta) sigue publicando que está BLOQUEADO porque mover el pie correría el anclaje de 0,750 a 0,720/0,691. Esa cuarta pared cayó con V3-B — el defecto 6 quedó DESBLOQUEADO y el texto que lo bloquea se sigue imprimiendo. La misma cita está duplicada en `s10-acceso-tablas.ts`',
    arreglo:
      'sacar de las dos citas la parte del progreso y dejar anotado que V3-B la levantó, con el número corregido (0,7381 y 0,7262, no 0,7201 y 0,6906 — ver la corrección a §7.46 en `s13b-progreso.ts`)',
  },
]

/** ¿La marca sigue en el fuente? `null` si el archivo no se puede leer. */
export function sigueSinAplicarse(p: Pendiente): boolean | null {
  let fuente: string
  try {
    fuente = fuenteDe(p.archivo)
  } catch {
    return null
  }
  return fuente.includes(p.marca)
}

/**
 * §5 DEL INVARIANTE — publica los pendientes que siguen abiertos y afirma en
 * verde los que ya se cerraron.
 */
export function afirmarLosPendientes(): void {
  titulo('5 · LO QUE V3-B NO PUDO TOCAR — los pendientes, detectados y con su arreglo')

  const leidos = PENDIENTES.map((p) => ({ p, abierto: sigueSinAplicarse(p) }))
  afirmar(
    leidos.every((l) => l.abierto !== null),
    'los siete archivos de la lista existen y se pueden leer: la lista no se vacía por no encontrarlos',
    `${leidos.length} pendientes declarados sobre ${new Set(PENDIENTES.map((p) => p.archivo)).size} archivos`,
  )
  controlPositivo(
    'y el detector no encuentra una marca que no está: no da «abierto» contra cualquier cosa',
    { ...PENDIENTES[0], marca: 'esta cadena no existe en ningún fuente del repo' },
    (p: Pendiente) => sigueSinAplicarse(p) === true,
  )

  const abiertos = leidos.filter((l) => l.abierto === true)
  const cerrados = leidos.filter((l) => l.abierto === false)
  afirmar(
    cerrados.length + abiertos.length === PENDIENTES.length,
    `de los ${PENDIENTES.length} pendientes, ${cerrados.length} ya se aplicaron y ${abiertos.length} siguen abiertos`,
    cerrados.length === 0 ? 'ninguno se aplicó todavía' : cerrados.map((l) => l.p.archivo).join(' · '),
  )

  for (const { p } of abiertos) {
    console.log(`  🔴 ${p.archivo}`)
    console.log(`     síntoma: ${p.sintoma}`)
    console.log(`     arreglo: ${p.arreglo}`)
  }
}
