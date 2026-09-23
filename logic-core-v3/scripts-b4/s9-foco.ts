/**
 * EL PISO DEL FOCO, EN EL NAVEGADOR — lo que ve alguien que entra con el teclado.
 *
 *     npx tsx scripts-b4/s9-foco.ts
 *
 * La revisión adversarial del sprint encontró dos paradas de teclado invisibles:
 * el nombre de cada captura —el piso caía en el borde de la banda del rótulo, en
 * opacidad 0— y el CTA —su enlace no vive en una captura y no tenía piso—. Esto
 * enfoca cada parada con el scroll todavía en el cartel, SIN dejar que el foco
 * mueva la página (como pasa con Tab cuando el panel clavado ya está a la vista),
 * espera el reposo y mide lo que se ve.
 */

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const PERFIL = perfilPorId('1440')
/** El resorte llega al 99 % en ~2,1 s: se espera con margen. */
const REPOSO_MS = 3200

interface Lectura {
  readonly foco: string
  readonly scrollY: number
  readonly anchoDeLaCaptura: number
  readonly opacidadDelRotulo: number
  readonly anchoDelCta: number
}

const ENFOCAR_Y_LEER = (selector: string, indice: number): string => `(async () => {
  const blanco = document.querySelectorAll(${JSON.stringify(selector)})[${String(indice)}]
  if (!blanco) return null
  blanco.focus({ preventScroll: true })
  await new Promise((r) => setTimeout(r, ${String(REPOSO_MS)}))
  const captura = blanco.closest('[data-captura]')
  const rotulo = captura === null ? null : captura.querySelector('[data-rotulo]')
  const cta = document.querySelector('[data-pieza="ventana-del-cta"]')
  return {
    foco: (document.activeElement && (document.activeElement.textContent || document.activeElement.getAttribute('aria-label') || '')).trim().slice(0, 40),
    scrollY: window.scrollY,
    anchoDeLaCaptura: captura === null ? 0 : captura.getBoundingClientRect().width / window.innerWidth,
    opacidadDelRotulo: rotulo === null ? -1 : Number(getComputedStyle(rotulo).opacity),
    anchoDelCta: cta === null ? 0 : cta.getBoundingClientRect().width / window.innerWidth,
  }
})()`

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/s9-foco', ancho: PERFIL.ancho, alto: PERFIL.alto + 120 })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, 'http://localhost:3000/v3')
    await verificarLaPagina(p, PERFIL)
    const trabajos = (await paneles(p)).find((s) => s.id === 'trabajos')
    if (trabajos === undefined) throw new Error('falta trabajos')
    // En el cartel: el túnel todavía no arrancó (arranca en top + 950).
    await medir<number>(
      p,
      `(async () => { const h = performance.now() + 2500; while (performance.now() < h) { window.scrollTo(0, ${String(trabajos.top + 400)}); await new Promise((r) => setTimeout(r, 40)) } return 1 })()`,
    )
    const paradas: [string, number][] = [
      ['[data-rotulo] a', 0],
      ['[data-rotulo] a', 1],
      ['[data-rotulo] a', 2],
      ['[data-pieza="enlace-del-cta"]', 0],
    ]
    for (const [selector, i] of paradas) {
      const l = await medir<Lectura | null>(p, ENFOCAR_Y_LEER(selector, i))
      if (l === null) {
        console.log(`  ${selector}[${String(i)}]: no encontrado`)
        continue
      }
      console.log(
        `  foco en «${l.foco}»  scrollY ${String(l.scrollY)}  captura ${(l.anchoDeLaCaptura * 100).toFixed(1)} % del cuadro  rótulo en opacidad ${l.opacidadDelRotulo.toFixed(3)}  CTA ${(l.anchoDelCta * 100).toFixed(1)} %`,
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
    console.error(`\nSE CORTO: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
