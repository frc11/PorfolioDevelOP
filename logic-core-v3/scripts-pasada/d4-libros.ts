/**
 * PASADA FINAL · D4 — LOS LIBROS DE LA BIBLIOTECA CON EL MOUSE Y CON EL TECLADO: npx tsx scripts-pasada/d4-libros.ts
 * Busca bajando un libro que se vea entero (toda su cadena visible), pasa el mouse por encima y mira la cara (la pose
 * abierta), y después llega con Tab (modalidad de teclado: `:focus-visible`) y mira lo mismo. Pide el servidor.
 */
import { medir } from '../scripts-b4/navegador'
import { mover } from '../scripts-escena/banco-escena'
import { abrir } from '../scripts-escena10/banco'
import { esperar } from '../scripts-viajes/banco'

const VISIBLE = `(() => {
  const visible = (e) => { for (let v = e; v; v = v.parentElement) { const s = getComputedStyle(v); if (s.visibility === 'hidden' || Number(s.opacity) < 0.5 || s.display === 'none') return false } return true }
  // El que queda arriba en su propio centro (en el estante se solapan: el de al lado tapa una parte).
  const arribaEnSuCentro = (e) => { const r = e.getBoundingClientRect(); const a = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!a && a.closest('[data-pieza="libro"]') === e }
  const l = [...document.querySelectorAll('[data-pieza="libro"]')].find((e) => { const r = e.getBoundingClientRect(); return r.top > 40 && r.bottom < innerHeight - 40 && r.width > 0 && visible(e) && arribaEnSuCentro(e) })
  if (!l) return null
  l.setAttribute('data-libro-del-banco', '')
  const r = l.getBoundingClientRect()
  const x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2)
  const arriba = document.elementFromPoint(x, y)
  return { x, y, propio: !!(arriba && arriba.closest('[data-libro-del-banco]')) }
})()`
const CARA = `(() => { const l = document.querySelector('[data-libro-del-banco]'); return { hover: l.matches(':hover'), foco: l.matches(':focus-visible'), t: getComputedStyle(l.querySelector('[data-parte="cara"]')).transform.slice(0, 50) } })()`

async function principal(): Promise<void> {
  const b = await abrir('producto', 1440, 900)
  try {
    await mover(b, 8, 450)
    const fin = await medir<number>(b.p, 'document.documentElement.scrollHeight')
    let libro: { x: number; y: number; propio: boolean } | null = null
    let y = 4000
    for (; y < fin && libro === null; y += 300) {
      await medir(b.p, `scrollTo(0, ${String(y)})`)
      await esperar(500)
      libro = await medir(b.p, VISIBLE)
    }
    console.log('libro a la vista en', y, JSON.stringify(libro))
    if (libro === null) return
    await esperar(1500)
    const quieto = await medir(b.p, CARA)
    await mover(b, libro.x - 4, libro.y - 4)
    await mover(b, libro.x, libro.y)
    await esperar(1000)
    const conMouse = await medir(b.p, CARA)
    await mover(b, 8, 450)
    await esperar(1000)
    await medir(b.p, `(() => { const l = document.querySelector('[data-libro-del-banco]'); const p = l.previousElementSibling; (p && p.matches('[data-pieza="libro"]') ? p : l).focus() })()`)
    await b.p.conexion.enviar('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }, b.p.sessionId)
    await b.p.conexion.enviar('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }, b.p.sessionId)
    await esperar(1000)
    const conTeclado = await medir(b.p, `(() => { const l = document.activeElement; return l && l.matches('[data-pieza="libro"]') ? { foco: l.matches(':focus-visible'), t: getComputedStyle(l.querySelector('[data-parte="cara"]')).transform.slice(0, 50) } : { otro: l ? l.tagName : null } })()`)
    console.log(JSON.stringify({ quieto, conMouse, conTeclado }))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('d4-libros.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
