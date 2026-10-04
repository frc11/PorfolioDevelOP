/**
 * PASADA FINAL · D — EL ANCHO DE LA PÁGINA: npx tsx scripts-pasada/d-ancho.ts. Recorre /v3 a 1440, 1024 y 390 y dice el
 * ancho máximo del documento contra el de la ventana (una barra horizontal es un documento más ancho). Pide el servidor.
 */
import { medir } from '../scripts-b4/navegador'
import { abrir } from '../scripts-escena10/banco'
import { esperar } from '../scripts-viajes/banco'
async function principal(): Promise<void> {
  for (const [w, h] of [[1440, 900], [1024, 768], [390, 844]] as const) {
    const b = await abrir('producto', w, h)
    try {
      const total = await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight')
      let maximo = 0
      for (let y = 0; y <= total; y += Math.round(h / 2)) {
        await medir(b.p, `scrollTo(0, ${String(y)})`)
        await esperar(350)
        maximo = Math.max(maximo, await medir<number>(b.p, 'document.documentElement.scrollWidth'))
      }
      console.log(w, 'documento', maximo, 'ventana', await medir<number>(b.p, 'document.documentElement.clientWidth'))
    } finally {
      await b.cerrar()
    }
  }
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(e); process.exit(1) })
