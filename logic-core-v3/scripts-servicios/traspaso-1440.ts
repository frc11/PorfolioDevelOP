/**
 * EL TRASPASO DE SERVICIOS A 1440 — cuadro a cuadro, ida y vuelta.
 *
 * ── ⚠️ POR QUÉ NO ALCANZA CON `pin-1440.ts` ───────────────────────────────
 *
 * Ese banco recorre el pin moviendo el scroll y sacando una foto por parada.
 * Mide **mesetas**: entre foto y foto el scroll saltó ~37 px y el traspaso —que
 * dura `DURACION_DEL_DISPARO` segundos de RELOJ, no de scroll— ya terminó. Con
 * ese instrumento, un defecto que sólo existe DURANTE el cambio se reporta en
 * verde: fue exactamente lo que pasó con «desplazamiento en los tres estados:
 * 0,00 px», que dio por buena una torta que orbitaba 38 px en el medio.
 *
 * Acá el scroll se para ANTES de una frontera, la cruza de un salto, y **se
 * queda quieto** mientras un muestreador que vive adentro de la página anota un
 * renglón por cuadro de `requestAnimationFrame` hasta que el disparo termina.
 * El bucle no cruza el puente CDP, así que muestrea a 60 Hz de verdad.
 *
 * ── Las fronteras no se escriben: se buscan ───────────────────────────────
 *
 * `fronterasDeEstado` las deriva de la geometría medida en el navegador, así que
 * acá no se pueden importar. Se barre el pin a pasos gruesos leyendo en qué
 * estado quedó el rodillo, y cada cambio se acota bisecando. Lo que el recibo
 * publica es dónde las encontró, no dónde deberían estar.
 *
 * ── Dos pasadas por frontera, y el motivo ─────────────────────────────────
 *
 * `Page.captureScreenshot` tarda ~100 ms: sacar una foto por cuadro bajaría el
 * muestreo a 10 Hz y el recibo mediría el instrumento. Así que cada frontera se
 * cruza DOS veces — una para los números, a 60 Hz y sin fotos; otra para la
 * película, a la velocidad que la captura sostenga, con el tiempo real de cada
 * cuadro anotado al lado. Ningún cuadro de la película entra al repo: se
 * escriben en el TEMP del sistema y el directorio se borra en el `finally`,
 * porque `docs/` no está en `.gitignore` y el escaneo de Tailwind 4 lee todo lo
 * que no esté excluido.
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { capturar } from '../scripts-b4/captura'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import {
  abrirPagina,
  cerrarPagina,
  emular,
  irA,
  medir,
  scrollA,
  verificarLaPagina,
  type Pagina,
} from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'
import { decodificarPng } from '../scripts-b4/png'

const ORIGEN = 'http://localhost:3006'
const SALIDAS = 'docs/rediseno/outputs/servicios'
const PELICULA = `${SALIDAS}/traspaso-1440.mp4`
const RECIBO = `${SALIDAS}/traspaso-1440-cuadros.json`

/** Cuánto dura el muestreo de un traspaso. El disparo dura 1,4 s; esto lo cubre. */
const MS_DEL_MUESTREO = 2000

/** El paso grueso del barrido que busca las fronteras, y cuántas bisecciones. */
const PASO_DEL_BARRIDO = 150
const BISECCIONES = 5

/** Cuánto antes de la frontera se estaciona, y cuánto la cruza el salto. */
const ANTES_DE_LA_FRONTERA = 40
const SALTO = 90

/**
 * Cuándo cae el medio del giro, desde que se cruza la frontera. El disparo dura
 * 1,4 s sobre una curva simétrica, así que la mitad del camino cae en la mitad
 * del tiempo; se le restan los ~100 ms que tarda la captura en salir.
 */
const MS_DEL_MEDIO_DEL_GIRO = 620

/** Lo que tarda el rodillo en asentarse: más que `DURACION_DEL_DISPARO`. */
const ASENTADO_MS = 1700

/** Cuadros por segundo de la película. */
const FPS = 10

/**
 * El radio, en unidades del `viewBox`, del punto que sirve de control positivo.
 * Es el `RADIO` de `GraficoDeTorta`, y acá va suelto a propósito: un banco que
 * importa la constante que después verifica no verifica nada.
 */
const RADIO_SONDA = 82

const LECTOR_DE_LA_SECCION = `(() => {
  const s = document.querySelector('#servicios')
  if (s === null) return null
  const r = s.getBoundingClientRect()
  return { top: Math.round(r.top + window.scrollY), alto: Math.round(r.height), ventana: window.innerHeight }
})()`

/**
 * LA SONDA — un renglón del recibo.
 *
 * ⚠️ El centro del disco se lee del **CTM**, no de una caja. Aplicarle la matriz
 * de pantalla al punto `0 0` del espacio de usuario del SVG da dónde cae en
 * pantalla el centro de la torta, con el giro adentro: si el giro fuera sobre su
 * propio eje, ese punto no se mueve un píxel. Y aplicar una matriz a `(0,0)` es
 * leerle `e` y `f`, así que es exacto y no tiene redondeo.
 *
 * ⚠️ **Y por eso va también el BORDE, que es el control positivo.** Un centro
 * quieto es lo que se quiere afirmar y también lo que devolvería un instrumento
 * ciego: el giro lo lleva ahora un ancestro de HTML, y si el CTM no lo viera, el
 * centro daría 0 de dispersión por no ver nada. El punto `(RADIO, 0)` del mismo
 * espacio tiene que RECORRER — su dispersión es la prueba de que la sonda ve la
 * rotación que el centro dice no sufrir.
 */
const SONDA = `function () {
  const svg = document.querySelector('[data-pieza="torta"]')
  const giro = document.querySelector('[data-pieza="giro-de-la-torta"]')
  const caja = document.querySelector('[data-rodillo="estados"]')
  const tira = caja === null ? null : caja.querySelector(':scope > div')
  const cta = document.querySelector('[data-pieza="cta-que-rota"]')
  const cajaR = caja === null ? null : caja.getBoundingClientRect()
  const m = svg === null ? null : svg.getScreenCTM()
  const cs = giro === null ? null : getComputedStyle(giro)
  const reglas = caja === null ? [] : Array.from(caja.querySelectorAll('[data-fila="rotulo"] > span:last-child'))
  return {
    centro: m === null ? null : [+m.e.toFixed(4), +m.f.toFixed(4)],
    borde: m === null ? null : [+(m.a * ${RADIO_SONDA} + m.e).toFixed(4), +(m.b * ${RADIO_SONDA} + m.f).toFixed(4)],
    transform: cs === null ? null : cs.transform,
    rodillo: tira === null ? null : getComputedStyle(tira).transform,
    servicioDelCta: cta === null ? null : cta.getAttribute('data-servicio'),
    colorDelCta: cta === null ? null : getComputedStyle(cta).color,
    reglas: reglas.map(function (r) {
      const b = r.getBoundingClientRect()
      const dentro = cajaR === null ? 0 : Math.max(0, Math.min(b.bottom, cajaR.bottom) - Math.max(b.top, cajaR.top))
      return { dentro: +dentro.toFixed(3), desdeElTope: cajaR === null ? 0 : +(b.top - cajaR.top).toFixed(3) }
    }),
  }
}`

interface Regla {
  readonly dentro: number
  readonly desdeElTope: number
}

interface Muestra {
  readonly ms: number
  readonly centro: readonly [number, number] | null
  readonly borde: readonly [number, number] | null
  readonly transform: string | null
  readonly rodillo: string | null
  readonly servicioDelCta: string | null
  readonly colorDelCta: string | null
  readonly reglas: readonly Regla[]
}

interface Seccion {
  readonly top: number
  readonly alto: number
  readonly ventana: number
}

/** En qué estado quedó el rodillo, asentado. Es la traslación de su tira. */
async function estadoAsentado(pagina: Pagina, y: number): Promise<number> {
  await scrollA(pagina, y)
  return medir<number>(
    pagina,
    `(async () => {
      await new Promise((r) => setTimeout(r, ${ASENTADO_MS}))
      const caja = document.querySelector('[data-rodillo="estados"]')
      const tira = caja === null ? null : caja.querySelector(':scope > div')
      if (tira === null) return 0
      const m = new DOMMatrix(getComputedStyle(tira).transform)
      return Math.round(m.f)
    })()`,
  )
}

/** Muestrea un traspaso a 60 Hz, sin fotos: el bucle vive adentro de la página. */
async function muestrear(pagina: Pagina, destino: number): Promise<readonly Muestra[]> {
  return medir<readonly Muestra[]>(
    pagina,
    `(async () => {
      const sonda = ${SONDA}
      window.scrollTo(0, ${destino})
      const t0 = performance.now()
      const filas = []
      await new Promise((resolver) => {
        const paso = () => {
          const t = performance.now() - t0
          filas.push(Object.assign({ ms: +t.toFixed(1) }, sonda()))
          if (t >= ${MS_DEL_MUESTREO}) resolver()
          else requestAnimationFrame(paso)
        }
        requestAnimationFrame(paso)
      })
      return filas
    })()`,
  )
}

/** La dispersión de una serie: cuánto se movió entre su mínimo y su máximo. */
function dispersion(valores: readonly number[]): number {
  return valores.length === 0 ? 0 : Math.max(...valores) - Math.min(...valores)
}

/**
 * LA HUELLA PINTADA DE LA TORTA — la prueba de que no quedó un disco de más.
 *
 * Se decodifica una captura y se buscan los píxeles que no son papel. Un disco
 * plano deja una huella **simétrica respecto de su centro**; un canto corrido
 * `ESPESOR` unidades hacia abajo la alarga por abajo y por nada más. Así que lo
 * que se publica es cuánto sobresale la tinta en las cuatro direcciones: si
 * difieren, hay algo dibujado de más.
 *
 * ── ⚠️ DÓNDE SE MIDE, Y POR QUÉ NO EN UNA MESETA ──────────────────────────
 *
 * En una meseta hay una porción despegada y crecida, así que la huella es
 * asimétrica **a propósito** y no discrimina nada. En el MEDIO del giro las
 * tres están chicas y en su lugar —la salida termina en `SALIDA_DE_LA_PORCION`
 * y la entrada recién empieza en `1 − ENTRADA_DE_LA_PORCION`—, o sea que ahí la
 * torta es un disco limpio y las cuatro medidas tienen que dar lo mismo.
 *
 * ⚠️ Y el recuadro **no** es la caja del envoltorio: ése es el AABB de un
 * cuadrado rotado, mide 438 px de lado y se come el rótulo y el botón, que
 * entran como tinta ajena. Se recorta un cuadrado del lado del SVG centrado en
 * el disco, y el lado sale de la escala del CTM, no de una caja que la rotación
 * mueve.
 *
 * ── ⚠️ Y EL RECORTE VA EN COORDENADAS DE PÁGINA, NO DE VENTANA ────────────
 *
 * `capturar` pasa `captureBeyondViewport`, y con eso el `clip` de
 * `Page.captureScreenshot` se mide **desde el origen del documento**. Todo lo
 * que da el DOM —`getBoundingClientRect`, `getScreenCTM`— está en coordenadas
 * de VENTANA. Pasarlas derecho recorta en otro lado de la página y **no falla**:
 * acá, con el scroll en 12.607, el recorte de `y = 359` fotografió el hero y
 * devolvió una huella de 140 px arriba contra 74 abajo, que se lee como un
 * disco corrido y es texto. Por eso se le suma el scroll, y por eso la medida
 * publica el radio ESPERADO al lado del medido: una huella que no se parece a
 * un disco es señal de que el recorte cayó en otro lado, no de que el dibujo
 * esté mal.
 */
async function huellaDeLaTorta(pagina: Pagina, ruta: string, destino: number, msDelDisparo: number): Promise<unknown> {
  const marco = await medir<{
    x: number
    y: number
    w: number
    h: number
    cx: number
    cy: number
    escala: number
    scrollX: number
    scrollY: number
  } | null>(
    pagina,
    `(async () => {
      const svg = document.querySelector('[data-pieza="torta"]')
      if (svg === null) return null
      const m0 = svg.getScreenCTM()
      if (m0 === null) return null
      const escala = Math.hypot(m0.a, m0.b)
      const lado = Math.round(${2 * 120.84} * escala)
      window.scrollTo(0, ${destino})
      await new Promise((r) => setTimeout(r, ${msDelDisparo}))
      const m = svg.getScreenCTM()
      if (m === null) return null
      return {
        x: Math.round(m.e - lado / 2 + window.scrollX),
        y: Math.round(m.f - lado / 2 + window.scrollY),
        w: lado,
        h: lado,
        cx: m.e,
        cy: m.f,
        escala: +escala.toFixed(4),
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      }
    })()`,
  )
  if (marco === null) return null
  await capturar(pagina, ruta, { x: marco.x, y: marco.y, width: marco.w, height: marco.h })
  const img = decodificarPng(readFileSync(ruta))
  // El papel es el píxel de la esquina: la torta nunca llega a las esquinas del
  // recuadro, así que sale de la imagen y no hay que escribir un color acá.
  const fondo = [img.datos[0], img.datos[1], img.datos[2]]
  let arriba = Number.POSITIVE_INFINITY
  let abajo = Number.NEGATIVE_INFINITY
  let izq = Number.POSITIVE_INFINITY
  let der = Number.NEGATIVE_INFINITY
  for (let py = 0; py < img.alto; py += 1) {
    for (let px = 0; px < img.ancho; px += 1) {
      const i = (py * img.ancho + px) * 4
      const d =
        Math.abs(img.datos[i] - fondo[0]) +
        Math.abs(img.datos[i + 1] - fondo[1]) +
        Math.abs(img.datos[i + 2] - fondo[2])
      if (d > 12) {
        if (py < arriba) arriba = py
        if (py > abajo) abajo = py
        if (px < izq) izq = px
        if (px > der) der = px
      }
    }
  }
  // El centro DENTRO del recorte: el marco ya está en coordenadas de página, así
  // que se le resta el mismo scroll que se le sumó.
  const cy = marco.cy - marco.y + marco.scrollY
  const cx = marco.cx - marco.x + marco.scrollX
  return {
    recuadro: marco,
    radioEsperado: +(RADIO_SONDA * marco.escala).toFixed(2),
    centroEnElRecuadro: { x: +cx.toFixed(2), y: +cy.toFixed(2) },
    sobresaleArriba: +(cy - arriba).toFixed(2),
    sobresaleAbajo: +(abajo - cy).toFixed(2),
    sobresaleIzquierda: +(cx - izq).toFixed(2),
    sobresaleDerecha: +(der - cx).toFixed(2),
  }
}

async function principal(): Promise<void> {
  const perfil = perfilPorId('1440')
  mkdirSync(SALIDAS, { recursive: true })
  const cuadros = mkdtempSync(join(tmpdir(), 'traspaso-1440-'))

  const chrome = await lanzarChrome({ perfil: perfilDeChrome('servicios'), ancho: perfil.ancho, alto: perfil.alto })
  try {
    const pagina = await abrirPagina(chrome)
    await emular(pagina, perfil)
    await irA(pagina, `${ORIGEN}/v3`)
    const estado = await verificarLaPagina(pagina, perfil)
    if (estado.visibilityState !== 'visible' || estado.innerWidth === 0) {
      throw new Error(`pestaña no visible (${estado.visibilityState}, ${estado.innerWidth} px): el recibo no vale`)
    }

    const seccion = await medir<Seccion | null>(pagina, LECTOR_DE_LA_SECCION)
    if (seccion === null) throw new Error('no se encontró #servicios en el documento')
    const pin = seccion.alto - seccion.ventana
    const arranque = seccion.top
    const final = seccion.top + pin

    // ── Buscar las fronteras: barrido grueso y bisección ───────────────────
    const barrido: { y: number; estado: number }[] = []
    for (let y = arranque; y <= final; y += PASO_DEL_BARRIDO) {
      barrido.push({ y, estado: await estadoAsentado(pagina, y) })
    }
    const fronteras: number[] = []
    for (let i = 1; i < barrido.length; i += 1) {
      if (barrido[i].estado === barrido[i - 1].estado) continue
      let bajo = barrido[i - 1].y
      let alto = barrido[i].y
      const estadoBajo = barrido[i - 1].estado
      for (let k = 0; k < BISECCIONES; k += 1) {
        const medio = Math.round((bajo + alto) / 2)
        if ((await estadoAsentado(pagina, medio)) === estadoBajo) bajo = medio
        else alto = medio
      }
      fronteras.push(alto)
    }
    console.log(`fronteras encontradas: ${fronteras.join(', ')} (pin ${arranque} → ${final})`)

    // ── Los traspasos: cada frontera de bajada y después de subida ─────────
    const traspasos: { nombre: string; desde: number; hasta: number }[] = []
    for (const f of fronteras) {
      traspasos.push({ nombre: `baja@${f}`, desde: f - ANTES_DE_LA_FRONTERA, hasta: f + SALTO })
    }
    for (const f of [...fronteras].reverse()) {
      traspasos.push({ nombre: `sube@${f}`, desde: f + ANTES_DE_LA_FRONTERA, hasta: f - SALTO })
    }

    const filas: unknown[] = []
    let n = 0
    for (const t of traspasos) {
      await estadoAsentado(pagina, t.desde)
      const muestras = await muestrear(pagina, t.hasta)
      const centros = muestras.filter((m) => m.centro !== null)
      const xs = centros.map((m) => (m.centro as readonly [number, number])[0])
      const ys = centros.map((m) => (m.centro as readonly [number, number])[1])
      const bordes = muestras.filter((m) => m.borde !== null)
      const bx = bordes.map((m) => (m.borde as readonly [number, number])[0])
      const by = bordes.map((m) => (m.borde as readonly [number, number])[1])
      const dosReglas = muestras.filter((m) => m.reglas.filter((r) => r.dentro > 0).length > 1)
      const servicios = [...new Set(muestras.map((m) => m.servicioDelCta))]
      const colores = [...new Set(muestras.map((m) => m.colorDelCta))]
      const msDelCambioDeColor = muestras.find((m) => m.colorDelCta !== muestras[0].colorDelCta)?.ms ?? null
      const msDelCambioDeRodillo = muestras.find((m) => m.rodillo !== muestras[0].rodillo)?.ms ?? null

      // La película: se vuelve a cruzar, ahora con fotos.
      await estadoAsentado(pagina, t.desde)
      const pelicula: unknown[] = []
      const t0 = Date.now()
      await medir(pagina, `(() => { window.scrollTo(0, ${t.hasta}); return 1 })()`)
      while (Date.now() - t0 < MS_DEL_MUESTREO) {
        const destino = join(cuadros, `${String(n).padStart(3, '0')}.png`)
        const bytes = await capturar(pagina, destino)
        pelicula.push({ n, ms: Date.now() - t0, bytes })
        n += 1
      }

      filas.push({
        traspaso: t.nombre,
        desde: t.desde,
        hasta: t.hasta,
        muestras: muestras.length,
        hz: +((muestras.length * 1000) / MS_DEL_MUESTREO).toFixed(1),
        centroDelDisco: {
          primero: centros[0]?.centro ?? null,
          ultimo: centros[centros.length - 1]?.centro ?? null,
          dispersionX: +dispersion(xs).toFixed(4),
          dispersionY: +dispersion(ys).toFixed(4),
        },
        // El control positivo: si esto no recorre, la sonda está ciega al giro.
        bordeDelDisco: {
          dispersionX: +dispersion(bx).toFixed(4),
          dispersionY: +dispersion(by).toFixed(4),
        },
        rodillo: { msDelPrimerCambio: msDelCambioDeRodillo },
        cta: { servicios, colores, msDelCambioDeColor },
        subrayados: {
          cuadrosConMasDeUno: dosReglas.length,
          maximoSimultaneo: Math.max(...muestras.map((m) => m.reglas.filter((r) => r.dentro > 0).length)),
          peorAsomo: +Math.max(
            0,
            ...dosReglas.flatMap((m) =>
              m.reglas
                .filter((r) => r.dentro > 0)
                .map((r) => r.dentro)
                .slice(1),
            ),
          ).toFixed(3),
        },
        cuadrosDePelicula: pelicula.length,
        pelicula,
        muestrasCrudas: muestras,
      })
      console.log(
        `${t.nombre}: ${muestras.length} muestras, centro Δx ${dispersion(xs).toFixed(4)} Δy ${dispersion(ys).toFixed(4)}, ` +
          `borde Δx ${dispersion(bx).toFixed(1)} Δy ${dispersion(by).toFixed(1)}, ` +
          `subrayados de más ${dosReglas.length}, color cambia a los ${msDelCambioDeColor ?? '—'} ms`,
      )
    }

    // La huella pintada, en el MEDIO de un giro: ahí la torta es un disco limpio.
    const ultima = fronteras[fronteras.length - 1]
    await estadoAsentado(pagina, ultima - ANTES_DE_LA_FRONTERA)
    const huella = await huellaDeLaTorta(pagina, join(cuadros, 'torta.png'), ultima + SALTO, MS_DEL_MEDIO_DEL_GIRO)
    console.log(`huella de la torta: ${JSON.stringify(huella)}`)

    await cerrarPagina(pagina)

    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-framerate',
        String(FPS),
        '-i',
        join(cuadros, '%03d.png'),
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-crf',
        '20',
        '-movflags',
        '+faststart',
        PELICULA,
      ],
      { stdio: 'ignore' },
    )

    writeFileSync(
      RECIBO,
      `${JSON.stringify(
        {
          que: 'los traspasos de servicios a 1440, cuadro a cuadro, bajando y subiendo',
          cuando: new Date().toISOString(),
          origen: `${ORIGEN}/v3`,
          perfil: perfil.id,
          pelicula: PELICULA,
          fps: FPS,
          estado,
          seccion,
          pin,
          fronteras,
          // El barrido crudo: dónde se leyó cada estado, para poder discutir
          // cuánto dura cada uno sin volver a correr el banco.
          barrido,
          msDelMuestreo: MS_DEL_MUESTREO,
          huellaDeLaTorta: huella,
          filas,
        },
        null,
        2,
      )}\n`,
      'utf8',
    )
    console.log(`${n} cuadros de película → ${PELICULA} · recibo → ${RECIBO}`)
  } finally {
    await cerrarChrome(chrome)
    rmSync(cuadros, { recursive: true, force: true })
  }
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
