/**
 * PASADA FINAL · B3 — LA BARRA CON EL CONTACTO ABIERTO (con la marca de la raíz en vez del `:has()`):
 * npx tsx scripts-pasada/b3-contacto.ts. Abre «Contacto» de la barra, mira la marca de la raíz y la pastilla (opacidad),
 * lo cierra con Escape y vuelve a mirar después de la salida. Pide el servidor.
 */
import { medir } from '../scripts-b4/navegador'
import { abrir } from '../scripts-escena10/banco'
import { esperar } from '../scripts-viajes/banco'

const MIRAR = `(() => { const v3 = document.querySelector('[data-v3]'); const p = document.querySelector('[data-pieza="barra"] > [data-parte="pastilla"]'); return { marca: v3 ? v3.hasAttribute('data-contacto-abierto') : null, contacto: !!document.querySelector('[data-pieza="contacto"]'), pastilla: p ? getComputedStyle(p).opacity : null } })()`

async function principal(): Promise<void> {
  const b = await abrir('producto', 1440, 900)
  try {
    await medir(b.p, 'scrollTo(0, 2400)')
    await esperar(2500)
    const antes = await medir(b.p, MIRAR)
    await medir(b.p, `(document.querySelector('[data-pieza="barra"] a[href="#contacto"]') || document.querySelector('a[href="#contacto"]')).click()`)
    await esperar(1500)
    const abierto = await medir(b.p, MIRAR)
    await b.p.conexion.enviar('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }, b.p.sessionId)
    await b.p.conexion.enviar('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }, b.p.sessionId)
    await esperar(150)
    const saliendo = await medir(b.p, MIRAR)
    await esperar(1800)
    const cerrado = await medir(b.p, MIRAR)
    console.log(JSON.stringify({ antes, abierto, saliendo, cerrado }))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('b3-contacto.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
