/**
 * §9 bis DEL INVARIANTE DE SERVICIOS — EL PIN SON DOS ELEMENTOS, Y UNO ES INERTE.
 *
 * ⚠ **Vive en su propio archivo por la regla de las 300 líneas**, misma costura
 * que `s6-tipografia.ts` y `s6-asentamiento.ts`, y el corte es por TEMA: es la
 * única sección del invariante que afirma sobre la ESTRUCTURA DEL PINNEO, que
 * es un asunto del envoltorio y del bloque medido, no del contenido de la
 * sección.
 *
 * ── QUÉ CIERRA (B7 · frente B) ────────────────────────────────────────────
 *
 * `geometria.ts` tenía abierta desde S1 esta advertencia, textual: *«DECLARADO,
 * NO MEDIDO: el rango del pin es `alto de la sección − alto del sticky` … Nadie
 * lo miró todavía. Es la primera cosa a mirar cuando alguien abra la página.»*
 *
 * Ya se miró, con scroll REAL y los dos bordes afinados por bisección a 2 px:
 * `npx tsx scripts-b7/b-pin.ts` → `docs/rediseno/outputs/b7/b-pin.json`.
 *
 * ⚠️ **Las columnas separan lo MEDIDO de lo DERIVADO.** El rango sale de la
 * bisección de los dos bordes con scroll real; el desborde sale del alto del
 * hijo leído **en cada parada** —no del censo a `scrollY = 0`, que a 1025 lee
 * 774,55 y publica 6,55 px de desborde donde la medición da 30,55.
 *
 *     perfil      hijo @0   hijo DURANTE   contenedor   rango MEDIDO   pegado entre       desborde
 *     1920×1080    1080        1080           3240        2158 px     11.882 → 14.040       0 px
 *     1440×900      900         900           2700        1798 px      9.902 → 11.700       0 px
 *     1025×768    774,55      798,55          2304        1502 px      8.451 →  9.953    30,55 px
 *     1024×768      abajo de la compuerta la rama apilada no monta ningún `sticky`
 *
 * Este archivo NO repite esas cifras como afirmación —un instrumento sin
 * navegador no puede medir un pin— sino que afirma la ESTRUCTURA que las
 * produce, que es lo único que se puede sostener sobre el marcado.
 *
 * ── LA TRAMPA QUE ESTAS AFIRMACIONES EXISTEN PARA HACER IMPOSIBLE DE PERDER ──
 *
 * El marcado de esta sección tiene **DOS `sticky` anidados y sólo uno pinea**:
 *
 *   el envoltorio de `Seccion`   `w-full sticky top-0 min-h-svh`, y su ÚNICO
 *                                hijo declara el alto de la sección entera → su
 *                                recorrido es `alto − alto` = **0**. Siempre, en
 *                                todos los perfiles, por construcción.
 *   el hijo de la secuencia      `CLASE_DEL_STICKY`, una pantalla adentro de un
 *                                contenedor de tres → recorre dos.
 *
 * Un `sticky` son DOS elementos —el que se pega y el que le da recorrido— y la
 * cifra que los separa es `alto del padre − alto propio`. **La posición del hijo
 * sola devuelve el MISMO cero** para el que está roto y para el que nunca tuvo
 * recorrido: por eso B4-B, con Fase 0 y controles positivos, publicó «el pin de
 * servicios NO pinea en ningún perfil» midiendo el envoltorio inerte. El pin
 * andaba, y sigue byte por byte igual desde B1 (`git diff 8ab34b36 HEAD --
 * servicios/geometria.ts servicios/Servicios.tsx` es vacío).
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { cuenta, interiorDe } from './deteccion'
import { CLASE_DEL_STICKY } from './geometria'

/** Una clase que DECLARA `sticky`, no una que lo nombre en un comentario. */
const CLASE_QUE_PEGA = /class="[^"]*\bsticky\b[^"]*"/g

export function afirmarElPin(quieto: string, animado: string, altoDeLaSeccion: string): void {
  titulo('9 bis · El pin son DOS elementos, y el de arriba es INERTE por construcción')

  const etiquetaDelEnvoltorio = animado.match(/<div[^>]*data-pinneado="siempre"[^>]*>/)?.[0] ?? ''
  const claseDelEnvoltorio = etiquetaDelEnvoltorio.match(/class="([^"]*)"/)?.[1] ?? ''
  const dentroDelEnvoltorio = interiorDe(animado, 'data-pinneado', 'siempre')
  const aperturaDelBloque = dentroDelEnvoltorio.slice(0, dentroDelEnvoltorio.indexOf('>') + 1)
  const dentroDelBloque = interiorDe(dentroDelEnvoltorio, 'style', `min-height:${altoDeLaSeccion}`)
  const unSoloHijo = `${aperturaDelBloque}${dentroDelBloque}</div>`

  afirmar(
    claseDelEnvoltorio.includes('sticky') && claseDelEnvoltorio.includes('top-0'),
    'el envoltorio de la sección declara `sticky top-0`: la trampa es real, hay dos `sticky` anidados',
    claseDelEnvoltorio,
  )
  afirmar(
    dentroDelEnvoltorio === unSoloHijo,
    '  y tiene UN SOLO hijo, que ocupa su interior entero — no hay nada al lado del bloque',
    `${aperturaDelBloque} … ${dentroDelEnvoltorio.length} caracteres`,
  )
  afirmar(
    aperturaDelBloque.includes(`min-height:${altoDeLaSeccion}`),
    `  y ese hijo declara el alto de la sección ENTERA (${altoDeLaSeccion}): por eso el envoltorio mide lo mismo que su padre y su recorrido es CERO — no está roto, nunca lo tuvo`,
  )
  afirmar(
    dentroDelBloque.includes(CLASE_DEL_STICKY),
    'el pin de VERDAD está ADENTRO del bloque medido: es el `sticky` de la secuencia, y su padre es el que le da las dos pantallas de recorrido',
  )
  afirmarIgual(
    cuenta(animado, CLASE_QUE_PEGA),
    2,
    'con coreografía la sección emite exactamente DOS `sticky`: el inerte y el que pinea',
  )
  afirmarIgual(
    cuenta(quieto, CLASE_QUE_PEGA),
    1,
    '  y sin coreografía queda UNO, el inerte: la rama apilada no monta pin — y abajo de 1025 el barrido tampoco lo encuentra',
  )
  controlPositivo(
    'el detector vería un envoltorio con DOS hijos',
    `${unSoloHijo}<div></div>`,
    (h: string) => h === unSoloHijo,
  )
  controlPositivo(
    '  y uno cuyo hijo NO declara el alto de la sección',
    '<div class="relative">x</div>',
    (h: string) => h.slice(0, h.indexOf('>') + 1).includes(`min-height:${altoDeLaSeccion}`),
  )
  controlPositivo(
    '  y el contador de `sticky` ve una clase que no lo declara',
    '<div class="w-full top-0"></div>',
    (h: string) => cuenta(h, CLASE_QUE_PEGA) === 1,
  )
}
