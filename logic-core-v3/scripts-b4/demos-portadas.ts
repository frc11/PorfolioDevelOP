/**
 * LAS PORTADAS DE LA BIBLIOTECA — una captura real de cada template.
 *
 *     npx tsx scripts-b4/demos-portadas.ts
 *
 * El sitio vivo pide `/assets/templates/chatgpt/<slug>/mid.webp`, que no existe en
 * ningún worktree, y cae a una captura remota de terceros. La biblioteca de /v3 no
 * depende de un servicio ajeno: cada portada es una foto del template de verdad,
 * sacada acá, en vertical (la cara de un libro) y guardada en `public/demos/`.
 *
 * El catálogo es el de `demos/catalogo.ts`, así que una demo nueva trae su portada
 * corriendo esto otra vez. ⚠️ Usa Chrome: tomar el candado antes (ver el sprint).
 */

import { mkdirSync, writeFileSync } from 'node:fs'

import { CATALOGO_DE_DEMOS } from '../src/app/v3/_secciones/trabajos/demos/catalogo'
import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, irA } from './navegador'

const DESTINO = 'public/demos'
/** La cara de un libro: vertical, 2:3, a doble densidad. */
const VISTA = { ancho: 400, alto: 600, densidad: 2 } as const
/** Los templates tienen intros animados: se espera a que asienten. */
const ESPERA_MS = 5000

async function principal(): Promise<void> {
  mkdirSync(DESTINO, { recursive: true })
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/demos-portadas', ancho: VISTA.ancho, alto: VISTA.alto + 120 })
  try {
    for (const demo of CATALOGO_DE_DEMOS) {
      const p = await abrirPagina(chrome)
      await p.conexion.enviar(
        'Emulation.setDeviceMetricsOverride',
        { width: VISTA.ancho, height: VISTA.alto, deviceScaleFactor: VISTA.densidad, mobile: false },
        p.sessionId,
      )
      await irA(p, demo.url, { marcaDeIntro: false, msMaximo: 30_000 })
      await new Promise((r) => setTimeout(r, ESPERA_MS))
      const foto = (await p.conexion.enviar(
        'Page.captureScreenshot',
        { format: 'webp', quality: 72, clip: { x: 0, y: 0, width: VISTA.ancho, height: VISTA.alto, scale: 1 } },
        p.sessionId,
      )) as { data: string }
      const archivo = `${DESTINO}/${demo.slug}.webp`
      writeFileSync(archivo, Buffer.from(foto.data, 'base64'))
      console.log(`  ${demo.slug.padEnd(10)} ${archivo}`)
      await cerrarPagina(p)
    }
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(`\nSE CORTO: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
