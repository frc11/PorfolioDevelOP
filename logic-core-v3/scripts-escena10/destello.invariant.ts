/**
 * SPRINT ESCENA 10 · CIERRE — EL INVARIANTE DEL DESTELLO, con scroll real: `npm run test:escena-destello`.
 *
 * ⚠️ **Pide el servidor de desarrollo en :3000 y una placa** (con `BANCO_GPU=alta`, la NVIDIA; la de la página se lee y
 * se imprime). Por eso su script no tiene la forma `test:sNN-…`: `verificar` deriva sus suites de esos nombres y corre
 * sin servidor. Tarda unos tres minutos. Lo que se puede prometer sin navegador (el orden del cuadro, el viaje que cambia
 * de luz) está en `s36-escena10`, sección CIERRE.
 *
 * El defecto (Valentino, grabación a 30 cps): saliendo de Tu panel hacia Por qué develOP, UN cuadro de día (piso
 * blanco, sombra negra, logo negro) entre cuadros de noche. Era el orden del cuadro: el amanecer decidía la noche
 * sostenida DESPUÉS de que el rig la leyera, y el rig dibujaba con la del cuadro anterior (`Amanecer.tsx`, «El orden
 * del cuadro»). Lo que se mide acá, en lo que se ve (`destello-instrumento.ts`), con la rueda por CDP y Lenis:
 *
 *   · el tramo Tu panel → Por qué develOP, ida y vuelta a tres velocidades: ningún salto de luminancia entre dos
 *     cuadros seguidos fuera del barrido del amanecer, y ningún destello (uno o dos cuadros que se salen del rango de
 *     sus vecinos) en todo el tramo, barrido incluido;
 *   · sin verde por no llegar: cada pasada midió por lo menos 100 pares a la vista, arrancó con la compuerta apagada, y
 *     entre las tres pasaron A LA VISTA la compuerta que se prende, el cambio a día y el cambio a noche;
 *   · los viajes del menú que cruzan el final (los dos que cambian de luz y uno de día a día): ningún destello;
 *   · control positivo, por el camino del defecto: con la noche sostenida por el amanecer, el banco la da vuelta UN
 *     cuadro (`__amanecerDelBanco.destello`), el rig la lee y dibuja la sala de día; los dos detectores lo tienen que ver.
 */
import { afirmar, cerrar, controlPositivo, titulo } from '../src/app/v3/_lib/__tests__/afirmar'
import { medir } from '../scripts-b4/navegador'
import { abrirMotor } from '../scripts-calidad/motor/abrir'
import { clicEnElItem } from '../scripts-viajes/b-humo'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { ORIGEN, UMBRAL, UMBRAL_DEL_PICO, VELOCIDADES, acontecimientos, grabarCuadros, idaYVuelta, irAlControl, tope, tramoFinal } from './destello'
import { INSTRUMENTO, bandasALaVista, destellosEn, saltosEn } from './destello-instrumento'

const VIAJES = ['trabajos>por-que-develop', 'por-que-develop>trabajos', 'hero>por-que-develop'] as const
const A_LA_VISTA = ['compuerta-prende', 'cambio-a-dia', 'cambio-a-noche'] as const

async function principal(): Promise<void> {
  const b = await abrirMotor(1440, 900, { conVsync: true })
  try {
    const placa = await medir<string>(b.p, `(() => { const gl = document.createElement('canvas').getContext('webgl2'); const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) })()`)
    titulo(`El destello de un cuadro, con scroll real (1440 × 900, ${placa})`)
    afirmar(process.env.BANCO_GPU !== 'alta' || /NVIDIA/i.test(placa), 'la placa es la pedida (leída en la página, no supuesta por la bandera)', placa)
    afirmar((await medir<string>(b.p, INSTRUMENTO)) === 'puesto', 'el instrumento lee el lienzo en el mismo cuadro en que se dibuja')

    titulo('Tu panel → Por qué develOP, ida y vuelta con la rueda')
    const vistos = new Set<string>()
    for (const [vel, cadaMs] of Object.entries(VELOCIDADES)) {
      const { desde, muescas } = await tramoFinal(b)
      const r = await idaYVuelta(b, desde, muescas, cadaMs)
      const l = saltosEn(r.cuadros, UMBRAL)
      const picos = destellosEn(r.cuadros, UMBRAL_DEL_PICO)
      for (const e of acontecimientos(r.cuadros)) if (bandasALaVista(r.cuadros[e.i]).filter(Boolean).length >= 2) vistos.add(e.que)
      afirmar(r.cuadros[0]?.activo === 0 && l.medidos >= 100, `${vel}: arrancó con la compuerta apagada y midió ${String(l.medidos)} pares a la vista fuera del barrido`, `barrido ${String(l.barrido)} · tapados ${String(l.tapados)} · cortes ${String(l.cortes)}`)
      afirmar(l.saltos.length === 0, `${vel}: ningún salto de luminancia entre dos cuadros seguidos fuera del barrido (umbral ${String(UMBRAL)})`, l.saltos.length === 0 ? `el mayor: ${String(l.mayor)}` : JSON.stringify(l.saltos[0]))
      afirmar(picos.length === 0, `${vel}: ningún destello en todo el tramo, barrido incluido (umbral ${String(UMBRAL_DEL_PICO)})`, picos.length === 0 ? '' : JSON.stringify(picos[0]))
    }
    afirmar(A_LA_VISTA.every((q) => vistos.has(q)), 'las pasadas cruzaron A LA VISTA la compuerta que se prende, el cambio a día y el cambio a noche (no es verde por no llegar)', [...vistos].join(', '))

    titulo('Los viajes del menú que cruzan el final')
    for (const caso of VIAJES) {
      const [o, d] = caso.split('>')
      const donde = ORIGEN[o]
      await scrollHasta(b, donde === null ? 0 : await tope(b, donde[0], donde[1]))
      await esperar(1500)
      const r = await grabarCuadros(b, async () => {
        await clicEnElItem(b, d)
        await esperar(5500)
      })
      const picos = destellosEn(r.cuadros, UMBRAL_DEL_PICO)
      afirmar(r.cuadros.filter((c) => c.viaje === 1).length >= 30 && picos.length === 0, `${o} → ${d}: ningún destello en el viaje`, picos.length === 0 ? `${String(r.cuadros.filter((c) => c.viaje === 1).length)} cuadros de viaje` : JSON.stringify(picos[0]))
    }

    titulo('Control positivo: un cuadro con la noche sostenida al revés, por el camino del defecto')
    const hay = await medir<boolean>(b.p, 'typeof window.__amanecerDelBanco?.destello === "function"')
    afirmar(hay, 'el amanecer del banco expone `destello`')
    if (hay) {
      await irAlControl(b)
      const c = await grabarCuadros(b, async () => {
        await esperar(500)
        await medir(b.p, 'window.__amanecerDelBanco.destello()')
        await esperar(600)
      })
      afirmar(c.cuadros.some((x) => x.activo === 1 && x.sostiene === 0 && x.s < 2.4 && x.noche < 0.5), 'el control dibujó la sala de día con el amanecer antes del cambio (el cuadro del defecto)')
      controlPositivo('el detector de saltos VE el cuadro dado vuelta', c.cuadros, (x) => saltosEn(x, UMBRAL).saltos.length === 0)
      controlPositivo('el detector de destellos VE el cuadro dado vuelta', c.cuadros, (x) => destellosEn(x, UMBRAL_DEL_PICO).length === 0)
    }
  } finally {
    await b.cerrar()
  }
  cerrar('escena-destello')
}

principal().catch((e: unknown) => {
  console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`)
  process.exit(1)
})
