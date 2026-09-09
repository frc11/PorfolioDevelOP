/**
 * C · LA REFERENCIA — una navegación, una medición. Dónde pone el texto respecto
 * de su objeto 3D, cuánto ancho le da a cada uno, y si alguna vez los superpone.
 *
 *     npx tsx scripts-b11/c-referencia.ts
 *
 * ── Qué mide, y qué NO hace ────────────────────────────────────────────────
 *
 * Recorre `nk.studio` en producción a 1920×1080, pantalla por media pantalla,
 * y en cada parada saca las mismas cuatro capturas que el instrumento propio
 * (C, A con la tinta apagada, T con sus canvas ocultos, S con sólo sus canvas)
 * para contestar tres cosas por PROPIEDAD y no por selector:
 *
 *   · **dónde está su objeto**: en S —su canvas solo, un mundo oscuro— el
 *     objeto es la componente conexa más grande de lo que se aparta de la
 *     mediana de gris del cuadro (`SALTO_SOBRE_EL_FONDO`, el criterio de
 *     `particulas.ts`), con las partículas descartadas por área. Su caja y qué
 *     fracción del ancho ocupa;
 *   · **dónde está su texto**: los bloques en cuadro con opacidad, la caja que
 *     los une y qué fracción del ancho ocupa; a qué lado del objeto cae;
 *   · **si se superponen**: la fracción de los píxeles de GLIFO (la máscara de
 *     T contra A, la misma de `glifo-alfa.ts`) que cae adentro de la silueta
 *     del objeto, bloque por bloque, y el contraste bajo el glifo de esos
 *     bloques con el peor píxel — para ver qué hace cuando sí los superpone.
 *
 * NO copia nada: ni un selector, ni una clase, ni un valor. Es UNA navegación
 * con scroll adentro, se cierra la pestaña, y se escribe con nuestras palabras.
 * Cada parada corre en su propio `try`: una que falle se anota y se sigue.
 */

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION, conLaPagina } from '../scripts-b8/b8-comun'
import { contrasteBajoElGlifoConOpacidad, fraccionSobreLaSilueta, leerImagen, type Imagen } from '../scripts-b8/glifo-alfa'
import { APAGAR_LA_TINTA, LECTOR_DE_BLOQUES_EN, type Bloque, type TintaApagada } from '../scripts-b8/lectores'
import { CANVASES, INVENTARIO, type Inventario } from '../scripts-b8/lectores-referencia'
import { OCULTAR_NODOS, OCULTAR_TODO_MENOS, OCULTAR_TODO_MENOS_INFORMANDO, type Ocultamiento } from '../scripts-b8/ocultar'
import { AREA_MAXIMA, SALTO_SOBRE_EL_FONDO, mediaDeLaCaptura } from '../scripts-b8/particulas'

import { TEMP, asegurarCarpetas, capturaPendiente, cuatro, dos, jsonPendiente, mudarPendientes, perfilDeB11 } from './b11-comun'
import { partirPorTamano } from './mapa'

const ORIGEN_DE_LA_REFERENCIA = 'https://www.nk.studio'

interface Objeto {
  readonly area: number
  readonly caja: readonly number[]
  readonly fraccionDelAncho: number
  readonly fraccionDelAlto: number
  readonly fraccionDelCuadro: number
  readonly dentro: Uint8Array
}

/**
 * El objeto de su escena: lo que se aparta de la mediana del cuadro, sin las
 * partículas (componentes ≤ 400 px) y sin el fondo. La componente más grande.
 */
function objetoDe(S: Imagen): Objeto {
  const total = S.ancho * S.alto
  const gris = new Float32Array(total)
  const bins = new Uint32Array(256)
  for (let i = 0; i < total; i += 1) {
    const k = i * 4
    gris[i] = 0.2126 * S.datos[k] + 0.7152 * S.datos[k + 1] + 0.0722 * S.datos[k + 2]
    bins[Math.round(gris[i])] += 1
  }
  let acumulado = 0
  let mediana = 0
  for (let g = 0; g < 256; g += 1) {
    acumulado += bins[g]
    if (acumulado * 2 >= total) {
      mediana = g
      break
    }
  }
  const aparte = new Uint8Array(total)
  for (let i = 0; i < total; i += 1) if (Math.abs(gris[i] - mediana) > SALTO_SOBRE_EL_FONDO) aparte[i] = 1
  const partida = partirPorTamano(aparte, S.ancho, S.alto, AREA_MAXIMA)
  // La componente grande más grande: se etiqueta de nuevo sobre `grandes`.
  const visto = new Uint8Array(total)
  const pila = new Int32Array(total)
  let mejor: { n: number; pixeles: Int32Array; caja: number[] } | null = null
  for (let inicio = 0; inicio < total; inicio += 1) {
    if (partida.grandes[inicio] === 0 || visto[inicio] === 1) continue
    const acum: number[] = []
    let tope = 0
    pila[tope] = inicio
    tope += 1
    visto[inicio] = 1
    let minx = S.ancho
    let maxx = -1
    let miny = S.alto
    let maxy = -1
    while (tope > 0) {
      tope -= 1
      const k = pila[tope]
      acum.push(k)
      const x = k % S.ancho
      const y = (k - x) / S.ancho
      if (x < minx) minx = x
      if (x > maxx) maxx = x
      if (y < miny) miny = y
      if (y > maxy) maxy = y
      for (const v of [x > 0 ? k - 1 : -1, x < S.ancho - 1 ? k + 1 : -1, y > 0 ? k - S.ancho : -1, y < S.alto - 1 ? k + S.ancho : -1]) {
        if (v >= 0 && partida.grandes[v] === 1 && visto[v] === 0) {
          visto[v] = 1
          pila[tope] = v
          tope += 1
        }
      }
    }
    if (mejor === null || acum.length > mejor.n) mejor = { n: acum.length, pixeles: Int32Array.from(acum), caja: [minx, miny, maxx, maxy] }
  }
  const dentro = new Uint8Array(total)
  if (mejor !== null) for (const k of mejor.pixeles) dentro[k] = 1
  const caja = mejor?.caja ?? []
  return {
    area: mejor?.n ?? 0,
    caja,
    fraccionDelAncho: caja.length === 4 ? cuatro((caja[2] - caja[0] + 1) / S.ancho) : 0,
    fraccionDelAlto: caja.length === 4 ? cuatro((caja[3] - caja[1] + 1) / S.alto) : 0,
    fraccionDelCuadro: cuatro((mejor?.n ?? 0) / total),
    dentro,
  }
}

interface BloqueLeido {
  readonly etiqueta: string
  readonly texto: string
  readonly tamanoPx: number
  readonly opacidad: number
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly pixelesDeGlifo: number
  readonly sobreElObjeto: number
  readonly peorContraste: number
  readonly medianaContraste: number
  readonly pasaAA: boolean
}

type Lado = 'izquierda' | 'derecha' | 'encima' | 'ambos' | 'sin-objeto' | 'sin-texto'

interface Parada {
  readonly scrollY: number
  readonly pantalla: number
  readonly salaLuminancia: number
  readonly canvasEnCuadro: number
  readonly objeto: Omit<Objeto, 'dentro'>
  readonly texto: { readonly bloques: number; readonly caja: readonly number[] | null; readonly fraccionDelAncho: number; readonly lado: Lado } | null
  readonly glifosSobreElObjeto: number
  readonly bloquesSobreElObjeto: number
  readonly bloques: readonly BloqueLeido[]
  readonly error: string | null
}

function ladoDe(texto: readonly number[], objeto: readonly number[]): Lado {
  if (objeto.length !== 4) return 'sin-objeto'
  const [tx0, , tx1] = texto
  const [ox0, , ox1] = objeto
  if (tx1 < ox0) return 'izquierda'
  if (tx0 > ox1) return 'derecha'
  if (tx0 < ox0 && tx1 > ox1) return 'ambos'
  return 'encima'
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const perfil = perfilDeB11('1920')
  const salida = await conLaPagina(
    perfil,
    '/',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      await new Promise((r) => setTimeout(r, 4000))
      const inventario = await medir<Inventario>(pagina, INVENTARIO)
      console.log(`documento ${inventario.altoDelDocumento} px · ${dos(inventario.altoDelDocumento / inventario.ventana)} pantallas · ${inventario.canvases.length} canvas`)
      const paradas: Parada[] = []
      const paso = inventario.ventana / 2
      for (let y = 0; y <= inventario.altoDelDocumento - inventario.ventana; y += paso) {
        const pantalla = dos(y / inventario.ventana)
        try {
          await scrollA(pagina, y)
          await esperarElPrimerCuadro(pagina)
          const real = await medir<number>(pagina, 'window.scrollY')
          if (Math.abs(real - y) > 2) throw new Error(`se pidió y=${y} y el scroll quedó en ${real}`)
          const leidos = (await medir<Bloque[]>(pagina, LECTOR_DE_BLOQUES_EN('[document.body]'))).filter((b) => b.enCuadro && b.opacidad * b.alfaDeColor > 0.5)
          const base = `${TEMP}/referencia-${y}`
          const rutas = { C: `${base}-C.png`, A: `${base}-A.png`, T: `${base}-T.png`, S: `${base}-S.png` }
          await capturar(pagina, rutas.C)
          const apagada = await medir<TintaApagada>(pagina, APAGAR_LA_TINTA(true))
          const rebeldes = new Set(apagada.rebeldes.map((r) => r.n))
          await capturar(pagina, rutas.A)
          await medir(pagina, APAGAR_LA_TINTA(false))
          const canvasEnCuadro = await medir<number>(pagina, `${CANVASES}.length`)
          if (canvasEnCuadro > 0) {
            if (!(await medir<boolean>(pagina, OCULTAR_NODOS(CANVASES, true)))) throw new Error('los canvas no quedaron ocultos')
            await capturar(pagina, rutas.T)
            await medir(pagina, OCULTAR_NODOS(CANVASES, false))
            const oculto = await medir<Ocultamiento>(pagina, OCULTAR_TODO_MENOS_INFORMANDO('[]', CANVASES, true))
            if (!oculto.conservados.every((c) => c.visibility === 'visible') || oculto.marcados === 0) throw new Error(`sus canvas no quedaron solos: ${JSON.stringify(oculto).slice(0, 200)}`)
            await esperarElPrimerCuadro(pagina, 300)
            await capturar(pagina, rutas.S)
            if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', CANVASES, false)))) throw new Error('no se restauró lo oculto')
          }
          const A = leerImagen(rutas.A)
          const T = canvasEnCuadro > 0 ? leerImagen(rutas.T) : leerImagen(rutas.C)
          const S = canvasEnCuadro > 0 ? leerImagen(rutas.S) : null
          const objeto: Objeto = S === null ? { area: 0, caja: [], fraccionDelAncho: 0, fraccionDelAlto: 0, fraccionDelCuadro: 0, dentro: new Uint8Array(0) } : objetoDe(S)
          const bloques: BloqueLeido[] = []
          for (const b of leidos) {
            if (rebeldes.has(b.n) || b.cajas.length === 0) continue
            const l = contrasteBajoElGlifoConOpacidad(T, A, b.cajas, b.tinta, b.opacidad * b.alfaDeColor, b.grande)
            if (l.pixelesDeGlifo === 0) continue
            bloques.push({
              etiqueta: b.etiqueta,
              texto: b.texto,
              tamanoPx: b.tamanoPx,
              opacidad: dos(b.opacidad * b.alfaDeColor),
              x: dos(Math.min(...b.cajas.map((c) => c.x))),
              y: dos(Math.min(...b.cajas.map((c) => c.y))),
              ancho: dos(Math.max(...b.cajas.map((c) => c.x + c.ancho)) - Math.min(...b.cajas.map((c) => c.x))),
              alto: dos(Math.max(...b.cajas.map((c) => c.y + c.alto)) - Math.min(...b.cajas.map((c) => c.y))),
              pixelesDeGlifo: l.pixelesDeGlifo,
              sobreElObjeto: objeto.area === 0 ? 0 : cuatro(fraccionSobreLaSilueta(l.mascara, objeto.dentro)),
              peorContraste: l.peorContraste,
              medianaContraste: l.medianaContraste,
              pasaAA: l.peorContraste >= l.umbralAA,
            })
          }
          const cajaDelTexto = bloques.length === 0 ? null : [Math.min(...bloques.map((b) => b.x)), Math.min(...bloques.map((b) => b.y)), Math.max(...bloques.map((b) => b.x + b.ancho)), Math.max(...bloques.map((b) => b.y + b.alto))]
          const glifos = bloques.reduce((n, b) => n + b.pixelesDeGlifo, 0)
          const glifosSobre = bloques.reduce((n, b) => n + b.pixelesDeGlifo * b.sobreElObjeto, 0)
          const parada: Parada = {
            scrollY: y,
            pantalla,
            salaLuminancia: S === null ? Number.NaN : mediaDeLaCaptura(S).luminancia,
            canvasEnCuadro,
            objeto: { area: objeto.area, caja: objeto.caja, fraccionDelAncho: objeto.fraccionDelAncho, fraccionDelAlto: objeto.fraccionDelAlto, fraccionDelCuadro: objeto.fraccionDelCuadro },
            texto: cajaDelTexto === null ? null : { bloques: bloques.length, caja: cajaDelTexto, fraccionDelAncho: cuatro((cajaDelTexto[2] - cajaDelTexto[0]) / perfil.ancho), lado: ladoDe(cajaDelTexto, objeto.caja) },
            glifosSobreElObjeto: glifos === 0 ? 0 : cuatro(glifosSobre / glifos),
            bloquesSobreElObjeto: bloques.filter((b) => b.sobreElObjeto > 0.05).length,
            bloques,
            error: null,
          }
          paradas.push(parada)
          console.log(
            `  ${String(pantalla).padStart(5)} (y=${String(y).padStart(5)})  sala lum ${Number.isNaN(parada.salaLuminancia) ? '  —  ' : parada.salaLuminancia.toFixed(4)} · objeto ${objeto.area === 0 ? 'ninguno' : `${(objeto.fraccionDelCuadro * 100).toFixed(1)} % del cuadro, x ${objeto.caja[0]}–${objeto.caja[2]} (${(objeto.fraccionDelAncho * 100).toFixed(0)} % del ancho)`} · texto ${parada.texto === null ? 'ninguno' : `${parada.texto.bloques} bloques, x ${Math.round(parada.texto.caja?.[0] ?? 0)}–${Math.round(parada.texto.caja?.[2] ?? 0)} (${(parada.texto.fraccionDelAncho * 100).toFixed(0)} % del ancho), ${parada.texto.lado}`} · glifos sobre el objeto ${(parada.glifosSobreElObjeto * 100).toFixed(1)} % (${parada.bloquesSobreElObjeto} bloques) · ${bloques.filter((b) => !b.pasaAA).length} bajo AA`,
          )
          if (pantalla % 1 === 0 && canvasEnCuadro > 0) {
            capturaPendiente(rutas.C, `referencia-${pantalla}-C.png`)
            capturaPendiente(rutas.S, `referencia-${pantalla}-S.png`)
          }
        } catch (e) {
          const mensaje = e instanceof Error ? e.message : String(e)
          console.log(`  ${String(pantalla).padStart(5)} (y=${String(y).padStart(5)})  FALLÓ: ${mensaje.slice(0, 160)}`)
          paradas.push({ scrollY: y, pantalla, salaLuminancia: Number.NaN, canvasEnCuadro: 0, objeto: { area: 0, caja: [], fraccionDelAncho: 0, fraccionDelAlto: 0, fraccionDelCuadro: 0 }, texto: null, glifosSobreElObjeto: 0, bloquesSobreElObjeto: 0, bloques: [], error: mensaje })
          try {
            await medir(pagina, APAGAR_LA_TINTA(false))
            await medir(pagina, OCULTAR_NODOS(CANVASES, false))
            await medir(pagina, OCULTAR_TODO_MENOS('[]', CANVASES, false))
          } catch {
            /* ya restaurado o no se pudo: se sigue */
          }
        }
      }
      return { origen: ORIGEN_DE_LA_REFERENCIA, perfil: perfil.id, inventario: { altoDelDocumento: inventario.altoDelDocumento, ventana: inventario.ventana, canvases: inventario.canvases }, paso, paradas }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO], origen: ORIGEN_DE_LA_REFERENCIA, msMaximo: 90_000, perfilDeChrome: 'b11-referencia' },
  )
  const conObjeto = salida.paradas.filter((p) => p.objeto.area > 0)
  const conTexto = conObjeto.filter((p) => p.texto !== null)
  console.log(`\n  paradas con objeto: ${conObjeto.length} de ${salida.paradas.length} · con objeto Y texto: ${conTexto.length}`)
  console.log(`  lados: ${['izquierda', 'derecha', 'encima', 'ambos'].map((l) => `${l} ${conTexto.filter((p) => p.texto?.lado === l).length}`).join(' · ')}`)
  console.log(`  ancho del texto (mediana de las paradas con texto): ${(median(conTexto.map((p) => p.texto?.fraccionDelAncho ?? 0)) * 100).toFixed(0)} % · del objeto: ${(median(conObjeto.map((p) => p.objeto.fraccionDelAncho)) * 100).toFixed(0)} %`)
  console.log(`  paradas en las que algún glifo cae sobre el objeto: ${conTexto.filter((p) => p.glifosSobreElObjeto > 0.01).length} · fracción máxima ${(Math.max(0, ...conTexto.map((p) => p.glifosSobreElObjeto)) * 100).toFixed(1)} %`)
  jsonPendiente('referencia-nk-1920', salida)
  for (const r of mudarPendientes()) console.log(`escrito: ${r}`)
}

function median(v: readonly number[]): number {
  if (v.length === 0) return Number.NaN
  const o = v.slice().sort((a, b) => a - b)
  return o[Math.floor(o.length / 2)]
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
