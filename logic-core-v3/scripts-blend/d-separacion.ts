/**
 * BLEND-1 · D — LA ALTERNATIVA: separación vertical, medida con la misma vara.
 *
 *     npx tsx scripts-blend/d-separacion.ts [--ancho=390]
 *
 * ── Qué contesta ──────────────────────────────────────────────────────────
 *
 * La otra salida al texto sobre el logo no es un efecto: es **mover el bloque de
 * texto arriba o abajo de la tinta del logo, sin tocar la cámara**. Este script
 * pone el número que compite contra el blend:
 *
 *   · **cuánto mide la tinta del logo en vertical**, en px del cuadro y como
 *     fracción del alto — o sea cuánto lugar queda;
 *   · **cuántos píxeles habría que mover cada bloque** para no compartir banda
 *     vertical con esa tinta, hacia arriba o hacia abajo, el que salga más corto;
 *   · **si ese movimiento entra en la pantalla** sin que el bloque se salga del
 *     cuadro ni de su sección.
 *
 * ⚠️ **No aplica nada.** Es aritmética sobre cajas medidas, y el bloque se
 * queda donde está.
 *
 * ── ⚠️ DE DÓNDE SALE «LA TINTA DEL LOGO», Y POR QUÉ NO DE UN UMBRAL NUEVO ──
 *
 * De `siluetaMasGrande` (`scripts-b5/silueta.ts`) con **los umbrales que B5
 * publicó y B8 y B11 heredaron sin tocar**: `TINTA_MAXIMA = 60` y
 * `AREA_MINIMA_DEL_LOGO = 5000` (`scripts-b8/c-bloques.ts:44-45`). Inventar un
 * umbral acá daría un «alto de la tinta» que no se podría comparar con ninguna
 * cifra de B8 ni de B11, que es justo lo que el reporte necesita hacer.
 *
 * Y sale de la captura **S** —la sala desnuda, con todo lo que no es escena
 * oculto— por la razón que el docblock de la silueta ya escribe: con el texto
 * encima, el titular sería otra componente oscura y podría UNIRSE al logo.
 *
 * ── ⚠️ LO QUE ESTE NÚMERO NO DICE ─────────────────────────────────────────
 *
 * Dice si hay lugar geométrico. **No dice si el diseño lo tolera**: mover un
 * bloque cambia el ritmo de la sección, y B11 ya pagó ese precio dos veces con
 * su número (la foto de Quiénes somos «vuelve al ancho que B1 descartó y reabre
 * ~310 px de hueco»; Números «perdió la amplitud, de 1.220 a 594 px a 1440»).
 * Acá se publica el desplazamiento y el lugar disponible, no una aprobación.
 */

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { AREA_MINIMA_DEL_LOGO, TINTA_MAXIMA } from '../scripts-b8/c-bloques'
import { leerImagen, siluetaMasGrande } from '../scripts-b8/glifo-alfa'
import { LECTOR_DEL_DOCUMENTO, LECTOR_DE_BLOQUES, LECTOR_DE_PANELES, type Bloque } from '../scripts-b8/lectores'
import { ESCENA_NUESTRA, OCULTAR_TODO_MENOS } from '../scripts-b8/ocultar'
import {
  ASENTAMIENTO_DE_BLOQUES_MS,
  BORRAR_LAS_MARCAS,
  KEYFRAMES,
  TEMP,
  VENTANAS,
  argumento,
  asegurarCarpetas,
  asentarElHome,
  conLaPagina,
  cuatro,
  dos,
  guardarJson,
  hayCanvas,
  scrollDelProgreso,
  type MarcasBorradas,
} from './blend-comun'

interface PanelLeido {
  readonly id: string
  readonly superficie: string
  readonly alto: number
  readonly top: number
}

/** La banda vertical de la tinta del logo en el cuadro, y cuánto lugar deja. */
interface BandaDelLogo {
  readonly area: number
  readonly y0: number
  readonly y1: number
  readonly altoPx: number
  readonly fraccionDelAlto: number
  /** El hueco libre arriba de la tinta y abajo de la tinta, en px del cuadro. */
  readonly huecoArriba: number
  readonly huecoAbajo: number
}

/** Lo que habría que mover un bloque, y si entra. */
interface Desplazamiento {
  readonly clave: string
  readonly etiqueta: string
  readonly texto: string
  readonly y0: number
  readonly y1: number
  readonly altoPx: number
  readonly comparteBanda: boolean
  /** Para quedar ARRIBA de la tinta: `y1` tiene que subir hasta `logo.y0`. Negativo = subir. */
  readonly haciaArriba: number
  /** Para quedar ABAJO de la tinta: `y0` tiene que bajar hasta `logo.y1`. Positivo = bajar. */
  readonly haciaAbajo: number
  /** El más corto de los dos que ENTRA en el cuadro; `null` si ninguno entra. */
  readonly elMasCorto: number | null
  readonly direccion: 'arriba' | 'abajo' | 'ninguna entra' | 'no hace falta'
  readonly entraArriba: boolean
  readonly entraAbajo: boolean
}

function bandaDelLogo(rutaS: string, alto: number): BandaDelLogo | null {
  const S = leerImagen(rutaS)
  const silueta = siluetaMasGrande(S, TINTA_MAXIMA, AREA_MINIMA_DEL_LOGO)
  if (silueta.caja.length !== 4) return null
  const y0 = silueta.caja[1]
  const y1 = silueta.caja[3]
  return {
    area: silueta.area,
    y0,
    y1,
    altoPx: y1 - y0,
    fraccionDelAlto: cuatro((y1 - y0) / alto),
    huecoArriba: Math.max(0, y0),
    huecoAbajo: Math.max(0, alto - y1),
  }
}

/**
 * ⚠️ **«ENTRA» SE MIDE CONTRA EL CUADRO, NO CONTRA EL DOCUMENTO.** Un bloque
 * movido 400 px hacia abajo sigue existiendo en el documento; lo que la
 * instrucción pregunta es si entra EN LA PANTALLA, o sea si después del
 * movimiento el bloque entero sigue entre 0 y el alto del cuadro. Un bloque que
 * ya asoma cortado por el borde no puede «entrar» en ninguna dirección, y eso se
 * publica como tal en vez de devolver un número que no significa nada.
 */
function desplazamiento(
  clave: string,
  etiqueta: string,
  texto: string,
  caja: { readonly y: number; readonly alto: number },
  logo: BandaDelLogo,
  altoDelCuadro: number,
): Desplazamiento {
  const y0 = caja.y
  const y1 = caja.y + caja.alto
  const comparte = y0 < logo.y1 && y1 > logo.y0
  const haciaArriba = logo.y0 - y1
  const haciaAbajo = logo.y1 - y0
  const entraArriba = y0 + haciaArriba >= 0 && y1 + haciaArriba <= altoDelCuadro
  const entraAbajo = y0 + haciaAbajo >= 0 && y1 + haciaAbajo <= altoDelCuadro
  if (!comparte) {
    return {
      clave, etiqueta, texto, y0: dos(y0), y1: dos(y1), altoPx: dos(caja.alto), comparteBanda: false,
      haciaArriba: dos(haciaArriba), haciaAbajo: dos(haciaAbajo), elMasCorto: 0, direccion: 'no hace falta',
      entraArriba, entraAbajo,
    }
  }
  const candidatos: { readonly d: number; readonly dir: 'arriba' | 'abajo' }[] = []
  if (entraArriba) candidatos.push({ d: haciaArriba, dir: 'arriba' })
  if (entraAbajo) candidatos.push({ d: haciaAbajo, dir: 'abajo' })
  candidatos.sort((a, b) => Math.abs(a.d) - Math.abs(b.d))
  const elegido = candidatos[0]
  return {
    clave, etiqueta, texto, y0: dos(y0), y1: dos(y1), altoPx: dos(caja.alto), comparteBanda: true,
    haciaArriba: dos(haciaArriba), haciaAbajo: dos(haciaAbajo),
    elMasCorto: elegido === undefined ? null : dos(elegido.d),
    direccion: elegido === undefined ? 'ninguna entra' : elegido.dir,
    entraArriba, entraAbajo,
  }
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const pedido = argumento('ancho', '390')
  const perfil = VENTANAS.find((v) => v.id === pedido)
  if (perfil === undefined) throw new Error(`--ancho=${pedido} no es ninguno de ${VENTANAS.map((v) => v.id).join(', ')}`)
  const t0 = Date.now()

  const salida = await conLaPagina(perfil, '/v3', async (s) => {
    const { pagina } = s
    await asentarElHome(s)
    const lienzo = await hayCanvas(pagina)
    if (!lienzo.hay) throw new Error('no hay canvas: sin escena no hay tinta del logo que medir')
    const doc = await medir<{ altoDelDocumento: number; ventana: number; ancho: number }>(pagina, LECTOR_DEL_DOCUMENTO)
    const paneles = await medir<PanelLeido[]>(pagina, LECTOR_DE_PANELES)
    const secciones = { arriba: Math.min(...paneles.map((p) => p.top)), abajo: Math.max(...paneles.map((p) => p.top + p.alto)) }
    console.log(`canvas ${lienzo.ancho}×${lienzo.alto} · ventana ${doc.ventana} · silueta con tinta≤${TINTA_MAXIMA} y área≥${AREA_MINIMA_DEL_LOGO}`)

    const porSeccion: unknown[] = []
    for (const panel of paneles) {
      const porY = new Map<number, string[]>()
      const anotar = (y: number, nombre: string): void => {
        const previo = porY.get(y)
        if (previo === undefined) porY.set(y, [nombre])
        else if (!previo.includes(nombre)) previo.push(nombre)
      }
      anotar(Math.round(Math.max(0, Math.min(doc.altoDelDocumento - doc.ventana, panel.top))), 'arranque')
      for (const k of KEYFRAMES) {
        const y = scrollDelProgreso(k.at, secciones, doc.ventana)
        if (y >= panel.top && y < panel.top + panel.alto) anotar(y, `kf ${k.nombre} (${cuatro(k.at)})`)
      }
      const poses = [...porY.entries()].sort((a, b) => a[0] - b[0]).map(([y, nombres]) => ({ pose: nombres.join(' = '), y }))

      console.log(`\n── ${panel.id} (${panel.superficie}) · ${poses.length} poses ──`)
      const lecturas: unknown[] = []
      for (const pose of poses) {
        const logrado = await scrollA(pagina, pose.y)
        await esperarElPrimerCuadro(pagina)
        await new Promise((r) => setTimeout(r, ASENTAMIENTO_DE_BLOQUES_MS))

        const limpias = await medir<MarcasBorradas>(pagina, BORRAR_LAS_MARCAS)
        if (limpias.quedan !== 0) throw new Error(`quedaron ${limpias.quedan} marcas`)
        const bloques = (await medir<Bloque[]>(pagina, LECTOR_DE_BLOQUES(panel.id))).filter((b) => b.enCuadro)

        const rutaS = `${TEMP}/sep-${perfil.id}-${panel.id}-${logrado}-S.png`
        if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, true)))) throw new Error('no quedó sólo la escena')
        await esperarElPrimerCuadro(pagina, 300)
        await capturar(pagina, rutaS)
        if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, false)))) throw new Error('no se restauró lo oculto')

        const logo = bandaDelLogo(rutaS, doc.ventana)
        if (logo === null) {
          console.log(`  ${pose.pose.padEnd(30).slice(0, 30)} y=${String(logrado).padStart(6)} · sin tinta del logo en cuadro (área < ${AREA_MINIMA_DEL_LOGO})`)
          lecturas.push({ pose: pose.pose, scrollY: logrado, logo: null, bloques: [], union: null })
          continue
        }

        const desplazamientos = bloques
          .flatMap((b) =>
            b.cajas
              .filter((c) => c.y < doc.ventana && c.y + c.alto > 0)
              .map((c, i) =>
                desplazamiento(
                  `${b.etiqueta}|${b.texto}|${i}`,
                  b.etiqueta,
                  b.texto,
                  { y: c.y, alto: c.alto },
                  logo,
                  doc.ventana,
                ),
              ),
          )

        // La columna entera movida en bloque: lo que de verdad se haría.
        const cajas = desplazamientos.filter((d) => d.comparteBanda)
        const union =
          desplazamientos.length === 0
            ? null
            : desplazamiento(
                '(la columna entera)',
                'union',
                `${desplazamientos.length} cajas`,
                {
                  y: Math.min(...desplazamientos.map((d) => d.y0)),
                  alto: Math.max(...desplazamientos.map((d) => d.y1)) - Math.min(...desplazamientos.map((d) => d.y0)),
                },
                logo,
                doc.ventana,
              )

        const mayor = cajas.length === 0 ? null : cajas.reduce((a, b) => (Math.abs(b.elMasCorto ?? Infinity) > Math.abs(a.elMasCorto ?? Infinity) ? b : a))
        console.log(
          `  ${pose.pose.padEnd(30).slice(0, 30)} y=${String(logrado).padStart(6)} · logo y=[${logo.y0}, ${logo.y1}] (${logo.altoPx} px, ${(logo.fraccionDelAlto * 100).toFixed(1)}% del alto; hueco ${logo.huecoArriba}↑ / ${logo.huecoAbajo}↓) · ${cajas.length}/${desplazamientos.length} cajas comparten banda · peor caja ${mayor === null ? '—' : `${mayor.elMasCorto ?? '(no entra)'} px ${mayor.direccion}`} · columna entera ${union === null ? '—' : `${union.elMasCorto ?? '(no entra)'} px ${union.direccion}`}`,
        )
        lecturas.push({ pose: pose.pose, scrollY: logrado, logo, bloques: desplazamientos, union, capturaS: rutaS })
      }
      porSeccion.push({ seccion: panel.id, superficie: panel.superficie, poses: lecturas })
    }
    return { perfil, canvas: lienzo, documento: doc, paneles, secciones, umbrales: { TINTA_MAXIMA, AREA_MINIMA_DEL_LOGO }, porSeccion }
  })

  console.log('\n══ RESUMEN — cuánto habría que mover, por sección ══')
  console.log('  sección          poses  tinta del logo (% del alto)  cajas que comparten  el peor movimiento  la columna entera')
  interface Lectura {
    readonly pose: string
    readonly scrollY: number
    readonly logo: BandaDelLogo | null
    readonly bloques: readonly Desplazamiento[]
    readonly union: Desplazamiento | null
  }
  interface SeccionLeida {
    readonly seccion: string
    readonly superficie: string
    readonly poses: readonly Lectura[]
  }
  const resumen: unknown[] = []
  for (const sec of salida.porSeccion as readonly SeccionLeida[]) {
    const conLogo = sec.poses.filter((p) => p.logo !== null)
    if (conLogo.length === 0) {
      console.log(`  ${sec.seccion.padEnd(16)} ${String(sec.poses.length).padStart(5)}  (sin tinta del logo en cuadro en ninguna pose)`)
      resumen.push({ seccion: sec.seccion, poses: sec.poses.length, posesConLogo: 0 })
      continue
    }
    const fracciones = conLogo.map((p) => (p.logo as BandaDelLogo).fraccionDelAlto)
    const comparten = sec.poses.flatMap((p) => p.bloques.filter((b) => b.comparteBanda))
    const total = sec.poses.flatMap((p) => p.bloques).length
    const movimientos = comparten.map((b) => b.elMasCorto).filter((d): d is number => d !== null)
    const noEntran = comparten.filter((b) => b.elMasCorto === null).length
    const uniones = sec.poses.map((p) => p.union).filter((u): u is Desplazamiento => u !== null && u.comparteBanda)
    const unionPeor = uniones.length === 0 ? null : uniones.reduce((a, b) => (Math.abs(b.elMasCorto ?? Infinity) > Math.abs(a.elMasCorto ?? Infinity) ? b : a))
    const fila = {
      seccion: sec.seccion,
      superficie: sec.superficie,
      poses: sec.poses.length,
      posesConLogo: conLogo.length,
      tintaFraccionMinima: Math.min(...fracciones),
      tintaFraccionMaxima: Math.max(...fracciones),
      cajasQueComparten: comparten.length,
      cajasTotales: total,
      movimientoMinimo: movimientos.length === 0 ? null : Math.min(...movimientos.map((m) => Math.abs(m))),
      movimientoMaximo: movimientos.length === 0 ? null : Math.max(...movimientos.map((m) => Math.abs(m))),
      cajasQueNoEntranEnNingunaDireccion: noEntran,
      columnaEntera: unionPeor === null ? null : { px: unionPeor.elMasCorto, direccion: unionPeor.direccion, entraArriba: unionPeor.entraArriba, entraAbajo: unionPeor.entraAbajo },
    }
    resumen.push(fila)
    console.log(
      `  ${sec.seccion.padEnd(16)} ${String(sec.poses.length).padStart(5)}  ${(fila.tintaFraccionMinima * 100).toFixed(1)}–${(fila.tintaFraccionMaxima * 100).toFixed(1)}%${' '.repeat(18)} ${String(comparten.length).padStart(4)}/${String(total).padEnd(4)} ${fila.movimientoMaximo === null ? '(ninguna entra)' : `${String(fila.movimientoMinimo).padStart(4)}–${String(fila.movimientoMaximo).padEnd(4)} px`}${noEntran > 0 ? ` (+${noEntran} no entran)` : ''}   ${fila.columnaEntera === null ? '—' : `${fila.columnaEntera.px ?? '(no entra)'} px ${fila.columnaEntera.direccion}`}`,
    )
  }

  const ruta = guardarJson(`d-separacion-${salida.perfil.id}`, { cuando: new Date().toISOString(), ...salida, resumen })
  console.log(`\n  ${ruta} · ${((Date.now() - t0) / 1000).toFixed(0)} s`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
