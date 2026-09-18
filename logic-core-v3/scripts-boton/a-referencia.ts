/**
 * A · LA REFERENCIA — **una navegación, una medición.**
 *
 *     npx tsx scripts-boton/a-referencia.ts
 *
 * UN `Page.navigate` a su home. Adentro de esa única carga entran el censo de
 * rótulos, el inventario del CTA, los dos ciclos de hover muestreados por
 * cuadro, el censo de animaciones vivas, las cuatro capturas de estado y la
 * tira de 18 cuadros. Después se cierra la pestaña y no se vuelve.
 *
 * ── Lo que se lleva, y lo que NO ──────────────────────────────────────────
 *
 * Se lleva NÚMEROS: tiempos, curvas declaradas, matrices, opacidades, cajas. Y
 * píxeles propios (las capturas), que son el contraste de la medición.
 *
 * No se lleva **ni un selector, ni una clase, ni un id, ni una línea de su
 * CSS**. El CTA se encuentra por su RÓTULO VISIBLE —lo único que un visitante
 * también ve— y cada nodo se identifica por su camino estructural entre
 * hermanos. `pagina-de-boton.ts` no tiene una sola lectura de `className`.
 *
 * ── El rótulo, y por qué la búsqueda es por texto y por etapas ────────────
 *
 * `COMPONENTS.md` §3.3 midió que su rollover deja el rótulo DUPLICADO en el
 * árbol de accesibilidad, sin espacio entre las copias. Por eso la búsqueda usa
 * `indexOf` y no igualdad: el `textContent` del botón trae la frase dos veces
 * pegada, y una comparación exacta no encontraría nada.
 *
 * Y por eso además hay tres criterios, de más estricto a menos: con una sola
 * navegación disponible, un rótulo que hoy diga una palabra distinta de la que
 * decía en S0 no puede costar la medición entera. El criterio que ganó se
 * publica en el JSON.
 */

import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'

import {
  CRUDO,
  ORIGEN_DE_LA_REFERENCIA,
  conLaPagina,
  esperar,
  guardarJson,
  rotulos,
  type RotuloVisible,
} from './boton-comun'
import { medirElBoton, type MedidaDelBoton } from './medida'

/** El rótulo visible del CTA principal de su home. Es texto de pantalla, no un selector. */
const ROTULO = 'EXPLORE OUR UNIVERSE'

/** De más estricto a menos. El que gana queda escrito en el reporte. */
const CRITERIOS: readonly string[] = [ROTULO, 'EXPLORE OUR', 'EXPLORE']

/**
 * Cuánto se le da a su home para asentarse antes de tocar nada.
 *
 * Su sitio monta una escena y una coreografía de scroll; medir sobre el primer
 * cuadro daría cajas que todavía se están moviendo. 6 s es holgado y se declara.
 */
const ASENTAMIENTO_MS = 6000

function normalizar(t: string): string {
  return t.replace(/\s+/g, ' ').trim().toUpperCase()
}

interface Eleccion {
  readonly criterio: string
  readonly indice: number
  readonly aciertos: readonly RotuloVisible[]
}

function elegir(censo: readonly RotuloVisible[]): Eleccion {
  for (const criterio of CRITERIOS) {
    const aciertos = censo.filter((r) => normalizar(r.texto).includes(criterio))
    if (aciertos.length > 0) return { criterio, indice: 0, aciertos }
  }
  throw new Error(
    `ninguno de los ${CRITERIOS.length} criterios encontró el CTA entre ${censo.length} rótulos visibles. ` +
      `Los diez primeros: ${censo.slice(0, 10).map((r) => JSON.stringify(r.texto.slice(0, 40))).join(', ')}`,
  )
}

async function principal(): Promise<void> {
  mkdirSync(CRUDO, { recursive: true })
  const salida = await conLaPagina<{ medida: MedidaDelBoton; eleccion: Eleccion; censo: number }>(
    {
      origen: ORIGEN_DE_LA_REFERENCIA,
      ruta: '/',
      marcaDeIntro: false,
      perfilDeChrome: 'boton-referencia',
      msMaximo: 90_000,
    },
    async (s) => {
      await esperar(ASENTAMIENTO_MS)
      const titulo = await medir<string>(s.pagina, 'document.title')
      const url = await medir<string>(s.pagina, 'location.href')
      console.log(`  cargó: ${JSON.stringify(titulo)} — ${url}`)
      const censo = await rotulos(s.pagina)
      const eleccion = elegir(censo)
      console.log(
        `  censo: ${censo.length} rótulos visibles · criterio «${eleccion.criterio}» · ` +
          `${eleccion.aciertos.length} acierto(s)`,
      )
      for (const a of eleccion.aciertos) {
        console.log(`    <${a.etiqueta}> ${JSON.stringify(a.texto)} rect=${JSON.stringify(a.rect)}`)
      }
      const medida = await medirElBoton(
        s,
        { id: 'nk', nombre: 'nk.studio · el CTA principal', texto: eleccion.criterio, indice: eleccion.indice },
        CRUDO,
      )
      return { medida, eleccion, censo: censo.length }
    },
  )

  writeFileSync(`${CRUDO}/nk-crudo.json`, `${JSON.stringify(salida.medida)}\n`, 'utf8')
  const ruta = guardarJson('referencia-resumen', {
    instrumento: 'scripts-boton/a-referencia.ts — una navegación, puntero por Input.dispatchMouseEvent',
    origen: ORIGEN_DE_LA_REFERENCIA,
    rotuloBuscado: ROTULO,
    criterioQueGano: salida.eleccion.criterio,
    aciertos: salida.eleccion.aciertos,
    rotulosVisiblesEnLaPagina: salida.censo,
    cuandoSeMidio: new Date().toISOString(),
    crudo: `${CRUDO}/nk-crudo.json`,
    caja: salida.medida.cajaMedida,
    recorte: salida.medida.recorte,
    nodos: salida.medida.preparacion.cantidadDeNodos,
    cuadros: salida.medida.grabacion.cuadros,
    dtP50: salida.medida.grabacion.dtP50,
    dtP95: salida.medida.grabacion.dtP95,
    animacionesAlEntrar: salida.medida.animacionesAlEntrar.length,
    tiraCongelada: salida.medida.tiraCongelada,
  })
  console.log(`\n  crudo    → ${CRUDO}/nk-crudo.json`)
  console.log(`  resumen  → ${ruta}`)
  console.log(`  capturas → ${CRUDO}/nk-*.png`)
}

principal().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
