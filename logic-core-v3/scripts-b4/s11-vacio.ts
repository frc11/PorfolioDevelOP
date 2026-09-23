/**
 * EL VACÍO DE LA SALIDA, MIRADO — a 1440×900 y a 1440×1300.
 *
 *     npx tsx scripts-b4/s11-vacio.ts
 *
 * La aceptación del sprint, y nada más:
 *
 *   · después del CTA aparece un vacío chiquito en el centro que crece hasta
 *     revelar la escena entera, y lleno no queda ningún resto del túnel;
 *   · a 1440×1300 también, que es donde la salida vieja no vaciaba el cuadro;
 *   · y el solape de Portfolio rige sólo desde escritorio: se leen los topes de
 *     Números y Trabajos a 393 y a 1440.
 *
 * En cada punto se posa el scroll —el resorte del túnel tarda ~2,1 s—, se lee el
 * recorte que la caja del túnel tiene puesto y se saca una foto. Los puntos van en
 * px de la sección contados a 900, como toda la geometría, y se pasan al scroll
 * real con el alto real de la sección, así caen en el mismo lugar a los dos altos.
 *
 * ⚠️ `Page.captureScreenshot` congela los pasos de render: después de cada foto
 * se re-emula el viewport (lección del repo).
 */

import { mkdirSync } from 'node:fs'

import { capturar } from './captura'
import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId, type Perfil } from './perfiles'
import { paneles } from './sitio'

const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/s11-vacio'
const PX_DE_LA_SECCION = 6813
/** La espera, el nacimiento, el crecimiento, el lleno (4.851) y los demos. */
const PUNTOS = [3830, 3895, 4100, 4350, 4600, 4800, 4860, 5100] as const
const POSADO_MS = 3000

const ALTO: Perfil = {
  ...perfilPorId('1440'),
  id: '1440x1300',
  nombre: '1440 × 1300',
  procedencia: 'una pantalla alta: la salida vieja trasladaba 1.131 px y ahí no vaciaba el cuadro',
  alto: 1300,
}

async function posarEn(p: Awaited<ReturnType<typeof abrirPagina>>, y: number): Promise<void> {
  await medir<number>(
    p,
    `(async () => { const h = performance.now() + ${String(POSADO_MS)}; while (performance.now() < h) { window.scrollTo(0, ${String(y)}); await new Promise((r) => setTimeout(r, 40)) } return 1 })()`,
  )
}

async function topes(perfil: Perfil): Promise<void> {
  const chrome = await lanzarChrome({ perfil: `C:/Users/Valentino/.cache/b4-medicion/s11-vacio-${perfil.id}`, ancho: perfil.ancho, alto: perfil.alto + 120 })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, 'http://localhost:3000/v3')
    await verificarLaPagina(p, perfil)
    const lista = await paneles(p)
    const n = lista.find((s) => s.id === 'numeros')
    const t = lista.find((s) => s.id === 'trabajos')
    if (n === undefined || t === undefined) throw new Error('faltan paneles')
    const solape = n.top + n.alto - t.top
    console.log(`  ${perfil.id.padEnd(10)} Números termina en ${(n.top + n.alto).toFixed(0)} · Trabajos arranca en ${t.top.toFixed(0)} → solape ${solape.toFixed(0)} px (${((solape / perfil.alto) * 100).toFixed(1)} % del alto)`)
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

async function elVacio(perfil: Perfil): Promise<void> {
  const dir = `${SALIDA}/${perfil.id}`
  mkdirSync(dir, { recursive: true })
  const chrome = await lanzarChrome({ perfil: `C:/Users/Valentino/.cache/b4-medicion/s11-vacio-${perfil.id}`, ancho: perfil.ancho, alto: perfil.alto + 120 })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, 'http://localhost:3000/v3')
    await verificarLaPagina(p, perfil)
    const t = (await paneles(p)).find((s) => s.id === 'trabajos')
    if (t === undefined) throw new Error('falta trabajos')
    const cero = t.top - perfil.alto
    // Se llega de a muescas desde antes de la noche, para que el disparo cruce su línea.
    for (let y = cero - 1500; y < cero + 3000; y += 150) {
      await medir<number>(p, `(window.scrollTo(0, ${String(y)}), new Promise((r) => setTimeout(() => r(1), 60)))`)
    }
    console.log(`\n${perfil.nombre} — Trabajos en ${t.top.toFixed(0)} +${t.alto.toFixed(0)}`)
    for (const [i, px] of PUNTOS.entries()) {
      const y = Math.round(cero + (px / PX_DE_LA_SECCION) * t.alto)
      await posarEn(p, y)
      const recorte = await medir<string>(p, `getComputedStyle(document.querySelector('[data-pieza="tunel"]')).clipPath`)
      await capturar(p, `${dir}/p${String(i)}-${String(px)}.png`)
      await emular(p, perfil)
      console.log(`  px ${String(px).padStart(4)} (y=${String(y)})  recorte: ${recorte.length > 90 ? `${recorte.slice(0, 40)}…${recorte.slice(-52)}` : recorte}`)
    }
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

async function principal(): Promise<void> {
  console.log('EL SOLAPE')
  await topes(perfilPorId('393'))
  await topes(perfilPorId('1440'))
  await elVacio(perfilPorId('1440'))
  await elVacio(ALTO)
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(`\nSE CORTO: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
