/**
 * B7 · FRENTE D — LO QUE `d-cuadro-largo.ts` LE HACE A LA PÁGINA Y LEE DE ELLA.
 *
 * Salió del instrumento cuando pasó las 300 líneas del repo, con el mismo corte
 * que hizo B5 entre `d-vitales.ts` y `vitales-lectores.ts`: acá está **lo que se
 * ejecuta en el navegador y cómo se conduce el scroll**, y allá quedó **lo que
 * decide y compara**, que es lo que hay que leer para juzgar si la medición
 * significa algo.
 *
 * Las cuatro piezas de acá son las cuatro que la primera corrida obligó a
 * escribir; cada una tiene su cicatriz en su docblock.
 */

import { medir, type Pagina } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'

import { dos } from './b7-comun'

/** El perfil del barrido. Es el de B5: la cifra que se juzga se midió a 1440. */
export const PERFIL = perfilPorId('1440')

/** Los mismos 12 s y los mismos 24 px por cuadro que usó `scripts-b5/d-vitales.ts`. */
export const DURACION_MS = 12_000
export const PASO_PX = 24

/**
 * ⚠️ **LA VELOCIDAD SE IGUALA, NO EL DELTA POR EVENTO — y la primera corrida
 * explicó por qué.**
 *
 * El brazo de `scrollBy` avanza `PASO_PX` por CUADRO: a la mediana medida de
 * 75,19 fps son ~1.800 px/s, y recorre el documento entero (15.300 px) en unos
 * 8,5 s. El brazo de rueda despacha desde Node y cada `Input.dispatchMouseEvent`
 * es una ida y vuelta por el socket con el renderer ocupado: medido, **~26
 * eventos por segundo, no 60**. Con el mismo delta de 24 px eso da ~620 px/s, y
 * en 12 s la rueda llegó a y=7.100 — o sea que **nunca visitó el y≈10.500 donde
 * vive el cuadro que se está juzgando**. Un «no aparece» ahí no habría sido un
 * resultado: habría sido una comprobación verde por vacío, y de la peor clase,
 * porque el propio instrumento le habría sacado a la entrada la región bajo
 * prueba.
 *
 * La salida es calibrar: se mide la velocidad real de la rueda y se escala el
 * delta para que los dos brazos recorran el MISMO documento en el MISMO tiempo.
 * Y de paso queda más parecido a un visitante: una rueda real no despacha 60
 * eventos por segundo, despacha pocos y grandes.
 */
export const VELOCIDAD_OBJETIVO_PX_S = 1_800
export const CALIBRACION_MS = 2_500

export interface Cuadro {
  readonly t: number
  readonly y: number
}

export interface Barrido {
  readonly cuadros: readonly Cuadro[]
  readonly bloqueoInyectadoEnElCuadro: number | null
}

/**
 * EL LECTOR, adentro de la página. **Es el mismo para los tres brazos** — lo
 * único que cambia es quién mueve el scroll.
 *
 * Guarda la promesa en `window.__b7barrido` en vez de devolverla, para que Node
 * pueda conducir la rueda MIENTRAS el lector corre. La expresión de afuera
 * devuelve `true` en el acto, así que `medir` no se queda esperando.
 *
 * `y` va por cuadro y no sólo al final: el cuadro largo se ubica por PÍXEL de
 * documento, que es lo único comparable entre dos brazos que avanzan a ritmos
 * distintos.
 */
export function arrancarElLector(opciones: {
  readonly conScrollBy: boolean
  readonly bloqueoEnElCuadro: number | null
  readonly bloqueoMs: number
}): string {
  const empuje = opciones.conScrollBy ? `window.scrollBy(0, ${PASO_PX})` : ''
  const bloqueo =
    opciones.bloqueoEnElCuadro === null
      ? ''
      : `if (marcas.length === ${opciones.bloqueoEnElCuadro}) { const fin = performance.now() + ${opciones.bloqueoMs}; while (performance.now() < fin) {} }`
  return `(() => {
    window.__b7barrido = (async () => {
      const t0 = performance.now()
      const marcas = []
      await new Promise((listo) => {
        const paso = (t) => {
          marcas.push({ t: Math.round(t * 100) / 100, y: window.scrollY })
          ${bloqueo}
          ${empuje}
          if (t - t0 < ${DURACION_MS}) requestAnimationFrame(paso)
          else listo()
        }
        requestAnimationFrame(paso)
      })
      return { cuadros: marcas, bloqueoInyectadoEnElCuadro: ${opciones.bloqueoEnElCuadro} }
    })()
    return true
  })()`
}

/**
 * ⚠️ **QUE LA PÁGINA ESTÉ ENTERA — y por qué NO se reusa la de B5.**
 *
 * `scripts-b5/pagina.ts · verificarQueLaPaginaEstaEntera` exige que los ocho
 * paneles midan un múltiplo exacto del viewport, y **hoy eso es falso con la
 * página perfectamente sana**: a 1440 `servicios` mide 2.775 px y `cierre` 923,7
 * —los dos fuera de la grilla de 900—, y no es de hoy: la tabla publicada por
 * B4-B (`docs/rediseno/outputs/b4/c-anclas.json`) ya trae `servicios → tu-panel
 * = 2.774,95`. O sea que ese guardián **tira sobre una página correcta**, y
 * cualquier instrumento que lo llame no llega a medir. Se reporta como hallazgo
 * y no se toca: es de otro frente.
 *
 * Lo que hace falta es lo mismo que ese guardián buscaba —distinguir la página
 * compuesta de una a medio compilar, sin hoja de estilos— con una propiedad que
 * hoy sea verdadera: los OCHO paneles, el documento arriba de 15.000 px y el
 * hero midiendo EXACTAMENTE una ventana (`min-h-svh`). Una página sin CSS no
 * cumple ninguna de las tres.
 */
export async function verificarQueLaPaginaEstaEntera(p: Pagina): Promise<void> {
  const estado = await medir<{ paneles: number; hero: number; docH: number }>(
    p,
    `(() => {
      const ps = [...document.querySelectorAll('[data-panel]')]
      const hero = document.querySelector('[data-panel="hero"]')
      return {
        paneles: ps.length,
        hero: hero === null ? -1 : Math.round(hero.getBoundingClientRect().height),
        docH: document.documentElement.scrollHeight,
      }
    })()`,
  )
  const problemas: string[] = []
  if (estado.paneles !== 8) problemas.push(`hay ${estado.paneles} paneles y tienen que ser 8`)
  if (estado.hero !== PERFIL.alto) problemas.push(`el hero mide ${estado.hero} y tiene que medir ${PERFIL.alto}`)
  if (estado.docH < 15_000) problemas.push(`el documento mide ${estado.docH} px: es más corto que el recorrido`)
  if (problemas.length > 0) throw new Error(`la página no está entera — ${problemas.join(' · ')}`)
}

/**
 * ⚠️ **EL SELLO CONTRA LA RECARGA — pagado dos veces en este mismo archivo, y
 * es una regla de método del banco.**
 *
 * `next dev` recompila y **recarga la página** cuando un archivo del árbol
 * cambia. Un barrido dura 12 s y una corrida entera 90: en un árbol donde
 * trabajan varios frentes a la vez, la probabilidad de comer una recompilación
 * en el medio no es chica. La primera vez se manifestó como «Cannot read
 * properties of undefined», que no dice nada de la causa; la segunda, ya con el
 * sello puesto, se manifestó como lo que era.
 *
 * El sello se pone una vez por sesión de página y se comprueba después de cada
 * brazo: si no está, la página se recargó y **la corrida entera se corta** en
 * vez de pegar cuadros de dos documentos distintos.
 *
 * ⚠️ Corolario operativo: **este barrido se corre contra el build de producción**
 * (`next start`, `.next-probe`), que no tiene HMR. Contra `next dev` sólo es
 * confiable si nadie más está tocando `src/`.
 */
export const SELLO = `window.__b7sello = ${Date.now()}`
export const RECARGA =
  'la página se RECARGÓ en medio del barrido (el sello se perdió). Con `next dev`, cualquier edición de `src/` —de este frente o de otro— recompila y recarga: o se corre contra el build de producción, o nadie toca el árbol mientras esto corre.'

export async function verificarQueNoSeRecargo(p: Pagina): Promise<void> {
  const vivo = await medir<boolean>(p, 'typeof window.__b7sello === "number"')
  if (!vivo) throw new Error(RECARGA)
}

/**
 * ⚠️ **EL MOTOR DE SCROLL MONTA TARDE, Y MEDIR ANTES ES MEDIR OTRA PÁGINA.**
 *
 * `CompuertaDelScrollSuave` pide `ScrollSuaveDeV3` con un `import()` perezoso,
 * así que la instancia de Lenis NO existe cuando la página termina de cargar.
 * Medido en las dos superficies, leyendo `data-v3-scroll-suave` dos veces en la
 * misma carga: a +1.200 ms (la gracia de escena) da **null** en el 3005 y en el
 * 3002; a +5.000 ms da `v3-scroll-suave-b5` en los dos, y el `<html>` recién ahí
 * tiene la clase `lenis`.
 *
 * La consecuencia es grave para este archivo en particular: una corrida que
 * empieza a +1.200 ms mide los primeros brazos **sin el motor que está bajo
 * prueba**. Por eso esto no es una espera de cortesía sino una precondición: si
 * el motor no aparece, **se tira**, porque sin él la pregunta de D-B5.5 no
 * existe.
 *
 * ── ⚠️ Y UNA CORRECCIÓN DE MÉTODO, PORQUE ESTE DOCBLOCK LLEGÓ A AFIRMAR UNA
 *    PRUEBA QUE NO PROBABA NADA ──────────────────────────────────────────────
 *
 * Decía, textual: *«se comprobó de la forma más literal posible — la calibración
 * de la rueda a 24 px por evento movió 456 px con 19 eventos, o sea 24,0 px por
 * evento exactos, que es scroll NATIVO y no un motor que interpola»*.
 *
 * **Ese argumento no discrimina.** `/v3` construye Lenis con `OPCIONES_DE_LENIS`
 * (`ScrollSuaveDeV3.tsx:54`, importadas de `@/components/layout/SmoothScroll`),
 * y ahí `wheelMultiplier: 1`. O sea que **con** el motor el desplazamiento TOTAL
 * también es `n × 24`: lo que Lenis cambia es la CURVA entre eventos, no la
 * suma. Medido con el motor confirmado —atributo presente y clase `lenis` en el
 * `<html>`— da **23,968 px/evento**, indistinguible de los 23,968 px/evento sin
 * él; y la propia calibración de este banco, que corre DESPUÉS de esperar el
 * motor, publica 1.462 px / 61 eventos = **23,97 px/evento**. Los tres números
 * son el mismo, con motor y sin motor.
 *
 * **Lo que sí discrimina es lo que esta función ya usa**: el atributo
 * `data-v3-scroll-suave` del `<html>` y la clase `lenis` que la librería cuelga
 * ahí. Se afirma eso, que es una observación del árbol, y no un total de scroll
 * que las dos hipótesis producen igual.
 *
 * La regla, que es la del bloque entero: **un argumento con forma de medición
 * que no separa las dos hipótesis es peor que ninguno**, porque se lee como
 * cerrado. Es la misma familia que «verde por arnés», un piso más abajo.
 */
export async function esperarElMotorDeScroll(p: Pagina, msMaximo = 20_000): Promise<string> {
  const hasta = Date.now() + msMaximo
  while (Date.now() < hasta) {
    const marca = await medir<string | null>(p, `document.documentElement.getAttribute('data-v3-scroll-suave')`)
    if (marca !== null) return marca
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(
    `el motor de scroll de /v3 no montó en ${msMaximo} ms (\`data-v3-scroll-suave\` sigue ausente): sin él, el brazo de la rueda no mide lo que este archivo pregunta`,
  )
}
