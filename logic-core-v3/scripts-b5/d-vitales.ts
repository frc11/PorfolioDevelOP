/**
 * B5 · LO QUE EL BLOQUE NO PUEDE ROMPER — cuadros, LCP, anclas y el progreso.
 *
 *     npx tsx scripts-b5/d-vitales.ts
 *
 * Cuatro mediciones que comparten una corrida porque comparten la condición:
 * la página tiene que estar entera, al frente y con las tres piezas prendidas.
 *
 *   1. **FPS durante el recorrido completo**, contra la línea de base de B4-B
 *      (mínimo 73,5). Tres consumidores nuevos del ciclo de cuadro.
 *   2. **FPS con la página QUIETA**, que es la situación nueva: antes no pasaba
 *      nada y ahora la escena sigue viva y el cursor interpola.
 *   3. **El LCP**, contra los 2.378 ms de mediana de B4-B, con la corrida que
 *      cruzaba el techo de 2,5 s en 2.524.
 *   4. **El progreso con la página quieta**, que es la comprobación que la regla
 *      de arquitectura de B5 exige: **con la página quieta y el mouse barriendo,
 *      el progreso tiene que ser idéntico bit a bit.**
 *
 * ── ⚠️ Cómo se observa el progreso sin instrumentar el producto ───────────
 *
 * La escena **no expone su pose ni su progreso al DOM** —`EscenaDelHome` emite
 * `data-escena`, `data-intro` y `data-escena-fase`, nada más— y el búfer de
 * WebGL no se puede leer desde la página. Agregarle un atributo de depuración a
 * producción para poder medirlo sería cambiar el producto para que pase la
 * prueba.
 *
 * Lo que sí se puede hacer, y es más fuerte: **el progreso es una función PURA
 * de tres entradas** —`scrollY`, la extensión de las ocho secciones y el alto de
 * la ventana— y las tres son observables. Se leen antes y después del barrido de
 * mouse, se evalúa `progresoDelScroll` sobre ellas del lado de Node, y se
 * comparan bit a bit. Que nada MÁS pueda escribir el progreso lo afirma
 * `b5-modulacion.invariant.ts` sobre la forma del módulo.
 *
 * **Con control positivo, y es el que le da sentido**: la misma comparación,
 * después de scrollear **un solo píxel**, tiene que dar un progreso DISTINTO. Sin
 * eso, «el progreso no cambió» pasaría en verde también si el lector estuviera
 * roto o la función devolviera siempre lo mismo.
 */

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'
import { progresoDelScroll } from '../src/app/v3/_lib/escena/recorrido'
import { BORDE_INFERIOR_EN_REPOSO_PX } from '../src/app/v3/_lib/navegacion'

import { conLaPagina, dos, guardarJson, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from './b5-comun'
import { moverElPuntero } from './pagina'
import {
  CONTADOR_DE_CUADROS,
  LECTOR_DE_ANCLAS,
  LECTOR_DE_ENTRADAS,
  OBSERVADOR_DE_LCP,
  type Entradas,
} from './vitales-lectores'

const PERFIL = perfilPorId('1440')

/** La línea de base de B4-B. No se afloja: se compara contra ella. */
const FPS_MINIMO_DE_B4B = 73.5
const LCP_MEDIANA_DE_B4B_MS = 2378
const LCP_TECHO_MS = 2500

async function principal(): Promise<void> {
  const salida = await conLaPagina(
    PERFIL,
    '/v3',
    async ({ pagina, estado }) => {
      await esperarElPrimerCuadro(pagina)
      const lcp = await medir<{ ms: number; elemento: string }>(pagina, 'window.__lcp')

      // ── 1 · el progreso con la página quieta y el mouse barriendo ────────
      await medir(pagina, '(() => { window.scrollTo(0, 4000); return true })()')
      await esperarElPrimerCuadro(pagina)
      const antes = await medir<Entradas>(pagina, LECTOR_DE_ENTRADAS)
      for (const [x, y] of [[40, 60], [1400, 60], [1400, 840], [40, 840], [720, 450]]) {
        await moverElPuntero(pagina, PERFIL, x, y)
        await new Promise((r) => setTimeout(r, 700))
      }
      const despues = await medir<Entradas>(pagina, LECTOR_DE_ENTRADAS)
      const pAntes = progresoDelScroll(antes.scrollY, antes.arriba, antes.abajo, antes.ventana)
      const pDespues = progresoDelScroll(despues.scrollY, despues.arriba, despues.abajo, despues.ventana)

      // el control positivo: UN píxel de scroll y el progreso tiene que cambiar
      await medir(pagina, '(() => { window.scrollTo(0, 4001); return true })()')
      await esperarElPrimerCuadro(pagina)
      const unPixel = await medir<Entradas>(pagina, LECTOR_DE_ENTRADAS)
      const pUnPixel = progresoDelScroll(unPixel.scrollY, unPixel.arriba, unPixel.abajo, unPixel.ventana)

      // ── 2 · FPS con la página quieta ─────────────────────────────────────
      await medir(pagina, '(() => { window.scrollTo(0, 0); return true })()')
      await esperarElPrimerCuadro(pagina)
      const quieta = await medir(pagina, CONTADOR_DE_CUADROS(3000, false))

      /**
       * ── 3 · FPS durante el recorrido completo, TRES VECES ────────────────
       *
       * ⚠️ **El mínimo es una cifra de UNA sola muestra**: un cuadro largo lo
       * parte al medio. Medido: dos corridas seguidas del mismo recorrido dieron
       * 74,07 y 37,45 de mínimo, con la mediana idéntica. Publicar una sola
       * corrida sería publicar el ruido del sistema operativo; se corre tres
       * veces y se publican las tres.
       */
      const recorridos = []
      for (let i = 0; i < 3; i += 1) {
        await medir(pagina, '(() => { window.scrollTo(0, 0); return true })()')
        await esperarElPrimerCuadro(pagina)
        recorridos.push(await medir(pagina, CONTADOR_DE_CUADROS(12000, true)))
      }
      const recorrido = recorridos[0]

      // ── 4 · el aterrizaje de las siete anclas ───────────────────────────
      const anclas = await medir<
        { ancla: string; topDelPanel: number; scrollY: number; topeDelDocumento: boolean; ok: boolean }[]
      >(
        pagina,
        LECTOR_DE_ANCLAS,
      )

      return {
        estadoDeLaPagina: estado,
        lcp,
        progreso: {
          antes,
          despues,
          pAntes,
          pDespues,
          identico: pAntes === pDespues,
          entradasIdenticas: JSON.stringify(antes) === JSON.stringify(despues),
          controlPositivo: {
            unPixel,
            pUnPixel: pUnPixel,
            cambia: pUnPixel !== pAntes,
            deltaDelProgreso: pUnPixel - pAntes,
          },
        },
        quieta,
        recorrido,
        recorridos,
        anclas,
      }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO, OBSERVADOR_DE_LCP] },
  )

  /**
   * ⚠️ **EL LCP, CONTRA SÍ MISMO Y NO CONTRA LA CIFRA DE B4-B.**
   *
   * Los 2.378 ms de mediana de B4-B se midieron en otras condiciones —otro
   * build, otra carga, otro estado de caché— y compararlos contra una corrida de
   * `next dev` con la ruta caliente daría una mejora que no existe. Lo que la
   * instrucción pide es otra cosa y sí se puede medir: **que Lenis no lo
   * empeore.** Así que se corre el MISMO instrumento, en el MISMO viewport, con
   * el motor apagado —la preferencia lo apaga— y se comparan los dos.
   *
   * El argumento estructural va aparte y sobrevive a cualquier número: el LCP es
   * texto que pinta el HTML del servidor, y la instancia de Lenis se construye en
   * un efecto de un módulo perezoso, o sea **después** del pintado que el LCP
   * mide.
   */
  const sinMotor = await conLaPagina(
    PERFIL,
    '/v3',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      const lcp = await medir<{ ms: number; elemento: string }>(pagina, 'window.__lcp')
      const motor = await medir<string | null>(pagina, `document.documentElement.getAttribute('data-v3-scroll-suave')`)
      /**
       * ⚠️ **Y EL MISMO RECORRIDO SIN NINGUNA DE LAS TRES PIEZAS, QUE ES EL
       * CONTROL DE ATRIBUCIÓN DEL CUADRO LARGO.**
       *
       * Con la preferencia puesta no hay Lenis, no hay cursor y la escena está
       * quieta. Si el cuadro largo sigue cayendo en el mismo lugar, **no es de
       * B5**: es del contenido. Sin este control, un mínimo peor que la línea de
       * base se le atribuye al bloque por estar al lado.
       */
      const sinPiezas = []
      for (let i = 0; i < 3; i += 1) {
        await medir(pagina, '(() => { window.scrollTo(0, 0); return true })()')
        await esperarElPrimerCuadro(pagina)
        sinPiezas.push(await medir(pagina, CONTADOR_DE_CUADROS(12000, true)))
      }
      return { lcp, motor, sinPiezas }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO, OBSERVADOR_DE_LCP], movimientoReducido: true },
  )

  const ruta = guardarJson('b5-vitales', {
    sinLasTresPiezas: sinMotor,
    que: 'FPS, LCP, el aterrizaje de las siete anclas y el progreso con la página quieta',
    instrumento: 'scripts-b5/d-vitales.ts',
    perfil: PERFIL.id,
    estrangulamiento: 'ninguno',
    lineasDeBase: { fpsMinimoB4B: FPS_MINIMO_DE_B4B, lcpMedianaB4Bms: LCP_MEDIANA_DE_B4B_MS, lcpTechoMs: LCP_TECHO_MS },
    ...salida,
  })
  console.log(`escrito: ${ruta}`)

  const p = salida.progreso
  console.log(`\n  PROGRESO con la página quieta y el puntero barriendo las 5 posiciones`)
  console.log(`    entradas idénticas: ${p.entradasIdenticas}  ·  progreso ${p.pAntes.toFixed(12)} → ${p.pDespues.toFixed(12)}  ·  IDÉNTICO: ${p.identico}`)
  console.log(`    [control positivo] con UN píxel de scroll pasa a ${p.controlPositivo.pUnPixel.toFixed(12)} — delta ${p.controlPositivo.deltaDelProgreso.toExponential(3)}: cambia = ${p.controlPositivo.cambia}`)

  type Cuadros = {
    cuadros: number
    fpsMediana: number
    fpsP05: number
    fpsMinimo: number
    indiceDelPeor: number
    cuadrosLargos: number
    scrollFinal: number
  }
  const q = salida.quieta as Cuadros
  console.log(`\n  FPS — las MISMAS tres cifras de B4-B sobre 765 cuadros: mediana 75,2 · p05 74,6 · mínimo ${FPS_MINIMO_DE_B4B}`)
  console.log(`    quieta      ${q.cuadros} cuadros · mediana ${dos(q.fpsMediana)} · p05 ${dos(q.fpsP05)} · mínimo ${dos(q.fpsMinimo)} (cuadro ${q.indiceDelPeor} de ${q.cuadros}, ${q.cuadrosLargos} arriba de 20 ms)`)
  for (const [i, r] of (salida.recorridos as Cuadros[]).entries()) {
    console.log(
      `    recorrido ${i + 1} ${r.cuadros} cuadros · mediana ${dos(r.fpsMediana)} · p05 ${dos(r.fpsP05)} · mínimo ${dos(r.fpsMinimo)} (cuadro ${r.indiceDelPeor} de ${r.cuadros}, ${r.cuadrosLargos} arriba de 20 ms) · llegó a y=${r.scrollFinal}`,
    )
  }
  for (const [i, c] of (sinMotor.sinPiezas as Cuadros[]).entries()) {
    console.log(
      `    [control ${i + 1}] SIN las tres piezas (preferencia puesta): mediana ${dos(c.fpsMediana)} · p05 ${dos(c.fpsP05)} ` +
        `· mínimo ${dos(c.fpsMinimo)} (cuadro ${c.indiceDelPeor} de ${c.cuadros}, ${c.cuadrosLargos} arriba de 20 ms)`,
    )
  }
  console.log(`    ⚠️ corrida sobre \`next dev\`: la comparación con B4-B se declara, no se afirma.`)

  console.log(`\n  LCP  con el motor prendido: ${dos(salida.lcp.ms)} ms sobre ${salida.lcp.elemento}`)
  console.log(`       con el motor APAGADO:     ${dos(sinMotor.lcp.ms)} ms  (data-v3-scroll-suave = ${sinMotor.motor})`)
  console.log(
    `       delta ${dos(salida.lcp.ms - sinMotor.lcp.ms)} ms — Lenis ${salida.lcp.ms <= sinMotor.lcp.ms + 50 ? 'NO lo empeora' : 'LO EMPEORA'}`,
  )
  console.log(`       ⚠️ los ${LCP_MEDIANA_DE_B4B_MS} ms de B4-B (techo ${LCP_TECHO_MS}) NO son comparables: otro build, otro estado de caché.`)

  console.log(`\n  ANCLAS — el borde del panel tiene que quedar a ${BORDE_INFERIOR_EN_REPOSO_PX} px del tope`)
  for (const a of salida.anclas) {
    console.log(
      `    ${a.ok ? 'ok   ' : 'FALLA'} ${a.ancla.padEnd(20)} top = ${String(a.topDelPanel).padStart(6)}  scrollY = ${String(a.scrollY).padStart(6)}` +
        `${a.topeDelDocumento ? '  (tope del documento: no hay a dónde subir)' : ''}`,
    )
  }
  const malas = salida.anclas.filter((a) => !a.ok).length
  console.log(`    ${salida.anclas.length} anclas, ${malas} fuera de la vara`)
}

void principal()
