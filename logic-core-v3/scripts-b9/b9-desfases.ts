/**
 * B9 · §1 — LA TABLA DE DESFASES, INSTANCIA POR INSTANCIA.
 *
 * Para cada instancia de patrón del home: en qué píxeles de scroll está EN
 * CUADRO, en qué píxeles se está ANIMANDO, y la resta entre las dos ventanas.
 *
 * ── Lo que este script NO hace, y es deliberado ───────────────────────────
 *
 * No le pregunta al código qué patrón usa cada bloque. El producto no publica
 * esa palabra en el DOM —`data-arbol` y `data-anclaje` son lo único que hay— y
 * agregarle un atributo al producto para poder medirlo sería medir el arnés.
 * Lo que hace en cambio es **identificar el patrón por su huella**: calcula el
 * rango que cada uno de los nueve predice para la caja medida y publica cuál
 * reproduce la ventana observada. Si ninguno la reproduce, eso también es un
 * hallazgo y se publica igual.
 *
 * Corre con:
 *
 *     npx tsx scripts-b9/b9-desfases.ts            → 1920×1080
 *     npx tsx scripts-b9/b9-desfases.ts 1440       → 1440×900
 *     npx tsx scripts-b9/b9-desfases.ts 1920 despues   → sufija la salida
 */

import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'
import { ANCLAS, rangoDeScroll } from '../src/app/v3/_lib/motion/anclas'
import { ORDEN_DE_PATRONES } from '../src/app/v3/_lib/motion/patrones'
import {
  desfases,
  dos,
  fuenteDelBarrido,
  jsonPendiente,
  mudar,
  SITIO,
  tres,
  type Desfase,
  type LecturaDeSincronia,
} from './b9-comun'

/** El mismo paso que el censo de B2, para que las dos tablas se puedan cruzar. */
const PASO = 120

const PERFIL = process.argv[2] ?? '1920'
const ETIQUETA = process.argv[3] ?? 'antes'

interface Candidato {
  readonly patron: string
  readonly inicio: number
  readonly fin: number
  /** Error en píxeles contra la ventana observada, sumando los dos extremos. */
  readonly error: number
}

/**
 * Los nueve rangos que predice cada ancla para la caja de flujo del bloque, y
 * cuál se parece más a lo observado.
 *
 * ⚠️ El error se tolera hasta un paso por extremo: el barrido cuantiza, y un
 * `scrub` numérico —P1, P3, P8, P9— corre el aterrizaje una parada.
 */
function candidatos(d: Desfase, ventana: number): readonly Candidato[] {
  const caja = { topDoc: d.bloque.topDeFlujo, alto: d.bloque.altoDeFlujo }
  const obsIni = d.empiezaAMoverse
  const obsFin = d.terminaDeMoverse
  return ORDEN_DE_PATRONES.map((id) => {
    const r = rangoDeScroll(ANCLAS[id], caja, ventana)
    const error =
      obsIni === null || obsFin === null
        ? Number.POSITIVE_INFINITY
        : Math.abs(r.inicio - obsIni) + Math.abs(r.fin - obsFin)
    return { patron: id, inicio: dos(r.inicio), fin: dos(r.fin), error: dos(error) }
  }).sort((a, b) => a.error - b.error)
}

function nombre(d: Desfase): string {
  return `${d.bloque.seccion ?? '(sin panel)'}#${d.bloque.ordinal}`
}

async function main(): Promise<void> {
  const perfil = perfilPorId(PERFIL)
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('b9'),
    ancho: perfil.ancho,
    alto: perfil.alto + 120,
  })
  let lectura: LecturaDeSincronia
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, SITIO)
    const estado = await verificarLaPagina(p, perfil)
    console.log(
      `página verificada — visibilityState=${estado.visibilityState} innerWidth=${estado.innerWidth} innerHeight=${estado.innerHeight} rAF=${estado.rafCorre} documento=${estado.alturaDelDocumento}`,
    )
    // La escena tarda entre 300 y 700 ms en armar; medir antes es medir otra
    // página. (`B4-B`, regla de captura 1.)
    await medir<boolean>(p, `new Promise((r) => setTimeout(() => r(true), 1200))`)
    lectura = await medir<LecturaDeSincronia>(p, `(${fuenteDelBarrido({ paso: PASO })})()`)
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }

  if (lectura.visibilityState !== 'visible' || lectura.innerWidth === 0) {
    throw new Error(
      `barrido inválido: visibilityState="${lectura.visibilityState}", innerWidth=${lectura.innerWidth}`,
    )
  }
  if (lectura.bloques.length === 0) {
    throw new Error('no hay un solo [data-arbol] en la página — la coreografía no montó')
  }

  const tabla = desfases(lectura)
  const conCandidatos = tabla.map((d) => ({
    ...d,
    candidatos: candidatos(d, lectura.ventana).slice(0, 3),
  }))

  const ordenada = [...conCandidatos].sort(
    (a, b) => (b.peorDesfasePantallas ?? -1) - (a.peorDesfasePantallas ?? -1),
  )

  console.log('')
  console.log(
    `B9 · DESFASES — ${perfil.ancho}×${perfil.alto} · ${lectura.bloques.length} instancias · paso ${PASO} px · ventana ${lectura.ventana} px · documento ${lectura.alturaDelDocumento} px (${dos(lectura.alturaDelDocumento / lectura.ventana)} pantallas)`,
  )
  console.log('')
  console.log(
    [
      'instancia',
      'anclaje',
      'patrón~',
      'en cuadro',
      'anima',
      'desf.entrada',
      'desf.salida',
      'fuera',
      'cuadro@0',
      'cuadro@1',
      'op@centro',
    ].join(' | '),
  )
  for (const d of ordenada) {
    const c = d.candidatos[0]
    console.log(
      [
        nombre(d).padEnd(22),
        (d.bloque.anclaje ?? '-').padEnd(7),
        `${c.patron}(err ${c.error})`.padEnd(16),
        `[${d.entraEnCuadro} , ${d.saleDeCuadro}]`.padEnd(18),
        `[${d.empiezaAMoverse} , ${d.terminaDeMoverse}]`.padEnd(18),
        `${d.desfaseDeEntradaPantallas}`.padEnd(8),
        `${d.desfaseDeSalidaPantallas}`.padEnd(8),
        `${d.fraccionFueraDeCuadro}`.padEnd(6),
        d.cuadroAlEmpezar === null ? '-' : `${d.cuadroAlEmpezar.top}..${d.cuadroAlEmpezar.fondo}`.padEnd(14),
        d.cuadroAlTerminar === null ? '-' : `${d.cuadroAlTerminar.top}..${d.cuadroAlTerminar.fondo}`.padEnd(14),
        `${d.opacidadAlCentro}`,
      ].join(' | '),
    )
  }

  console.log('')
  console.log('TEXTO DE CADA INSTANCIA (para poder nombrarlas en el reporte):')
  for (const d of conCandidatos) console.log(`  ${nombre(d).padEnd(22)} ${d.bloque.texto}`)

  console.log('')
  console.log('PANELES:')
  for (const s of lectura.paneles) {
    console.log(`  ${s.id.padEnd(18)} top ${s.top}  alto ${s.alto}  (${tres(s.alto / lectura.ventana)} pantallas)`)
  }

  const pendientes = [
    jsonPendiente(`desfases-${perfil.id}-${ETIQUETA}.json`, {
      perfil: perfil.id,
      etiqueta: ETIQUETA,
      paso: PASO,
      ventana: lectura.ventana,
      alturaDelDocumento: lectura.alturaDelDocumento,
      paneles: lectura.paneles,
      instancias: conCandidatos,
    }),
    jsonPendiente(`serie-${perfil.id}-${ETIQUETA}.json`, lectura),
  ]
  const escritos = mudar(pendientes)
  console.log('')
  for (const e of escritos) console.log(`escrito: ${e}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
