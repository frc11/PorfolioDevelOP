/**
 * B12 · EL LENTE DE P7 Y EL REVELADO, EN EL NAVEGADOR — la frontera que la
 * instrucción manda no romper.
 *
 *     npx tsx scripts-b12/lente.ts [--perfil=1920]
 *
 * ⚠️ **Es `scripts-b8/g-escena.ts` con UNA diferencia: el origen.** Aquél clava
 * `ORIGEN` en el 3001 —el dev server de `C:\v3-luz`, que sigue vivo al lado— y
 * esta sesión corre en el 3000. Medir contra el 3001 sería medir el árbol de
 * otro worktree sin enterarse. El lector del lente, el de la máscara y la cuenta
 * del origen son los MISMOS: se importan, no se copian.
 *
 * ── Por qué hay que volver a medirlo en B12 ───────────────────────────────
 *
 * Porque **la caja del bloque de P7 cambió**. B12 sacó el marco clavado arriba
 * —el título y la bajada— y el bloque pasó de `relative min-h-0 flex-1` adentro
 * de un `Envoltorio` con relleno a `relative h-full w-full` a sangre. El lente
 * se calcula contra ESA caja (`origenDeLaLente(rect, ventana)`), así que si el
 * bloque se mueve, el punto de fuga se mueve con él. La instrucción lo dice con
 * todas las letras: **los −3000 px caen a 63,6 unidades, adentro de la pared del
 * fondo, y eso no se toca.**
 *
 * ── Y el revelado, por la misma razón ─────────────────────────────────────
 *
 * El Cierre pasó de `oscuro-transparente` a `papel-transparente` (§2). Las dos
 * dejan ver el canvas, así que **las seis costuras no cambian** — y eso es lo
 * que esta corrida comprueba en vez de darlo por hecho.
 */

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { FOCO_EN_ALTOS_DE_VENTANA, origenDeLaLente } from '../src/app/v3/_lib/motion/lente'
import { LECTOR_DE_PANELES } from '../scripts-b8/lectores'

import { argumento, asegurarCarpetas, asentarElHome, conElHome, jsonPendiente, mudarPendientes, perfilDeB11 } from './b12-comun'

const LECTOR_DEL_LENTE = `(() => {
  const bloque = document.querySelector('[data-panel="trabajos"] [data-anclaje="seccion"]')
  if (bloque === null) throw new Error('no hay bloque de P7 con anclaje de sección')
  const cs = getComputedStyle(bloque)
  const r = bloque.getBoundingClientRect()
  const pegado = bloque.closest('[data-pinneado]')
  const rp = pegado === null ? null : pegado.getBoundingClientRect()
  return {
    perspective: cs.perspective,
    perspectiveOrigin: cs.perspectiveOrigin,
    rect: { left: r.left, top: r.top, width: r.width, height: r.height },
    pegado: rp === null ? null : { top: rp.top, height: rp.height, position: getComputedStyle(pegado).position },
    ventana: { ancho: innerWidth, alto: innerHeight },
  }
})()`

const LECTOR_DE_LA_MASCARA = `(() => {
  const el = document.querySelector('[data-escena]')
  return el === null ? null : (el.style.maskImage || el.style.webkitMaskImage || '')
})()`

interface Lente {
  readonly perspective: string
  readonly perspectiveOrigin: string
  readonly rect: { readonly left: number; readonly top: number; readonly width: number; readonly height: number }
  readonly pegado: { readonly top: number; readonly height: number; readonly position: string } | null
  readonly ventana: { readonly ancho: number; readonly alto: number }
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const perfil = perfilDeB11(argumento('perfil', '1920'))
  const salida = await conElHome(
    perfil,
    async (s) => {
      await asentarElHome(s)
      const paneles = await medir<{ id: string; top: number; alto: number }[]>(s.pagina, LECTOR_DE_PANELES)
      const panel = (id: string): { id: string; top: number; alto: number } => {
        const p = paneles.find((x) => x.id === id)
        if (p === undefined) throw new Error(`no existe ${id}`)
        return p
      }
      const v = perfil.alto
      const trabajos = panel('trabajos')

      const lente: Record<string, unknown>[] = []
      for (const f of [0, 0.5, 1]) {
        const y = Math.round(trabajos.top + f * (trabajos.alto - 2 * v))
        await scrollA(s.pagina, y)
        await esperarElPrimerCuadro(s.pagina)
        await new Promise((r) => setTimeout(r, 400))
        const leido = await medir<Lente>(s.pagina, LECTOR_DEL_LENTE)
        const esperado = {
          perspectivePx: FOCO_EN_ALTOS_DE_VENTANA * leido.ventana.alto,
          origen: origenDeLaLente({ left: leido.rect.left, top: leido.rect.top }, leido.ventana),
        }
        /**
         * ⚠️ La comparación es NUMÉRICA y no de cadena: el navegador devuelve
         * `1712.66px` y `960px 540px` donde la cuenta da `1712.6611932761348px` y
         * `960.0px 540.0px`. Comparar los literales daba un rojo que sólo hablaba
         * del redondeo de `getComputedStyle`, no del lente.
         */
        const px = (v: string): number[] => (v.match(/-?[0-9.]+/g) ?? []).map(Number)
        const cerca = (a: number[], b: number[]): boolean => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < 0.01)
        const coincide = cerca(px(leido.perspective), [esperado.perspectivePx]) && cerca(px(leido.perspectiveOrigin), px(esperado.origen))
        lente.push({ scrollY: y, leido, esperado, coincide })
        console.log(
          `y=${String(y).padStart(6)} · perspective ${leido.perspective} (esperado ${esperado.perspectivePx}px) · origen ${leido.perspectiveOrigin} (esperado ${esperado.origen}) · ` +
            `bloque (${leido.rect.left.toFixed(0)}, ${leido.rect.top.toFixed(0)}) de ${leido.rect.width.toFixed(0)}×${leido.rect.height.toFixed(0)} · pegado ${leido.pegado === null ? '—' : `${leido.pegado.position} top ${leido.pegado.top.toFixed(0)}`} · ${coincide ? 'COINCIDE' : '⚠ NO COINCIDE'}`,
        )
      }

      const fronteras = [
        { de: 'hero', a: 'quienes-somos', espera: 'ninguna' },
        { de: 'quienes-somos', a: 'numeros', espera: 'ninguna' },
        { de: 'numeros', a: 'trabajos', espera: 'ninguna' },
        { de: 'trabajos', a: 'servicios', espera: 'sale' },
        { de: 'tu-panel', a: 'por-que-develop', espera: 'entra' },
        { de: 'por-que-develop', a: 'cierre', espera: 'ninguna' },
      ] as const
      const revelado: Record<string, unknown>[] = []
      for (const f of fronteras) {
        const y = Math.round(panel(f.a).top - v / 2)
        await scrollA(s.pagina, y)
        await esperarElPrimerCuadro(s.pagina)
        await new Promise((r) => setTimeout(r, 400))
        const mascara = await medir<string | null>(s.pagina, LECTOR_DE_LA_MASCARA)
        const hay = mascara !== null && mascara !== ''
        revelado.push({ frontera: `${f.de} → ${f.a}`, scrollY: y, mascara, espera: f.espera, coincide: (f.espera === 'ninguna') === !hay })
        console.log(`${`${f.de} → ${f.a}`.padEnd(34)} y=${String(y).padStart(6)} · espera ${f.espera.padEnd(8)} · máscara ${hay ? mascara?.slice(0, 70) : '(ninguna)'}`)
      }
      return { lente, revelado }
    },
    'b12-lente',
  )
  jsonPendiente(`lente-${perfil.id}`, { perfil: perfil.id, ...salida })
  for (const e of mudarPendientes()) console.log(`escrito: ${e}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
