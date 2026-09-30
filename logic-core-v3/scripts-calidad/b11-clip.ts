/**
 * SPRINT CALIDAD 1 — B11 · el clip de la calidad adaptativa: b11-clip.ts [ancho alto dpr]
 *
 * El amanecer congelado en su pico, con vsync, grabado 18 s: los primeros 4 con la calidad fija y después con la
 * adaptativa prendida, que baja de a un escalón (menos motas con fundido, menos dpr de a 10 %). Para juzgar si los
 * escalones se notan. Más un recorte al doble del centro.
 */
import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { grabar } from '../scripts-escena/banco-escena'
import { recorte } from '../scripts-escena/clips6'
import { carpeta } from './banco'
import { abrirMotor } from './motor/abrir'

const [ANCHO, ALTO, DPR] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900), Number(process.argv[4] ?? 1.5)]

async function principal(): Promise<void> {
  const dir = carpeta('b11-adaptativa')
  const b = await abrirMotor(ANCHO, ALTO, { dpr: DPR, conVsync: true })
  try {
    const pie = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - 0.12 * innerHeight) })()`)
    await medir(b.p, `window.__cuadrosDelBanco.recorrer(0, ${String(pie)}, 3000)`)
    await medir(b.p, 'window.__amanecerDelBanco.congelar(4.9)')
    await esperar(2500)
    const destino = `${dir}/amanecer-adaptativa-${String(ANCHO)}@${String(DPR)}x`
    const banco = b as unknown as Parameters<typeof grabar>[0]
    const r = await grabar(banco, destino, async () => {
      await esperar(4000)
      await medir(b.p, 'window.__calidadDelBanco.activa(true)')
      await esperar(14000)
    }, ANCHO)
    recorte(`${destino}.mp4`, `${destino}-centro-x2.mp4`, Math.round(ANCHO / 2 - 240), Math.round(ALTO / 2 - 150), 480, 300)
    console.log(JSON.stringify(r))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('b11-clip.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
