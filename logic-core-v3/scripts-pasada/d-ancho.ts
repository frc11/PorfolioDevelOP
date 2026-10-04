/**
 * PASADA FINAL · D — EL ANCHO DE LA PÁGINA: npx tsx scripts-pasada/d-ancho.ts. Recorre /v3 a 1440, 1024 y 390 y dice el
 * ancho máximo del documento contra el de la ventana (una barra horizontal es un documento más ancho). Pide el servidor.
 */
import { medir } from '../scripts-b4/navegador'
import { mover } from '../scripts-escena/banco-escena'
import { abrir } from '../scripts-escena10/banco'
import { esperar } from '../scripts-viajes/banco'
async function principal(): Promise<void> {
  // El puntero en los dos bordes: la cámara viva lo sigue y lo que va con su homografía (el pie de volumen) se corre.
  for (const [w, h, x] of [[1440, 900, 8], [1440, 900, 1432], [1024, 768, 8], [1024, 768, 1016], [390, 844, 8]] as const) {
    const b = await abrir('producto', w, h)
    try {
      await mover(b, x, Math.round(h / 2))
      const total = await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight')
      let maximo = 0
      for (let y = 0; y <= total; y += Math.round(h / 2)) {
        await medir(b.p, `scrollTo(0, ${String(y)})`)
        await esperar(350)
        maximo = Math.max(maximo, await medir<number>(b.p, 'document.documentElement.scrollWidth'))
      }
      console.log(w, 'puntero en', x, 'documento', maximo, 'ventana', await medir<number>(b.p, 'document.documentElement.clientWidth'))
    } finally {
      await b.cerrar()
    }
  }
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(e); process.exit(1) })
