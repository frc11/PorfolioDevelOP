/**
 * PASADA FINAL · D7 — EL CAZADOR DE DESBORDES: npx tsx scripts-pasada/d7-cazador.ts. Baja por /v3 de a media pantalla
 * con el puntero en un borde y, en el PRIMER cuadro en que el documento se ensancha, busca por eliminación qué lo
 * estira (y lista lo que cruza el borde derecho). Ancho, alto y lado del puntero, en el archivo. Pide el servidor.
 */
import { medir } from '../scripts-b4/navegador'
import { mover } from '../scripts-escena/banco-escena'
import { abrir } from '../scripts-escena10/banco'
import { esperar } from '../scripts-viajes/banco'
async function principal(): Promise<void> {
  const b = await abrir('producto', 1440, 900)
  try {
    await esperar(1500)
    await mover(b, 1432, 450)
    await medir(b.p, `(() => {
      window.__cazado = null
      const buscar = (el, base, prof) => {
        const res = []
        for (const h of el.children) {
          const antes = h.style.display
          h.style.display = 'none'
          const sin = document.documentElement.scrollWidth
          h.style.display = antes
          if (sin < base) {
            res.push(h.tagName.toLowerCase() + '.' + String(h.className).split(' ').slice(0, 4).join('.') + (h.getAttribute('data-pieza') ? '[' + h.getAttribute('data-pieza') + ']' : '') + (h.getAttribute('data-parte') ? '(' + h.getAttribute('data-parte') + ')' : '') + (h.getAttribute('data-panel') ? '{' + h.getAttribute('data-panel') + '}' : '') + ' r=' + h.getBoundingClientRect().right.toFixed(0) + ' tr=' + getComputedStyle(h).transform.slice(0, 40))
            if (prof < 18) res.push(...buscar(h, base, prof + 1))
            break
          }
        }
        return res
      }
      const mirar = () => {
        const w = document.documentElement.scrollWidth
        if (window.__cazado === null && w > document.documentElement.clientWidth) {
          const fuera = [...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).position !== 'fixed').filter((e) => e.getBoundingClientRect().right > document.documentElement.clientWidth + 0.5).slice(0, 12).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).split(' ').slice(0, 5).join('.') + (e.getAttribute('data-pieza') ? '[' + e.getAttribute('data-pieza') + ']' : '') + (e.getAttribute('data-parte') ? '(' + e.getAttribute('data-parte') + ')' : '') + ' r=' + e.getBoundingClientRect().right.toFixed(0) + ' w=' + e.getBoundingClientRect().width.toFixed(0) + ' tr=' + getComputedStyle(e).transform.slice(0, 50) + ' op=' + getComputedStyle(e).opacity)
          window.__cazado = { y: Math.round(scrollY), w, fuera, cadena: buscar(document.body, w, 0) }
        }
        if (window.__cazado === null) requestAnimationFrame(mirar)
      }
      requestAnimationFrame(mirar)
    })()`)
    for (let y = 0; y <= 30000; y += 450) {
      await medir(b.p, `scrollTo(0, ${String(y)})`)
      await esperar(900)
      const c = await medir(b.p, 'window.__cazado')
      if (c !== null) break
    }
    console.log(JSON.stringify(await medir(b.p, 'window.__cazado'), null, 1))
  } finally {
    await b.cerrar()
  }
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(e); process.exit(1) })
