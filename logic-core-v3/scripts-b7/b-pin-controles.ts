/**
 * B7 · FRENTE B — EL AGREGADO Y LOS CONTROLES DEL BARRIDO DEL PIN.
 *
 * Sale de `b-pin-comprobaciones.ts` cuando ese archivo cruzó las 300 líneas del
 * repo al reemplazar la tautología por la propiedad medida, y el corte es por
 * tema y no por tamaño: allá está **lo que se afirma de cada perfil**; acá está
 * **el agregado de los cuatro y los cinco controles**, que es lo que responde a
 * la pregunta «¿y si el instrumento no supiera mirar?».
 *
 * Los controles son de dos clases y las dos hacen falta:
 *
 *   · **Del sitio** — un pin que anda (Trabajos), el mismo apagado por la
 *     compuerta abajo de 1025, un `<section>` que no es `sticky`, y el PADRE del
 *     pin. Ninguno es `sticky` salvo el primero: el censo no los levanta solo, y
 *     por eso se los pasa como selectores.
 *   · **Del predicado** — el que alimenta a `desbordeCierra` con un alto
 *     alterado y exige ROJO. Es el que distingue una afirmación de una
 *     tautología, y es el que faltaba.
 */

import {
  buscar,
  desbordeCierra,
  HUELLA_DEL_PIN,
  porPerfil,
  rangoDe,
  redondear,
  type Comprobacion,
  type Corrida,
} from './b-pin-comprobaciones'
import type { ResultadoDelArnes } from './b-pin-arnes'

export function comprobar(
  corridas: ReadonlyMap<string, Corrida>,
  arnes: ResultadoDelArnes,
): readonly Comprobacion[] {
  const todas = [...corridas.values()]
  const mil920 = corridas.get('1920')
  const mil024 = corridas.get('1024')
  const pin1920 = mil920 === undefined ? undefined : buscar(mil920, HUELLA_DEL_PIN)
  // El `Bloque`, buscado por lo que ES —el PADRE que el censo le adjudicó al
  // pin— y no por su marca. Es la mitad de la lección de D2 puesta a trabajar.
  const padreDelPin =
    mil920 === undefined || pin1920 === undefined
      ? undefined
      : mil920.filas.find((f) => f.huella === pin1920.barrido.ficha.huellaDelPadre)

  return [
    ...todas.flatMap(porPerfil),
    {
      /**
       * ⚠️ **EL CONTROL DE LA AFIRMACIÓN QUE REEMPLAZÓ A LA TAUTOLOGÍA.**
       *
       * Es la mitad que a la tautología le faltaba, y por eso va acá y no como
       * comentario: se llama al MISMO predicado con un alto alterado —el hijo,
       * 40 px más alto de lo que se midió— y se exige que dé **rojo**. Si diera
       * verde, el predicado no estaría mirando el alto y sería la tautología de
       * vuelta con otra cara.
       *
       * El desvío elegido (40 px) es mayor que la tolerancia (`2 × PRECISION` =
       * 4 px) y del orden del desborde real de 1025 (30,55), o sea que prueba lo
       * que hay que probar sin quedar tan lejos que cualquier cosa lo detecte.
       */
      que: 'CONTROL DEL PREDICADO · con el alto del hijo alterado 40 px, la identidad desborde↔pérdida da ROJO',
      ok:
        mil920 !== undefined &&
        pin1920?.barrido.altoPegadoMax !== null &&
        pin1920?.barrido.altoPegadoMax !== undefined &&
        desbordeCierra(mil920, pin1920.barrido.altoPegadoMax, rangoDe(pin1920)) &&
        !desbordeCierra(mil920, pin1920.barrido.altoPegadoMax + 40, rangoDe(pin1920)),
      obtenido:
        pin1920 === undefined || pin1920.barrido.altoPegadoMax === null
          ? '(no hay pin a 1920)'
          : `con ${pin1920.barrido.altoPegadoMax} → verde · con ${redondear(pin1920.barrido.altoPegadoMax + 40)} → rojo`,
    },
    {
      que: 'CONTROL DEL SITIO · el pin de Trabajos, que anda, sale con su rango',
      ok: mil920 !== undefined && buscar(mil920, 'data-seccion-id=trabajos')?.clase === 'pegado',
      obtenido:
        (mil920 === undefined
          ? undefined
          : buscar(mil920, 'data-seccion-id=trabajos')?.porQue) ?? '(no encontrado)',
    },
    {
      que: 'CONTROL DEL SITIO · abajo de 1025 la compuerta lo apaga: deja de ser `sticky`',
      ok: mil024 !== undefined && buscar(mil024, 'data-seccion-id=trabajos')?.clase === 'no-sticky',
      obtenido:
        (mil024 === undefined
          ? undefined
          : buscar(mil024, 'data-seccion-id=trabajos')?.porQue) ?? '(no encontrado)',
    },
    {
      que: 'CONTROL DEL SITIO · el `<section>` no es `sticky`, y sale clasificado como tal',
      ok:
        mil920 !== undefined &&
        buscar(mil920, 'section[data-panel=servicios]')?.clase === 'no-sticky',
      obtenido:
        (mil920 === undefined
          ? undefined
          : buscar(mil920, 'section[data-panel=servicios]')?.porQue) ?? '(no encontrado)',
    },
    {
      que: 'CONTROL DEL SITIO · el PADRE del pin —el que le da el recorrido— tampoco lo es',
      ok: padreDelPin?.clase === 'no-sticky',
      obtenido: `${padreDelPin?.huella.slice(0, 64) ?? '(no encontrado)'} → ${padreDelPin?.clase ?? '—'}`,
    },
    {
      que: 'ARNÉS · el barrido separa `pegado`, `roto-con-recorrido` y `no-sticky`',
      ok: arnes.separa,
      obtenido: arnes.filas.map((f) => `${f.marca}=${f.clase}`).join(' · '),
    },
    {
      que: 'ninguna huella se movió en ninguna parada de ninguna corrida',
      ok: todas.every((c) => c.filas.every((f) => f.barrido.huellasDistintas === 0)),
      obtenido: `${todas.reduce((s, c) => s + c.filas.reduce((t, f) => t + f.barrido.huellasDistintas, 0), 0)} desajustes`,
    },
    {
      que: 'los dos censos —el de acá y `CENSO_DE_STICKIES`— dicen lo mismo',
      ok: todas.every((c) => c.desacuerdosConElPadre.length === 0),
      obtenido: todas.flatMap((c) => c.desacuerdosConElPadre).join(' · ') || 'sin desacuerdos',
    },
  ]
}
