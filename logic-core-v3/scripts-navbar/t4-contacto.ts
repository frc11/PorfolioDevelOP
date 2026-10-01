/**
 * SPRINT NAVBAR V3 · T4 — el contacto en el teléfono: t4-contacto.ts [rotulo]
 *
 * A 390 × 844 y a 375 × 667 (los altos con que los bancos del repo miden el teléfono), y a 390 × 664 y 375 × 548 (los
 * mismos con las barras de Safari a la vista, aproximados): abre el formulario desde el menú
 * («Contacto») y mide si entra entero en una pantalla —el alto del contenido contra el de la hoja, y dónde queda el
 * botón de enviar—, con una captura de la hoja abierta. Va a `navbar/t4-contacto/<rotulo>/`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, carpeta, correr, esperar } from './banco'

const MEDIDA = `(() => {
  const hoja = document.querySelector('[data-pieza="contacto"] [data-parte="hoja"]')
  const enviar = hoja.querySelector('button[type="submit"]')
  const r = enviar.getBoundingClientRect()
  const h = hoja.getBoundingClientRect()
  const adentro = hoja.firstElementChild.getBoundingClientRect()
  return { cuadro: [innerWidth, innerHeight], alto: Math.round(adentro.height), svh: Math.round(document.documentElement.clientHeight), hoja: Math.round(h.height), contenido: hoja.scrollHeight, sobra: Math.round(h.height - hoja.scrollHeight), enviarAbajo: Math.round(r.bottom), enviarALaVista: r.bottom <= innerHeight && r.top >= 0, desliza: hoja.scrollHeight > hoja.clientHeight + 1 }
})()`

correr(async () => {
  const dir = carpeta(`t4-contacto/${process.argv[2] ?? 'despues'}`)
  const salida: Record<string, unknown> = {}
  // Los dos de los bancos del repo, y los mismos con las barras de Safari a la vista (el `svh` de un iPhone 14/15 y de un SE, aproximado).
  for (const [ancho, alto] of [[390, 844], [375, 667], [390, 664], [375, 548]] as const) {
    const b = await abrir(ancho, alto)
    try {
      await medir(b.p, `document.querySelector('[data-parte="boton-del-menu"]').click()`)
      await esperar(1400)
      await medir(b.p, `document.querySelector('[data-pieza="menu-movil"] button[data-parte="item-del-menu"]').click()`)
      await esperar(2200)
      salida[`${String(ancho)}x${String(alto)}`] = await medir(b.p, MEDIDA)
      const c = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
      writeFileSync(`${dir}/${String(ancho)}x${String(alto)}.png`, Buffer.from(c.data, 'base64'))
    } finally {
      await b.cerrar()
    }
  }
  writeFileSync(`${dir}/medida.json`, JSON.stringify(salida, null, 1))
  console.log(JSON.stringify(salida))
})
