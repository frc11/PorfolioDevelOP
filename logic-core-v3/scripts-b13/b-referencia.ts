/**
 * B · LA REFERENCIA, MEDIDA COMO FUENTE DE LUZ — una navegación, una medición.
 *
 *     npx tsx scripts-b13/b-referencia.ts
 *
 * ── Las cuatro preguntas de §1.2, y cómo se contesta cada una ─────────────
 *
 * | pregunta | cómo |
 * |---|---|
 * | **la luminancia de su barra contra la de su fondo** | la silueta del objeto sale de S (su canvas solo): lo que se aparta de la mediana del cuadro, sin partículas. Se publica la luminancia ADENTRO de la silueta (p05/p50/p95) y AFUERA (la sala), y su razón de contraste |
 * | **si aporta luz al entorno** | los ANILLOS: la luminancia media de la sala en cuatro coronas alrededor de la silueta (1–5 px, 6–15, 16–40, 41–100) contra la del resto del cuadro. Un objeto que sólo brilla deja los cuatro anillos iguales al fondo; uno que ILUMINA deja un gradiente que baja con la distancia |
 * | **qué fracción del cuadro ocupa** | el área de la silueta sobre el cuadro, parada por parada |
 * | **el contraste de su texto cuando cae encima** | la máscara de glifo de `glifo-alfa.ts` (la misma que firma nuestras cifras) cruzada con la silueta, y el peor píxel bajo esos glifos |
 *
 * ── Lo que NO hace ────────────────────────────────────────────────────────
 *
 * **No copia nada**: ni un selector, ni una clase, ni un valor de CSS, ni un
 * asset. Es UNA navegación con scroll adentro, se cierra la pestaña, y lo que
 * queda son números escritos con nuestras palabras. El paso es media pantalla,
 * el mismo de `scripts-b11/c-referencia.ts`, para que la fracción del cuadro y
 * el contraste se puedan cruzar con lo que aquel bloque publicó.
 *
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
import { partirPorTamano } from '../scripts-b11/mapa'

import { cuatro, dos, escribirJson, perfilDeB13, red } from './b13-comun'

const ORIGEN_DE_LA_REFERENCIA = 'https://www.nk.studio'

/** Los cuatro anillos, en píxeles de distancia a la silueta. */
const ANILLOS: readonly (readonly [number, number])[] = [
  [1, 5],
  [6, 15],
  [16, 40],
  [41, 100],
]

function luminanciaDe(datos: Uint8Array | Uint8ClampedArray, k: number): number {
  const lin = (c: number): number => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(datos[k]) + 0.7152 * lin(datos[k + 1]) + 0.0722 * lin(datos[k + 2])
}

function contrasteEntre(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

interface Silueta {
  readonly area: number
  readonly caja: readonly number[]
  readonly fraccionDelCuadro: number
  readonly dentro: Uint8Array
}

/** El objeto de su escena: la componente grande más grande que se aparta de la mediana. */
function objetoDe(S: Imagen): Silueta {
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
  return {
    area: mejor?.n ?? 0,
    caja: mejor?.caja ?? [],
    fraccionDelCuadro: cuatro((mejor?.n ?? 0) / total),
    dentro,
  }
}

/**
 * LA DISTANCIA DE CADA PÍXEL A LA SILUETA, por dilataciones sucesivas. Es lo
 * que convierte «¿hay halo?» en cuatro números en vez de en una opinión.
 */
function distancias(dentro: Uint8Array, ancho: number, alto: number, maximo: number): Int16Array {
  const d = new Int16Array(ancho * alto).fill(-1)
  let frente: number[] = []
  for (let i = 0; i < dentro.length; i += 1) {
    if (dentro[i] === 1) {
      d[i] = 0
      frente.push(i)
    }
  }
  for (let paso = 1; paso <= maximo && frente.length > 0; paso += 1) {
    const siguiente: number[] = []
    for (const k of frente) {
      const x = k % ancho
      const y = (k - x) / ancho
      for (const v of [x > 0 ? k - 1 : -1, x < ancho - 1 ? k + 1 : -1, y > 0 ? k - ancho : -1, y < alto - 1 ? k + ancho : -1]) {
        if (v >= 0 && d[v] === -1) {
          d[v] = paso
          siguiente.push(v)
        }
      }
    }
    frente = siguiente
  }
  return d
}

interface Parada {
  readonly scrollY: number
  readonly pantalla: number
  readonly canvasEnCuadro: number
  readonly objeto: { readonly area: number; readonly caja: readonly number[]; readonly fraccionDelCuadro: number }
  /** La luminancia ADENTRO de la silueta. */
  readonly barra: { readonly p05: number; readonly p50: number; readonly p95: number } | null
  /** La luminancia de la SALA (todo lo que no es la silueta). */
  readonly sala: { readonly p05: number; readonly p50: number; readonly p95: number; readonly media: number }
  readonly contrasteBarraSala: number
  /** Los cuatro anillos: la luminancia media de la sala a esa distancia de la silueta. */
  readonly anillos: readonly (number | null)[]
  /** El resto del cuadro, más allá del último anillo. La línea de base del halo. */
  readonly lejos: number | null
  readonly glifosSobreElObjeto: number
  readonly bloquesSobreElObjeto: number
  readonly peorSobreElObjeto: number | null
  readonly error: string | null
}

function percentiles(valores: Float64Array): { readonly p05: number; readonly p50: number; readonly p95: number } {
  const o = valores.slice()
  o.sort()
  const q = (p: number) => o[Math.min(o.length - 1, Math.max(0, Math.round(p * (o.length - 1))))]
  return { p05: red(q(0.05), 5), p50: red(q(0.5), 5), p95: red(q(0.95), 5) }
}

async function principal(): Promise<void> {
  const perfil = perfilDeB13('1920')
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
          const base = `.b13-capturas/ref-${y}`
          const rutas = { A: `${base}-A.png`, T: `${base}-T.png`, S: `${base}-S.png` }
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
            if (!oculto.conservados.every((c) => c.visibility === 'visible') || oculto.marcados === 0) throw new Error('sus canvas no quedaron solos')
            await esperarElPrimerCuadro(pagina, 300)
            await capturar(pagina, rutas.S)
            if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', CANVASES, false)))) throw new Error('no se restauró lo oculto')
          }
          const A = leerImagen(rutas.A)
          const T = canvasEnCuadro > 0 ? leerImagen(rutas.T) : A
          const S = canvasEnCuadro > 0 ? leerImagen(rutas.S) : null
          const objeto: Silueta = S === null ? { area: 0, caja: [], fraccionDelCuadro: 0, dentro: new Uint8Array(0) } : objetoDe(S)

          let barra: Parada['barra'] = null
          let sala = { p05: 0, p50: 0, p95: 0, media: 0 }
          const anillos: (number | null)[] = ANILLOS.map(() => null)
          let lejos: number | null = null
          if (S !== null) {
            const total = S.ancho * S.alto
            const dentroVals: number[] = []
            const fueraVals: number[] = []
            const lum = new Float64Array(total)
            for (let i = 0; i < total; i += 1) {
              lum[i] = luminanciaDe(S.datos, i * 4)
              if (objeto.dentro.length > 0 && objeto.dentro[i] === 1) dentroVals.push(lum[i])
              else fueraVals.push(lum[i])
            }
            if (dentroVals.length > 0) barra = percentiles(Float64Array.from(dentroVals))
            const pf = percentiles(Float64Array.from(fueraVals))
            let suma = 0
            for (const v of fueraVals) suma += v
            sala = { ...pf, media: red(suma / Math.max(1, fueraVals.length), 5) }
            if (objeto.area > 0) {
              const d = distancias(objeto.dentro, S.ancho, S.alto, ANILLOS[ANILLOS.length - 1][1])
              const sumas = ANILLOS.map(() => 0)
              const cuentas = ANILLOS.map(() => 0)
              let sumaLejos = 0
              let cuentaLejos = 0
              for (let i = 0; i < total; i += 1) {
                if (objeto.dentro[i] === 1) continue
                const dist = d[i]
                if (dist === -1) {
                  sumaLejos += lum[i]
                  cuentaLejos += 1
                  continue
                }
                for (let a = 0; a < ANILLOS.length; a += 1) {
                  if (dist >= ANILLOS[a][0] && dist <= ANILLOS[a][1]) {
                    sumas[a] += lum[i]
                    cuentas[a] += 1
                    break
                  }
                }
              }
              for (let a = 0; a < ANILLOS.length; a += 1) anillos[a] = cuentas[a] === 0 ? null : red(sumas[a] / cuentas[a], 5)
              lejos = cuentaLejos === 0 ? null : red(sumaLejos / cuentaLejos, 5)
            }
          }

          let glifos = 0
          let glifosSobre = 0
          let bloquesSobre = 0
          let peor: number | null = null
          for (const b of leidos) {
            if (rebeldes.has(b.n) || b.cajas.length === 0) continue
            const l = contrasteBajoElGlifoConOpacidad(T, A, b.cajas, b.tinta, b.opacidad * b.alfaDeColor, b.grande)
            if (l.pixelesDeGlifo === 0) continue
            const sobre = objeto.area === 0 ? 0 : fraccionSobreLaSilueta(l.mascara, objeto.dentro)
            glifos += l.pixelesDeGlifo
            glifosSobre += l.pixelesDeGlifo * sobre
            if (sobre > 0.05) {
              bloquesSobre += 1
              peor = peor === null ? l.peorContraste : Math.min(peor, l.peorContraste)
            }
          }

          const parada: Parada = {
            scrollY: y,
            pantalla,
            canvasEnCuadro,
            objeto: { area: objeto.area, caja: objeto.caja, fraccionDelCuadro: objeto.fraccionDelCuadro },
            barra,
            sala,
            contrasteBarraSala: barra === null ? Number.NaN : red(contrasteEntre(barra.p50, sala.p50), 2),
            anillos,
            lejos,
            glifosSobreElObjeto: glifos === 0 ? 0 : cuatro(glifosSobre / glifos),
            bloquesSobreElObjeto: bloquesSobre,
            peorSobreElObjeto: peor === null ? null : red(peor, 2),
            error: null,
          }
          paradas.push(parada)
          console.log(
            `  ${String(pantalla).padStart(5)}  objeto ${objeto.area === 0 ? '  —  ' : `${(objeto.fraccionDelCuadro * 100).toFixed(2).padStart(5)} %`} · ` +
              `barra ${barra === null ? '  —   ' : barra.p50.toFixed(4)} · sala ${sala.p50.toFixed(4)} · ` +
              `C ${Number.isNaN(parada.contrasteBarraSala) ? ' — ' : parada.contrasteBarraSala.toFixed(2).padStart(6)} · ` +
              `anillos ${anillos.map((a) => (a === null ? '  —   ' : a.toFixed(4))).join(' ')} lejos ${lejos === null ? '  —   ' : lejos.toFixed(4)} · ` +
              `glifos sobre ${(parada.glifosSobreElObjeto * 100).toFixed(1)} % (${bloquesSobre} bl${peor === null ? '' : `, peor ${peor.toFixed(2)}`})`,
          )
        } catch (e) {
          const mensaje = e instanceof Error ? e.message : String(e)
          console.log(`  ${String(pantalla).padStart(5)}  FALLÓ: ${mensaje.slice(0, 140)}`)
          paradas.push({
            scrollY: y, pantalla, canvasEnCuadro: 0,
            objeto: { area: 0, caja: [], fraccionDelCuadro: 0 },
            barra: null, sala: { p05: 0, p50: 0, p95: 0, media: 0 }, contrasteBarraSala: Number.NaN,
            anillos: ANILLOS.map(() => null), lejos: null,
            glifosSobreElObjeto: 0, bloquesSobreElObjeto: 0, peorSobreElObjeto: null, error: mensaje,
          })
          try {
            await medir(pagina, APAGAR_LA_TINTA(false))
            await medir(pagina, OCULTAR_NODOS(CANVASES, false))
            await medir(pagina, OCULTAR_TODO_MENOS('[]', CANVASES, false))
          } catch {
            /* ya restaurado o no se pudo: se sigue */
          }
        }
      }
      return { origen: ORIGEN_DE_LA_REFERENCIA, perfil: perfil.id, cuando: new Date().toISOString(), anillos: ANILLOS, paso, paradas }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO], origen: ORIGEN_DE_LA_REFERENCIA, msMaximo: 90_000, perfilDeChrome: 'b13-referencia' },
  )
  const conObjeto = salida.paradas.filter((p) => p.objeto.area > 0 && p.barra !== null)
  console.log(`\n  paradas con objeto: ${conObjeto.length} de ${salida.paradas.length}`)
  if (conObjeto.length > 0) {
    const f = conObjeto.map((p) => p.objeto.fraccionDelCuadro)
    const c = conObjeto.map((p) => p.contrasteBarraSala)
    console.log(`  fracción del cuadro: ${(Math.min(...f) * 100).toFixed(2)} % a ${(Math.max(...f) * 100).toFixed(2)} %`)
    console.log(`  contraste barra/sala: ${Math.min(...c).toFixed(2)}:1 a ${Math.max(...c).toFixed(2)}:1`)
    console.log(`  ¿la barra es MÁS CLARA que su sala? ${conObjeto.filter((p) => (p.barra?.p50 ?? 0) > p.sala.p50).length} de ${conObjeto.length} paradas`)
  }
  console.log(`\nescrito (pendiente de mover a docs/ con el navegador cerrado): ${JSON.stringify(salida.paradas.length)} paradas`)
  escribirJson('referencia-emision-nk-1920', salida)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
