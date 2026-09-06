/**
 * FRENTE C · 1 — LAS SIETE ANCLAS DEL PIE, CON SCROLL REAL.
 *
 * ── Qué destraba ──────────────────────────────────────────────────────────
 *
 * `s9-scrollPadding.ts` cierra con un `noCorre` textual: *«el aterrizaje REAL de
 * las siete anclas, medido en el navegador — el sprint prohíbe abrir un
 * navegador»*. Los 72 px del `scroll-padding-top` son **geométricos**, derivados
 * de cuatro tokens en `_lib/navegacion.ts` (`BORDE_INFERIOR_EN_REPOSO_PX = 24 de
 * reposo + 48 de alto`). Nadie los vio aterrizar.
 *
 * ── Cómo se navega, y por qué se CLICKEA ──────────────────────────────────
 *
 * Con `Element.click()` sobre el `<a href="#id">` del pie, que es lo que hace un
 * visitante. Escribir `location.hash` produce el mismo salto en Chrome, pero
 * saltearía el enlace: si un `preventDefault` o un manejador se metiera en el
 * medio, la medición por `hash` daría verde y la del visitante no. Se parte
 * SIEMPRE desde el pie (`scrollTo` al fondo), que es donde está el enlace.
 *
 * ── ⚠️ Lo que se mide, y con qué salvedad ─────────────────────────────────
 *
 * `getBoundingClientRect()` devuelve la caja TRANSFORMADA, y `CLAUDE.md`
 * advierte sobre creerle con transformadas activas. Acá esa caja es justamente
 * la que se quiere: la pregunta es si la pastilla tapa lo que se VE, y lo que se
 * ve está transformado. Por eso cada caja de contenido se publica con su
 * `transform` computado al lado — quien lea la tabla ve si la pieza estaba
 * desplazada cuando se la midió.
 *
 * Corre con `npx tsx scripts-b4/c-anclas.ts`.
 */

import { capturarRegion } from './captura'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from './cdp'
import { rutaDeCaptura } from './capturas'
import { abrirPagina, cerrarPagina, emular, irA, medir, scrollA, verificarLaPagina } from './navegador'
import { perfilPorId, type Perfil } from './perfiles'
import {
  foto,
  fuenteDeLaLectura,
  type FotoDelDocumento,
  type LecturaDelAncla,
} from './c-anclas-lectura'
import {
  dos,
  esperarQueElScrollSeAsiente,
  guardarJson,
  mudarLasCapturas,
  rutaTemporal,
  solape,
  SITIO,
  type Asentamiento,
  type CapturaPendiente,
} from './c-comun'

/** El `scroll-padding-top` que /v3 declara, en píxeles. Es la vara. */
const VARA_PX = 72

/**
 * ⚠️ **CAPTURAR ES UNA VARIABLE DEL EXPERIMENTO, NO UN DETALLE DE SALIDA.**
 *
 * Escribir un PNG en `docs/` durante la corrida mete un archivo nuevo adentro
 * del árbol que el `next dev` de este worktree vigila —`docs/` NO está en
 * `.gitignore`, que es la misma trampa que `CLAUDE.md` documenta para un
 * `distDir` alternativo— y una recompilación en medio de la medición cambia el
 * layout debajo del instrumento. Con la bandera apagada, entre `irA` y
 * `cerrarChrome` no se escribe un solo byte en el repo.
 *
 *     npx tsx scripts-b4/c-anclas.ts             → mide, no escribe hasta el final
 *     npx tsx scripts-b4/c-anclas.ts capturar    → mide y captura
 */
const CAPTURAR = process.argv[2] === 'capturar'

/** Las siete: las ocho secciones menos `cierre` (no se enlaza a sí misma). */
const DESTINOS = ['hero', 'quienes-somos', 'numeros', 'trabajos', 'servicios', 'tu-panel', 'por-que-develop'] as const


interface FilaDelAncla {
  readonly perfil: string
  readonly ancla: string
  readonly scrollAntes: number
  readonly fotos: readonly FotoDelDocumento[]
  readonly asentamiento: Asentamiento
  readonly lectura: LecturaDelAncla
  readonly topDelPanel: number
  readonly desvioContraLaVara: number
  /** Cuánto despeja el glifo por debajo de la pastilla. Negativo = la pastilla lo tapa. */
  readonly despejeDelGlifo: number | null
  readonly solapeConLaPastilla: { readonly x: number; readonly y: number; readonly seTapan: boolean } | null
  readonly captura: string | null
}

async function medirUnPerfil(perfil: Perfil, pendientes: CapturaPendiente[]): Promise<readonly FilaDelAncla[]> {
  const chrome = await lanzarChrome({ perfil: perfilDeChrome('c'), ancho: perfil.ancho, alto: perfil.alto + 120 })
  const filas: FilaDelAncla[] = []
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, SITIO)
    await verificarLaPagina(p, perfil)

    for (const ancla of DESTINOS) {
      // Se parte del pie, que es donde vive el enlace: es el viaje real.
      const alturaDelDocumento = await medir<number>(p, 'document.documentElement.scrollHeight')
      const scrollAntes = await scrollA(p, alturaDelDocumento)
      const enElPie = await foto(p, 'en el pie, antes de clickear')
      const clickeo = await medir<boolean>(
        p,
        `(() => {
          const a = document.querySelector('[data-panel="cierre"] a[href="#${ancla}"]')
          if (a === null) return false
          a.click()
          return true
        })()`,
      )
      if (!clickeo) throw new Error(`no hay enlace del pie hacia #${ancla} — el pie cambió y esta medición no vale`)
      const asentamiento = await esperarQueElScrollSeAsiente(p)
      const alAsentarse = await foto(p, 'al asentarse el scroll')
      // La gracia de la escena: los patrones de movimiento siguen corriendo
      // después de que el scroll paró, y la caja del primer contenido es de
      // ellos. Se mide con el sistema quieto, no en la mitad de la entrada.
      await medir<boolean>(p, '(async () => { await new Promise((r) => setTimeout(r, 1200)); return true })()')
      const alLeer = await foto(p, 'al leer las cajas (+1200 ms)')
      const lectura = await medir<LecturaDelAncla>(p, fuenteDeLaLectura(ancla))

      const solapeConLaPastilla =
        lectura.pastilla === null || lectura.contenido === null
          ? null
          : solape(lectura.pastilla, lectura.contenido.glifo)
      // Se captura lo que TAPA, lo que pasa raspando (1 px o menos de despeje) y
      // el hero, que es el caso del tope del documento y hay que poder mirarlo.
      const despeje = solapeConLaPastilla === null ? null : -solapeConLaPastilla.y
      const debeCapturar =
        CAPTURAR && (solapeConLaPastilla?.seTapan === true || (despeje !== null && despeje <= 1) || ancla === 'hero')
      let captura: string | null = null
      if (debeCapturar) {
        captura = rutaDeCaptura('c', perfil.id, `ancla-${ancla}`)
        const temporal = rutaTemporal(`${perfil.id}-ancla-${ancla}.png`)
        await capturarRegion(p, temporal, { y: lectura.scrollY, alto: perfil.alto, ancho: perfil.ancho })
        pendientes.push({ temporal, destino: captura })
      }

      filas.push({
        perfil: perfil.id,
        ancla,
        scrollAntes,
        fotos: [enElPie, alAsentarse, alLeer],
        asentamiento,
        lectura,
        topDelPanel: dos(lectura.panel.top),
        desvioContraLaVara: dos(lectura.panel.top - VARA_PX),
        despejeDelGlifo: despeje === null ? null : dos(despeje),
        solapeConLaPastilla,
        captura,
      })
      const crecio = alLeer.alturaDelDocumento - enElPie.alturaDelDocumento
      console.log(
        `${perfil.id} · #${ancla}: scrollY ${lectura.scrollY} · doc ${enElPie.alturaDelDocumento}→${alAsentarse.alturaDelDocumento}→${alLeer.alturaDelDocumento} (${crecio >= 0 ? '+' : ''}${crecio}) · top del panel ${dos(lectura.panel.top)} · ` +
          `desvío ${dos(lectura.panel.top - VARA_PX)} · solape ${
            solapeConLaPastilla === null ? '(sin datos)' : `${dos(solapeConLaPastilla.y)}px ${solapeConLaPastilla.seTapan ? 'SÍ TAPA' : 'no'}`
          }`,
      )
    }
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
  return filas
}

async function principal(): Promise<void> {
  const perfiles = ['1440', '1920', '375'].map(perfilPorId)
  const filas: FilaDelAncla[] = []
  const pendientes: CapturaPendiente[] = []
  for (const perfil of perfiles) filas.push(...(await medirUnPerfil(perfil, pendientes)))
  // Recién acá, con los tres navegadores cerrados: ver `mudarLasCapturas`.
  mudarLasCapturas(pendientes)

  const destino = guardarJson(CAPTURAR ? 'c-anclas-con-captura.json' : 'c-anclas.json', {
    capturando: CAPTURAR,
    que: 'el aterrizaje real de las siete anclas del pie de /v3, con scroll real',
    instrumento: 'scripts-b4/c-anclas.ts · CDP directo (scripts-b4/cdp.ts), Page/Runtime, sin estrangular',
    emulado: true,
    nota:
      'TODO viewport es EMULADO con Emulation.setDeviceMetricsOverride sobre el Chrome de esta máquina: es un viewport de layout, no un dispositivo.',
    vara: { px: VARA_PX, deDonde: '_lib/navegacion.ts · BORDE_INFERIOR_EN_REPOSO_PX = 24 (--spacing-6) + 48 (alto de la pastilla)' },
    navegacion: 'Element.click() sobre el <a href="#id"> del pie, partiendo desde el fondo del documento',
    esperas: 'asentamiento del scroll (4 lecturas iguales de 32 ms) + 1200 ms de gracia de escena antes de leer cajas',
    filas,
  })
  console.log(`\n→ ${destino}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
