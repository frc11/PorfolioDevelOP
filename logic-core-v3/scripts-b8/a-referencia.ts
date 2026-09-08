/**
 * LA REFERENCIA — una navegación, una medición. El instrumento de la PARADA 1 (a) y del §3.1.
 *
 *     npx tsx scripts-b8/a-referencia.ts
 *
 * ── Qué mide, y qué NO hace ────────────────────────────────────────────────
 *
 * Perfila `nk.studio` en producción pantalla por pantalla con el MISMO
 * instrumento que mide el nuestro (`c-bloques.ts`): cuánto de su escena
 * sobrevive a lo que ponen encima, qué tan oscura es su sala (luminancia media
 * del canvas solo) y el contraste bajo el glifo de TODO el texto en cuadro, con
 * el peor píxel. Eso es (a). Para el §3.1 agrega cuatro lecturas que B6-A no
 * hizo: los planos con transformación 3D —de qué profundidad vienen, cuánto
 * scroll tardan, cuántos hay en cuadro a la vez, qué traen—, sus partículas
 * sobre el fondo oscuro —tamaño, densidad, brillo—, si el fondo se mueve solo
 * con el tiempo y si acompaña al scroll.
 *
 * NO copia nada: ni un selector, ni una clase, ni un valor. Todo se lee por
 * propiedad computada y se publica como medida escrita con nuestras palabras.
 * Es UNA navegación con scroll adentro, y se cierra la pestaña.
 *
 * ⚠️ Cada pantalla corre en su propio `try`: B6-A necesitó seis cargas porque su
 * DOM tiró tres veces. Una pantalla que falla se anota y se sigue; no se vuelve
 * a navegar.
 */

import { copyFileSync, mkdirSync } from 'node:fs'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'

import { CARPETA_DE_CAPTURAS, PERFIL, PUENTE_DE_AUTOMATIZACION, TEMP, asegurarCarpetas, conLaPagina, dos, guardarJson } from './b8-comun'
import { evaluarLaPosicion, type LecturaDePosicion } from './c-bloques'
import { leerImagen } from './glifo-alfa'
import { APAGAR_LA_TINTA, LECTOR_DE_BLOQUES_EN, type Bloque, type TintaApagada } from './lectores'
import { CANVASES, INVENTARIO, LECTOR_DE_PLANOS_3D, type Inventario, type PlanoLeido } from './lectores-referencia'
import { OCULTAR_NODOS, OCULTAR_TODO_MENOS, OCULTAR_TODO_MENOS_INFORMANDO, type Ocultamiento } from './ocultar'
import { censarParticulas, fraccionQueCambio, mediaDeLaCaptura, type CensoDeParticulas } from './particulas'

const ORIGEN_DE_LA_REFERENCIA = 'https://www.nk.studio'

interface Pantalla {
  readonly scrollY: number
  readonly pantalla: number
  readonly salaMedia: number
  readonly salaGris: number
  readonly vistaMedia: number
  readonly pasa: number
  readonly clase: 'desnuda' | 'velada' | 'tapada' | 'sin-textura' | 'sin-canvas'
  readonly oscura: boolean
  readonly canvasEnCuadro: number
  readonly bloques: number
  readonly peorPlena: number
  readonly medianaDeMedianas: number
  readonly fallan: number
  readonly planosEnCuadro: readonly PlanoLeido[]
  readonly particulas: CensoDeParticulas | null
  readonly lectura: LecturaDePosicion | null
  readonly error: string | null
}

interface Muestra {
  readonly scrollY: number
  readonly planos: readonly PlanoLeido[]
}

function clasificar(pasa: number, varianzaDeLaSala: number, canvas: number): Pantalla['clase'] {
  if (canvas === 0) return 'sin-canvas'
  if (Number.isNaN(varianzaDeLaSala) || varianzaDeLaSala < 1e-4) return 'sin-textura'
  if (Number.isNaN(pasa) || pasa < 0.05) return 'tapada'
  return pasa > 0.95 ? 'desnuda' : 'velada'
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const salida = await conLaPagina(
    PERFIL,
    '/',
    async ({ pagina, perfil }) => {
      await esperarElPrimerCuadro(pagina)
      await new Promise((r) => setTimeout(r, 4000))
      const inventario = await medir<Inventario>(pagina, INVENTARIO)
      console.log(`documento ${inventario.altoDelDocumento} px · ${dos(inventario.altoDelDocumento / inventario.ventana)} pantallas · ${inventario.canvases.length} canvas`)
      for (const c of inventario.canvases) console.log(`  canvas ${Math.round(c.ancho)}×${Math.round(c.alto)} en y=${Math.round(c.top)} (${c.position}, padre ${c.positionDelPadre})`)
      console.log(`  ${inventario.paneles.length} paneles grandes con fondo o desenfoque`)
      for (const p of inventario.paneles) console.log(`    <${p.etiqueta}> ${Math.round(p.ancho)}×${Math.round(p.alto)} en y=${Math.round(p.top)} · fondo lum ${p.luminanciaDelFondo.toFixed(3)} @ alfa ${p.alfa} · backdrop ${p.backdrop} · ${p.caracteres} caracteres`)

      const pantallas: Pantalla[] = []
      const region = { x: 0, y: 0, ancho: perfil.ancho, alto: perfil.alto }
      let rebeldes = new Set<number>()
      for (let y = 0; y <= inventario.altoDelDocumento - inventario.ventana; y += inventario.ventana) {
        const pantalla = y / inventario.ventana
        try {
          await scrollA(pagina, y)
          await esperarElPrimerCuadro(pagina)
          const real = await medir<number>(pagina, 'window.scrollY')
          if (Math.abs(real - y) > 2) throw new Error(`se pidió y=${y} y el scroll quedó en ${real}: su scroll no es el del documento`)
          const leidos = await medir<Bloque[]>(pagina, LECTOR_DE_BLOQUES_EN('[document.body]'))
          const planos = (await medir<PlanoLeido[]>(pagina, LECTOR_DE_PLANOS_3D)).filter((p) => p.enCuadro)
          const base = `${TEMP}/referencia-${y}`
          const rutas = { C: `${base}-C.png`, A: `${base}-A.png`, T: `${base}-T.png`, S: `${base}-S.png`, V: `${base}-A.png` }
          await capturar(pagina, rutas.C)
          const apagada = await medir<TintaApagada>(pagina, APAGAR_LA_TINTA(true))
          if (y === 0) rebeldes = new Set(apagada.rebeldes.map((r) => r.n))
          const bloques = leidos.filter((b) => !rebeldes.has(b.n))
          await capturar(pagina, rutas.A)
          await medir(pagina, APAGAR_LA_TINTA(false))
          const canvasEnCuadro = await medir<number>(pagina, `${CANVASES}.length`)
          if (canvasEnCuadro > 0) {
            if (!(await medir<boolean>(pagina, OCULTAR_NODOS(CANVASES, true)))) throw new Error('los canvas no quedaron ocultos')
            await capturar(pagina, rutas.T)
            await medir(pagina, OCULTAR_NODOS(CANVASES, false))
          } else {
            copyFileSync(rutas.C, rutas.T)
          }
          const oculto = await medir<Ocultamiento>(pagina, OCULTAR_TODO_MENOS_INFORMANDO('[]', CANVASES, true))
          if (!oculto.conservados.every((c) => c.visibility === 'visible') || oculto.marcados === 0) throw new Error(`sus canvas no quedaron solos: ${JSON.stringify(oculto)}`)
          await esperarElPrimerCuadro(pagina, 300)
          await capturar(pagina, rutas.S)
          if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', CANVASES, false)))) throw new Error('no se restauró lo oculto')
          const A = leerImagen(rutas.A)
          const S = leerImagen(rutas.S)
          const lectura = evaluarLaPosicion({ C: leerImagen(rutas.C), A, T: leerImagen(rutas.T), S, V: A }, bloques, region, y, rutas)
          const plenas = lectura.bloques.map((b) => b.peorAPlena)
          const medianas = lectura.bloques.map((b) => b.medianaContraste).sort((a, b) => a - b)
          const sala = mediaDeLaCaptura(S)
          const oscura = lectura.escena.conPanelSinTinta.media < 0.3
          const p: Pantalla = {
            scrollY: y,
            pantalla,
            salaMedia: sala.luminancia,
            salaGris: sala.gris,
            vistaMedia: lectura.escena.conPanelSinTinta.media,
            pasa: lectura.escena.varianzaConContenido,
            clase: clasificar(lectura.escena.varianzaConContenido, lectura.escena.sinPanel.varianza, canvasEnCuadro),
            oscura,
            canvasEnCuadro,
            bloques: lectura.bloques.length,
            peorPlena: plenas.length === 0 ? Number.NaN : Math.min(...plenas),
            medianaDeMedianas: medianas.length === 0 ? Number.NaN : medianas[Math.floor(medianas.length / 2)],
            fallan: lectura.bloques.filter((b) => !b.pasaAA).length,
            planosEnCuadro: planos,
            particulas: canvasEnCuadro > 0 && sala.luminancia < 0.3 ? censarParticulas(S) : null,
            lectura,
            error: null,
          }
          pantallas.push(p)
          const pc = p.particulas
          console.log(
            `  pantalla ${String(pantalla).padStart(2)} (y=${String(y).padStart(5)})  sala lum ${p.salaMedia.toFixed(4)} gris ${p.salaGris.toFixed(1)} · vista ${p.vistaMedia.toFixed(3)} ${oscura ? 'OSCURA' : 'clara '} · pasa ${(p.pasa * 100).toFixed(1)}% → ${p.clase.padEnd(11)} · ${String(p.bloques).padStart(3)} bloques · peor plena ${Number.isNaN(p.peorPlena) ? '  —  ' : p.peorPlena.toFixed(2)} · mediana ${Number.isNaN(p.medianaDeMedianas) ? ' — ' : p.medianaDeMedianas.toFixed(2)} · ${p.fallan} fallan AA` +
              ` · planos 3D en cuadro ${planos.length}` +
              (pc === null ? '' : ` · partículas ${pc.cantidad} (${pc.porCienMilPx}/100k px², ⌀ mediana ${pc.diametroMediano} px, pico ${pc.picoMediano})`),
          )
          for (const q of planos) console.log(`      plano ${q.id} <${q.etiqueta}> z=${q.z.toFixed(0)} escala ${q.escala.toFixed(3)} op ${q.opacidad.toFixed(2)} ${Math.round(q.ancho)}×${Math.round(q.alto)} @(${Math.round(q.x)},${Math.round(q.y)}) medios ${q.medios} · ${q.caracteres} car · cuerpo máx ${q.cuerpoMaximoPx.toFixed(0)} px · perspective ${q.perspectivaPx ?? 'ninguna'}${q.perspectivaEnAncestro ? ' (ancestro)' : ''}`)
        } catch (e) {
          const mensaje = e instanceof Error ? e.message : String(e)
          console.log(`  pantalla ${String(pantalla).padStart(2)} (y=${String(y).padStart(5)})  FALLÓ: ${mensaje.slice(0, 160)}`)
          pantallas.push({ scrollY: y, pantalla, salaMedia: Number.NaN, salaGris: Number.NaN, vistaMedia: Number.NaN, pasa: Number.NaN, clase: 'sin-canvas', oscura: false, canvasEnCuadro: 0, bloques: 0, peorPlena: Number.NaN, medianaDeMedianas: Number.NaN, fallan: 0, planosEnCuadro: [], particulas: null, lectura: null, error: mensaje })
          try { await medir(pagina, APAGAR_LA_TINTA(false)); await medir(pagina, OCULTAR_TODO_MENOS('[]', CANVASES, false)) } catch { /* ya está restaurado o no se pudo: se sigue */ }
        }
      }

      // ── §3.1 · Los planos 3D contra el scroll, en pasos de un octavo de pantalla ──
      const conPlanos = pantallas.filter((p) => p.planosEnCuadro.length > 0)
      const muestras: Muestra[] = []
      if (conPlanos.length > 0) {
        const desde = Math.max(0, conPlanos[0].scrollY - inventario.ventana)
        const hasta = Math.min(inventario.altoDelDocumento - inventario.ventana, conPlanos[conPlanos.length - 1].scrollY + inventario.ventana)
        const paso = inventario.ventana / 8
        console.log(`\n  planos 3D: barrido fino de y=${desde} a ${hasta} cada ${paso} px`)
        for (let y = desde; y <= hasta; y += paso) {
          try {
            await scrollA(pagina, y)
            await new Promise((r) => setTimeout(r, 120))
            muestras.push({ scrollY: y, planos: await medir<PlanoLeido[]>(pagina, LECTOR_DE_PLANOS_3D) })
          } catch (e) {
            console.log(`    y=${y} falló: ${e instanceof Error ? e.message.slice(0, 120) : String(e)}`)
          }
        }
        // ¿Animan por tiempo con el scroll quieto?
        const medio = Math.round((desde + hasta) / 2 / paso) * paso
        await scrollA(pagina, medio)
        await new Promise((r) => setTimeout(r, 300))
        const antes = await medir<PlanoLeido[]>(pagina, LECTOR_DE_PLANOS_3D)
        await new Promise((r) => setTimeout(r, 700))
        const despues = await medir<PlanoLeido[]>(pagina, LECTOR_DE_PLANOS_3D)
        const porId = new Map(despues.map((p) => [p.id, p]))
        const seMovieron = antes.filter((p) => { const d = porId.get(p.id); return d !== undefined && (Math.abs(d.z - p.z) > 1 || Math.abs(d.opacidad - p.opacidad) > 0.02) })
        console.log(`  con el scroll quieto en y=${medio} durante 700 ms: ${seMovieron.length} de ${antes.length} planos cambiaron de profundidad u opacidad`)
        muestras.push({ scrollY: -1, planos: seMovieron })
      }

      // ── §3.1 · El fondo: ¿se mueve solo? ¿acompaña al scroll? (sobre la pantalla más oscura con canvas) ──
      const oscuras = pantallas.filter((p) => p.canvasEnCuadro > 0 && !Number.isNaN(p.salaMedia)).sort((a, b) => a.salaMedia - b.salaMedia)
      let fondo: { readonly scrollY: number; readonly cambioEn500ms: number; readonly cambioCon120px: number } | null = null
      if (oscuras.length > 0) {
        const y = oscuras[0].scrollY
        await scrollA(pagina, y)
        await esperarElPrimerCuadro(pagina, 600)
        const oculto = await medir<Ocultamiento>(pagina, OCULTAR_TODO_MENOS_INFORMANDO('[]', CANVASES, true))
        if (oculto.marcados > 0) {
          await esperarElPrimerCuadro(pagina, 300)
          await capturar(pagina, `${TEMP}/referencia-fondo-1.png`)
          await new Promise((r) => setTimeout(r, 500))
          await capturar(pagina, `${TEMP}/referencia-fondo-2.png`)
          await scrollA(pagina, y + 120)
          await esperarElPrimerCuadro(pagina, 300)
          await capturar(pagina, `${TEMP}/referencia-fondo-3.png`)
          await medir(pagina, OCULTAR_TODO_MENOS('[]', CANVASES, false))
          const f1 = leerImagen(`${TEMP}/referencia-fondo-1.png`)
          fondo = { scrollY: y, cambioEn500ms: fraccionQueCambio(f1, leerImagen(`${TEMP}/referencia-fondo-2.png`)), cambioCon120px: fraccionQueCambio(f1, leerImagen(`${TEMP}/referencia-fondo-3.png`)) }
          console.log(`  el fondo (canvas solo) en y=${y}: cambió el ${(fondo.cambioEn500ms * 100).toFixed(2)}% de los píxeles en 500 ms con el scroll quieto, y el ${(fondo.cambioCon120px * 100).toFixed(2)}% al bajar 120 px`)
        }
      }
      return { inventario, pantallas, muestras, fondo }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION], origen: ORIGEN_DE_LA_REFERENCIA, msMaximo: 90_000 },
  )

  const resumen = (clase: Pantalla['clase']): string => salida.pantallas.filter((p) => p.clase === clase).map((p) => p.pantalla).join(', ') || 'ninguna'
  console.log(`\n  desnudas: ${resumen('desnuda')} · veladas: ${resumen('velada')} · tapadas: ${resumen('tapada')} · sin textura: ${resumen('sin-textura')} · sin canvas: ${resumen('sin-canvas')}`)
  const fallaron = salida.pantallas.filter((p) => p.error !== null)
  console.log(`  pantallas que fallaron: ${fallaron.length === 0 ? 'ninguna' : fallaron.map((p) => p.pantalla).join(', ')}`)
  const oscurasConTexto = salida.pantallas.filter((p) => p.oscura && p.bloques > 0)
  console.log(`  oscuras con texto: ${oscurasConTexto.map((p) => `${p.pantalla} (peor plena ${p.peorPlena.toFixed(2)}, mediana ${p.medianaDeMedianas.toFixed(2)}, ${p.fallan} de ${p.bloques} bajo AA)`).join(' · ') || 'ninguna'}`)
  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })
  const conCanvas = salida.pantallas.filter((p) => p.lectura !== null && p.canvasEnCuadro > 0)
  for (const p of [...conCanvas.filter((q) => q.planosEnCuadro.length > 0).slice(0, 2), ...conCanvas.sort((a, b) => a.salaMedia - b.salaMedia).slice(0, 1)]) {
    if (p.lectura === null) continue
    copyFileSync(p.lectura.capturas.C, `${CARPETA_DE_CAPTURAS}/referencia-pantalla-${p.pantalla}-C.png`)
    copyFileSync(p.lectura.capturas.S, `${CARPETA_DE_CAPTURAS}/referencia-pantalla-${p.pantalla}-S.png`)
  }
  console.log(`  ${guardarJson('a-referencia', { ...salida, pantallas: salida.pantallas.map((p) => ({ ...p, lectura: p.lectura === null ? null : { ...p.lectura, bloques: p.lectura.bloques } })) })}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
