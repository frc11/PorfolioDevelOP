/**
 * FRENTE B · 1 y 2 — LAS OCHO SECCIONES EN LOS CUATRO PERFILES DE ABAJO DEL
 * UMBRAL, con capturas, y el AIRE MUERTO de cada una.
 *
 * ── ⚠️ POR QUÉ ESTE ARCHIVO MIDE TAMBIÉN EL ESCRITORIO ────────────────────
 *
 * La instrucción pide comparar mobile «contra sus cifras de escritorio», y las
 * cifras de escritorio que hay son las de B1 —45,30 % promedio, 85,65 % máximo,
 * 849 px de banda—. **El código que las produjo no existe** (`MEDICION-B4.md`
 * §4: los dos bloques lo dejaron en el scratchpad y los dos lo perdieron). Una
 * cifra de acá **no es la continuación** de una de B1: es una medición nueva con
 * la misma definición.
 *
 * Por eso este archivo mide **también `1920` con este mismo banco**, sección por
 * sección, y ése —y no la tabla de B1— es el escritorio contra el que se compara.
 * La tabla de B1 se publica al lado, declarada como de otro instrumento.
 * Comparar dos instrumentos distintos y llamarlo delta es el modo de falla que
 * este repo lleva veinte sprints cazando.
 *
 * ── ⚠️ Y EL CAVEAT DEL CONTROL DE ESCRITORIO ─────────────────────────────
 *
 * `capturarRegion` devuelve `masAltoQueLaVentana` marcado cuando el recorte pasa
 * una pantalla Y la página tiene escenario: con la capa `fixed inset-0`, Chrome
 * compone el escenario UNA sola vez, donde está la ventana, así que un recorte
 * de tres pantallas lo muestra en una y le falta en las otras dos. Abajo de 1025
 * no hay canvas y el peligro no existe; a 1920 sí, y la marca queda en el JSON
 * fila por fila en vez de esconderse.
 */

import { readFileSync } from 'node:fs'

import { aireMuerto, BANDA_VACIA_OBJETIVO_PX, type AireMuerto } from './aire-muerto'
import { capturarRegion, GRACIA_DE_ESCENA_MS } from './captura'
import { rutaDeCaptura, SECCIONES } from './capturas'
import { decodificarPng } from './png'
import { PERFILES_DEBAJO_DEL_UMBRAL, perfilPorId, type Perfil } from './perfiles'
import { documento, paneles } from './sitio'
import { asegurarCarpetaDeCapturas, conLaPagina, dos, FRENTE, guardarJson, procedencia } from './b-comun'

/**
 * LA TABLA DE B1, CITADA Y NO CONTINUADA. Sale de `B1-DELTAS` §3, medida a 1920
 * con un instrumento que ya no existe. Va al JSON con esta etiqueta para que
 * ninguna lectura la reste contra una cifra de este banco.
 */
export const B1_1920_OTRO_INSTRUMENTO = {
  fuente: 'B1-DELTAS §3, a 1920, con un instrumento que ya no existe en el repo',
  promedioPorciento: 45.3,
  maximoPorciento: 85.65,
  bandaVaciaMaxPx: 849,
  advertencia:
    'NO es comparable cifra a cifra con este banco: misma definición, código distinto. El escritorio contra el que se compara mobile es la fila `1920` de este mismo archivo.',
} as const

/**
 * ⚠️ **EL ASENTAMIENTO, Y POR QUÉ HUBO QUE AGREGARLO.**
 *
 * Las dos primeras corridas de este archivo NO se reprodujeron. El hero a 1920
 * dio **0,00 %** en una y **77,59 %** en la otra —que es, exactamente, el número
 * que `MEDICION-B4.md` §3.1 publicó para «la escena todavía no dibujó»—, y
 * `trabajos` a 768, donde no hay escena ninguna, se movió 24 puntos entre dos
 * corridas del mismo comando.
 *
 * O sea: **los 1200 ms de `GRACIA_DE_ESCENA_MS` alcanzan a veces.** El 700 ms
 * que la Fase 0 midió salió de una máquina que en ese momento no tenía dos
 * Chrome y dos `next dev` encima; con el otro lane corriendo en paralelo, no
 * alcanza.
 *
 * La salida es la misma que `censo.ts` ya usa para el scroll con inercia: **no
 * fijar un tiempo más largo, sino esperar a que la lectura DEJE DE CAMBIAR.** Se
 * captura, se mide, se vuelve a capturar la misma región, y se acepta cuando dos
 * lecturas seguidas coinciden dentro de la tolerancia. Un tiempo fijo más largo
 * sería otra apuesta; esto es un criterio.
 */
const TOLERANCIA_DE_ASENTAMIENTO_PUNTOS = 0.5
const INTENTOS_DE_ASENTAMIENTO = 5

interface FilaDeSeccion {
  readonly perfil: string
  readonly seccion: string
  readonly topPx: number
  readonly altoPx: number
  readonly pantallas: number
  readonly captura: string
  readonly bytes: number
  readonly scrollPedido: number
  readonly scrollLogrado: number
  readonly masAltoQueLaVentana: boolean
  readonly porcentaje: number
  readonly porcentajeConVertical: number
  readonly bandaVaciaMaxPx: number
  readonly bandaVaciaMaxDesdeY: number
  readonly superaLaVara: boolean
  /** Cuántas capturas hicieron falta hasta que la cifra dejó de moverse. */
  readonly capturasHastaAsentar: number
  /** La diferencia entre las dos últimas lecturas, en puntos. */
  readonly deltaFinalPuntos: number
  /** `false` si se agotaron los intentos y la cifra seguía moviéndose. */
  readonly asentada: boolean
  /** Todas las lecturas, en orden. Es la evidencia de que asentó. */
  readonly serie: readonly number[]
}

function fila(
  perfil: Perfil,
  seccion: string,
  geo: { readonly top: number; readonly alto: number; readonly ventana: number },
  captura: { readonly ruta: string; readonly bytes: number; readonly pedido: number; readonly logrado: number; readonly alto: boolean },
  medida: AireMuerto,
  asentamiento: { readonly serie: readonly number[]; readonly asentada: boolean },
): FilaDeSeccion {
  const s = asentamiento.serie
  return {
    capturasHastaAsentar: s.length,
    deltaFinalPuntos: s.length < 2 ? 0 : dos(Math.abs(s[s.length - 1] - s[s.length - 2])),
    asentada: asentamiento.asentada,
    serie: s.map(dos),
    perfil: perfil.id,
    seccion,
    topPx: dos(geo.top),
    altoPx: dos(geo.alto),
    pantallas: dos(geo.alto / geo.ventana),
    captura: captura.ruta,
    bytes: captura.bytes,
    scrollPedido: captura.pedido,
    scrollLogrado: captura.logrado,
    masAltoQueLaVentana: captura.alto,
    porcentaje: dos(medida.porcentaje),
    porcentajeConVertical: dos(medida.porcentajeConVertical),
    bandaVaciaMaxPx: medida.bandaVaciaMaxPx,
    bandaVaciaMaxDesdeY: medida.bandaVaciaMaxDesdeY,
    superaLaVara: medida.bandaVaciaMaxPx > BANDA_VACIA_OBJETIVO_PX,
  }
}

async function medirUnPerfil(perfil: Perfil): Promise<readonly FilaDeSeccion[]> {
  return conLaPagina(perfil, '/v3', async ({ pagina }) => {
    const doc = await documento(pagina)
    const pans = await paneles(pagina)
    const vistas = pans.map((p) => p.id)
    for (const id of SECCIONES) {
      if (!vistas.includes(id)) throw new Error(`falta la sección "${id}" a ${perfil.id}: se vieron ${vistas.join(', ')}`)
    }
    const filas: FilaDeSeccion[] = []
    for (const panel of pans) {
      const y = Math.round(panel.top)
      const alto = Math.round(panel.alto)
      const destino = rutaDeCaptura(FRENTE, perfil.id, panel.id)
      const serie: number[] = []
      let ultima: AireMuerto | null = null
      let ultimoRecorte: Awaited<ReturnType<typeof capturarRegion>> | null = null
      let asentada = false
      for (let i = 0; i < INTENTOS_DE_ASENTAMIENTO; i += 1) {
        ultimoRecorte = await capturarRegion(pagina, destino, { y, alto, ancho: perfil.ancho })
        ultima = aireMuerto(decodificarPng(readFileSync(destino)))
        serie.push(ultima.porcentaje)
        if (serie.length >= 2 && Math.abs(serie[serie.length - 1] - serie[serie.length - 2]) <= TOLERANCIA_DE_ASENTAMIENTO_PUNTOS) {
          asentada = true
          break
        }
      }
      if (ultima === null || ultimoRecorte === null) throw new Error('asentamiento sin lectura: no debería poder pasar')
      const f = fila(
        perfil,
        panel.id,
        { top: panel.top, alto: panel.alto, ventana: doc.ventanaPx },
        { ruta: destino, bytes: ultimoRecorte.bytes, pedido: ultimoRecorte.scrollPedido, logrado: ultimoRecorte.scrollLogrado, alto: ultimoRecorte.masAltoQueLaVentana },
        ultima,
        { serie, asentada },
      )
      filas.push(f)
      console.log(
        `  ${perfil.id.padEnd(5)} ${panel.id.padEnd(16)} ${String(f.altoPx).padStart(8)} px  ` +
          `aire ${String(f.porcentaje).padStart(6)} %  (con vertical ${String(f.porcentajeConVertical).padStart(6)} %)  ` +
          `banda ${String(f.bandaVaciaMaxPx).padStart(5)} px desde y=${f.bandaVaciaMaxDesdeY}` +
          `  [${f.capturasHastaAsentar} capt · Δ${f.deltaFinalPuntos}${f.asentada ? '' : ' ⚠️ NO ASENTÓ'}]` +
          `${f.superaLaVara ? '  ⚠️ >104' : ''}${f.masAltoQueLaVentana ? '  ⚠️ recorte multi-pantalla con escenario' : ''}`,
      )
    }
    return filas
  })
}

function resumen(filas: readonly FilaDeSeccion[]): {
  readonly promedioPorciento: number
  readonly maximoPorciento: number
  readonly seccionDelMaximo: string
  readonly bandaVaciaMaxPx: number
  readonly seccionDeLaBanda: string
  readonly seccionesQueSuperanLaVara: number
} {
  const peor = filas.reduce((a, b) => (b.porcentaje > a.porcentaje ? b : a))
  const banda = filas.reduce((a, b) => (b.bandaVaciaMaxPx > a.bandaVaciaMaxPx ? b : a))
  return {
    promedioPorciento: dos(filas.reduce((a, f) => a + f.porcentaje, 0) / filas.length),
    maximoPorciento: peor.porcentaje,
    seccionDelMaximo: peor.seccion,
    bandaVaciaMaxPx: banda.bandaVaciaMaxPx,
    seccionDeLaBanda: banda.seccion,
    seccionesQueSuperanLaVara: filas.filter((f) => f.superaLaVara).length,
  }
}

/**
 * ⚠️ **EL REINTENTO NO ES CORTESÍA: `next dev` RECARGA LA PESTAÑA SOLO.**
 *
 * Medido con `b-vigilia.ts`: a los 49,5 s de una corrida, el reloj del documento
 * saltó de 50.335 ms a 836 ms —o sea, primer paint nuevo— sin que nadie
 * navegara. Una corrida entera de este archivo murió por eso, con «Inspected
 * target navigated or closed», después de 34 de 40 capturas.
 *
 * El reintento es POR PERFIL y descarta las filas del intento fallido: mezclar
 * capturas de dos documentos distintos sería exactamente la contaminación que
 * este banco existe para evitar. Los intentos quedan contados en el JSON.
 */
const INTENTOS_POR_PERFIL = 3

async function medirConReintento(perfil: Perfil): Promise<{ readonly filas: readonly FilaDeSeccion[]; readonly intentos: number }> {
  let ultimo: unknown = null
  for (let intento = 1; intento <= INTENTOS_POR_PERFIL; intento += 1) {
    try {
      return { filas: await medirUnPerfil(perfil), intentos: intento }
    } catch (e: unknown) {
      ultimo = e
      console.log(`  ⚠️ intento ${intento}/${INTENTOS_POR_PERFIL} a ${perfil.id} falló: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  throw ultimo instanceof Error ? ultimo : new Error(String(ultimo))
}

async function principal(): Promise<void> {
  asegurarCarpetaDeCapturas()
  const control = perfilPorId('1920')
  const aMedir: readonly Perfil[] = [...PERFILES_DEBAJO_DEL_UMBRAL, control]

  const filas: FilaDeSeccion[] = []
  const intentos: { perfil: string; intentos: number }[] = []
  for (const perfil of aMedir) {
    console.log(`\n── ${perfil.id} · ${perfil.nombre} ──`)
    const r = await medirConReintento(perfil)
    filas.push(...r.filas)
    intentos.push({ perfil: perfil.id, intentos: r.intentos })
  }

  const porPerfil = aMedir.map((p) => ({
    perfil: p.id,
    debajoDelUmbral: p.debajoDelUmbral,
    ...resumen(filas.filter((f) => f.perfil === p.id)),
  }))

  console.log('\n── resumen por perfil ──')
  for (const r of porPerfil) {
    console.log(
      `  ${r.perfil.padEnd(5)} promedio ${String(r.promedioPorciento).padStart(6)} %  ` +
        `máximo ${String(r.maximoPorciento).padStart(6)} % (${r.seccionDelMaximo})  ` +
        `banda ${String(r.bandaVaciaMaxPx).padStart(5)} px (${r.seccionDeLaBanda})  ` +
        `${r.seccionesQueSuperanLaVara}/8 superan la vara`,
    )
  }

  const ruta = guardarJson('aire-muerto', {
    procedencia: procedencia(
      'scripts-b4/b-secciones.ts',
      `aire muerto de B1-DELTAS §3 sobre capturas de Page.captureScreenshot, con ${GRACIA_DE_ESCENA_MS} ms de gracia de escena y el scroll puesto en cada región antes de recortarla. Sin estrangular. Emulado.`,
    ),
    asentamiento: {
      toleranciaPuntos: TOLERANCIA_DE_ASENTAMIENTO_PUNTOS,
      intentosMaximos: INTENTOS_DE_ASENTAMIENTO,
      porQue:
        'dos corridas del mismo comando NO se reprodujeron: el hero a 1920 dio 0,00 % en una y 77,59 % en la otra (el número exacto de «la escena todavía no dibujó», MEDICION-B4 §3.1), y `trabajos` a 768 —donde no hay escena— se movió 24 puntos. Los 1200 ms fijos de gracia alcanzan a veces. Cada cifra de este JSON se captura hasta que dos lecturas seguidas coinciden dentro de la tolerancia; la serie entera queda en la fila.',
      leerAsi:
        'una fila con `asentada: false` es una cifra que seguía moviéndose al agotarse los intentos, y NO se debe citar como estable.',
    },
    varaDeB1: {
      bandaVaciaMaxPx: BANDA_VACIA_OBJETIVO_PX,
      definicion: 'ninguna banda vacía continua por encima de 104 px',
    },
    escritorioDeReferencia: {
      perfil: '1920',
      medidoConEsteBanco: true,
      nota: 'ÉSTE es el escritorio contra el que se compara mobile.',
    },
    b1CitadoNoComparable: B1_1920_OTRO_INSTRUMENTO,
    intentosPorPerfil: intentos,
    entornoDeMedicion:
      '`next dev` recarga la pestaña por su cuenta (medido en b-vigilia-canvas.json: el reloj del documento saltó de 50.335 ms a 836 ms a los 49,5 s). Un perfil cuyo `intentos` sea > 1 se volvió a medir entero desde cero; nunca se mezclan filas de dos documentos.',
    porPerfil,
    filas,
  })
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
