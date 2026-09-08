/**
 * B7 · FRENTE D — LAS 13 CAPTURAS DE ANCLAS QUE B4-B NO ALCANZÓ A TOMAR.
 *
 *     npx tsx scripts-b7/d-anclas.ts
 *
 * ── Qué falta, exactamente ────────────────────────────────────────────────
 *
 * B4-B midió las **21 filas** (7 anclas × 3 perfiles) con navegación real y
 * publicó el resultado: 6 de 7 aterrizan en 72,00 px con desvío 0,00 a 1440 y
 * 1920 y ≤ 0,23 px a 375; la séptima es `hero`, que aterriza en 0 y es correcto
 * porque el tope del documento no se puede scrollear más arriba. **Las
 * mediciones están completas.** Lo que faltó fue la FOTO de 13 de ellas: el
 * frente se cortó por cuota con 8 tomadas, que son las que su regla de captura
 * elegía (las que tapan, las que pasan raspando y el hero).
 *
 * Este archivo toma las 13 que faltan y **re-mide las 21**, porque una foto sin
 * su medición al lado no dice de qué es foto. Si un aterrizaje no diera lo que
 * B4-B publicó, eso es un hallazgo y sale con su número: la comparación se hace
 * contra `docs/rediseno/outputs/b4/c-anclas.json` LEÍDO, no contra una tabla
 * transcrita a mano.
 *
 * ── ⚠️ EL PEOR POZO DEL REPO, Y ESTE ARCHIVO LO ESQUIVA POR CONSTRUCCIÓN ──
 *
 * Escribir un PNG adentro de `docs/` con el navegador abierto **corrompe la
 * medición en curso**: `docs/` no está en `.gitignore`, así que el archivo cae
 * adentro del árbol que vigilan el `next dev` de este worktree y la
 * auto-detección de fuentes de Tailwind 4. Medido por B4-B: dos aterrizajes de
 * la misma corrida dieron `top` de 1.066 y de −1.979 px, y el documento saltó de
 * 16.224 a 19.025 px y volvió.
 *
 * La salida es la de `c-comun.ts`: **capturar en `os.tmpdir()` y mudar los
 * archivos DESPUÉS de cerrar el navegador**. Acá la raíz temporal es propia
 * (`b7-frente-d`) para no pisar la de B4 si alguien corre los dos.
 *
 * Y el corolario que este archivo agrega: **el sello contra la recarga**. Si
 * `next dev` recompila en el medio —porque alguien tocó un archivo de `src/`—,
 * la página se recarga y los `top` que salgan de ahí son de dos documentos
 * distintos. Se corta en vez de publicar.
 */

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { capturarRegion } from '../scripts-b4/captura'
import {
  esperarQueElScrollSeAsiente,
  solape,
  type Asentamiento,
} from '../scripts-b4/c-comun'
import { foto, fuenteDeLaLectura, type FotoDelDocumento, type LecturaDelAncla } from '../scripts-b4/c-anclas-lectura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { perfilPorId, type Perfil } from '../scripts-b4/perfiles'

import { conLaPagina, dos, guardarJson, ORIGEN } from './b7-comun'
import { esperarElMotorDeScroll, RECARGA, SELLO, verificarQueNoSeRecargo } from './d-cuadro-lectores'

/** El `scroll-padding-top` que /v3 declara, en píxeles. Es la vara, y es la misma de B4-B. */
const VARA_PX = 72
/** Las siete: las ocho secciones menos `cierre` (no se enlaza a sí misma). */
const DESTINOS = ['hero', 'quienes-somos', 'numeros', 'trabajos', 'servicios', 'tu-panel', 'por-que-develop'] as const
const PERFILES = ['1440', '1920', '375'] as const

const RAIZ_TEMPORAL = path.join(os.tmpdir(), 'b7-frente-d')
const RAIZ_DE_CAPTURAS = 'docs/rediseno/capturas/b7'

/** Lo que B4-B publicó, LEÍDO de su salida. Transcribirlo a mano sería inventar la comparación. */
interface FilaDeB4 {
  readonly perfil: string
  readonly ancla: string
  readonly topDelPanel: number
  readonly desvioContraLaVara: number
  readonly captura: string | null
}
function filasDeB4(): readonly FilaDeB4[] {
  const crudo = readFileSync('docs/rediseno/outputs/b4/c-anclas-con-captura.json', 'utf8')
  return (JSON.parse(crudo) as { filas: FilaDeB4[] }).filas
}

interface CapturaPendiente {
  readonly temporal: string
  readonly destino: string
}

interface Fila {
  readonly perfil: string
  readonly ancla: string
  readonly fotos: readonly FotoDelDocumento[]
  readonly asentamiento: Asentamiento
  readonly topDelPanel: number
  readonly desvioContraLaVara: number
  readonly topDeB4B: number | null
  readonly deltaContraB4B: number | null
  readonly reproduce: boolean
  readonly despejeDelGlifo: number | null
  readonly seTapan: boolean | null
  readonly scrollY: number
  readonly captura: string | null
  readonly capturaDeB4B: string | null
}

async function medirUnPerfil(perfil: Perfil, pendientes: CapturaPendiente[], deB4: readonly FilaDeB4[]): Promise<Fila[]> {
  return conLaPagina(
    perfil,
    '/v3',
    async ({ pagina: p }) => {
      await medir(p, `(() => { ${SELLO}; return true })()`)
      /**
       * ⚠️ **EL MOTOR DE SCROLL, ESPERADO Y NO SUPUESTO — pero SÓLO ARRIBA DEL
       * UMBRAL.**
       *
       * Monta perezoso y tarda entre 1,2 y 5 s (ver `d-cuadro-lectores.ts`). El
       * salto de ancla lo hace el navegador, pero quién termina de asentar la
       * posición depende de si Lenis corre: medir las primeras anclas sin motor
       * y las últimas con motor daría una tabla de dos experimentos.
       *
       * ⚠️ Y abajo de 1025 **no hay motor y eso es lo correcto**: cuelga del
       * mismo umbral que el escenario (`compuerta.invariant` lo afirma sobre
       * `scrollSuave.ts`). Esperarlo a 375 hacía fallar la corrida por una
       * ausencia que es la respuesta esperada — el modo de falla exacto que este
       * banco viene cazando: un guardián que tira sobre una página sana.
       */
      const motor = perfil.debajoDelUmbral ? null : await esperarElMotorDeScroll(p)
      console.log(
        `  ${perfil.id}: motor de scroll = ${motor ?? 'null — abajo de 1025 no monta, y es lo correcto'}`,
      )
      const filas: Fila[] = []
      for (const ancla of DESTINOS) {
        // Se parte del pie, que es donde vive el enlace: es el viaje real.
        const alturaDelDocumento = await medir<number>(p, 'document.documentElement.scrollHeight')
        await scrollA(p, alturaDelDocumento)
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
        // después de que el scroll paró. Se lee con el sistema quieto.
        await medir(p, '(async () => { await new Promise((r) => setTimeout(r, 1200)); return true })()')
        const alLeer = await foto(p, 'al leer las cajas (+1200 ms)')
        const lectura = await medir<LecturaDelAncla>(p, fuenteDeLaLectura(ancla))
        await verificarQueNoSeRecargo(p)

        const cruce =
          lectura.pastilla === null || lectura.contenido === null
            ? null
            : solape(lectura.pastilla, lectura.contenido.glifo)
        const previa = deB4.find((f) => f.perfil === perfil.id && f.ancla === ancla) ?? null
        const top = dos(lectura.panel.top)

        // ── LA CAPTURA: sólo las que B4-B no tomó, y SIEMPRE al temporal ────
        let captura: string | null = null
        if (previa !== null && previa.captura === null) {
          captura = `${RAIZ_DE_CAPTURAS}/${perfil.id}-ancla-${ancla}.png`
          mkdirSync(RAIZ_TEMPORAL, { recursive: true })
          const temporal = path.join(RAIZ_TEMPORAL, `${perfil.id}-ancla-${ancla}.png`)
          await capturarRegion(p, temporal, { y: lectura.scrollY, alto: perfil.alto, ancho: perfil.ancho })
          pendientes.push({ temporal, destino: captura })
          await verificarQueNoSeRecargo(p)
        }

        filas.push({
          perfil: perfil.id,
          ancla,
          fotos: [enElPie, alAsentarse, alLeer],
          asentamiento,
          topDelPanel: top,
          desvioContraLaVara: dos(top - VARA_PX),
          topDeB4B: previa === null ? null : previa.topDelPanel,
          deltaContraB4B: previa === null ? null : dos(top - previa.topDelPanel),
          reproduce: previa === null ? false : Math.abs(top - previa.topDelPanel) <= 0.5,
          despejeDelGlifo: cruce === null ? null : dos(-cruce.y),
          seTapan: cruce === null ? null : cruce.seTapan,
          scrollY: lectura.scrollY,
          captura,
          capturaDeB4B: previa === null ? null : previa.captura,
        })
        console.log(
          `  ${perfil.id.padEnd(5)} #${ancla.padEnd(16)} top ${String(top).padStart(7)} · desvío ${String(dos(top - VARA_PX)).padStart(6)} · ` +
            `B4-B ${previa === null ? '  (sin fila)' : String(previa.topDelPanel).padStart(7)} · ` +
            `${previa !== null && Math.abs(top - previa.topDelPanel) <= 0.5 ? 'reproduce' : 'NO REPRODUCE'}` +
            `${captura === null ? '' : `  → ${path.basename(captura)}`}`,
        )
      }
      return filas
    },
    { quien: 'b7-d-anclas' },
  )
}

/**
 * ⚠️ **HASTA TRES INTENTOS POR PERFIL, Y SÓLO SI LA CAUSA ES UNA RECARGA.**
 *
 * `next dev` recarga la página cuando cualquier frente toca `src/`, y este árbol
 * tiene cuatro trabajando a la vez. Un aterrizaje leído a caballo de dos
 * documentos no se publica: se descarta y se vuelve a medir. Cualquier OTRA
 * excepción —el enlace del pie que no está, la página a medio compilar— **no se
 * reintenta**, porque reintentar un error real es esconderlo.
 */
async function medirUnPerfilConReintento(
  perfil: Perfil,
  deB4: readonly FilaDeB4[],
): Promise<{ filas: Fila[]; pendientes: CapturaPendiente[] }> {
  let ultimo: unknown = null
  for (let intento = 1; intento <= 3; intento += 1) {
    // Las capturas del intento van a una lista PROPIA: si el intento se
    // descarta, se descartan con él. Compartir la lista habría mezclado los
    // temporales de una corrida abortada con los de la buena.
    const pendientes: CapturaPendiente[] = []
    try {
      return { filas: await medirUnPerfil(perfil, pendientes, deB4), pendientes }
    } catch (e: unknown) {
      ultimo = e
      if (!(e instanceof Error && e.message === RECARGA)) throw e
      console.log(`  ⚠ ${perfil.id}: la página se recargó en el medio (intento ${intento} de 3). Se descarta y se vuelve a medir.`)
    }
  }
  throw ultimo instanceof Error ? ultimo : new Error(String(ultimo))
}

async function principal(): Promise<void> {
  const deB4 = filasDeB4()
  const pendientes: CapturaPendiente[] = []
  const filas: Fila[] = []
  for (const id of PERFILES) {
    const r = await medirUnPerfilConReintento(perfilPorId(id), deB4)
    filas.push(...r.filas)
    pendientes.push(...r.pendientes)
  }

  // ⚠️ RECIÉN ACÁ, con los tres navegadores cerrados. Ver el docblock de arriba.
  for (const p of pendientes) {
    mkdirSync(path.dirname(p.destino), { recursive: true })
    copyFileSync(p.temporal, p.destino)
  }

  const noReproducen = filas.filter((f) => !f.reproduce)
  const ruta = guardarJson('d-anclas', {
    que: 'las 13 capturas de anclas que B4-B no tomó, con las 21 filas RE-MEDIDAS contra lo que B4-B publicó',
    instrumento: 'scripts-b7/d-anclas.ts · CDP propio, perfil de Chrome `b7-d-anclas`, sin estrangular',
    origen: `${ORIGEN}/v3`,
    heredado: 'docs/rediseno/outputs/b4/c-anclas-con-captura.json (leído, no transcrito)',
    vara: { px: VARA_PX, deDonde: '_lib/navegacion.ts · BORDE_INFERIOR_EN_REPOSO_PX = 24 (--spacing-6) + 48 (alto de la pastilla)' },
    navegacion: 'Element.click() sobre el <a href="#id"> del pie, partiendo desde el fondo del documento',
    esperas: 'asentamiento del scroll (4 lecturas iguales de 32 ms) + 1200 ms de gracia de escena antes de leer cajas',
    reglaDeCaptura: 'se captura SÓLO donde B4-B dejó `captura: null` — las 13 que faltaban. Al temporal, y se mudan con el navegador cerrado',
    capturasTomadas: pendientes.length,
    filasQueNoReproducen: noReproducen.length,
    filas,
  })
  console.log(`\n  ${pendientes.length} capturas nuevas en ${RAIZ_DE_CAPTURAS}/`)
  console.log(`  ${filas.length - noReproducen.length}/${filas.length} aterrizajes reproducen lo que B4-B publicó (±0,5 px)`)
  for (const f of noReproducen) {
    console.log(`  ⚠ NO REPRODUCE ${f.perfil} #${f.ancla}: hoy ${f.topDelPanel}, B4-B ${f.topDeB4B} (delta ${f.deltaContraB4B})`)
  }
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
