/**
 * ¿TIENE EL ESTADO 00 DE SERVICIOS ALGÚN SCROLL PROPIO ADENTRO DEL PIN?
 *
 *     npx tsx scripts-b4/s4-estado00.ts
 *
 * El punto 7 del sprint pide que «Nuestros servicios» LLEGUE con el gesto de la
 * casa. Un gesto de la casa se consume sobre un progreso, y el único progreso
 * que la sección tiene es el del pin. `secciones.ts` afirma —en prosa— que el
 * estado 00 «se lee en la APROXIMACIÓN, con el progreso acotado en 0». Si eso
 * es cierto, no hay ni un píxel de scroll durante el cual el gesto pueda correr,
 * y el punto está bloqueado por estructura y no por esfuerzo.
 *
 * Esto lo pregunta midiendo, no leyendo. Barre el scroll desde un viewport antes
 * del panel hasta bien entrado el pin y anota, cuadro por cuadro:
 *
 *   · qué ranura del rodillo está encendida (opacidad computada = la posición
 *     disparada, sin tener que alcanzar un valor de motion desde afuera);
 *   · dónde está el tope del panel sticky (0 = el pin enganchó);
 *   · el tope de la <section>, para saber cuánto falta para que enganche.
 *
 * Lo que se busca son dos números: el último scroll en el que el 00 sigue
 * encendido, y el primero en el que el pin engancha. Si el primero es mayor o
 * igual que el segundo, el 00 tiene recorrido propio y el gesto se puede colgar
 * ahí. Si es menor, no lo tiene.
 */

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const URL_BASE = 'http://localhost:3000'
const PERFIL = perfilPorId('1440')

/** Lo que tarda el disparo del rodillo en posarse, con aire. */
const ASENTAMIENTO_MS = 1800

interface Muestra {
  readonly y: number
  /** Qué ranuras tienen opacidad > 0,5. En una meseta es una sola. */
  readonly encendidas: number[]
  /** El tope del panel sticky: 0 cuando el pin enganchó. */
  readonly topeDelSticky: number
  /** El tope de la sección en el viewport. */
  readonly topeDeLaSeccion: number
}

const SONDA = `(() => {
  const caja = document.querySelector('[data-rodillo="estados"]')
  if (caja === null) return null
  const tira = caja.firstElementChild
  const ranuras = [...tira.children]
  const encendidas = ranuras
    .map((r, i) => (parseFloat(getComputedStyle(r).opacity) > 0.5 ? i : -1))
    .filter((i) => i >= 0)
  const seccion = caja.closest('section') ?? caja.closest('[data-panel]')
  const sticky = caja.closest('[class*="sticky"]') ?? caja.parentElement
  return {
    y: window.scrollY,
    encendidas,
    topeDelSticky: sticky.getBoundingClientRect().top,
    topeDeLaSeccion: seccion.getBoundingClientRect().top,
  }
})()`

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({
    perfil: 'C:/Users/Valentino/.cache/b4-medicion/s4-estado00',
    ancho: PERFIL.ancho,
    alto: PERFIL.alto + 120,
  })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, `${URL_BASE}/v3`)
    await verificarLaPagina(p, PERFIL)

    const lista = await paneles(p)
    const servicios = lista.find((s) => s.id === 'servicios')
    if (servicios === undefined) throw new Error('no se encontró el panel de servicios')
    console.log(`\nservicios: top ${servicios.top.toFixed(0)} px · alto ${servicios.alto.toFixed(0)} px · viewport ${PERFIL.alto}`)

    // Desde un viewport ANTES de que el panel entre, hasta un viewport después
    // de que enganche. El paso es chico a propósito: la frontera que se busca
    // puede caer en decenas de píxeles.
    const desde = Math.max(0, servicios.top - PERFIL.alto * 1.2)
    const hasta = servicios.top + PERFIL.alto * 0.6
    const paso = 40

    const muestras: Muestra[] = []
    for (let y = desde; y <= hasta; y += paso) {
      // ⚠️ DOS DEFECTOS DE INSTRUMENTO, LOS DOS PAGADOS EN ESTA MEDICIÓN.
      //
      // 1. Sin esperar, las DOS ranuras salen encendidas en todo el barrido: es
      //    `ranuraVisible` mostrando la que sale y la que entra mientras la
      //    rotación de 1,4 s corre. La primera corrida barrió 27 pasos en menos
      //    de lo que tarda UNA rotación y leyó [0,1] de punta a punta —un falso
      //    «el 00 tiene 520 px de recorrido propio».
      // 2. Y esperando quieto, el scroll SE VA: el sitio corre con scroll suave,
      //    así que un `scrollTo` deja inercia y a los 1,8 s la página está en
      //    otro lado. La segunda corrida devolvió `y` saltando de 10.313 a 9.390
      //    y a 6.653 sin haberlo pedido.
      //
      // El arreglo cierra los dos a la vez: se RE-PIDE la posición mientras se
      // espera, así que la página se queda quieta y la rotación igual corre.
      await medir<number>(
        p,
        `(async () => {
          const objetivo = ${String(y)}
          const hasta = performance.now() + ${String(ASENTAMIENTO_MS)}
          while (performance.now() < hasta) {
            window.scrollTo(0, objetivo)
            await new Promise((r) => setTimeout(r, 60))
          }
          return window.scrollY
        })()`,
      )
      const m = await medir<Muestra | null>(p, SONDA)
      if (m !== null) muestras.push(m)
    }

    const con00 = muestras.filter((m) => m.encendidas.includes(0))
    const pinneadas = muestras.filter((m) => m.topeDelSticky <= 0.5)
    const ultimoCon00 = con00.length === 0 ? null : con00[con00.length - 1]
    const primeraPinneada = pinneadas.length === 0 ? null : pinneadas[0]

    console.log(`\nmuestras: ${muestras.length}  ·  con el 00 encendido: ${con00.length}  ·  con el pin enganchado: ${pinneadas.length}`)
    console.log(`  el 00 se lee de y=${con00[0]?.y ?? NaN} a y=${ultimoCon00?.y ?? NaN}`)
    console.log(`  el pin engancha en y=${primeraPinneada?.y ?? NaN}`)

    if (ultimoCon00 !== null && primeraPinneada !== null) {
      const propio = ultimoCon00.y - primeraPinneada.y
      console.log(
        propio >= paso
          ? `\n  => el 00 TIENE ${propio.toFixed(0)} px de scroll propio adentro del pin: el gesto se puede colgar ahí`
          : `\n  => el 00 NO tiene scroll propio adentro del pin (${propio.toFixed(0)} px): se lee entero en la aproximación`,
      )
    }

    console.log('\n  y  | ranuras encendidas | tope sticky | tope seccion')
    for (const m of muestras) {
      console.log(
        `  ${String(m.y).padStart(6)} | ${JSON.stringify(m.encendidas).padStart(18)} | ${m.topeDelSticky.toFixed(0).padStart(11)} | ${m.topeDeLaSeccion.toFixed(0).padStart(12)}`,
      )
    }

    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(`\nSE CORTÓ: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
