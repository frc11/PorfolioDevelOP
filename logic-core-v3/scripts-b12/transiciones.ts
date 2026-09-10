/**
 * B12 · LAS DOS TRANSICIONES DE TRABAJOS, EN PANTALLA — cuánto duran y qué se ve.
 *
 *     npx tsx scripts-b12/transiciones.ts [--perfil=1920]
 *
 * El barrido de `bloques.ts` para en la última posición en la que el panel LLENA
 * el cuadro, así que no ve ninguna de las dos costuras: ni la entrada —donde
 * Trabajos todavía está subiendo— ni la salida —donde ya se está yendo y
 * Servicios sube por el pie—. Este instrumento barre esa banda entera, de a un
 * OCTAVO de pantalla, que es el mismo paso con el que se midió la salida de la
 * referencia (`referencia-salida.ts`), y en cada parada saca dos capturas:
 *
 *   C — lo que el visitante ve (la escena, los paneles y la gota, compuestos).
 *   S — la sala sola, con todos los paneles ocultos: la LUZ, sin DOM encima.
 *
 * De ahí salen las dos cifras que la instrucción pide: **cuánto dura** cada
 * transición en pantallas de scroll y **cuánto cambia el cuadro** mientras dura.
 * La gota se lee además por su propio marcado (`[data-pieza="gota"]`): opacidad
 * y radio del gradiente, leídos del estilo que la capa escribe por cuadro.
 *
 * ⚠️ El búfer de WebGL no se lee desde la página: las dos capturas son
 * `Page.captureScreenshot`.
 */

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { leerImagen } from '../scripts-b8/glifo-alfa'
import { censarParticulas, mediaDeLaCaptura } from '../scripts-b8/particulas'

import { TEMP, argumento, asegurarCarpetas, asentarElHome, conElHome, jsonPendiente, mudarPendientes, perfilDeB11 } from './b12-comun'

/** El estado de la gota tal como la capa lo escribió en el DOM, y la caja del panel. */
const LECTOR = `(() => {
  const g = document.querySelector('[data-pieza="gota"]')
  const panel = document.querySelector('[data-panel="trabajos"]')
  const r = panel === null ? null : panel.getBoundingClientRect()
  if (g === null) return { gota: null, panel: r === null ? null : { top: r.top, bottom: r.bottom } }
  const cs = getComputedStyle(g)
  const bruto = g.style.maskImage || cs.maskImage || ''
  const nums = bruto.match(/(-?[0-9.]+)%/g)
  const m = nums === null || nums.length < 2 ? null : [null, parseFloat(nums[0]), parseFloat(nums[1])]
  return {
    gota: {
      opacidad: Number(cs.opacity),
      visible: cs.visibility !== 'hidden',
      opaco: m === null ? null : m[1],
      borde: m === null ? null : m[2],
      mask: (g.style.maskImage || cs.maskImage || '').slice(0, 90),
    },
    panel: r === null ? null : { top: r.top, bottom: r.bottom },
  }
})()`

interface Gota {
  readonly opacidad: number
  readonly visible: boolean
  readonly opaco: number | null
  readonly borde: number | null
  readonly mask: string
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const perfil = perfilDeB11(argumento('perfil', '1920'))
  const filas = await conElHome(
    perfil,
    async (s) => {
      const { pagina } = s
      await asentarElHome(s)
      const ventana = perfil.alto
      /** De la pantalla 6,5 (Trabajos todavía abajo) a la 11,5 (Servicios ya arriba). */
      const desde = Math.round(6.5 * ventana)
      const hasta = Math.round(11.5 * ventana)
      const paso = Math.round(ventana / 8)
      const salida: Record<string, unknown>[] = []
      for (let y = desde; y <= hasta; y += paso) {
        const logrado = await scrollA(pagina, y)
        if (Math.abs(logrado - y) > 2) throw new Error(`se pidió y=${y} y el scroll quedó en ${logrado}`)
        await esperarElPrimerCuadro(pagina)
        await new Promise((r) => setTimeout(r, 700))
        const base = `${TEMP}/transicion-${perfil.id}-${logrado}`
        await capturar(pagina, `${base}-C.png`)
        const leido = await medir<{ gota: Gota | null; panel: { top: number; bottom: number } | null }>(pagina, LECTOR)
        /**
         * ⚠️ **ACÁ NO SE OCULTA NADA, Y ES DELIBERADO.** `bloques.ts` saca la
         * captura de la sala sola escondiendo los paneles, y eso funciona
         * mientras el panel medido LLENA el cuadro. En esta banda no lo llena
         * —de eso se trata— y esconder los ocho paneles **colapsa el documento**:
         * el scroll se va a cero y la escena dibuja la pose del hero. Se midió:
         * en la pantalla 8,24 el cuadro compuesto daba 26,8 de gris y la
         * «sala sola» 126,1, o sea la pose equivocada. Lo que este instrumento
         * publica es EL CUADRO COMPUESTO, que además es lo que el visitante ve.
         */
        const imagenC = leerImagen(`${base}-C.png`)
        const C = mediaDeLaCaptura(imagenC)
        const S = C
        const censo = C.luminancia < 0.3 ? censarParticulas(imagenC) : null
        salida.push({
          scrollY: logrado,
          pantalla: Math.round((logrado / ventana) * 1000) / 1000,
          cuadro: { gris: C.gris, luminancia: C.luminancia },
          sala: null,
          particulas: censo === null ? null : { cantidad: censo.cantidad, diametroMediano: censo.diametroMediano, picoMediano: censo.picoMediano, fondoGris: censo.fondoGris },
          gota: leido.gota,
          panelTrabajos: leido.panel,
        })
        console.log(
          `pantalla ${(logrado / ventana).toFixed(3)} (y=${String(logrado).padStart(6)}) · cuadro gris ${C.gris.toFixed(1).padStart(6)} lum ${C.luminancia.toFixed(4)} · ` +
            '' +
            (leido.gota === null
              ? ' · gota SIN MONTAR'
              : ` · gota ${leido.gota.visible ? `α${leido.gota.opacidad.toFixed(2)} r${leido.gota.opaco ?? '?'}→${leido.gota.borde ?? '?'}%` : 'oculta'}`) +
            (censo === null ? '' : ` · motas ${censo.cantidad} ⌀${censo.diametroMediano} pico ${censo.picoMediano} sobre ${censo.fondoGris}`),
        )
      }
      return salida
    },
    'b12-transiciones',
  )
  jsonPendiente(`transiciones-${perfil.id}`, {
    perfil: perfil.id,
    instrumento: 'Page.captureScreenshot cada 1/8 de pantalla entre la 6,5 y la 11,5; el mismo paso con el que se midió la salida de la referencia',
    filas,
  })
  for (const e of mudarPendientes()) console.log(`escrito: ${e}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
