/**
 * PAPEL-2 · D — EL ALTO DE LA COLUMNA CONTRA EL ALTO DEL VIEWPORT, y la captura.
 *
 *     npx tsx scripts-papel/d-alto.ts
 *
 * ── Qué mide que `scripts-texto/e-antes-despues.ts` NO mide ───────────────
 *
 * Aquel banco publica `bloque`, que es la unión de las cajas del **titular, la
 * bajada y el CTA** — su `LECTOR` lo arma con esas tres y con ninguna más. Es la
 * cifra correcta para lo que aquel sprint preguntaba, y **no sirve para el §4 de
 * éste**: la marca que PAPEL-2 agrega vive ARRIBA del `h1`, así que cae fuera de
 * esa unión y el «alto del bloque» seguiría publicando el bloque de texto solo.
 *
 * Acá se mide la COLUMNA ENTERA —de la primera pieza que se dibuja hasta la
 * última—, que es lo que compite contra los 667 px de 375 y los 568 de 320. Y se
 * miden además las dos piezas nuevas por separado, porque el §4 pedía saber con
 * qué tamaños entra y con cuáles no.
 *
 * ── ⚠️ SE MIDE LO QUE SE DIBUJA, NO LO QUE ESTÁ EN EL MARCADO ────────────
 *
 * La marca está en el HTML de los ocho anchos y **se ve en dos**: de 390 para
 * arriba es `display:none`. Un `getBoundingClientRect` sobre un elemento apagado
 * devuelve ceros, así que la columna se arma con las piezas cuyo rectángulo
 * tiene alto — que es exactamente la definición de «lo que se dibuja». En los
 * seis anchos intocables la cuenta tiene que dar el bloque de texto y nada más,
 * y eso es una comprobación, no una suposición.
 *
 * ── ⚠️ Y LAS CAPTURAS VAN A SU PROPIA CARPETA ────────────────────────────
 *
 * `capturas/papel/`, una por ancho, con recarga limpia. No se escriben en
 * `capturas/texto/` ni en `capturas/compo/` por la lección que COMPO-1 dejó
 * escrita: una captura en la carpeta de otro sprint deja de identificar un
 * estado del árbol. Ocho archivos, muy por debajo del tope de 50.
 */

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { capturar } from '../scripts-b4/captura'
import { medir } from '../scripts-b4/navegador'
import { TEMP, VENTANAS, asegurarCarpetas, conChrome, dos, enLaVentana } from '../scripts-tapado/tapado-comun'

const SALIDAS = 'docs/rediseno/outputs/papel'
const CAPTURAS = 'docs/rediseno/capturas/papel'

interface Pieza {
  readonly clave: string
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly tamano: number
}

interface Lectura {
  readonly ventana: { readonly ancho: number; readonly alto: number }
  readonly relleno: { readonly arriba: number; readonly abajo: number }
  readonly piezas: readonly Pieza[]
  readonly columna: { readonly arriba: number; readonly abajo: number; readonly alto: number } | null
  readonly pastillaVisible: boolean
  readonly fondoDelPanel: string
}

/**
 * Las piezas se buscan por `data-*` y por rol, nunca por clase: una clase de
 * Tailwind cambia con el sprint y un `data-pieza` es un handle.
 */
const LECTOR_DE_LA_COLUMNA = `(() => {
  const pantalla = document.querySelector('[data-pantalla="hero"]')
  if (pantalla === null) return null
  const panel = pantalla.closest('[data-panel]') ?? pantalla
  const nav = document.querySelector('[data-parte="pastilla"]')
  const buscar = (clave, sel) => {
    const el = pantalla.querySelector(sel)
    if (el === null) return null
    const r = el.getBoundingClientRect()
    if (r.height <= 0.5) return null
    const cs = getComputedStyle(el)
    return { clave, x: r.x, y: r.y, ancho: r.width, alto: r.height, tamano: parseFloat(cs.fontSize) }
  }
  const piezas = [
    buscar('logotipo', '[data-pieza="logotipo"]'),
    buscar('isotipo', '[data-pieza="isotipo"]'),
    buscar('titular', 'h1'),
    buscar('bajada', '[data-nivel="base"]'),
    buscar('cta', 'a'),
  ].filter((p) => p !== null)
  const sp = getComputedStyle(pantalla)
  const arriba = piezas.length === 0 ? null : Math.min(...piezas.map((p) => p.y))
  const abajo = piezas.length === 0 ? null : Math.max(...piezas.map((p) => p.y + p.alto))
  return {
    ventana: { ancho: window.innerWidth, alto: window.innerHeight },
    relleno: { arriba: parseFloat(sp.paddingTop), abajo: parseFloat(sp.paddingBottom) },
    piezas,
    columna: arriba === null ? null : { arriba, abajo, alto: abajo - arriba },
    // \`offsetParent\` nulo o caja sin alto = \`display:none\`. Es la pregunta
    // exacta del §5: la pastilla NO está, no «está escondida».
    pastillaVisible: nav !== null && nav.getBoundingClientRect().height > 0.5,
    fondoDelPanel: getComputedStyle(panel).backgroundColor,
  }
})()`

async function principal(): Promise<void> {
  asegurarCarpetas()
  mkdirSync(CAPTURAS, { recursive: true })
  mkdirSync(SALIDAS, { recursive: true })

  const filas: Record<string, unknown>[] = []
  const pendientes: { readonly de: string; readonly a: string }[] = []

  await conChrome('papel-2 · alto', async (chrome) => {
    for (const v of VENTANAS) {
      await enLaVentana(chrome, v, async ({ pagina }) => {
        const l = await medir<Lectura | null>(pagina, LECTOR_DE_LA_COLUMNA)
        if (l === null) throw new Error(`a ${v.ancho}: no encontré la pantalla del hero`)
        const temporal = path.join(TEMP, `papel2-${v.ancho}x${v.alto}.png`)
        await capturar(pagina, temporal)
        pendientes.push({ de: temporal, a: path.join(CAPTURAS, `papel2-${v.ancho}x${v.alto}.png`) })

        const conMarca = l.piezas.some((p) => p.clave === 'isotipo')
        const alto = l.columna?.alto ?? 0
        const util = l.ventana.alto - l.relleno.arriba - l.relleno.abajo
        filas.push({
          ancho: v.ancho,
          alto: v.alto,
          ventana: l.ventana,
          relleno: l.relleno,
          conMarca,
          pastillaVisible: l.pastillaVisible,
          fondoDelPanel: l.fondoDelPanel,
          columna: l.columna === null ? null : { arriba: dos(l.columna.arriba), abajo: dos(l.columna.abajo), alto: dos(alto) },
          utilDeLaPantalla: dos(util),
          holgura: dos(util - alto),
          fraccionDelViewport: dos((alto / l.ventana.alto) * 100),
          piezas: l.piezas.map((p) => ({ ...p, x: dos(p.x), y: dos(p.y), ancho: dos(p.ancho), alto: dos(p.alto), tamano: dos(p.tamano) })),
        })

        console.log(
          `  ${String(v.ancho).padStart(4)}x${String(v.alto).padEnd(4)}  ` +
            `marca ${conMarca ? 'SI' : 'no'} · pastilla ${l.pastillaVisible ? 'SI' : 'no'} · fondo ${l.fondoDelPanel.padEnd(22)} ` +
            `columna ${alto.toFixed(1).padStart(6)} px de ${util.toFixed(0).padStart(4)} utiles (${((alto / l.ventana.alto) * 100).toFixed(1)} % del viewport) · holgura ${(util - alto).toFixed(1)}`,
        )
        for (const p of l.piezas) {
          console.log(`        ${p.clave.padEnd(9)} x ${p.x.toFixed(0).padStart(4)} · y ${p.y.toFixed(0).padStart(4)} · ${p.ancho.toFixed(1).padStart(6)} x ${p.alto.toFixed(1).padStart(6)} px · ${p.tamano.toFixed(2)} px`)
        }
      })
    }
  })

  // ⚠ Las capturas se copian con TODAS las pestañas cerradas: el dev server
  // vigila el repo y un archivo escrito adentro del árbol con la página abierta
  // dispara un recompilado y una recarga en caliente. Lección de TEXTO-2.
  for (const { de, a } of pendientes) copyFileSync(de, a)
  writeFileSync(path.join(SALIDAS, 'd-alto.json'), `${JSON.stringify(filas, null, 2)}\n`)
  console.log(`\n  -> ${path.join(SALIDAS, 'd-alto.json')} · ${pendientes.length} capturas en ${CAPTURAS}`)
}

void principal()
