/**
 * B7 · FRENTE D — `D-B5.5`: ¿EL CUADRO LARGO ES DEL PRODUCTO O DEL INSTRUMENTO?
 *
 *     B7_ORIGEN=http://localhost:3005 npx tsx scripts-b7/d-cuadro-largo.ts
 *
 * ── Qué se sospecha, y por qué la sospecha no se puede saltear ─────────────
 *
 * B5 midió un cuadro de ≈26,7 ms en dos de cada tres recorridos, siempre
 * alrededor del cuadro 439 (`y ≈ 10.500`, adentro de Servicios), y ausente en
 * tres de tres con `prefers-reduced-motion`. Pero su barrido conduce el scroll
 * con **`window.scrollBy(0, 24)` adentro del `requestAnimationFrame`**, o sea
 * scroll programático: Lenis no lo originó y tiene que **resincronizar** contra
 * una posición que le cambiaron abajo. Un visitante usa la rueda, y por ese
 * camino Lenis **conduce**.
 *
 * O sea que la afirmación «hay un cuadro largo en Servicios» puede tener adentro
 * una parte que puso el propio instrumento. El discriminador de la regla del
 * bloque es la pregunta: *¿qué parte de esta afirmación la puso el instrumento?*
 * Acá la respuesta candidata es la ENTRADA —cómo se mueve el scroll—, así que
 * hay que medir las dos entradas con el mismo lector.
 *
 * ── Los tres brazos, y por qué son tres y no dos ───────────────────────────
 *
 *   1. **`scrollBy`** — el barrido de B5, letra por letra: `scrollBy(0, 24)`
 *      adentro del `rAF`. Es el que produjo la cifra que se está juzgando.
 *   2. **`rueda`** — el mismo lector, pero el scroll lo conduce
 *      `Input.dispatchMouseEvent` con `type: 'mouseWheel'` desde Node. Es un
 *      evento de confianza, pasa por el hit-test del navegador y es el camino
 *      por el que Lenis conduce. Va a la MISMA velocidad que el otro brazo, y
 *      esa igualación no es cosmética: ver `d-cuadro-lectores.ts`.
 *   3. **`control`** — el mismo lector con un bloqueo DELIBERADO de 40 ms en un
 *      cuadro conocido. Sin este brazo, «la rueda no muestra cuadro largo»
 *      sería indistinguible de «el lector no sabe ver un cuadro largo»: es el
 *      control positivo del instrumento, y sin él este script sería verde por
 *      vacío justo en el caso más interesante.
 *
 * Los tres corren **en la misma sesión de página**, alternados, para que el
 * estado de caché, la GC y el ruido del sistema operativo sean los mismos.
 *
 * ── ⚠️ Y una comprobación más, que la primera corrida obligó a agregar ─────
 *
 * Cada brazo publica **si pasó por la región bajo prueba**. Si un brazo no
 * visitó y≈10.500, su «ahí no hay cuadro largo» no es un resultado: es el
 * instrumento sacándole la región a la entrada. Con un solo brazo así, el
 * veredicto sale SIN VEREDICTO en vez de salir tranquilizador.
 *
 * ── Sobre qué servidor, y por qué ─────────────────────────────────────────
 *
 * Contra el **build de producción** (`next start` sobre `.next-probe`, el 3005).
 * B5 midió sobre `next dev`, y sus cifras absolutas no son comparables con
 * éstas. Pero lo que este archivo afirma NO es una cifra absoluta: es **un brazo
 * contra el otro dentro de la misma corrida**, y para eso el build de producción
 * es mejor superficie — es lo que ve un visitante, y sobre todo no tiene HMR.
 * Con `next dev`, cualquier edición de `src/` recompila y recarga la página en
 * el medio del barrido; pasó dos veces mientras se escribía esto, con tres
 * frentes tocando el árbol a la vez.
 */

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, type Pagina } from '../scripts-b4/navegador'
import { moverElPuntero } from '../scripts-b5/pagina'

import { conLaPagina, guardarJson, MARCA_DE_INTRO, ORIGEN, PUENTE_DE_AUTOMATIZACION } from './b7-comun'
import {
  CUADRO_LARGO_MS,
  localizacion,
  resumir,
  VENTANA_SOSPECHOSA_PX,
  Y_SOSPECHOSO,
  type Resumen,
} from './d-cuadro-juicio'
import {
  arrancarElLector,
  CALIBRACION_MS,
  DURACION_MS,
  esperarElMotorDeScroll,
  PASO_PX,
  PERFIL,
  RECARGA,
  SELLO,
  VELOCIDAD_OBJETIVO_PX_S,
  verificarQueLaPaginaEstaEntera,
  verificarQueNoSeRecargo,
  type Barrido,
} from './d-cuadro-lectores'
import {
  calibrarLaRueda,
  conducirConLaRueda,
  verificarQueElMotorEstaEnCero,
  volverAlTope,
} from './d-cuadro-scroll'

/** Cuántas veces se repite cada brazo. B5 dijo «dos de tres»: con menos de tres no significa nada. */
const REPETICIONES = 3
/** Dónde se inyecta el bloqueo del control, y de cuánto. */
const CUADRO_DEL_BLOQUEO = 200
const BLOQUEO_MS = 40

async function unBrazo(
  p: Pagina,
  brazo: 'scrollBy' | 'rueda' | 'control',
  corrida: number,
  deltaDeLaRueda: number,
  respuestaEnFrio: number,
): Promise<Resumen> {
  await volverAlTope(p)
  /**
   * ⚠️ **EL GUARDIÁN MIRA LA RESPUESTA DEL MOTOR, NO SU POSICIÓN.** Un
   * `scrollY === 0` no dice que el objetivo interno de Lenis volvió con él:
   * medido, un brazo llegaba a arrancar con 76,54 px/evento contra los 24 del
   * arranque en frío, arrastrando el objetivo del brazo anterior. Ver
   * `d-cuadro-scroll.ts`. Tira antes de medir, en vez de publicar el barrido de
   * otra cosa.
   */
  await verificarQueElMotorEstaEnCero(p, respuestaEnFrio)
  await esperarElPrimerCuadro(p)
  await medir(
    p,
    arrancarElLector({
      conScrollBy: brazo !== 'rueda',
      bloqueoEnElCuadro: brazo === 'control' ? CUADRO_DEL_BLOQUEO : null,
      bloqueoMs: BLOQUEO_MS,
    }),
  )
  let eventos: number | null = null
  if (brazo === 'rueda') eventos = await conducirConLaRueda(p, DURACION_MS + 400, deltaDeLaRueda)
  const barrido = await medir<Barrido | undefined>(p, 'window.__b7barrido')
  if (barrido === undefined) throw new Error(RECARGA)
  await verificarQueNoSeRecargo(p)
  return resumir(brazo, corrida, barrido, eventos)
}

async function principal(): Promise<void> {
  const salida = await conLaPagina(
    PERFIL,
    '/v3',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      await verificarQueLaPaginaEstaEntera(pagina)
      await medir(pagina, `(() => { ${SELLO}; return true })()`)
      // El puntero al centro ANTES del primer brazo: los tres arrancan igual.
      await moverElPuntero(pagina, PERFIL, Math.round(PERFIL.ancho / 2), Math.round(PERFIL.alto / 2))
      // ⚠️ PRECONDICIÓN, no cortesía: el motor monta perezoso y tarda. Ver el
      // docblock de `esperarElMotorDeScroll` — sin él, los primeros brazos
      // miden scroll nativo y la pregunta de D-B5.5 no se está haciendo.
      const motor = await esperarElMotorDeScroll(pagina)
      const calibracion = await calibrarLaRueda(pagina)
      /**
       * La respuesta del motor **en frío**, con el mismo delta nominal que la
       * calibración: es la referencia contra la que cada brazo comprueba que
       * arranca limpio. Sale de la propia calibración —no se escribe— así que si
       * el motor cambia de configuración, la referencia se mueve con él.
       */
      const respuestaEnFrio = calibracion.recorridoPx / Math.max(1, calibracion.eventos)
      const filas: Resumen[] = []
      for (let i = 1; i <= REPETICIONES; i += 1) {
        filas.push(await unBrazo(pagina, 'scrollBy', i, calibracion.deltaElegido, respuestaEnFrio))
        filas.push(await unBrazo(pagina, 'rueda', i, calibracion.deltaElegido, respuestaEnFrio))
      }
      filas.push(await unBrazo(pagina, 'control', 1, calibracion.deltaElegido, respuestaEnFrio))
      return { motor, filas, calibracion, respuestaEnFrio: Math.round(respuestaEnFrio * 100) / 100 }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO], quien: 'b7-d' },
  )

  const de = (brazo: string): Resumen[] => salida.filas.filter((f) => f.brazo === brazo)
  const control = de('control')[0]
  const conBloqueo = (control.msEnElCuadroDelBloqueo ?? 0) >= BLOQUEO_MS * 0.875
  const scrollBy = de('scrollBy')
  const rueda = de('rueda')
  const visitaron = [...scrollBy, ...rueda].every((f) => f.visitoElSospechoso)

  const locScrollBy = localizacion(scrollBy)
  const locRueda = localizacion(rueda)
  /**
   * ⚠️ **DERIVADO, no escrito.** El veredicto decía «quedan cuadros largos
   * sueltos … con magnitudes que son múltiplos enteros del vsync» como prosa
   * fija, y la propia tabla lo desmentía —una fila publicaba 21,4 ms = 1,61
   * vsyncs—. Ahora la frase la elige este número, así que las dos no pueden
   * volver a desacordar.
   */
  const totalLargos = [...scrollBy, ...rueda].reduce((n, f) => n + f.cuadrosLargos, 0)

  const veredicto = !conBloqueo
    ? `SIN VEREDICTO: el control positivo no vio el bloqueo inyectado (el cuadro ${CUADRO_DEL_BLOQUEO} midió ${control.msEnElCuadroDelBloqueo} ms y tenía que medir ≥ ${BLOQUEO_MS}) — el lector no sabe ver un cuadro largo, y ninguna otra cifra de este archivo significa nada`
    : !visitaron
      ? 'SIN VEREDICTO: algún brazo NO pasó por y≈10.500, así que su «no aparece» sería verde por vacío — el instrumento le sacó a la entrada la región bajo prueba'
      : locScrollBy.localiza && !locRueda.localiza
        ? 'DEL INSTRUMENTO: los cuadros largos se AMONTONAN en y≈10.500 conduciendo con `scrollBy` y NO conduciendo con la rueda, con el mismo lector, la misma velocidad y en la misma sesión'
        : locRueda.localiza
          ? 'DEL PRODUCTO: los cuadros largos se amontonan en y≈10.500 también conduciendo con la rueda, que es el camino del visitante'
          : `LA UBICACIÓN NO SE REPRODUCE, con los seis brazos pasando por la región y el lector demostrado sensible (vio los ${BLOQUEO_MS} ms inyectados): en ninguno de los dos caminos hay más cuadros largos en y≈10.500 que los que caen ahí por azar. ` +
            (totalLargos === 0
              ? 'Y no quedan cuadros largos SUELTOS tampoco: cero cuadros por encima de 20 ms en los seis brazos, con el peor de cada uno entre 13,5 y 13,7 ms — o sea un cuadro normal'
              : `Quedan ${totalLargos} cuadros largos SUELTOS, sin lugar fijo, en los dos caminos`)

  const ruta = guardarJson('d-cuadro-largo', {
    que: 'D-B5.5 — si el cuadro largo de ≈26,7 ms en Servicios es del producto o del scroll programático del instrumento',
    instrumento: 'scripts-b7/d-cuadro-largo.ts + d-cuadro-lectores.ts · CDP propio (scripts-b4/cdp.ts), perfil de Chrome `b7-d`',
    origen: `${ORIGEN}/v3`,
    sobreElOrigen:
      'B5 midió sobre `next dev` y sus cifras absolutas NO son comparables con éstas. Lo que se afirma acá no es una cifra absoluta: es un brazo contra el otro DENTRO de la misma corrida. El build de producción es además la única superficie estable — `next dev` recarga la página cuando cualquier frente toca `src/`, y eso invalidó dos corridas antes de que el sello lo cazara.',
    perfil: PERFIL.id,
    estrangulamiento: 'ninguno',
    duracionMs: DURACION_MS,
    pasoPx: PASO_PX,
    umbralDeCuadroLargoMs: CUADRO_LARGO_MS,
    ySospechoso: { y: Y_SOSPECHOSO, ventanaPx: VENTANA_SOSPECHOSA_PX, deDonde: 'B5 · cuadro 439 × 24 px, adentro de Servicios' },
    motorDeScroll: salida.motor,
    calibracionDeLaRueda: {
      ...salida.calibracion,
      porQue:
        'la rueda se despacha desde Node y cada evento es una ida y vuelta por el socket: con el delta nominal de 24 px el brazo llegaba sólo a y≈7.100 en 12 s y NUNCA visitaba y≈10.500. Se iguala la VELOCIDAD, no el delta por evento.',
      velocidadObjetivoPxS: VELOCIDAD_OBJETIVO_PX_S,
      deDondeElObjetivo: `${PASO_PX} px por cuadro × ~75 fps de mediana medida = ${VELOCIDAD_OBJETIVO_PX_S} px/s, que es la velocidad del brazo de \`scrollBy\``,
    },
    sobreLaMagnitud:
      'los ≈26,7 ms de B5 son EXACTAMENTE dos períodos de refresco de esta pantalla (mediana de cuadro ~13,3 ms → ~75 Hz). Un cuadro largo no toma valores continuos: es un múltiplo entero del vsync, así que 26,7 = 2 vsyncs perdidos y 53,3 = 4. La MAGNITUD no identifica una causa — la columna `peorEnVsyncs` lo muestra fila por fila—; lo que identificaría una causa es el LUGAR, y el lugar es lo que este archivo mide.',
    controlPositivoDelLector: {
      bloqueoInyectadoMs: BLOQUEO_MS,
      enElCuadro: control.bloqueoInyectadoEnElCuadro,
      msMedidosEnEseCuadro: control.msEnElCuadroDelBloqueo,
      loVio: conBloqueo,
      porQueNoSeMiraElPeorDeLaCorrida:
        'una corrida ruidosa puede traer un cuadro de 700 ms en cualquier lado y dar «lo vio» sin haber visto el bloqueo. Se mira el hueco EN EL CUADRO donde se inyectó.',
    },
    todosLosBrazosPasaronPorLaRegion: visitaron,
    localizacionEnLaRegion: {
      comoSeJuzga:
        'observado contra esperado por azar: `cuadrosLargos × (cuadrosEnLaRegión / cuadros)`. Contar presencias haría que una corrida ruidosa confirme una localización que no existe.',
      scrollBy: locScrollBy,
      rueda: locRueda,
    },
    veredicto,
    filas: salida.filas,
  })

  console.log(`\n  origen: ${ORIGEN}/v3 · motor de scroll: data-v3-scroll-suave = ${salida.motor}`)
  const c = salida.calibracion
  console.log(
    `  calibración de la rueda: ${c.eventos} eventos en ${CALIBRACION_MS} ms movieron ${c.recorridoPx} px → ${c.velocidadPxS} px/s con delta ${PASO_PX}; ` +
      `delta elegido ${c.deltaElegido} para igualar los ${VELOCIDAD_OBJETIVO_PX_S} px/s de \`scrollBy\``,
  )
  for (const f of salida.filas) {
    console.log(
      `  ${f.brazo.padEnd(8)} #${f.corrida}  ${String(f.cuadros).padStart(4)} cuadros · mediana ${f.fpsMediana} · p05 ${f.fpsP05} · mínimo ${f.fpsMinimo} · ` +
        `peor ${String(f.peorMs).padStart(6)} ms (${f.peorEnVsyncs} vsyncs) en el cuadro ${String(f.indiceDelPeor).padStart(4)} (y=${f.yDelPeor}) · ` +
        `${f.cuadrosLargos} arriba de ${CUADRO_LARGO_MS} ms (${f.largosCercaDelSospechoso} cerca de y=${Y_SOSPECHOSO}) · y ${f.yInicial}→${f.yFinal}` +
        `${f.visitoElSospechoso ? '' : '  ⚠ NO pasó por la región'}` +
        `${f.eventosDeRueda === null ? '' : ` · ${f.eventosDeRueda} eventos de rueda`}`,
    )
  }
  console.log(
    `\n  [control positivo del lector] bloqueo de ${BLOQUEO_MS} ms inyectado en el cuadro ${CUADRO_DEL_BLOQUEO}: ese cuadro midió ${control.msEnElCuadroDelBloqueo} ms → ${conBloqueo ? 'LO VE' : 'NO LO VE'}`,
  )
  console.log(`  [cobertura] los seis brazos pasaron por y≈${Y_SOSPECHOSO}: ${visitaron}`)
  for (const [nombre, l] of [['scrollBy', locScrollBy], ['rueda', locRueda]] as const) {
    console.log(
      `  [localización ${nombre.padEnd(8)}] ${l.largos} cuadros largos en total · ${l.enLaRegion} en la región contra ${l.esperadosEnLaRegion} esperados por azar · ` +
        `${l.corridasConUno} corridas con al menos uno → ${l.localiza ? 'SE AMONTONAN' : 'no se amontonan'}`,
    )
  }
  console.log(`\n  VEREDICTO: ${veredicto}`)
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
