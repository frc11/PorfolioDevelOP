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
/**
 * Dos fotos por demo: la cara del libro (vertical, 2:3, a doble densidad) y la
 * VENTANA —el área de la demo en la ventana abierta a 1440 × 900—, que es la
 * textura del Genie y la imagen desde la que se funde el iframe vivo.
 */
const VISTAS = [
  { sufijo: '', ancho: 400, alto: 600, densidad: 2 },
  { sufijo: '-ventana', ancho: 1152, alto: 654, densidad: 1 },
] as const
/** Los templates tienen intros animados: se espera a que asienten. */
const ESPERA_MS = 5000
/**
 * Uso: sin argumentos, las ocho. Con slugs (`... demos-portadas.ts aura`), sólo
 * ésas y con el doble de espera: AXON tiene un intro de más de 5 s y la primera
 * foto lo agarró a mitad de la transición.
 */
const SOLO = process.argv.slice(2)

async function principal(): Promise<void> {
  mkdirSync(DESTINO, { recursive: true })
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/demos-portadas', ancho: 1152, alto: 654 + 120 })
  try {
    for (const demo of CATALOGO_DE_DEMOS.filter((d) => SOLO.length === 0 || SOLO.includes(d.slug))) {
      for (const vista of VISTAS) {
        const p = await abrirPagina(chrome)
        await p.conexion.enviar(
          'Emulation.setDeviceMetricsOverride',
          { width: vista.ancho, height: vista.alto, deviceScaleFactor: vista.densidad, mobile: false },
          p.sessionId,
        )
        await irA(p, demo.url, { marcaDeIntro: false, msMaximo: 30_000 })
        await new Promise((r) => setTimeout(r, SOLO.length === 0 ? ESPERA_MS : ESPERA_MS * 3))
        const foto = (await p.conexion.enviar(
          'Page.captureScreenshot',
          { format: 'webp', quality: 72, clip: { x: 0, y: 0, width: vista.ancho, height: vista.alto, scale: 1 } },
          p.sessionId,
        )) as { data: string }
        const archivo = `${DESTINO}/${demo.slug}${vista.sufijo}.webp`
        writeFileSync(archivo, Buffer.from(foto.data, 'base64'))
        console.log(`  ${demo.slug.padEnd(10)} ${archivo}`)
        await cerrarPagina(p)
      }
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
