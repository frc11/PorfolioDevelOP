/**
 * B5 · EL DISCRIMINADOR — ¿los 296 píxeles bajo AA caen sobre el LOGO?
 *
 *     npx tsx scripts-b5/e-discriminador.ts
 *
 * ── La pregunta, y por qué no se puede contestar mirando ──────────────────
 *
 * El método de máscara de B1 (`B1-DELTAS` §4-bis) da hoy **1,01:1 con 296
 * píxeles bajo AA** en el titular del hero, donde B1 publicó 10,45:1 con CERO.
 * B5 lo atribuyó al instrumento y cambió la máscara. **Esa atribución no estaba
 * verificada**, y la diferencia importa muchísimo:
 *
 *   · si esos píxeles caen **sobre el LOGO** —tinta casi negra— entonces es un
 *     DEFECTO REAL: texto ilegible sobre el objeto, que es exactamente lo que
 *     costó tres sprints cerrar en el diferencial, reapareciendo en el hero. Y
 *     la máscara nueva **lo esconde**, porque saca la escena de la captura;
 *   · si caen sobre el **FONDO de la sala** —el gradiente de la pared, la sombra
 *     de la celosía, el moiré— entonces sí es el instrumento: el método viejo
 *     confundía un borde que se movió con un glifo, y la máscara nueva es la
 *     correcta.
 *
 * ── Cómo se contesta, con tres clasificaciones independientes ─────────────
 *
 * Por cada píxel culpable se responden tres preguntas que no dependen una de
 * otra, y las tres tienen que coincidir para que la conclusión valga:
 *
 *   1. **¿Está adentro de la silueta del logo?** La silueta sale de la captura
 *      de FONDO (`A`), como la componente conexa oscura más grande. Es
 *      geometría, no interpretación.
 *   2. **¿Es tinta de verdad?** O sea: ¿el mismo píxel está en la máscara BUENA,
 *      la que sale del texto sobre papel plano sin escena? Un píxel que el
 *      método viejo llama glifo y el bueno no, es un falso positivo por
 *      construcción.
 *   3. **¿Qué luminancia tiene el fondo debajo?** El logo es tinta casi negra
 *      (`rgb(17,17,17)` en el papel; en la escena, sombreado). La pared de la
 *      sala es gris medio. Los dos rangos no se tocan.
 *
 * ⚠️ **Con control positivo del detector de silueta**: se le pregunta por un
 * píxel del centro del logo y por uno del papel, y tiene que contestar distinto.
 */

import { mkdirSync } from 'node:fs'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { luminancia, contraste, AA_TEXTO_GRANDE } from '../scripts-b4/color'
import { medir } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'

import { conLaPagina, dos, guardarJson, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from './b5-comun'
import { cajaYTinta, moverElPuntero, ocultarPorSelector } from './pagina'
import { leerImagen, siluetaMasGrande } from './silueta'

const PERFIL = perfilPorId('1440')
const TEMP = '.b5-capturas'
const SELECTOR_DE_LA_ESCENA = '[data-escena]'
const SELECTOR_DEL_TITULAR = '[data-panel="hero"] .font-titulo'

/** Los umbrales del método VIEJO, tal cual los publicó B1. No se tocan. */
const UMBRAL_DE_GLIFO = 24
const TOLERANCIA_DE_MOVIMIENTO = 10

/** Debajo de esta luminancia (0–255 de srgb) un píxel es TINTA, no pared. */
const TINTA_MAXIMA = 60
/** Área mínima de una componente para ser el logo y no una mota de polvo. */
const AREA_MINIMA_DEL_LOGO = 5000

async function principal(): Promise<void> {
  mkdirSync(TEMP, { recursive: true })

  const salida = await conLaPagina(
    PERFIL,
    '/v3',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      await new Promise((r) => setTimeout(r, 4000))
      await moverElPuntero(pagina, PERFIL, 720, 450)
      await new Promise((r) => setTimeout(r, 2500))

      /**
       * La caja del texto, con el lector compartido de `b5-comun.ts`. Ahi vive
       * el filtro de `clip-path`, que es lo que impide que el `span.sr-only` del
       * titular —sin un pixel pintado, 1.076 px de ancho— estire la caja por
       * encima del logo.
       */
      const caja = await cajaYTinta(pagina, SELECTOR_DEL_TITULAR)

      // Las CUATRO capturas: el método viejo pide A, B y C; la máscara buena, T.
      if (!(await ocultarPorSelector(pagina, SELECTOR_DEL_TITULAR, true))) throw new Error('el titular no quedó oculto')
      const rutaA = `${TEMP}/disc-A.png`
      await capturar(pagina, rutaA)
      await medir(pagina, '(async () => { await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return true })()')
      const rutaB = `${TEMP}/disc-B.png`
      await capturar(pagina, rutaB)
      await ocultarPorSelector(pagina, SELECTOR_DEL_TITULAR, false)
      const rutaC = `${TEMP}/disc-C.png`
      await capturar(pagina, rutaC)
      if (!(await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, true))) throw new Error('la escena no quedó oculta')
      const rutaT = `${TEMP}/disc-T.png`
      await capturar(pagina, rutaT)
      await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, false)

      return { caja, rutaA, rutaB, rutaC, rutaT }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO] },
  )

  const A = leerImagen(salida.rutaA)
  const B = leerImagen(salida.rutaB)
  const C = leerImagen(salida.rutaC)
  const T = leerImagen(salida.rutaT)
  const cajas = salida.caja.cajas
  const caja = salida.caja.caja
  const tinta = salida.caja.tinta as [number, number, number]
  const lumTinta = luminancia(tinta[0], tinta[1], tinta[2])

  const logo = siluetaMasGrande(A, TINTA_MAXIMA, AREA_MINIMA_DEL_LOGO)

  // ── el control positivo del detector de silueta ─────────────────────────
  const centroDelLogo = logo.caja.length === 4
    ? ((((logo.caja[1] + logo.caja[3]) >> 1) * A.ancho) + ((logo.caja[0] + logo.caja[2]) >> 1))
    : -1
  const enElPapel = 40 * A.ancho + 40
  const controlDeSilueta = {
    unPixelDelCentroDelLogo: centroDelLogo >= 0 ? logo.dentro[centroDelLogo] === 1 : false,
    unPixelDelPapel: logo.dentro[enElPapel] === 1,
  }

  // ── la máscara BUENA, del texto sobre papel plano ────────────────────────
  const limites = cajas.map((c) => ({
    x0: Math.max(0, Math.floor(c.x)),
    y0: Math.max(0, Math.floor(c.y)),
    x1: Math.min(A.ancho, Math.ceil(c.x + c.ancho)),
    y1: Math.min(A.alto, Math.ceil(c.y + c.alto)),
  }))
  const muestras: number[] = []
  for (const l of limites) for (let y = l.y0; y < l.y1; y += 1) for (let x = l.x0; x < l.x1; x += 1) muestras.push(T.datos[(y * T.ancho + x) * 4])
  muestras.sort((a, b) => a - b)
  const papel = muestras[Math.floor(muestras.length / 2)]
  const esTintaDeVerdad = (k: number): boolean =>
    Math.max(
      Math.abs(T.datos[k] - papel),
      Math.abs(T.datos[k + 1] - papel),
      Math.abs(T.datos[k + 2] - papel),
    ) > UMBRAL_DE_GLIFO

  // ── el método VIEJO, y la clasificación de cada culpable ────────────────
  const culpables: {
    x: number
    y: number
    contraste: number
    fondo: number[]
    dentroDelLogo: boolean
    esTintaDeVerdad: boolean
    luminanciaDelFondo: number
  }[] = []
  let mascaraVieja = 0
  for (const l of limites) {
  for (let y = l.y0; y < l.y1; y += 1) {
    for (let x = l.x0; x < l.x1; x += 1) {
      const i = y * A.ancho + x
      const k = i * 4
      const dC = Math.max(
        Math.abs(C.datos[k] - A.datos[k]),
        Math.abs(C.datos[k + 1] - A.datos[k + 1]),
        Math.abs(C.datos[k + 2] - A.datos[k + 2]),
      )
      if (dC <= UMBRAL_DE_GLIFO) continue
      const dB = Math.max(
        Math.abs(B.datos[k] - A.datos[k]),
        Math.abs(B.datos[k + 1] - A.datos[k + 1]),
        Math.abs(B.datos[k + 2] - A.datos[k + 2]),
      )
      if (dB > TOLERANCIA_DE_MOVIMIENTO) continue
      mascaraVieja += 1
      const r = contraste(lumTinta, luminancia(A.datos[k], A.datos[k + 1], A.datos[k + 2]))
      if (r >= AA_TEXTO_GRANDE) continue
      culpables.push({
        x,
        y,
        contraste: dos(r),
        fondo: [A.datos[k], A.datos[k + 1], A.datos[k + 2]],
        dentroDelLogo: logo.dentro[i] === 1,
        esTintaDeVerdad: esTintaDeVerdad(k),
        luminanciaDelFondo: Math.max(A.datos[k], A.datos[k + 1], A.datos[k + 2]),
      })
    }
  }
  }

  const sobreElLogo = culpables.filter((c) => c.dentroDelLogo)
  const tintaDeVerdad = culpables.filter((c) => c.esTintaDeVerdad)
  const fondosOscuros = culpables.filter((c) => c.luminanciaDelFondo < TINTA_MAXIMA)

  const ruta = guardarJson('b5-discriminador', {
    que: '¿los píxeles bajo AA del método viejo caen sobre el LOGO o sobre el fondo de la sala?',
    instrumento: 'scripts-b5/e-discriminador.ts — método viejo de B1 (|C−A|>24 con |B−A|≤10) y tres clasificaciones independientes',
    cajaDelTitular: caja,
    cajasPorElemento: cajas,
    nodosSalteadosPorRecorte: salida.caja.nodosSalteadosPorRecorte,
    siluetaDelLogo: { area: logo.area, caja: logo.caja },
    controlDeSilueta,
    papelDeLaMascaraBuena: papel,
    mascaraVieja,
    culpables: culpables.length,
    sobreElLogo: sobreElLogo.length,
    sonTintaDeVerdad: tintaDeVerdad.length,
    conFondoOscuro: fondosOscuros.length,
    losPeores: culpables.sort((a, b) => a.contraste - b.contraste).slice(0, 15),
  })

  console.log(`escrito: ${ruta}`)
  console.log(`\n  caja del titular: x ${dos(caja.x)}–${dos(caja.x + caja.ancho)} · y ${dos(caja.y)}–${dos(caja.y + caja.alto)}`)
  console.log(`  silueta del logo: ${logo.area} px, caja x ${logo.caja[0]}–${logo.caja[2]} · y ${logo.caja[1]}–${logo.caja[3]}`)
  console.log(`  [control positivo] el detector de silueta dice DENTRO en el centro del logo: ${controlDeSilueta.unPixelDelCentroDelLogo}`)
  console.log(`  [control positivo]   y FUERA en el papel de arriba a la izquierda: ${!controlDeSilueta.unPixelDelPapel}`)
  console.log(`\n  máscara VIEJA dentro de la caja: ${mascaraVieja} px`)
  console.log(`  de esos, bajo AA (${AA_TEXTO_GRANDE}:1): ${culpables.length} px`)
  console.log(`\n  ── LA RESPUESTA ──────────────────────────────────────────`)
  console.log(`  culpables que caen SOBRE EL LOGO:        ${sobreElLogo.length} de ${culpables.length}`)
  console.log(`  culpables que son TINTA DE VERDAD:       ${tintaDeVerdad.length} de ${culpables.length}`)
  console.log(`  culpables con el fondo OSCURO (<${TINTA_MAXIMA}):   ${fondosOscuros.length} de ${culpables.length}`)
  console.log(`\n  los peores, con su píxel:`)
  for (const c of culpables.slice(0, 10)) {
    console.log(
      `    (${String(c.x).padStart(4)}, ${String(c.y).padStart(3)})  ${String(c.contraste).padStart(5)}:1  fondo rgb(${c.fondo.join(',')})` +
        `  logo=${c.dentroDelLogo}  tinta=${c.esTintaDeVerdad}`,
    )
  }
}

void principal()
