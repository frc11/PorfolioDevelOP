/**
 * B · LAS TRES VARIANTES DEL LOGO, CAPTURADAS Y MEDIDAS.
 *
 *     npx tsx scripts-vidrio/b-variantes.ts
 *
 * Para cada ancho (768 y 375):
 *
 *   1. **Dónde cruza.** Se barre el scroll de la primera pantalla de «Quiénes
 *      somos» y en cada parada se mide el contraste de los DOS bloques de
 *      texto. El cruce no se elige a ojo: es la parada donde más píxeles de
 *      glifo caen abajo de AA.
 *   2. **Las tres variantes**, en esa misma parada: V0 (negro macizo, la de
 *      hoy), V1 (relleno claro, contorno fino) y V2 (relleno claro, contorno
 *      grueso). Una captura y una cifra por variante.
 *
 * ⚠️ **EL TEXTO QUE CRUZA EL LOGO ES LA BAJADA, NO EL TITULAR.** La primera
 * corrida barrió sólo el titular y devolvió 17,60:1 —el contraste del papel
 * limpio— en ocho de nueve paradas: a 768 y a 375 el titular queda ARRIBA del
 * logo y no lo pisa nunca. La captura lo muestra sin lugar a dudas. Se miden
 * los dos y el cruce lo decide la bajada.
 *
 * ⚠️ **Y el PEOR PÍXEL no distingue una variante de otra**, por dos causas que
 * conviven: el piso de motas que B11 ya declaró (una mota oscura abajo de un
 * glifo da 1,00:1 y es escena, no material) y —en V1 y V2— el contorno, que es
 * la MISMA tinta del texto. Por eso la cifra que decide es **cuántos píxeles de
 * glifo caen abajo de AA**, y el peor se publica igual con su motivo.
 *
 * El contraste sale del instrumento del repo y no de uno nuevo: la máscara de
 * glifo viene de la captura con la ESCENA OCULTA —ahí el texto cae sobre papel
 * plano— y el fondo, de la captura con el TEXTO oculto. Es
 * `scripts-b8/glifo-alfa.ts`, el mismo que firma las cifras de B8 y B11.
 */

import { mkdirSync } from 'node:fs'

import { capturar } from '../scripts-b4/captura'
import { medir, type Pagina } from '../scripts-b4/navegador'
import type { Perfil } from '../scripts-b4/perfiles'
import { cajaYTinta, ocultarPorSelector, type CajaYTinta } from '../scripts-b5/pagina'
import { contrasteBajoElGlifoConOpacidad, leerImagen } from '../scripts-b8/glifo-alfa'

import { ASENTAMIENTO_MS, PERFILES, SALIDAS, conLaPagina, esperar, scrollA } from './vidrio-comun'

/** El envoltorio de la escena. Lo emite `EscenaDelHome.tsx`. */
/** El salto de línea del fuente que se inyecta. Como constante para no escribirlo adentro de un literal. */
const SALTO = String.fromCharCode(10)

const ESCENA = '[data-escena]'
/** Los dos renglones visibles del titular. El `sr-only` lo filtra el lector por su `clip-path`. */
const TITULAR = '[data-panel="quienes-somos"] [data-composicion="agencia"] div[aria-hidden="true"]'
/** La bajada: el párrafo del cuerpo, que es el que de verdad cruza el logo. */
const BAJADA = '[data-panel="quienes-somos"] [data-composicion="agencia"] p'

const VARIANTES = [
  { id: 'v0', nombre: 'negro macizo (hoy)', consulta: '' },
  { id: 'v1', nombre: 'relleno claro, contorno fino', consulta: '?vidrio=1' },
  { id: 'v2', nombre: 'relleno claro, contorno grueso', consulta: '?vidrio=2' },
] as const

const DONDE = [
  '(() => {',
  "  const t = document.querySelector('" + BAJADA + "')",
  '  if (t === null) return { hay: false, top: 0, alto: 0, ventana: 0 }',
  '  const r = t.getBoundingClientRect()',
  '  return { hay: true, top: Math.round(r.top + window.scrollY), alto: Math.round(r.height), ventana: window.innerHeight }',
  '})()',
].join('\n')

interface Lectura {
  readonly peor: number
  readonly p1: number
  readonly mediana: number
  readonly bajoAA: number
  readonly pixeles: number
}

const VACIA: Lectura = { peor: Number.NaN, p1: Number.NaN, mediana: Number.NaN, bajoAA: 0, pixeles: 0 }

/** Las dos lecturas en la parada actual. Deja además la captura COMPUESTA si se le da destino. */
async function medirElCruce(
  p: Pagina,
  carpeta: string,
  destino: string | null,
): Promise<{ readonly titular: Lectura; readonly bajada: Lectura }> {
  const cajasDelTitular = await cajaYTinta(p, TITULAR)
  const cajasDeLaBajada = await cajaYTinta(p, BAJADA)
  if (cajasDeLaBajada.cajas.length === 0) throw new Error('la bajada no devolvió ninguna caja de texto')

  if (destino !== null) await capturar(p, `${carpeta}/${destino}.png`)

  // T — la escena oculta: el texto sobre papel plano, que es de donde sale la máscara.
  if (!(await ocultarPorSelector(p, ESCENA, true))) throw new Error('no se pudo ocultar la escena')
  await esperar(320)
  await capturar(p, `${carpeta}/_t.png`)
  await ocultarPorSelector(p, ESCENA, false)

  // A — el texto oculto: el fondo que hay debajo de cada glifo.
  const ambos = `${TITULAR}, ${BAJADA}`
  if (!(await ocultarPorSelector(p, ambos, true))) throw new Error('no se pudo ocultar el texto')
  await esperar(320)
  await capturar(p, `${carpeta}/_a.png`)
  await ocultarPorSelector(p, ambos, false)
  await esperar(320)

  const T = leerImagen(`${carpeta}/_t.png`)
  const A = leerImagen(`${carpeta}/_a.png`)
  const leer = (c: CajaYTinta, grande: boolean): Lectura => {
    if (c.cajas.length === 0) return VACIA
    const l = contrasteBajoElGlifoConOpacidad(T, A, c.cajas, c.tinta, 1, grande)
    return {
      peor: l.peorContraste,
      p1: l.p1Contraste,
      mediana: l.medianaContraste,
      bajoAA: l.bajoAA,
      pixeles: l.pixelesDeGlifo,
    }
  }
  return { titular: leer(cajasDelTitular, true), bajada: leer(cajasDeLaBajada, false) }
}

function linea(id: string, l: Lectura): string {
  return `peor ${l.peor.toFixed(2)}:1 · mediana ${l.mediana.toFixed(2)} · bajo AA ${l.bajoAA}/${l.pixeles} (${id})`
}

async function conElAncho(perfil: Perfil): Promise<void> {
  const carpeta = `${SALIDAS}/${perfil.id}`
  mkdirSync(carpeta, { recursive: true })

  // ── 1 · dónde cruza, barriendo con la variante de hoy ───────────────────
  const cruce = await conLaPagina(perfil, async (s) => {
    await esperar(ASENTAMIENTO_MS)
    const donde = await medir<{ hay: boolean; top: number; alto: number; ventana: number }>(s.pagina, DONDE)
    if (!donde.hay) throw new Error('no se encontró la bajada')
    const desde = donde.top - donde.ventana + Math.round(donde.alto * 0.5)
    const hasta = donde.top + Math.round(donde.alto * 0.5)
    const paradas: { y: number; malos: number }[] = []
    for (let i = 0; i <= 8; i += 1) {
      const y = Math.max(0, Math.round(desde + ((hasta - desde) * i) / 8))
      await scrollA(s.pagina, y)
      await esperar(700)
      // ⚠️ Sólo valen las paradas donde la bajada está ENTERA y despejada. Sin
      // esto gana siempre la parada en que el texto pasa por atrás de la franja
      // negra del aviso de contenido inventado: ahí el contraste es 1,00:1 y no
      // tiene nada que ver con el logo.
      const caja = await medir<{ dentro: boolean; top: number; bottom: number }>(
        s.pagina,
        [
          '(() => {',
          "  const t = document.querySelector('" + BAJADA + "')",
          '  if (t === null) return { dentro: false, top: 0, bottom: 0 }',
          '  const r = t.getBoundingClientRect()',
          '  return { dentro: r.top > 80 && r.bottom < window.innerHeight - 80, top: Math.round(r.top), bottom: Math.round(r.bottom) }',
          '})()',
        ].join(SALTO),
      )
      const l = await medirElCruce(s.pagina, carpeta, null)
      if (caja.dentro) paradas.push({ y, malos: l.bajada.bajoAA })
      console.log(
        `    y=${String(y).padStart(5)}  ${caja.dentro ? 'vale ' : 'fuera'}  bajada ${l.bajada.bajoAA}/${l.bajada.pixeles} bajo AA (caja ${caja.top}..${caja.bottom})`,
      )
    }
    if (paradas.length === 0) throw new Error('ninguna parada dejó la bajada despejada')
    return paradas.reduce((p, c) => (c.malos > p.malos ? c : p))
  })

  console.log(`\n  ${perfil.id}: el cruce cae en scroll ${cruce.y} (${cruce.malos} px de la bajada bajo AA)`)

  // ── 2 · las tres variantes en esa parada ────────────────────────────────
  for (const v of VARIANTES) {
    const l = await conLaPagina(perfil, async (s) => {
      if (v.consulta !== '') {
        await medir<null>(s.pagina, `(() => { window.location.replace(location.pathname + '${v.consulta}'); return null })()`)
        await esperar(3500)
      }
      await esperar(ASENTAMIENTO_MS)
      await scrollA(s.pagina, cruce.y)
      await esperar(900)
      return medirElCruce(s.pagina, carpeta, `${perfil.id}-${v.id}`)
    })
    console.log(`  ${perfil.id} · ${v.id.toUpperCase()} ${v.nombre}`)
    console.log(`      bajada  ${linea('la que cruza', l.bajada)}`)
    console.log(`      titular ${linea('no cruza', l.titular)}`)
  }
}

async function principal(): Promise<void> {
  mkdirSync(SALIDAS, { recursive: true })
  for (const perfil of PERFILES) {
    console.log(`\n=== ${perfil.id} (${perfil.ancho}x${perfil.alto})`)
    await conElAncho(perfil)
  }
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
