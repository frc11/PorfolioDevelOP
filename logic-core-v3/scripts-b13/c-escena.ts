/**
 * C · EL LOGO EN LA ESCENA REAL — lo que el modelo no puede contestar.
 *
 *     npx tsx scripts-b13/c-escena.ts --etiqueta=antes --perfil=1440,1920
 *
 * ── Por qué esta medición existe si ya hay un modelo ──────────────────────
 *
 * Porque el modelo de `shading.ts` **no incluye el lóbulo especular**, y el
 * especular es exactamente lo que le da forma a una pieza negra: `probeScene.ts`
 * lo dice con su número —el albedo de la tinta es 0,0046 en lineal, así que «lo
 * único que dibuja su volumen es el reflejo especular»— y `INK_ROUGHNESS` está
 * calibrado para eso. O sea: **la columna «¿sigue leyéndose como el logo?» del
 * barrido no se puede contestar con el modelo.** Hay que mirar el píxel.
 *
 * ⚠️ **Y el búfer de WebGL no se lee desde la página**: todo sale de
 * `Page.captureScreenshot` de lo compuesto (`MEDICION-NAVEGADOR.md`).
 *
 * ── Qué mide, por sección ─────────────────────────────────────────────────
 *
 *   · **la silueta del logo**, con un detector de DOS REGÍMENES. El de B11
 *     («la componente OSCURA más grande», tinta < 60 y área ≥ 5.000) sirve
 *     mientras la sala está clara y **no puede funcionar en la noche**: ahí lo
 *     oscuro es todo. Así que se corren los dos —la componente oscura más
 *     grande y la CLARA más grande (min(RGB) > mediana + 40)— y se publica cuál
 *     de los dos la encontró y con qué área. Un detector solo daría «no hay
 *     logo» en la mitad del recorrido, que es justamente lo que B11 anotó como
 *     «33 paradas a oscuras».
 *   · **su valor en pantalla**: p05, mediana, p95 y el degradé p95−p05, que es
 *     el volumen que el modelo no ve.
 *   · **la sala**: sus percentiles y la razón de contraste contra el logo.
 *   · **los huecos de la marca**: las dos contras de la «O» y de la «P» son
 *     fondo visto a través del trazo. Se miden como los agujeros de la silueta
 *     —componentes de fondo que no tocan el borde de la caja del logo— y lo que
 *     se publica es su contraste contra el trazo que las rodea: si eso colapsa,
 *     la marca deja de leerse aunque la silueta siga ahí.
 */

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { leerImagen, type Imagen } from '../scripts-b8/glifo-alfa'
import { LECTOR_DE_PANELES } from '../scripts-b8/lectores'
import { ESCENA_NUESTRA, OCULTAR_NODOS, OCULTAR_TODO_MENOS } from '../scripts-b8/ocultar'
import { SALTO_SOBRE_EL_FONDO } from '../scripts-b8/particulas'
import { AREA_MINIMA_DEL_LOGO, TINTA_MAXIMA } from '../scripts-b8/c-bloques'
import { conLaPagina, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from '../scripts-b8/b8-comun'

import { MAPEO_DE_LAS_SECCIONES } from '../src/app/v3/_lib/escena/recorrido'
import { muestrearLogo } from '../src/app/v3/_lib/escena/__tests__/s10-logo'
import { ESCENA_REAL, cajaDelLogo } from '../src/app/v3/_lib/escena/__tests__/s10-logo-lectura'

import { LAS_SEIS, ORIGEN, argumento, asegurarCarpetas, asentarElHome, escribirJson, perfilDeB13, red } from './b13-comun'

/**
 * LA CAJA QUE EL MODELO PREDICE, en píxeles de la captura. Es el
 * DISCRIMINADOR: adentro del cuadro hay dos candidatos —la componente oscura
 * más grande y la clara más grande— y sin un tercero independiente elegir uno
 * sería el instrumento contestándose a sí mismo. La proyección del SVG no
 * depende del sombreado: es geometría, y sus controles de equivalencia están en
 * `s10-logo.invariant.ts` §2.
 */
function cajaPredicha(progreso: number, ancho: number, alto: number): readonly [number, number, number, number] | null {
  const m = muestrearLogo(progreso, ancho / alto, ESCENA_REAL, 240, 135, 1)
  const c = cajaDelLogo(m)
  if (c === null) return null
  const aX = (v: number) => Math.round(((v + 1) / 2) * ancho)
  const aY = (v: number) => Math.round(((1 - v) / 2) * alto)
  return [aX(c.x0), aY(c.y1), aX(c.x1), aY(c.y0)]
}

interface Panel {
  readonly id: string
  readonly top: number
  readonly alto: number
}

interface Componente {
  readonly area: number
  readonly caja: readonly [number, number, number, number]
  readonly dentro: Uint8Array
}

/** El gris 0..255 de cada píxel de una captura. */
function grises(img: Imagen): Float32Array {
  const total = img.ancho * img.alto
  const g = new Float32Array(total)
  for (let i = 0; i < total; i += 1) {
    const k = i * 4
    g[i] = 0.2126 * img.datos[k] + 0.7152 * img.datos[k + 1] + 0.0722 * img.datos[k + 2]
  }
  return g
}

function medianaDe(g: Float32Array): number {
  const bins = new Uint32Array(256)
  for (let i = 0; i < g.length; i += 1) bins[Math.round(g[i])] += 1
  let acumulado = 0
  for (let v = 0; v < 256; v += 1) {
    acumulado += bins[v]
    if (acumulado * 2 >= g.length) return v
  }
  return 0
}

/** La componente conexa más grande de una máscara. */
function mayorComponente(mascara: Uint8Array, ancho: number, alto: number): Componente | null {
  const total = ancho * alto
  const visto = new Uint8Array(total)
  const pila = new Int32Array(total)
  let mejor: Componente | null = null
  for (let inicio = 0; inicio < total; inicio += 1) {
    if (mascara[inicio] === 0 || visto[inicio] === 1) continue
    const acum: number[] = []
    let tope = 0
    pila[tope] = inicio
    tope += 1
    visto[inicio] = 1
    let minx = ancho
    let maxx = -1
    let miny = alto
    let maxy = -1
    while (tope > 0) {
      tope -= 1
      const k = pila[tope]
      acum.push(k)
      const x = k % ancho
      const y = (k - x) / ancho
      if (x < minx) minx = x
      if (x > maxx) maxx = x
      if (y < miny) miny = y
      if (y > maxy) maxy = y
      for (const v of [x > 0 ? k - 1 : -1, x < ancho - 1 ? k + 1 : -1, y > 0 ? k - ancho : -1, y < alto - 1 ? k + ancho : -1]) {
        if (v >= 0 && mascara[v] === 1 && visto[v] === 0) {
          visto[v] = 1
          pila[tope] = v
          tope += 1
        }
      }
    }
    if (mejor === null || acum.length > mejor.area) {
      const dentro = new Uint8Array(total)
      for (const k of acum) dentro[k] = 1
      mejor = { area: acum.length, caja: [minx, miny, maxx, maxy], dentro }
    }
  }
  return mejor
}

function percentiles(valores: readonly number[]): { readonly p05: number; readonly p50: number; readonly p95: number } {
  const o = Float64Array.from(valores)
  o.sort()
  const q = (p: number) => o[Math.min(o.length - 1, Math.max(0, Math.round(p * (o.length - 1))))]
  return { p05: red(q(0.05), 1), p50: red(q(0.5), 1), p95: red(q(0.95), 1) }
}

function contrasteDeGrises(a: number, b: number): number {
  const lin = (c: number): number => {
    const v = Math.min(255, Math.max(0, c)) / 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  const la = 0.2126 * lin(a) + 0.7152 * lin(a) + 0.0722 * lin(a)
  const lb = 0.2126 * lin(b) + 0.7152 * lin(b) + 0.0722 * lin(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/**
 * LOS HUECOS DE LA MARCA. Adentro de la caja del logo, los píxeles que NO son
 * silueta y cuya componente no toca el borde de esa caja: las contras. Se
 * devuelve su valor mediano y cuántos hay.
 */
function huecosDe(comp: Componente, ancho: number, g: Float32Array): { readonly cuantos: number; readonly p50: number } {
  const [x0, y0, x1, y1] = comp.caja
  const w = x1 - x0 + 1
  const h = y1 - y0 + 1
  const fuera = new Uint8Array(w * h)
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      fuera[y * w + x] = comp.dentro[(y + y0) * ancho + (x + x0)] === 0 ? 1 : 0
    }
  }
  // Inundación desde el borde: lo que queda sin marcar son los huecos.
  const visto = new Uint8Array(w * h)
  const pila: number[] = []
  for (let x = 0; x < w; x += 1) {
    for (const k of [x, (h - 1) * w + x]) if (fuera[k] === 1 && visto[k] === 0) { visto[k] = 1; pila.push(k) }
  }
  for (let y = 0; y < h; y += 1) {
    for (const k of [y * w, y * w + w - 1]) if (fuera[k] === 1 && visto[k] === 0) { visto[k] = 1; pila.push(k) }
  }
  while (pila.length > 0) {
    const k = pila.pop() as number
    const x = k % w
    const y = (k - x) / w
    for (const v of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, y > 0 ? k - w : -1, y < h - 1 ? k + w : -1]) {
      if (v >= 0 && fuera[v] === 1 && visto[v] === 0) {
        visto[v] = 1
        pila.push(v)
      }
    }
  }
  const valores: number[] = []
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const k = y * w + x
      if (fuera[k] === 1 && visto[k] === 0) valores.push(g[(y + y0) * ancho + (x + x0)])
    }
  }
  return { cuantos: valores.length, p50: valores.length === 0 ? Number.NaN : percentiles(valores).p50 }
}

/**
 * CUÁNTOS PÍXELES DIFIEREN entre dos capturas del mismo cuadro. Es la vara de
 * las secciones OPACAS: si esconder la escena no mueve un píxel de lo compuesto,
 * la escena no aporta nada ahí y **ningún cambio de la escena puede alcanzarlas**.
 */
function pixelesQueDifieren(a: Imagen, b: Imagen): { readonly pixeles: number; readonly pct: number } {
  const total = Math.min(a.ancho * a.alto, b.ancho * b.alto)
  let n = 0
  for (let i = 0; i < total; i += 1) {
    const k = i * 4
    if (a.datos[k] !== b.datos[k] || a.datos[k + 1] !== b.datos[k + 1] || a.datos[k + 2] !== b.datos[k + 2]) n += 1
  }
  return { pixeles: n, pct: red((100 * n) / total, 3) }
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const etiqueta = argumento('etiqueta', 'antes')
  const perfiles = argumento('perfil', '1440,1920').split(',').map((id) => perfilDeB13(id.trim()))
  const salida: Record<string, unknown> = { etiqueta, cuando: new Date().toISOString(), secciones: {} }

  for (const perfil of perfiles) {
    const porSeccion = await conLaPagina(
      perfil,
      '/v3',
      async (s) => {
        await asentarElHome(s)
        const paneles = await medir<Panel[]>(s.pagina, LECTOR_DE_PANELES)
        const filas: unknown[] = []
        // `--secciones` acepta `todas`, una lista por coma, o nada (las seis
        // transparentes, que son las que tienen contraste que medir).
        const pedidas = argumento('secciones', '')
        const cuales =
          pedidas === '' ? [...LAS_SEIS] : pedidas === 'todas' ? paneles.map((p) => p.id) : pedidas.split(',').map((t) => t.trim())
        for (const id of cuales) {
          const panel = paneles.find((p) => p.id === id)
          if (panel === undefined) throw new Error(`no está el panel «${id}»`)
          const tramo = MAPEO_DE_LAS_SECCIONES.find((t) => t.id === id)
          if (tramo === undefined) throw new Error(`«${id}» no está en el mapeo`)
          const progreso = tramo.llenaDesde
          // ⚠️ Servicios y Tu panel son OPACAS (`superficies.ts`,
          // `dejaVerElCanvas: false`): la escena no se ve a través de ellas, así
          // que su captura de escena sola existe para dejar constancia de que el
          // cambio no las alcanza, no para medirles un contraste.
          const opaca = !tramo.dejaVerLaEscena
          const y = Math.round(panel.top)
          await scrollA(s.pagina, y)
          await esperarElPrimerCuadro(s.pagina, 700)
          const real = await medir<number>(s.pagina, 'window.scrollY')
          if (Math.abs(real - y) > 2) throw new Error(`se pidió y=${y} y el scroll quedó en ${real}`)
          const base = `.b13-capturas/${etiqueta}-${id}-${perfil.id}`
          await capturar(s.pagina, `${base}-C.png`)
          // ⚠️ LA PRUEBA DE LAS DOS OPACAS. Para Servicios y Tu panel no hay un
          // «antes» que sacar: lo que hay que demostrar es que la escena **no
          // aporta un píxel**, y entonces ningún cambio de la escena puede
          // alcanzarlas. Se captura lo compuesto con la escena ESCONDIDA y se
          // cuentan los píxeles que difieren. Cero píxeles es «antes y después
          // son la misma imagen por construcción», que es más fuerte que dos
          // capturas que se parecen.
          //
          // ⚠️ **Y con su control positivo**, porque sin él la prueba no vale.
          // La primera pasada dio 2.252 px en Tu panel a 1920 —un disco de
          // 67 × 61 px en DOS posiciones a 30 px una de otra— y el control
          // aislado lo reprodujo en CERO: era una pieza todavía asentándose del
          // ciclo de escondido de la sección anterior, no la escena. Así que se
          // captura una TERCERA vez con la escena de vuelta: si `C` y `C2` no
          // son idénticas el cuadro no estaba quieto y la comparación no dice
          // nada.
          let aporteDeLaEscena: { readonly pixeles: number; readonly pct: number } | null = null
          let cuadroQuieto: { readonly pixeles: number; readonly pct: number } | null = null
          if (opaca) {
            if (!(await medir<boolean>(s.pagina, OCULTAR_NODOS(ESCENA_NUESTRA, true)))) {
              throw new Error('la escena no se escondió')
            }
            await esperarElPrimerCuadro(s.pagina, 500)
            await capturar(s.pagina, `${base}-N.png`)
            if (!(await medir<boolean>(s.pagina, OCULTAR_NODOS(ESCENA_NUESTRA, false)))) {
              throw new Error('no se restauró la escena')
            }
            await esperarElPrimerCuadro(s.pagina, 500)
            await capturar(s.pagina, `${base}-C2.png`)
            aporteDeLaEscena = pixelesQueDifieren(leerImagen(`${base}-C.png`), leerImagen(`${base}-N.png`))
            cuadroQuieto = pixelesQueDifieren(leerImagen(`${base}-C.png`), leerImagen(`${base}-C2.png`))
          }
          if (!(await medir<boolean>(s.pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, true)))) {
            throw new Error('la escena no quedó sola')
          }
          await esperarElPrimerCuadro(s.pagina, 500)
          await capturar(s.pagina, `${base}-S.png`)
          if (!(await medir<boolean>(s.pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, false)))) {
            throw new Error('no se restauró lo oculto')
          }

          const S = leerImagen(`${base}-S.png`)
          const g = grises(S)
          const mediana = medianaDe(g)
          const total = S.ancho * S.alto
          // Régimen oscuro: el criterio de B8/B11, tal cual.
          const oscura = new Uint8Array(total)
          for (let i = 0; i < total; i += 1) {
            const k = i * 4
            if (Math.max(S.datos[k], S.datos[k + 1], S.datos[k + 2]) < TINTA_MAXIMA) oscura[i] = 1
          }
          // Régimen claro: lo que se levanta sobre la mediana, con el mismo salto
          // que `particulas.ts` usa para separar una mota del fondo.
          const clara = new Uint8Array(total)
          for (let i = 0; i < total; i += 1) {
            const k = i * 4
            if (Math.min(S.datos[k], S.datos[k + 1], S.datos[k + 2]) > mediana + SALTO_SOBRE_EL_FONDO) clara[i] = 1
          }
          const predicha = cajaPredicha(progreso, S.ancho, S.alto)
          const centro = predicha === null ? null : [(predicha[0] + predicha[2]) / 2, (predicha[1] + predicha[3]) / 2]
          const distanciaAlCentro = (c: Componente): number =>
            centro === null
              ? Number.POSITIVE_INFINITY
              : Math.hypot((c.caja[0] + c.caja[2]) / 2 - centro[0], (c.caja[1] + c.caja[3]) / 2 - centro[1]) / S.ancho
          const candidatos: readonly (readonly [string, Componente | null])[] = [
            ['oscura', mayorComponente(oscura, S.ancho, S.alto)],
            ['clara', mayorComponente(clara, S.ancho, S.alto)],
          ]
          // Se descarta lo que ocupa más de un tercio del cuadro: eso no es una
          // pieza, es el régimen entero (la noche, o el papel). Es la misma vara
          // del 35 % con la que B11 marcaba una parada como «oscura».
          const validos = candidatos.filter(
            (c): c is readonly [string, Componente] =>
              c[1] !== null && c[1].area >= AREA_MINIMA_DEL_LOGO && c[1].area / total <= 0.35,
          )
          const elegido = validos.sort((a, b) => distanciaAlCentro(a[1]) - distanciaAlCentro(b[1]))[0]
          const regimen = elegido === undefined ? 'ninguno' : elegido[0]
          const comp = elegido === undefined ? null : elegido[1]
          const desvio = elegido === undefined ? null : red(distanciaAlCentro(elegido[1]) * 100, 2)
          const candidatosPublicados = candidatos.map(([nombre, c]) => ({
            regimen: nombre,
            area: c?.area ?? 0,
            fraccionDelCuadro: c === null ? 0 : red((c.area / total) * 100, 2),
            caja: c?.caja ?? null,
            desvioDelCentroPct: c === null ? null : red(distanciaAlCentro(c) * 100, 2),
          }))

          const dentroVals: number[] = []
          const fueraVals: number[] = []
          for (let i = 0; i < g.length; i += 1) {
            if (comp !== null && comp.dentro[i] === 1) dentroVals.push(g[i])
            else fueraVals.push(g[i])
          }
          const logo = comp === null ? null : percentiles(dentroVals)
          const sala = percentiles(fueraVals)
          const huecos = comp === null ? { cuantos: 0, p50: Number.NaN } : huecosDe(comp, S.ancho, g)
          const fila = {
            seccion: id,
            ancho: perfil.id,
            opaca,
            aporteDeLaEscena,
            cuadroQuieto,
            scrollY: y,
            progreso,
            medianaDelCuadro: mediana,
            regimen,
            cajaPredicha: predicha,
            desvioDelCentroPct: desvio,
            candidatos: candidatosPublicados,
            logo,
            fraccionDelCuadro: comp === null ? 0 : red((comp.area / (S.ancho * S.alto)) * 100, 2),
            caja: comp?.caja ?? null,
            degradado: logo === null ? null : red(logo.p95 - logo.p05, 1),
            sala,
            contrasteLogoSala: logo === null ? null : red(contrasteDeGrises(logo.p50, sala.p50), 2),
            huecos: { cuantos: huecos.cuantos, p50: Number.isNaN(huecos.p50) ? null : huecos.p50 },
            contrasteTrazoHueco:
              logo === null || Number.isNaN(huecos.p50) ? null : red(contrasteDeGrises(logo.p50, huecos.p50), 2),
          }
          filas.push(fila)
          console.log(
            `  ${perfil.id} ${id.padEnd(16)} y=${String(y).padStart(6)} · mediana ${String(mediana).padStart(3)} · ` +
              `logo[${regimen.padEnd(7)}] ${logo === null ? '   —   ' : `${logo.p05.toFixed(0).padStart(3)}/${logo.p50.toFixed(0).padStart(3)}/${logo.p95.toFixed(0).padStart(3)}`} ` +
              `(${fila.fraccionDelCuadro.toFixed(2).padStart(5)} % del cuadro, degradé ${fila.degradado ?? '—'}, desvío ${desvio ?? '—'} %) · ` +
              `sala ${sala.p05.toFixed(0).padStart(3)}/${sala.p50.toFixed(0).padStart(3)}/${sala.p95.toFixed(0).padStart(3)} · ` +
              `logo/sala ${fila.contrasteLogoSala ?? '—'}:1 · contras ${huecos.cuantos} px, trazo/contra ${fila.contrasteTrazoHueco ?? '—'}:1` +
              (aporteDeLaEscena === null
                ? ''
                : `
     ⚠️ OPACA · control del cuadro quieto (C contra C2, con la escena de vuelta): ${cuadroQuieto?.pixeles ?? '—'} px
        esconder la escena cambia ${aporteDeLaEscena.pixeles} px (${aporteDeLaEscena.pct} % del cuadro) → ` +
                  `${cuadroQuieto !== null && cuadroQuieto.pixeles > 0 ? 'EL CUADRO NO ESTABA QUIETO: la comparación no dice nada' : aporteDeLaEscena.pixeles === 0 ? 'la escena NO aporta un píxel: antes ≡ después por construcción' : 'la escena SÍ aporta: hay que mirarla'}`),
          )
        }
        return filas
      },
      { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO], origen: ORIGEN, perfilDeChrome: `b13-${perfil.id}` },
    )
    ;(salida.secciones as Record<string, unknown>)[perfil.id] = porSeccion
  }

  console.log(`\nescrito: ${escribirJson(argumento('json', `escena-${etiqueta}`), salida)}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
