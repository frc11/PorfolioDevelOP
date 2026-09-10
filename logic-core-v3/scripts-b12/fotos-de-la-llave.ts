/**
 * B12 §4 · LAS CAPTURAS DE LAS OCHO, CON LA LLAVE Y SIN ELLA.
 *
 *     npx tsx scripts-b12/fotos-de-la-llave.ts --marca=con-llave
 *     npx tsx scripts-b12/fotos-de-la-llave.ts --marca=sin-llave
 *
 * ── Qué es «antes y después» en §4 ────────────────────────────────────────
 *
 * La PARADA 2 pide capturas de las ocho a 1440 y 1920, antes y después. Para
 * §1–§3 el «antes» era el árbol commiteado; para §4 **el antes y el después son
 * la misma pantalla con la llave apagada y prendida**, que además es lo que hay
 * que poder mirar: si apagarla no devolviera los marcadores, se vería acá.
 *
 * Y es lo único producible sin romper la regla 1: reconstruir el árbol de HEAD
 * pediría un `checkout`, que este sprint tiene prohibido. Apagar la llave es
 * editar un token y volver a editarlo, con el SHA-1 del archivo antes y después.
 *
 * ⚠ **El servidor de desarrollo tiene que estar corriendo en el 3000** y hay que
 * darle tiempo a recompilar después de tocar la llave: la llave es un módulo del
 * árbol, no una variable de entorno.
 *
 * ⚠ Las capturas se escriben en `.b12-capturas/` y se MUDAN al final: escribir
 * en `docs/` con un navegador abierto corrompe el archivo (`MEDICION-NAVEGADOR.md`).
 */

import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { capturarRegion } from '../scripts-b4/captura'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from '../scripts-b4/navegador'
import { paneles } from '../scripts-b4/sitio'

import {
  ORIGEN,
  PERFILES_DE_B12,
  TEMP,
  argumento,
  asegurarCarpetas,
  capturaPendiente,
  mudarPendientes,
} from './b12-comun'

/** La franja de la llave es `fixed`: se ve en la primera pantalla de cada panel. */
async function principal(): Promise<void> {
  asegurarCarpetas()
  const marca = argumento('marca', 'con-llave')
  const salidas: string[] = []

  for (const perfil of PERFILES_DE_B12) {
    const chrome = await lanzarChrome({
      perfil: perfilDeChrome('b12-fotos'),
      ancho: perfil.ancho,
      alto: perfil.alto + 120,
    })
    try {
      const p = await abrirPagina(chrome)
      await emular(p, perfil)
      await irA(p, `${ORIGEN}/v3`)
      await verificarLaPagina(p, perfil)
      const conLaMarca = await medir<boolean>(
        p,
        'document.querySelector(\'[data-pieza="marca-de-la-llave"]\') !== null',
      )
      console.log(`${perfil.id}: la marca de la llave ${conLaMarca ? 'ESTÁ' : 'no está'} en el documento`)

      for (const panel of await paneles(p)) {
        const temporal = `${TEMP}/${marca}-${perfil.id}-${panel.id}.png`
        /** ⚠ El MEDIO del panel, no su borde de arriba: es donde vive el contenido.
         *  La primera pantalla de una sección de cuatro es escena, y ahí no hay
         *  ninguna cifra que mirar. La franja de la llave es `fixed`, así que
         *  sale en las dieciséis igual. */
        const y = Math.round(panel.top + Math.max(0, (panel.alto - perfil.alto) / 2))
        const r = await capturarRegion(p, temporal, { y, alto: perfil.alto, ancho: perfil.ancho })
        capturaPendiente(temporal, `${marca}-${perfil.id}-${panel.id}.png`)
        salidas.push(`${marca}-${perfil.id}-${panel.id}  ${(r.bytes / 1024).toFixed(0)} KiB`)
      }
      await cerrarPagina(p)
    } finally {
      await cerrarChrome(chrome)
    }
  }

  for (const s of salidas) console.log(`  ${s}`)
  for (const e of mudarPendientes()) console.log(`escrito: ${e}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
