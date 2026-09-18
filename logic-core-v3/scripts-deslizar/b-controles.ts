/**
 * DESLIZAR-1 · FASE B — LOS CONTROLES POSITIVOS DE LA REVERSIBILIDAD.
 *
 *     npx tsx scripts-deslizar/b-controles.ts
 *
 * Cuatro corridas en un Chrome propio, contra el dev server de ESTE worktree.
 * `s18-deslizamiento.invariant` afirma la ESTRUCTURA del sprint sobre el fuente;
 * esto mide el COMPORTAMIENTO, que es lo único que un invariante no puede ver.
 *
 *   0. **el viaje** — el click desliza y frena donde el ancla frena;
 *   1. **cancelar a mitad** — una rueda a los 800 ms apaga el velo y suelta el
 *      scroll;
 *   2. **el botón de atrás** — un `history.back()` a mitad de vuelo apaga el velo;
 *   3. **el click durante el intro** — con la capa puesta, el botón NO desliza.
 *
 * ── ⚠️ LAS CUATRO REGLAS DE MEDICIÓN QUE ESTE BANCO HONRA ────────────────
 *
 *   1. **La pestaña tiene que estar visible.** `verificarLaPagina` tira si
 *      `visibilityState !== 'visible'` o si `innerWidth` no da el perfil: con la
 *      pestaña tapada no se despachan eventos de scroll, no corre `rAF` y
 *      `innerWidth` da 0. Es la lección de agosto de `CLAUDE.md`, y acá invalida
 *      TODO: el sprint entero es una medición de scroll.
 *   2. **El preloader no arma bajo `webdriver`.** Las corridas 0 a 2 van con
 *      `PUENTE_DE_AUTOMATIZACION` + `MARCA_DE_INTRO`: el visitante de la visita
 *      repetida, que es la rama donde el deslizamiento tiene que andar. La
 *      corrida 3 va con el puente y **`SIN_MARCA_DE_INTRO`**, que es la única
 *      forma de que la secuencia CORRA y la compuerta tenga algo que frenar.
 *   3. **La rueda va por CDP.** `Input.dispatchMouseEvent` con
 *      `type: 'mouseWheel'` produce un evento de verdad, que es el que
 *      `VirtualScroll` escucha. Un `new WheelEvent` despachado a mano mediría el
 *      arnés.
 *   4. **El velo se muestrea por cuadro, no al final.** Un velo que se prende y
 *      se apaga entre dos lecturas no existe para el instrumento. Cada corrida
 *      devuelve la serie entera.
 */
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from '../scripts-b4/navegador'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { perfilPorId } from '../scripts-b4/perfiles'
import type { Pagina } from '../scripts-b4/navegador'
import { MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION, SIN_MARCA_DE_INTRO } from '../scripts-b5/b5-comun'
import {
  ATRIBUTO_DEL_VELO,
  DURACION_DEL_DESLIZAMIENTO_S,
  PRELUDIO_MS,
  SELECTOR_DEL_CTA_DEL_HERO,
} from '../src/app/v3/_componentes/deslizamiento'

/** 3007: el puerto de ESTE worktree. El 3000 es del lane de `rediseno/home`. */
const ORIGEN = process.env.ORIGEN_DESLIZAR ?? 'http://localhost:3007'
const PERFIL = perfilPorId('1440')

/** Lo que dura todo, desde el click. Sale de las constantes, no de un numero. */
const TOTAL_MS = PRELUDIO_MS + DURACION_DEL_DESLIZAMIENTO_S * 1000
/** La mitad del RECORRIDO, que es donde la curva nueva va mas rapido. */
const MITAD_DEL_VIAJE_MS = PRELUDIO_MS + (DURACION_DEL_DESLIZAMIENTO_S * 1000) / 2
/**
 * 🔴 Y el instante TEMPRANO, adentro del preludio: con una curva que arranca
 * suave, una rueda aca cancela un viaje que todavia no movio un pixel.
 */
const TEMPRANO_MS = 100

interface Muestra {
  readonly t: number
  readonly y: number
  readonly velo: boolean
  readonly inerte: boolean
}

interface Corrida {
  readonly nombre: string
  readonly muestras: readonly Muestra[]
  /** Cuanto tardo `cta.click()` en volver. Si es grande, el hilo estaba tomado. */
  readonly tDelClick: number
  /** Donde estaba el scroll cuando se clickeo. */
  readonly yAlClickear: number
  /** El velo leido en la MISMA vuelta del bucle: mide si el escucha ya estaba. */
  readonly veloSincronico: boolean
  readonly altoDeLaVentana: number
  readonly altoDeLaSeccion: number
  /** Que % del viewport ocupa `#trabajos` al frenar, medido sobre su rect. */
  readonly fraccionDelViewport: number
  /** Cuantos px de la seccion quedan por ENCIMA del borde de arriba. */
  readonly recorteDeArriba: number
  readonly hash: string
  readonly focoAlFinal: string
  readonly largoDelHistorial: number
  readonly yFinal: number
}

/**
 * EL MUESTREADOR, adentro de la página.
 *
 * Clickea el CTA y muestrea por cuadro `scrollY`, el atributo del velo y el
 * `inert` del `<main>` durante `msTotal`. `interrupcion` es el nombre de lo que
 * se hace a los `msDeLaInterrupcion` —`nada`, `atras`— y la rueda la inyecta el
 * proceso de afuera por CDP, porque desde acá sería un evento sintético.
 */
function fuenteDelMuestreo(msTotal: number, msDeLaInterrupcion: number, interrupcion: string): string {
  return `(async () => {
    const cta = document.querySelector(${JSON.stringify(SELECTOR_DEL_CTA_DEL_HERO)})
    if (cta === null) throw new Error('no encuentro el CTA del hero')
    const main = document.querySelector('[data-v3] main')
    if (main === null) throw new Error('no encuentro el <main>')
    const muestras = []
    const t0 = performance.now()
    let interrumpido = false
    const yAlClickear = Math.round(window.scrollY)
    cta.click()
    const tDelClick = Math.round(performance.now() - t0)
    // El velo LEIDO EN LA MISMA VUELTA DEL BUCLE DE EVENTOS que el click: si el
    // escucha delegado esta instalado, ya tiene que estar puesto.
    const veloSincronico = main.hasAttribute(${JSON.stringify(ATRIBUTO_DEL_VELO)})
    await new Promise((listo) => {
      const cuadro = () => {
        const t = performance.now() - t0
        muestras.push({
          t: Math.round(t),
          y: Math.round(window.scrollY),
          velo: main.hasAttribute(${JSON.stringify(ATRIBUTO_DEL_VELO)}),
          inerte: main.hasAttribute('inert'),
        })
        if (!interrumpido && t >= ${msDeLaInterrupcion} && ${JSON.stringify(interrupcion)} === 'atras') {
          interrumpido = true
          history.back()
        }
        if (t >= ${msTotal}) { listo(); return }
        requestAnimationFrame(cuadro)
      }
      requestAnimationFrame(cuadro)
    })
    const activo = document.activeElement
    // EL ATERRIZAJE, medido sobre el rect REAL y no sobre la tabla: la regla del
    // repo es que el alto de la tabla es un min-height y el natural puede ser otro.
    const destino = document.getElementById('trabajos')
    const caja = destino === null ? null : destino.getBoundingClientRect()
    const visible = caja === null ? 0 : Math.max(0, Math.min(window.innerHeight, caja.bottom) - Math.max(0, caja.top))
    return {
      muestras,
      tDelClick,
      yAlClickear,
      veloSincronico,
      altoDeLaVentana: window.innerHeight,
      altoDeLaSeccion: caja === null ? 0 : Math.round(caja.height),
      fraccionDelViewport: Math.round((visible / window.innerHeight) * 1000) / 10,
      recorteDeArriba: caja === null ? 0 : Math.round(Math.max(0, -caja.top)),
      hash: location.hash,
      focoAlFinal: activo === null ? 'ninguno' : (activo.tagName.toLowerCase() + (activo.id === '' ? '' : '#' + activo.id)),
      largoDelHistorial: history.length,
      yFinal: Math.round(window.scrollY),
    }
  })()`
}

/** La rueda de verdad, por CDP, a mitad del viaje. */
async function rodarLaRueda(p: Pagina): Promise<void> {
  await p.conexion.enviar(
    'Input.dispatchMouseEvent',
    {
      type: 'mouseWheel',
      x: Math.round(PERFIL.ancho / 2),
      y: Math.round(PERFIL.alto / 2),
      deltaX: 0,
      deltaY: 120,
      pointerType: 'mouse',
    },
    p.sessionId,
  )
}

/**
 * ⚠ El perfil se limpia UNA sola vez, antes de la primera corrida, y no en cada
 * una: `lanzarChrome` borra el directorio con `rmSync`, y si el Chrome anterior
 * todavia no solto los descriptores eso tira `EPERM` a mitad del banco. Cada
 * corrida igual arranca con `sessionStorage` vacio porque el pre-paint le escribe
 * (o le borra) la marca del intro antes del primer pintado.
 */
let primeraCorrida = true

async function correr(
  nombre: string,
  { conIntro = false, interrupcion = 'nada', msDeLaInterrupcion = 800 } = {},
): Promise<Corrida> {
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('deslizar'),
    ancho: PERFIL.ancho,
    alto: PERFIL.alto + 120,
    limpiarPerfil: primeraCorrida,
  })
  primeraCorrida = false
  try {
    const p = await abrirPagina(chrome)
    try {
      await emular(p, PERFIL)
      for (const fuente of [PUENTE_DE_AUTOMATIZACION, conIntro ? SIN_MARCA_DE_INTRO : MARCA_DE_INTRO]) {
        await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: fuente }, p.sessionId)
      }
      // `marcaDeIntro: false`: las marcas las registra el bucle de arriba, y si
      // `irA` agregara la suya DESPUES pisaria el `SIN_MARCA_DE_INTRO` del control 3.
      await irA(p, `${ORIGEN}/v3`, { marcaDeIntro: false })
      await verificarLaPagina(p, PERFIL)
      // El asentamiento: la escena tarda entre 300 y 700 ms en tener algo, y el
      // dev server compila la ruta en el primer pedido.
      await medir(p, `new Promise((r) => setTimeout(r, ${conIntro ? 400 : 2500}))`)
      /**
       * ⚠ EL RESET TIENE QUE SER CONSCIENTE DE LENIS, y la primera corrida lo
       * demostro: `window.scrollTo(0, 0)` deja el DOM en 0 y Lenis lo devuelve a
       * su `animatedScroll`, que no es 0 (se midio 328 px). Es la propiedad que
       * `scrollSuave.ts` ya declara —*«Lenis no suaviza el scroll: REEMPLAZA el
       * valor de la posicion»*— y que `SmoothScroll` resuelve en `/` con un
       * `lenis.scrollTo(0, { immediate: true })`. Aca no hay instancia a mano, asi
       * que se hace lo equivalente desde el DOM: scrollear y esperar cuadros hasta
       * que la lectura se quede quieta en 0.
       */
      await medir(
        p,
        `(async () => {
          for (let i = 0; i < 40; i += 1) {
            window.scrollTo(0, 0)
            await new Promise((r) => requestAnimationFrame(r))
            if (window.scrollY === 0) { await new Promise((r) => requestAnimationFrame(r)) }
            if (window.scrollY === 0) return window.scrollY
          }
          return window.scrollY
        })()`,
      )

      const msTotal = TOTAL_MS + 1200
      const pedido = medir<Corrida>(p, fuenteDelMuestreo(msTotal, msDeLaInterrupcion, interrupcion))
      if (interrupcion === 'rueda') {
        await new Promise((r) => setTimeout(r, msDeLaInterrupcion))
        await rodarLaRueda(p)
      }
      const salida = await pedido
      return { ...salida, nombre }
    } finally {
      await cerrarPagina(p)
    }
  } finally {
    await cerrarChrome(chrome)
    await new Promise((r) => setTimeout(r, 900))
  }
}

function informar(c: Corrida): void {
  const conVelo = c.muestras.filter((m) => m.velo)
  const conInerte = c.muestras.filter((m) => m.inerte)
  const primera = conVelo[0]
  const ultima = conVelo[conVelo.length - 1]
  console.log(`\n── ${c.nombre} ─────────────────────────────────────────────`)
  console.log(`  ${c.muestras.length} cuadros en ${c.muestras[c.muestras.length - 1]?.t ?? 0} ms`)
  console.log(
    `  CLICK: y=${c.yAlClickear} px al clickear · \`click()\` volvio en ${c.tDelClick} ms · velo puesto EN LA MISMA VUELTA: ${c.veloSincronico}`,
  )
  console.log(
    conVelo.length === 0
      ? '  VELO: nunca se prendió'
      : `  VELO: prendido de ${primera?.t} a ${ultima?.t} ms (${conVelo.length} cuadros) · apagado al final: ${!(c.muestras[c.muestras.length - 1]?.velo ?? false)}`,
  )
  console.log(
    conInerte.length === 0
      ? '  INERT: nunca se puso'
      : `  INERT: puesto en ${conInerte.length} cuadros · suelto al final: ${!(c.muestras[c.muestras.length - 1]?.inerte ?? false)}`,
  )
  console.log(`  SCROLL: 0 → ${c.yFinal} px   ·   hash "${c.hash}"   ·   foco "${c.focoAlFinal}"`)
  console.log(
    `  ATERRIZAJE: \`#trabajos\` mide ${c.altoDeLaSeccion} px y ocupa ${c.fraccionDelViewport} % de los ${c.altoDeLaVentana} px del viewport` +
      ` · ${c.recorteDeArriba} px por encima del borde`,
  )
  const hitos = [0, 300, 600, 1000, 2600, 4600, 5400].map((ms) => {
    const m = c.muestras.find((x) => x.t >= ms)
    return m === undefined ? `${ms}:—` : `${ms}:${m.y}`
  })
  console.log(`  y por hito (ms:px)  ${hitos.join('  ')}`)
}

async function principal(): Promise<void> {
  const corridas: Corrida[] = []
  corridas.push(await correr('0 · EL VIAJE — click y nada más'))
  corridas.push(
    await correr(`1 · CANCELAR A MITAD — una rueda a los ${MITAD_DEL_VIAJE_MS} ms`, {
      interrupcion: 'rueda',
      msDeLaInterrupcion: MITAD_DEL_VIAJE_MS,
    }),
  )
  corridas.push(
    await correr(`1b · 🔴 LA RUEDA TEMPRANA — a los ${TEMPRANO_MS} ms, ADENTRO del preludio`, {
      interrupcion: 'rueda',
      msDeLaInterrupcion: TEMPRANO_MS,
    }),
  )
  corridas.push(
    await correr(`2 · EL BOTÓN DE ATRÁS — a los ${MITAD_DEL_VIAJE_MS} ms`, {
      interrupcion: 'atras',
      msDeLaInterrupcion: MITAD_DEL_VIAJE_MS,
    }),
  )
  corridas.push(await correr('3 · CLICK DURANTE EL INTRO — la capa puesta', { conIntro: true, msDeLaInterrupcion: 999_999 }))

  for (const c of corridas) informar(c)

  console.log('')
  console.log('── LA LECTURA ──────────────────────────────────────────────')
  const viaje = corridas[0]
  const rueda = corridas[1]
  const temprana = corridas[2]
  const atras = corridas[3]
  const intro = corridas[4]

  /** ¿Se movio el scroll durante el preludio? Es LA medicion de la pausa. */
  const enElPreludio = (c: Corrida | undefined): number => {
    if (c === undefined) return -1
    const m = c.muestras.filter((x) => x.t <= PRELUDIO_MS)
    return m.reduce((peor, x) => Math.max(peor, Math.abs(x.y - (c.muestras[0]?.y ?? 0))), 0)
  }
  console.log(`  🔴 LA PAUSA: el scroll se movio ${enElPreludio(viaje)} px en los primeros ${PRELUDIO_MS} ms del viaje (tiene que ser 0)`)
  console.log(`  el viaje llegó a ${viaje?.yFinal} px; la rueda a mitad lo dejó en ${rueda?.yFinal}; la temprana en ${temprana?.yFinal}; atrás en ${atras?.yFinal}`)
  console.log(
    `  velo prendido: viaje ${viaje?.muestras.filter((m) => m.velo).length} cuadros · rueda ${rueda?.muestras.filter((m) => m.velo).length} · temprana ${temprana?.muestras.filter((m) => m.velo).length} · atrás ${atras?.muestras.filter((m) => m.velo).length} · intro ${intro?.muestras.filter((m) => m.velo).length}`,
  )
  console.log(`  velo APAGADO al final en las CINCO: ${corridas.every((c) => !(c.muestras[c.muestras.length - 1]?.velo ?? true))}`)
  console.log(`  inert SUELTO al final en las CINCO: ${corridas.every((c) => !(c.muestras[c.muestras.length - 1]?.inerte ?? true))}`)
  console.log(
    `  🔴 LA RUEDA TEMPRANA: velo apagado ${!(temprana?.muestras[temprana.muestras.length - 1]?.velo ?? true)}` +
      ` · el viaje NO salio despues de cancelar: llego a ${temprana?.yFinal} px de los ${viaje?.yFinal} del viaje completo`,
  )
  console.log(`  ATERRIZAJE del viaje: ${viaje?.fraccionDelViewport} % del viewport`)
}

void principal()
