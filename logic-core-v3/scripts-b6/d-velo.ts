/**
 * LA PERILLA DEL VELO — cuánta escena deja pasar y cuánto texto deja leer cada
 * forma del velo, medidas en la MISMA pose. El instrumento de la PARADA 1 (b).
 *
 *     npx tsx scripts-b6/d-velo.ts [--posiciones=trabajos:1,cierre:0]
 *
 * Las dos restricciones opuestas del bloque, con un número cada una:
 *
 *   · **cuánto deja ver**: la varianza de luminancia de la sala que atraviesa
 *     el panel (captura con panel y sin tinta, contra captura sin panel), en la
 *     región del panel.
 *   · **cuánto deja leer**: el contraste bajo el glifo, peor píxel, de TODOS los
 *     bloques en cuadro — con la tinta que tienen y a tinta plena.
 *
 * Y un tercero, porque el desenfoque no es gratis: los FPS de un barrido de
 * scroll por la sección con cada variante puesta, con el contador de B5.
 *
 * ── Las variantes, y por qué éstas ───────────────────────────────────────
 *
 *   base       — el token tal cual: `rgba(14,14,14,0.60)`, la alfa de `--opacity-casi`.
 *   alfa-0,4…0,8 — la misma alfa plana barrida. 0,4 es la única alfa oscura que
 *                S3 midió en la referencia; 0,8 es donde la tinta a `opacity-casi`
 *                empezaría a pasar según los tokens.
 *   blur-12    — base + `backdrop-filter: blur(12px)`, que es `--blur-panel`. Se
 *                mide y no se descarta de antemano: el ~77 `backdrop-blur` del
 *                sitio viejo son deuda, pero la deuda se mide, no se supone.
 *   gradiente  — alfa 0,8 detrás de la columna de texto y 0,4 en la zona
 *                desnuda, con la frontera donde termina el texto medido.
 *   opaco      — `background-color: var(--color-fondo)`: el control. Tiene que
 *                dejar pasar CERO varianza, o el instrumento está ciego.
 *
 * Todas son estilos inline puestos por el instrumento mientras mide y borrados
 * después. El producto no cambia: cambia la ENTRADA del instrumento.
 */

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { ocultarPorSelector } from '../scripts-b5/pagina'
import { CONTADOR_DE_CUADROS } from '../scripts-b5/vitales-lectores'

import {
  MARCA_DE_INTRO,
  PERFIL,
  PUENTE_DE_AUTOMATIZACION,
  SELECTOR_DE_LA_ESCENA,
  TEMP,
  asegurarCarpetas,
  asentarElHome,
  conLaPagina,
  dos,
  guardarJson,
} from './b6-comun'
import { evaluarLaPosicion, type LecturaDePosicion } from './c-bloques'
import { leerImagen } from './glifo-alfa'
import {
  APAGAR_LA_TINTA,
  ESTILAR_EL_PANEL,
  FONDO_DEL_PANEL,
  LECTOR_DE_BLOQUES,
  LECTOR_DE_PANELES,
  LECTOR_DEL_DOCUMENTO,
  raicesDelPanel,
  type Bloque,
  type FondoDelPanel,
  type TintaApagada,
} from './lectores'
import { ESCENA_NUESTRA, OCULTAR_TODO_MENOS } from './ocultar'

interface Cuadros {
  readonly cuadros: number
  readonly duracionMs: number
  readonly fpsMediana: number
  readonly fpsP05: number
  readonly fpsMinimo: number
  readonly cuadrosLargos: number
}

interface Variante {
  readonly id: string
  readonly estilos: (bordeDelTexto: number) => Readonly<Record<string, string | null>>
}

const OSCURO = '14, 14, 14'
const VARIANTES: readonly Variante[] = [
  { id: 'base (token 0,60)', estilos: () => ({}) },
  ...[0.4, 0.5, 0.7, 0.8].map((a) => ({
    id: `alfa ${a.toFixed(2)}`,
    estilos: () => ({ '--color-superficie-translucida': `rgba(${OSCURO}, ${a})` }),
  })),
  { id: 'blur 12 + 0,60', estilos: () => ({ 'backdrop-filter': 'blur(12px)' }) },
  { id: 'blur 12 + 0,40', estilos: () => ({ 'backdrop-filter': 'blur(12px)', '--color-superficie-translucida': `rgba(${OSCURO}, 0.4)` }) },
  {
    id: 'gradiente 0,80→0,40',
    estilos: (borde) => ({
      'background-image': `linear-gradient(to right, rgba(${OSCURO}, 0.8) 0px, rgba(${OSCURO}, 0.8) ${borde}px, rgba(${OSCURO}, 0.4) ${borde + 240}px, rgba(${OSCURO}, 0.4) 100%)`,
      'background-color': 'transparent',
    }),
  },
  { id: 'opaco (control)', estilos: () => ({ 'background-color': 'var(--color-fondo)' }) },
]
const TODAS_LAS_PROPIEDADES = ['--color-superficie-translucida', 'backdrop-filter', 'background-image', 'background-color']

const argumento = (nombre: string, defecto: string): string => {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}
const POSICIONES = argumento('posiciones', 'trabajos:1,cierre:0')
  .split(',')
  .map((par) => ({ id: par.split(':')[0], pantallas: Number(par.split(':')[1] ?? '0') }))

interface LecturaDeVariante {
  readonly variante: string
  readonly fondoPintado: string
  readonly backdrop: string
  readonly posicion: LecturaDePosicion
  readonly peorPlena: number
  readonly peorConSuTinta: number
  readonly bloquesQueFallan: number
  readonly cuadros: Cuadros
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const salida = await conLaPagina(
    PERFIL,
    '/v3',
    async (s) => {
      const { pagina } = s
      await asentarElHome(s)
      const doc = await medir<{ altoDelDocumento: number; ventana: number }>(pagina, LECTOR_DEL_DOCUMENTO)
      const paneles = await medir<{ id: string; superficie: string; alto: number; top: number }[]>(pagina, LECTOR_DE_PANELES)
      const resultados: { id: string; superficie: string; scrollY: number; variantes: LecturaDeVariante[] }[] = []
      for (const pos of POSICIONES) {
        const panel = paneles.find((p) => p.id === pos.id)
        if (panel === undefined) throw new Error(`no existe el panel ${pos.id}`)
        const y = Math.round(Math.min(panel.top + pos.pantallas * doc.ventana, doc.altoDelDocumento - doc.ventana))
        console.log(`\n── ${panel.id} (${panel.superficie}) en y=${y} (pantalla ${dos(y / doc.ventana)}) ──`)
        await scrollA(pagina, y)
        await esperarElPrimerCuadro(pagina)
        // S una sola vez: la sala desnuda no depende del velo.
        const rutaS = `${TEMP}/velo-${panel.id}-S.png`
        if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, true)))) throw new Error('no quedó sólo la escena')
        await esperarElPrimerCuadro(pagina, 300)
        await capturar(pagina, rutaS)
        if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, false)))) throw new Error('no se restauró lo oculto')
        const S = leerImagen(rutaS)
        const bloquesBase = await medir<Bloque[]>(pagina, LECTOR_DE_BLOQUES(panel.id))
        const bordeDelTexto = Math.ceil(Math.max(...bloquesBase.filter((b) => b.enCuadro).flatMap((b) => b.cajas.map((c) => c.x + c.ancho))))
        console.log(`  ${bloquesBase.filter((b) => b.enCuadro).length} bloques en cuadro · el texto termina en x=${bordeDelTexto}`)
        const variantes: LecturaDeVariante[] = []
        for (const v of VARIANTES) {
          await scrollA(pagina, y)
          await medir(pagina, ESTILAR_EL_PANEL(panel.id, v.estilos(bordeDelTexto)))
          await esperarElPrimerCuadro(pagina, 400)
          const fondo = await medir<FondoDelPanel>(pagina, FONDO_DEL_PANEL(panel.id))
          const bloques = await medir<Bloque[]>(pagina, LECTOR_DE_BLOQUES(panel.id))
          const base = `${TEMP}/velo-${panel.id}-${v.id.replace(/[^a-z0-9]+/gi, '_')}`
          const rutas = { C: `${base}-C.png`, A: `${base}-A.png`, T: `${base}-T.png`, S: rutaS, V: `${base}-V.png` }
          await capturar(pagina, rutas.C)
          const apagada = await medir<TintaApagada>(pagina, APAGAR_LA_TINTA(true))
          if (!apagada.tomo) throw new Error(`la tinta no se apagó — ${JSON.stringify(apagada.rebeldes)}`)
          await capturar(pagina, rutas.A)
          await medir(pagina, APAGAR_LA_TINTA(false))
          if (!(await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, true))) throw new Error('la escena no quedó oculta')
          await capturar(pagina, rutas.T)
          await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, false)
          if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS(raicesDelPanel(panel.id), ESCENA_NUESTRA, true)))) throw new Error('no quedó sólo el panel sobre la escena')
          await esperarElPrimerCuadro(pagina, 300)
          await capturar(pagina, rutas.V)
          if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, false)))) throw new Error('no se restauró lo oculto')
          const lectura = evaluarLaPosicion(
            { C: leerImagen(rutas.C), A: leerImagen(rutas.A), T: leerImagen(rutas.T), S, V: leerImagen(rutas.V) },
            bloques,
            fondo.rect,
            y,
            rutas,
          )
          // FPS: un barrido de 2 s por la sección con la variante puesta.
          const cuadros = await medir<Cuadros>(pagina, CONTADOR_DE_CUADROS(2000, true))
          await medir(pagina, ESTILAR_EL_PANEL(panel.id, Object.fromEntries(TODAS_LAS_PROPIEDADES.map((p) => [p, null]))))
          const plenas = lectura.bloques.map((b) => b.peorAPlena)
          const propias = lectura.bloques.map((b) => b.peorContraste)
          const r: LecturaDeVariante = {
            variante: v.id,
            fondoPintado: fondo.backgroundColor,
            backdrop: fondo.backdropFilter,
            posicion: lectura,
            peorPlena: plenas.length === 0 ? Number.NaN : Math.min(...plenas),
            peorConSuTinta: propias.length === 0 ? Number.NaN : Math.min(...propias),
            bloquesQueFallan: lectura.bloques.filter((b) => !b.pasaAA).length,
            cuadros,
          }
          variantes.push(r)
          console.log(
            `  ${v.id.padEnd(22)} fondo ${fondo.backgroundColor.padEnd(22)} backdrop ${fondo.backdropFilter.padEnd(12)}` +
              ` pasa ${(lectura.escena.varianzaQuePasa * 100).toFixed(1).padStart(5)}% de la var. de luminancia · ${(lectura.escena.desvioDeGrisQuePasa * 100).toFixed(1).padStart(5)}% del desvío de gris · sala media ${lectura.escena.sinPanel.media.toFixed(3)} → con velo ${lectura.escena.soloElPanel.media.toFixed(3)}` +
              ` · peor plena ${r.peorPlena.toFixed(2)} · peor con su tinta ${r.peorConSuTinta.toFixed(2)} (${r.bloquesQueFallan}/${lectura.bloques.length} fallan)` +
              ` · fps mediana ${dos(cuadros.fpsMediana)} p05 ${dos(cuadros.fpsP05)} mín ${dos(cuadros.fpsMinimo)} (${cuadros.cuadrosLargos} > 20 ms)`,
          )
        }
        resultados.push({ id: panel.id, superficie: panel.superficie, scrollY: y, variantes })
      }
      return { perfil: PERFIL.id, documento: doc, posiciones: resultados }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO] },
  )
  const control = salida.posiciones.flatMap((p) => p.variantes.filter((v) => v.variante.startsWith('opaco')))
  const ciego = control.filter((v) => !(v.posicion.escena.varianzaQuePasa < 0.005))
  if (ciego.length > 0) {
    console.error(`\n⚠️ EL CONTROL FALLA: detrás del panel OPACO pasa varianza (${ciego.map((v) => (v.posicion.escena.varianzaQuePasa * 100).toFixed(2) + '%').join(', ')}) — el instrumento está ciego`)
    process.exitCode = 1
  } else {
    console.log(`\n[control] detrás del panel opaco pasa ${control.map((v) => (v.posicion.escena.varianzaQuePasa * 100).toFixed(2) + '%').join(' y ')} de la varianza: el instrumento distingue`)
  }
  console.log(`  ${guardarJson('d-velo', salida)}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
