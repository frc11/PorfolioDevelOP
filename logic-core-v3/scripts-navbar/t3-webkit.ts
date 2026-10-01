/**
 * SPRINT NAVBAR V3 · T3 — el menú del teléfono en WebKit (Playwright 1.61, WebKit 26.5): t3-webkit.ts
 *
 * Lo que se puede probar acá de la versión de Safari: que el panel NO lleve la lente (el filtro SVG en el
 * `backdrop-filter`, que Safari no pinta y que le apagaría el desenfoque), que declare el desenfoque con el prefijo de
 * WebKit, y que el diálogo ande (abrir, el foco atrapado, Esc, el foco de vuelta al botón). Con un clip y una captura.
 *
 * ⚠️ Lo que NO se puede probar acá: cómo se VE el vidrio. El WebKit de Playwright en Windows no pinta
 * `backdrop-filter` (ni el desenfoque solo: medido con una página mínima); el aspecto en Safari se mira en el iPhone.
 * Va a `navbar/t3-menu/webkit/`.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { webkit } from 'playwright'

const DIR = 'C:/Users/Valentino/.cache/b4-medicion/navbar/t3-menu/webkit'

async function principal(): Promise<void> {
  mkdirSync(DIR, { recursive: true })
  const navegador = await webkit.launch()
  const contexto = await navegador.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
    reducedMotion: 'no-preference',
    recordVideo: { dir: DIR, size: { width: 390, height: 844 } },
  })
  const p = await contexto.newPage()
  const salida: Record<string, unknown> = {}
  try {
    await p.goto('http://localhost:3000/v3', { waitUntil: 'load', timeout: 180_000 })
    await p.waitForTimeout(6000)
    salida.motor = await p.evaluate(() => navigator.userAgent)
    salida.modo = await p.evaluate(() => document.querySelector('[data-pieza="barra"]')?.getAttribute('data-modo'))
    await p.click('[data-parte="boton-del-menu"]')
    await p.waitForTimeout(1500)
    salida.abierto = await p.evaluate(() => {
      const m = document.querySelector<HTMLElement>('#menu-movil')
      if (m === null) return null
      const s = getComputedStyle(m)
      return {
        visible: s.visibility,
        lente: m.hasAttribute('data-lente'),
        filtroSvg: document.getElementById('lente-del-menu') !== null,
        backdrop: s.backdropFilter,
        backdropWebkit: s.getPropertyValue('-webkit-backdrop-filter'),
        tono: m.getAttribute('data-seccion') === 'invertida' ? 'vidrio oscuro' : 'vidrio claro',
        foco: document.activeElement?.textContent?.trim(),
      }
    })
    await p.screenshot({ path: `${DIR}/abierto.png` })
    const recorrido: string[] = []
    for (let k = 0; k < 8; k += 1) {
      await p.keyboard.press('Tab')
      recorrido.push(await p.evaluate(() => (document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent ?? '').trim()))
    }
    salida.tabAdentro = recorrido
    await p.keyboard.press('Escape')
    await p.waitForTimeout(1200)
    salida.cerrado = await p.evaluate(() => ({
      visible: getComputedStyle(document.querySelector('#menu-movil') as Element).visibility,
      focoEnElBoton: document.activeElement === document.querySelector('[data-parte="boton-del-menu"]'),
    }))
    await p.tap('[data-parte="boton-del-menu"]')
    await p.waitForTimeout(1400)
    await p.tap('[data-parte="cerrar-el-menu"]')
    await p.waitForTimeout(1200)
  } finally {
    await contexto.close()
    await navegador.close()
  }
  writeFileSync(`${DIR}/webkit.json`, JSON.stringify(salida, null, 1))
  console.log(JSON.stringify(salida, null, 1))
}

principal().catch((e: unknown) => {
  console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`)
  process.exit(1)
})
