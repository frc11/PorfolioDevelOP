/**
 * FRENTE C · EL TECHO DE VELOCIDAD, CUADRO A CUADRO CON SCROLL REAL.
 *
 *     npx tsx scripts-b4/c-velocidad.ts
 *
 * B2 puso un techo de **1,0 altura de cuadro por pantalla de scroll** y publicó
 * que el pico bajó de **6,0945 a 4,6198**. Esas dos cifras salen de una
 * derivación ESTÁTICA sobre una grilla de 100 px (`scripts-b2/velocidad.ts`).
 * La instrucción pide medirlo **cuadro a cuadro con scroll real** y contestar si
 * el techo se respeta en todo el recorrido o sólo en promedio.
 *
 * ── ⚠️ QUÉ ES MEDIDO ACÁ Y QUÉ ES DERIVADO. Es la mitad del valor de esto ──
 *
 * **Medido en el navegador:** el `scrollY` en cada `requestAnimationFrame` de un
 * scroll real, y el reloj de cada cuadro. O sea **qué posiciones de scroll
 * ocurren de verdad** y **a qué ritmo pinta el navegador**.
 *
 * **Derivado en Node:** la velocidad de la cámara en cada una de esas
 * posiciones, con `velocidadEnScroll` de `scripts-b2/velocidad.ts` — el mismo
 * instrumento con el que B2 publicó sus cifras.
 *
 * **Por qué no se mide la cámara en vivo, y no es pereza:** la escena **no
 * expone su pose al DOM**. Se buscó: `EscenaDelHome.tsx` emite `data-escena` y
 * `data-escena-fase`, y nada más; no hay un `window.__` ni un atributo con la
 * pose. Y el búfer de WebGL no se puede leer desde la página (`B2-DELTAS`
 * §2.1). Inventar una lectura de cámara sería exactamente lo que este repo
 * lleva veinte sprints cazando. **La composición medido + derivado se declara,
 * no se disimula.**
 *
 * Lo que la composición SÍ agrega sobre la derivación sola: la grilla de 100 px
 * de B2 no puede ver un pico que caiga entre dos puntos de la grilla, y no sabe
 * qué posiciones de scroll ocurren realmente. Acá se evalúa la misma función en
 * **cada `scrollY` que el navegador atravesó**.
 *
 * ── Y de paso, los cuadros por segundo ────────────────────────────────────
 *
 * El mismo muestreo da el FPS del recorrido, que es lo que el frente A pedía
 * como «el costo de la escena». Sale del reloj de los cuadros, no de una
 * captura, y por eso está acá y no en una foto.
 */

import { velocidadEnScroll } from '../scripts-b2/velocidad'

import { guardarJson } from './c-comun'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'

/** El techo de B2: una altura de cuadro por pantalla de scroll. */
const TECHO_FH_POR_PANTALLA = 1.0
/** Píxeles de scroll por cuadro. 24 px a 60 Hz ≈ 1.440 px/s, un scroll de rueda vivo pero normal. */
const PASO_POR_CUADRO = 24

interface Cuadro {
  readonly t: number
  readonly y: number
}

interface Muestreo {
  readonly cuadros: readonly Cuadro[]
  readonly ventana: number
  readonly alturaDelDocumento: number
  readonly llegoAlFinal: boolean
}

/**
 * Baja el documento entero moviendo el scroll de VERDAD —un `scrollBy` por
 * cuadro— y anota `scrollY` y el reloj en cada uno.
 *
 * Se conduce por `requestAnimationFrame` y no por `setInterval` a propósito: el
 * objetivo es una muestra POR CUADRO PINTADO, que es la unidad en la que la
 * pregunta está hecha.
 */
const MUESTREO = `(async (paso, topeDeCuadros) => {
  const cuadros = []
  await new Promise((r) => { window.scrollTo(0, 0); requestAnimationFrame(() => requestAnimationFrame(r)) })
  await new Promise((r) => setTimeout(r, 1200))
  const fin = document.documentElement.scrollHeight - window.innerHeight
  await new Promise((resolver) => {
    let n = 0
    const tic = (t) => {
      cuadros.push({ t, y: window.scrollY })
      n += 1
      if (window.scrollY >= fin - 1 || n >= topeDeCuadros) { resolver(); return }
      window.scrollBy(0, paso)
      requestAnimationFrame(tic)
    }
    requestAnimationFrame(tic)
  })
  return {
    cuadros,
    ventana: window.innerHeight,
    alturaDelDocumento: document.documentElement.scrollHeight,
    llegoAlFinal: window.scrollY >= fin - 1,
  }
})(${PASO_POR_CUADRO}, 4000)`

async function principal(): Promise<void> {
  const perfil = perfilPorId('1920')
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('c'),
    ancho: perfil.ancho,
    alto: perfil.alto + 120,
  })
  let m: Muestreo
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, 'http://localhost:3002/v3')
    await verificarLaPagina(p, perfil)
    m = await medir<Muestreo>(p, MUESTREO)
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }

  const movidos = m.cuadros.filter((c, i) => i > 0 && c.y !== m.cuadros[i - 1].y).length
  const controles = [
    {
      nombre: 'el muestreo vio moverse el scroll — no es una página quieta',
      pasa: movidos > 100,
      detalle: `${movidos} cuadros con scroll distinto del anterior, de ${m.cuadros.length}`,
    },
    {
      nombre: 'y llegó al final del documento, así que el recorrido está entero',
      pasa: m.llegoAlFinal,
      detalle: `último y=${m.cuadros[m.cuadros.length - 1]?.y} de ${m.alturaDelDocumento - m.ventana}`,
    },
    {
      nombre: 'la derivación NO devuelve el mismo número para dos scrolls distintos',
      pasa: velocidadEnScroll(0).porCien !== velocidadEnScroll(9000).porCien,
      detalle: `y=0 → ${velocidadEnScroll(0).porCien.toFixed(4)} · y=9000 → ${velocidadEnScroll(9000).porCien.toFixed(4)} fh/100px`,
    },
  ]

  // fh por PANTALLA = fh por 100 px × (ventana / 100).
  const factor = m.ventana / 100
  const porCuadro = m.cuadros.map((c, i) => {
    const v = velocidadEnScroll(c.y)
    const anterior = i > 0 ? m.cuadros[i - 1] : null
    return {
      i,
      y: c.y,
      dtMs: anterior === null ? null : Math.round((c.t - anterior.t) * 100) / 100,
      dScroll: anterior === null ? null : c.y - anterior.y,
      pantalla: Math.round(v.pantalla * 1000) / 1000,
      fhPorPantalla: Math.round(v.porCien * factor * 10000) / 10000,
    }
  })

  const fh = porCuadro.map((c) => c.fhPorPantalla)
  const pasados = porCuadro.filter((c) => c.fhPorPantalla > TECHO_FH_POR_PANTALLA)
  const dts = porCuadro.map((c) => c.dtMs).filter((d): d is number => d !== null && d > 0)
  const fps = dts.map((d) => 1000 / d)
  const ordenados = [...fps].sort((a, b) => a - b)
  const p = (q: number): number => Math.round(ordenados[Math.floor(q * (ordenados.length - 1))] * 10) / 10

  // El pico sobre la grilla de 100 px, que es exactamente lo que B2 publicó.
  let picoEnGrilla = 0
  for (let y = 0; y <= m.alturaDelDocumento - m.ventana; y += 100) {
    picoEnGrilla = Math.max(picoEnGrilla, velocidadEnScroll(y).porCien * factor)
  }

  const tramos = new Map<number, { cuadros: number; fpsMin: number; fhMax: number }>()
  for (const c of porCuadro) {
    const k = Math.floor(c.y / m.ventana)
    const t = tramos.get(k) ?? { cuadros: 0, fpsMin: Number.POSITIVE_INFINITY, fhMax: 0 }
    t.cuadros += 1
    if (c.dtMs !== null && c.dtMs > 0) t.fpsMin = Math.min(t.fpsMin, 1000 / c.dtMs)
    t.fhMax = Math.max(t.fhMax, c.fhPorPantalla)
    tramos.set(k, t)
  }

  const resumen = {
    techo: TECHO_FH_POR_PANTALLA,
    cuadros: porCuadro.length,
    picoMedidoFhPorPantalla: Math.round(Math.max(...fh) * 10000) / 10000,
    picoEnGrillaDe100pxFhPorPantalla: Math.round(picoEnGrilla * 10000) / 10000,
    b2PublicoAntes: 6.0945,
    b2PublicoDespues: 4.6198,
    cuadrosPorEncimaDelTecho: pasados.length,
    fraccionPorEncimaDelTecho: Math.round((10000 * pasados.length) / porCuadro.length) / 10000,
    medioFhPorPantalla: Math.round((fh.reduce((a, b) => a + b, 0) / fh.length) * 10000) / 10000,
    dondeSePasa: pasados.length === 0 ? [] : [{ desdeY: pasados[0].y, hastaY: pasados[pasados.length - 1].y }],
    fps: { mediana: p(0.5), p05: p(0.05), minimo: Math.round(Math.min(...fps) * 10) / 10, cuadros: fps.length },
  }

  console.log('\n── EL TECHO DE VELOCIDAD, CUADRO A CUADRO (1920, scroll real) ──')
  console.log(`  cuadros muestreados: ${resumen.cuadros} · documento ${m.alturaDelDocumento} px · ventana ${m.ventana}`)
  console.log(`  pico MEDIDO cuadro a cuadro: ${resumen.picoMedidoFhPorPantalla} fh/pantalla`)
  console.log(`  pico sobre la grilla de 100 px (lo que B2 publicó): ${resumen.picoEnGrillaDe100pxFhPorPantalla}`)
  console.log(`  techo ${TECHO_FH_POR_PANTALLA} → ${resumen.cuadrosPorEncimaDelTecho} cuadros lo pasan (${(resumen.fraccionPorEncimaDelTecho * 100).toFixed(2)} %)`)
  console.log(`  medio: ${resumen.medioFhPorPantalla} fh/pantalla`)
  console.log(`  FPS: mediana ${resumen.fps.mediana} · p05 ${resumen.fps.p05} · mínimo ${resumen.fps.minimo}`)
  console.log('\n  tramo(pantalla)  cuadros  fps mín  fh/pantalla máx')
  for (const [k, t] of [...tramos.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(
      `  ${String(k).padStart(15)}  ${String(t.cuadros).padStart(7)}  ${(Math.round(t.fpsMin * 10) / 10).toFixed(1).padStart(7)}  ${t.fhMax.toFixed(4).padStart(15)}`,
    )
  }
  for (const c of controles) console.log(`  ${c.pasa ? 'ok  ' : 'FALLA'} [control] ${c.nombre} — ${c.detalle}`)

  const ruta = guardarJson('c-velocidad.json', {
    que: 'el techo de velocidad de la cámara, evaluado en cada scrollY que ocurrió durante un scroll real; y los cuadros por segundo del recorrido',
    instrumento:
      'scripts-b4/c-velocidad.ts — scrollY y reloj por requestAnimationFrame MEDIDOS en el navegador; velocidad de cámara DERIVADA con velocidadEnScroll de scripts-b2/velocidad.ts',
    emulado: true,
    perfil: '1920',
    estrangulamiento: 'ninguno',
    queEsMedidoYQueEsDerivado: {
      medido: 'scrollY por cuadro y el reloj de cada cuadro (o sea: qué posiciones ocurren y a qué ritmo pinta el navegador)',
      derivado: 'la velocidad de cámara en cada una de esas posiciones',
      porQue:
        'la escena no expone su pose al DOM (EscenaDelHome.tsx sólo emite data-escena y data-escena-fase) y el búfer de WebGL no se puede leer desde la página. Inventar una lectura de cámara sería peor que declarar la composición.',
    },
    conduccionDelScroll: `window.scrollBy(0, ${PASO_POR_CUADRO}) por requestAnimationFrame, desde 0 hasta el final del documento`,
    controlesPositivos: controles,
    resumen,
    porTramo: [...tramos.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([k, t]) => ({ pantalla: k, cuadros: t.cuadros, fpsMinimo: Math.round(t.fpsMin * 10) / 10, fhPorPantallaMax: Math.round(t.fhMax * 10000) / 10000 })),
    cuadros: porCuadro,
  })
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
