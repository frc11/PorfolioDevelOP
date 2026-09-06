/**
 * FRENTE C · SONDA — el control de arranque del frente, antes de medir nada.
 *
 * Comprueba tres cosas y no mide ninguna cifra del reporte:
 *   1. que el Chrome del perfil `c` arranca (el choque de `userDataDir` de §0
 *      del banco, un piso más abajo);
 *   2. que `/v3` pasa el paso 4 de la receta a 1920;
 *   3. que la pastilla y las siete anclas del pie EXISTEN en el DOM, que es la
 *      precondición de `c-anclas.ts`.
 *
 * Corre con `npx tsx scripts-b4/c-sonda.ts`.
 */

import { cerrarChrome, lanzarChrome, perfilDeChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'

interface Sonda {
  readonly pastillas: number
  readonly anclasDelPie: readonly string[]
  readonly paneles: readonly string[]
  readonly scrollPaddingTop: string
}

async function principal(): Promise<void> {
  const perfil = perfilPorId('1920')
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('c'),
    ancho: perfil.ancho,
    alto: perfil.alto + 120,
  })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, 'http://localhost:3002/v3')
    const estado = await verificarLaPagina(p, perfil)
    console.log('estado:', JSON.stringify(estado))

    const sonda = await medir<Sonda>(
      p,
      `(() => ({
        pastillas: document.querySelectorAll('nav[data-parte="pastilla"]').length,
        anclasDelPie: [...document.querySelectorAll('[data-panel="cierre"] a[href^="#"]')].map((a) => a.getAttribute('href')),
        paneles: [...document.querySelectorAll('[data-panel]')].map((el) => el.dataset.panel),
        scrollPaddingTop: getComputedStyle(document.documentElement).scrollPaddingTop,
      }))()`,
    )
    console.log('sonda:', JSON.stringify(sonda, null, 2))
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
