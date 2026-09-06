/**
 * FRENTE B · 0 — EL INVENTARIO DE LAYOUT, que es lo que los otros cinco
 * instrumentos de este frente necesitan saber ANTES de capturar.
 *
 * Mide, por perfil: cuánto mide el documento, cuántas pantallas es, y dónde
 * arranca y cuánto mide cada una de las ocho secciones.
 *
 * ── Por qué es un instrumento y no una exploración a mano ─────────────────
 *
 * Porque de acá sale una decisión que cambia una captura: **el techo del
 * rasterizador son 16.384 px**, y una sección de cuatro pantallas a 375 mide
 * 2.668 —cabe— pero nadie midió cuánto mide de verdad. `capturar` tira si el
 * recorte se pasa; este archivo dice de antemano si alguno se va a pasar, y
 * deja el número escrito para el reporte.
 */

import { PERFILES, perfilPorId, type Perfil } from './perfiles'
import { documento, paneles, type Documento, type Panel } from './sitio'
import { ALTO_MAXIMO_DE_CAPTURA_PX } from './captura'
import { conLaPagina, dos, guardarJson, procedencia } from './b-comun'

interface FilaDeLayout {
  readonly perfil: string
  readonly ancho: number
  readonly alto: number
  readonly debajoDelUmbral: boolean
  readonly documento: Documento
  readonly paneles: readonly (Panel & { readonly pantallas: number; readonly cabeEnUnaCaptura: boolean })[]
  readonly secciones: number
}

/** Los cuatro de abajo, el par de arriba del umbral y el control de escritorio. */
const A_MEDIR: readonly Perfil[] = [
  ...PERFILES.filter((p) => p.debajoDelUmbral),
  perfilPorId('1025'),
  perfilPorId('1920'),
]

async function principal(): Promise<void> {
  const filas: FilaDeLayout[] = []
  for (const perfil of A_MEDIR) {
    const fila = await conLaPagina(perfil, '/v3', async ({ pagina }) => {
      const doc = await documento(pagina)
      const pans = await paneles(pagina)
      return {
        perfil: perfil.id,
        ancho: perfil.ancho,
        alto: perfil.alto,
        debajoDelUmbral: perfil.debajoDelUmbral,
        documento: doc,
        paneles: pans.map((p) => ({
          ...p,
          alto: dos(p.alto),
          top: dos(p.top),
          pantallas: dos(p.alto / doc.ventanaPx),
          cabeEnUnaCaptura: Math.ceil(p.alto) <= ALTO_MAXIMO_DE_CAPTURA_PX,
        })),
        secciones: pans.length,
      }
    })
    filas.push(fila)
    const desborde = fila.documento.anchoDelDocumento > fila.documento.anchoDeLaVentana
    console.log(
      `${perfil.id}: ${fila.secciones} secciones · documento ${fila.documento.alturaPx} px ` +
        `(${fila.documento.pantallas} pantallas) · ancho doc ${fila.documento.anchoDelDocumento} vs ventana ` +
        `${fila.documento.anchoDeLaVentana}${desborde ? '  ⚠️ DESBORDE' : ''}`,
    )
    for (const p of fila.paneles) {
      console.log(
        `   ${p.id.padEnd(16)} top ${String(p.top).padStart(8)}  alto ${String(p.alto).padStart(8)}` +
          `  ${p.pantallas} pantallas${p.cabeEnUnaCaptura ? '' : '  ⚠️ NO CABE EN UNA CAPTURA'}`,
      )
    }
  }

  const ruta = guardarJson('layout', {
    procedencia: procedencia(
      'scripts-b4/b-layout.ts',
      'inventario de layout previo a las capturas. Sin estrangular. Todo emulado con Emulation.setDeviceMetricsOverride sobre Chrome de escritorio: no es un teléfono.',
    ),
    techoDelRasterizadorPx: ALTO_MAXIMO_DE_CAPTURA_PX,
    filas,
  })
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
