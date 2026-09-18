/**
 * B · LO NUESTRO, EN LA MISMA VARA — los DOS ejemplares del mismo componente.
 *
 *     npx tsx scripts-boton/b-nuestro.ts
 *
 * ── Por qué dos y no uno ──────────────────────────────────────────────────
 *
 * El CTA del hero y el del Cierre **son el mismo componente** (`CtaEnlace` de
 * `_componentes/chrome/Cta.tsx`): lo que se decida sobre el comportamiento los
 * mueve a los dos. Pero no son la misma pieza en pantalla —el del hero monta
 * `registro="rotulo"` y el del Cierre no— y **medir uno solo sería publicar una
 * de las dos como si fuera la del componente**.
 *
 * Cuando este banco midió por primera vez, el registro además bifurcaba la
 * coreografía: `rotulo` apagaba el subrayado. Desde BOTON-2 ya no —los dos
 * hacen el mismo gesto— y estas dos corridas son justamente la forma de
 * comprobarlo en el píxel y no en la hoja.
 *
 * ── La compuerta del intro ────────────────────────────────────────────────
 *
 * `MARCA_DE_INTRO` + `PUENTE_DE_AUTOMATIZACION`, los dos antes del primer
 * pintado: sin el primero el preloader deja 4,275 s de capa encima, y sin el
 * segundo el preloader ni siquiera arma bajo automatización, que es otra rama.
 * La receta está en `MEDICION-NAVEGADOR.md` §1 paso 3.
 */

import { mkdirSync, writeFileSync } from 'node:fs'

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir } from '../scripts-b4/navegador'

import { CRUDO, ORIGEN, conLaPagina, esperar, guardarJson } from './boton-comun'
import { medirElBoton, type DescripcionDelBoton, type MedidaDelBoton } from './medida'

/**
 * Los dos ejemplares, agarrados por ATRIBUTO y no por texto.
 *
 * `data-pieza="cta"` lo emite `Cta.tsx` y `data-panel` lo emite `Panel.tsx`:
 * los dos son contrato del sistema y sobreviven a un cambio de copy. Acá sí se
 * puede, porque el árbol es nuestro. En la referencia no, y por eso allá la
 * búsqueda es por rótulo.
 */
const BOTONES: readonly DescripcionDelBoton[] = [
  {
    id: 'hero',
    nombre: '/v3 · el CTA del hero (registro «rotulo»)',
    selector: '[data-panel="hero"] [data-pieza="cta"]',
    sinCongelar: true,
  },
  {
    id: 'cierre',
    nombre: '/v3 · el CTA del Cierre (registro «cuerpo»)',
    selector: '[data-panel="cierre"] [data-pieza="cta"]',
    sinCongelar: true,
  },
]

/** Lo que la escena tarda en asentarse, heredado de B5/B6/B8. */
const ASENTAMIENTO_MS = 4000

async function principal(): Promise<void> {
  mkdirSync(CRUDO, { recursive: true })
  const medidas = await conLaPagina<readonly MedidaDelBoton[]>(
    { origen: ORIGEN, ruta: '/v3', marcaDeIntro: true, perfilDeChrome: 'boton-nuestro' },
    async (s) => {
      await esperarElPrimerCuadro(s.pagina)
      await esperar(ASENTAMIENTO_MS)
      const paneles = await medir<number>(s.pagina, 'document.querySelectorAll("[data-panel]").length')
      if (paneles !== 8) {
        throw new Error(`hay ${paneles} paneles y tienen que ser 8 — ¿el dev server recompilando?`)
      }
      const salida: MedidaDelBoton[] = []
      for (const b of BOTONES) {
        console.log(`\n  ── ${b.nombre}`)
        salida.push(await medirElBoton(s, b, CRUDO))
      }
      return salida
    },
  )

  for (const m of medidas) {
    writeFileSync(`${CRUDO}/${m.id}-crudo.json`, `${JSON.stringify(m)}\n`, 'utf8')
  }
  const ruta = guardarJson('nuestro-resumen', {
    instrumento: 'scripts-boton/b-nuestro.ts — el MISMO protocolo que la referencia',
    origen: ORIGEN,
    cuandoSeMidio: new Date().toISOString(),
    botones: medidas.map((m) => ({
      id: m.id,
      nombre: m.nombre,
      crudo: `${CRUDO}/${m.id}-crudo.json`,
      caja: m.cajaMedida,
      nodos: m.preparacion.cantidadDeNodos,
      cuadros: m.grabacion.cuadros,
      dtP50: m.grabacion.dtP50,
      dtP95: m.grabacion.dtP95,
      animacionesAlEntrar: m.animacionesAlEntrar.length,
      tiraCongelada: m.tiraCongelada,
    })),
  })
  console.log(`\n  resumen  → ${ruta}`)
  console.log(`  crudo    → ${CRUDO}/hero-crudo.json · ${CRUDO}/cierre-crudo.json`)
}

principal().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
