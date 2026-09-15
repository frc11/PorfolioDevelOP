/**
 * BLEND-1 · C — DÓNDE ESTÁN LOS GRISES MEDIOS. El mapa, independiente del texto.
 *
 *     npx tsx scripts-blend/c-zona-muerta.ts --ancho=390|1440|1920
 *
 * ── Qué contesta, y por qué se mide sin texto ─────────────────────────────
 *
 * El blend se apaga donde el fondo es gris medio: en sRGB 127,5 la razón de
 * contraste es **1,00:1 exacto** y en toda la banda 102–153 no pasa de
 * **2,08:1**, o sea que está bajo AA en cualquier tamaño (la aritmética, con su
 * porqué, en `blend-comun.ts` · `ZONA_MUERTA`).
 *
 * Así que la pregunta es geográfica y no tiene nada que ver con dónde esté el
 * texto hoy: **¿qué fracción del cuadro es gris medio, y está donde pasa la
 * columna?** Si los grises medios son una mota, el blend se puede aplicar donde
 * convenga; si barren el cuadro en diagonal —las sombras de la celosía—, no hay
 * lugar donde ponerlo.
 *
 * ── Los dos fondos, y por qué los dos ─────────────────────────────────────
 *
 *   **S — la sala desnuda.** Todo oculto menos `[data-escena]`. Es la escena
 *   como tal: su celosía, su pared, su logo, sus motas. Contesta «dónde están
 *   los grises medios DE LA SALA», que es la pregunta del paso.
 *
 *   **F — el fondo real, con la tinta apagada.** El cuadro compuesto tal como se
 *   ve, pero sin texto: incluye lo que las superficies opacas TAPAN. Contesta
 *   «dónde están los grises medios que el texto REALMENTE tiene detrás», que es
 *   la que decide. Una sección con `bg-fondo` tapa la sala entera, y ahí el
 *   gris medio de la sala no le llega a ningún glifo.
 *
 * Publicar sólo S sobrestimaría el problema; publicar sólo F esconderÍa que la
 * sala lo tiene. Van los dos, y la diferencia entre ellos es información.
 *
 * ── La captura con la zona muerta pintada ─────────────────────────────────
 *
 * Por cada cuadro se escribe un PNG con los píxeles de la zona muerta pintados
 * de magenta sobre el cuadro real, y el recuadro de la banda de texto marcado.
 * Se escribe con `codificarPngRgba` (`scripts-b4/png.ts:166`), que existía como
 * control positivo del decodificador; es su segundo uso y no se lo toca.
 *
 * ⚠️ **El PNG pintado no juzga: muestra.** Se puede decir «el 43,8 % del cuadro
 * cae en la zona muerta»; que eso se vea bien o mal lo decide el humano mirando.
 */

import { mkdirSync, writeFileSync } from 'node:fs'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { codificarPngRgba } from '../scripts-b4/png'
import { medir, scrollA } from '../scripts-b4/navegador'
import { leerImagen, type Imagen } from '../scripts-b8/glifo-alfa'
import {
  APAGAR_LA_TINTA,
  LECTOR_DEL_DOCUMENTO,
  LECTOR_DE_BLOQUES_EN,
  LECTOR_DE_PANELES,
  type Bloque,
  type TintaApagada,
} from '../scripts-b8/lectores'
import { ESCENA_NUESTRA, OCULTAR_TODO_MENOS } from '../scripts-b8/ocultar'
import {
  ASENTAMIENTO_DE_BLOQUES_MS,
  BORRAR_LAS_MARCAS,
  CARPETA_DE_CAPTURAS,
  KEYFRAMES,
  TEMP,
  VENTANAS,
  ZONA_MUERTA,
  argumento,
  asegurarCarpetas,
  asentarElHome,
  conLaPagina,
  cuatro,
  enZonaMuerta,
  grisDelPixel,
  guardarJson,
  hayCanvas,
  scrollDelProgreso,
  type MarcasBorradas,
} from './blend-comun'

interface PanelLeido {
  readonly id: string
  readonly superficie: string
  readonly alto: number
  readonly top: number
}

interface Region {
  readonly x0: number
  readonly y0: number
  readonly x1: number
  readonly y1: number
}

/** La fracción de una región que cae en la banda donde el blend se apaga. */
function fraccionMuerta(img: Imagen, region: Region): { readonly pixeles: number; readonly muertos: number; readonly fraccion: number } {
  let total = 0
  let muertos = 0
  for (let y = Math.max(0, region.y0); y < Math.min(img.alto, region.y1); y += 1) {
    for (let x = Math.max(0, region.x0); x < Math.min(img.ancho, region.x1); x += 1) {
      total += 1
      if (enZonaMuerta(grisDelPixel(img.datos, (y * img.ancho + x) * 4))) muertos += 1
    }
  }
  return { pixeles: total, muertos, fraccion: total === 0 ? Number.NaN : cuatro(muertos / total) }
}

/**
 * EL HISTOGRAMA DEL GRIS, en diez cubetas. Es lo que dice si los grises medios
 * son una banda ancha o una frontera: un cuadro bimodal (logo negro + papel
 * claro) puede tener poca zona muerta y aun así ser todo borde.
 */
function histograma(img: Imagen, region: Region): readonly number[] {
  const cubetas = new Array<number>(10).fill(0)
  let total = 0
  for (let y = Math.max(0, region.y0); y < Math.min(img.alto, region.y1); y += 1) {
    for (let x = Math.max(0, region.x0); x < Math.min(img.ancho, region.x1); x += 1) {
      const g = grisDelPixel(img.datos, (y * img.ancho + x) * 4)
      cubetas[Math.min(9, Math.floor((g / 255) * 10))] += 1
      total += 1
    }
  }
  return cubetas.map((c) => (total === 0 ? Number.NaN : cuatro(c / total)))
}

/** Pinta de magenta la zona muerta de `fuente` sobre una copia de `base`, y marca la banda. */
function pintarLaZonaMuerta(base: Imagen, fuente: Imagen, banda: Region | null): Buffer {
  const datos = new Uint8Array(base.ancho * base.alto * 4)
  for (let i = 0; i < base.ancho * base.alto; i += 1) {
    const k = i * 4
    if (enZonaMuerta(grisDelPixel(fuente.datos, k))) {
      datos[k] = 255
      datos[k + 1] = 0
      datos[k + 2] = 200
    } else {
      datos[k] = base.datos[k]
      datos[k + 1] = base.datos[k + 1]
      datos[k + 2] = base.datos[k + 2]
    }
    datos[k + 3] = 255
  }
  if (banda !== null) {
    const linea = (x: number, y: number): void => {
      if (x < 0 || y < 0 || x >= base.ancho || y >= base.alto) return
      const k = (y * base.ancho + x) * 4
      datos[k] = 0
      datos[k + 1] = 255
      datos[k + 2] = 80
      datos[k + 3] = 255
    }
    for (let y = Math.max(0, banda.y0); y < Math.min(base.alto, banda.y1); y += 1) {
      for (const dx of [0, 1]) {
        linea(banda.x0 + dx, y)
        linea(banda.x1 - 1 - dx, y)
      }
    }
  }
  return codificarPngRgba(base.ancho, base.alto, datos)
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const pedido = argumento('ancho', '390')
  const perfil = VENTANAS.find((v) => v.id === pedido)
  if (perfil === undefined) throw new Error(`--ancho=${pedido} no es ninguno de ${VENTANAS.map((v) => v.id).join(', ')}`)
  const t0 = Date.now()

  const salida = await conLaPagina(perfil, '/v3', async (s) => {
    const { pagina } = s
    await asentarElHome(s)
    const lienzo = await hayCanvas(pagina)
    if (!lienzo.hay) throw new Error('no hay canvas: sin escena no hay sala que barrer')
    const doc = await medir<{ altoDelDocumento: number; ventana: number; ancho: number }>(pagina, LECTOR_DEL_DOCUMENTO)
    const paneles = await medir<PanelLeido[]>(pagina, LECTOR_DE_PANELES)
    const secciones = { arriba: Math.min(...paneles.map((p) => p.top)), abajo: Math.max(...paneles.map((p) => p.top + p.alto)) }
    console.log(`canvas ${lienzo.ancho}×${lienzo.alto} · documento ${doc.altoDelDocumento} · ventana ${doc.ventana} · zona muerta = sRGB [${ZONA_MUERTA.desde}, ${ZONA_MUERTA.hasta}]`)

    const cuadros: unknown[] = []
    for (const k of KEYFRAMES) {
      const y = scrollDelProgreso(k.at, secciones, doc.ventana)
      const logrado = await scrollA(pagina, y)
      await esperarElPrimerCuadro(pagina)
      await new Promise((r) => setTimeout(r, ASENTAMIENTO_DE_BLOQUES_MS))

      // Qué sección llena el cuadro acá, y con qué superficie.
      const enCuadro = paneles.filter((p) => p.top < logrado + doc.ventana && p.top + p.alto > logrado)
      const base = `${TEMP}/zm-${perfil.id}-${k.nombre.replace(/[^a-z0-9]+/gi, '-')}`
      const rutas = { C: `${base}-C.png`, S: `${base}-S.png`, F: `${base}-F.png` }

      // C — lo que se ve.
      await capturar(pagina, rutas.C)

      // La banda donde vive la columna de texto: la unión de las cajas de texto
      // EN CUADRO, leídas del documento entero (no de un panel), porque en una
      // costura puede haber texto de dos secciones a la vez.
      const limpias = await medir<MarcasBorradas>(pagina, BORRAR_LAS_MARCAS)
      if (limpias.quedan !== 0) throw new Error(`quedaron ${limpias.quedan} marcas`)
      const bloques = (await medir<Bloque[]>(pagina, LECTOR_DE_BLOQUES_EN('[document.body]'))).filter((b) => b.enCuadro)
      const cajas = bloques.flatMap((b) => b.cajas).filter((c) => c.y < doc.ventana && c.y + c.alto > 0 && c.ancho > 0)
      const banda: Region | null =
        cajas.length === 0
          ? null
          : {
              x0: Math.max(0, Math.floor(Math.min(...cajas.map((c) => c.x)))),
              y0: 0,
              x1: Math.min(lienzo.ancho, Math.ceil(Math.max(...cajas.map((c) => c.x + c.ancho)))),
              y1: doc.ventana,
            }
      const cajaDelTexto: Region | null =
        cajas.length === 0
          ? null
          : {
              x0: Math.max(0, Math.floor(Math.min(...cajas.map((c) => c.x)))),
              y0: Math.max(0, Math.floor(Math.min(...cajas.map((c) => c.y)))),
              x1: Math.ceil(Math.max(...cajas.map((c) => c.x + c.ancho))),
              y1: Math.ceil(Math.max(...cajas.map((c) => c.y + c.alto))),
            }

      // F — el fondo real: la tinta apagada, todo lo demás pintado.
      const apagada = await medir<TintaApagada>(pagina, APAGAR_LA_TINTA(true))
      if (!apagada.tomo) throw new Error(`la tinta no se apagó — ${JSON.stringify(apagada.rebeldes.slice(0, 3))}`)
      await esperarElPrimerCuadro(pagina, 300)
      await capturar(pagina, rutas.F)
      await medir(pagina, APAGAR_LA_TINTA(false))

      // S — la sala desnuda.
      if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, true)))) throw new Error('no quedó sólo la escena')
      await esperarElPrimerCuadro(pagina, 300)
      await capturar(pagina, rutas.S)
      if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, false)))) throw new Error('no se restauró lo oculto')

      const C = leerImagen(rutas.C)
      const S = leerImagen(rutas.S)
      const F = leerImagen(rutas.F)
      const cuadroEntero: Region = { x0: 0, y0: 0, x1: C.ancho, y1: C.alto }

      const fila = {
        keyframe: k.nombre,
        progreso: cuatro(k.at),
        scrollY: logrado,
        seccionesEnCuadro: enCuadro.map((p) => ({ id: p.id, superficie: p.superficie })),
        bloquesEnCuadro: bloques.length,
        banda: banda === null ? null : { ...banda, anchoPx: banda.x1 - banda.x0, fraccionDelAncho: cuatro((banda.x1 - banda.x0) / C.ancho) },
        cajaDelTexto,
        sala: {
          cuadro: fraccionMuerta(S, cuadroEntero),
          banda: banda === null ? null : fraccionMuerta(S, banda),
          cajaDelTexto: cajaDelTexto === null ? null : fraccionMuerta(S, cajaDelTexto),
          histograma: histograma(S, cuadroEntero),
        },
        fondoReal: {
          cuadro: fraccionMuerta(F, cuadroEntero),
          banda: banda === null ? null : fraccionMuerta(F, banda),
          cajaDelTexto: cajaDelTexto === null ? null : fraccionMuerta(F, cajaDelTexto),
          histograma: histograma(F, cuadroEntero),
        },
        capturas: rutas,
      }
      cuadros.push(fila)

      const pc = (v: number): string => (Number.isNaN(v) ? '   —' : `${(v * 100).toFixed(1).padStart(5)}%`)
      console.log(
        `  ${k.nombre.padEnd(18)} p=${cuatro(k.at).toFixed(4)} y=${String(logrado).padStart(6)} · ${enCuadro.map((p) => p.id).join('+').padEnd(26).slice(0, 26)} · sala ${pc(fila.sala.cuadro.fraccion)} cuadro / ${pc(fila.sala.banda?.fraccion ?? Number.NaN)} banda / ${pc(fila.sala.cajaDelTexto?.fraccion ?? Number.NaN)} caja · fondo real ${pc(fila.fondoReal.cuadro.fraccion)} cuadro / ${pc(fila.fondoReal.banda?.fraccion ?? Number.NaN)} banda / ${pc(fila.fondoReal.cajaDelTexto?.fraccion ?? Number.NaN)} caja`,
      )
    }
    return { perfil, canvas: lienzo, documento: doc, paneles, secciones, cuadros }
  })

  // Con el navegador ya cerrado: las capturas pintadas y el JSON.
  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })
  interface CuadroConCapturas {
    readonly keyframe: string
    readonly banda: (Region & { readonly anchoPx: number }) | null
    readonly capturas: { readonly C: string; readonly S: string; readonly F: string }
  }
  for (const c of salida.cuadros as readonly CuadroConCapturas[]) {
    const slug = c.keyframe.replace(/[^a-z0-9]+/gi, '-')
    const C = leerImagen(c.capturas.C)
    const S = leerImagen(c.capturas.S)
    const F = leerImagen(c.capturas.F)
    const banda = c.banda === null ? null : { x0: c.banda.x0, y0: c.banda.y0, x1: c.banda.x1, y1: c.banda.y1 }
    writeFileSync(`${CARPETA_DE_CAPTURAS}/zm-${salida.perfil.id}-${slug}-sala.png`, pintarLaZonaMuerta(S, S, banda))
    writeFileSync(`${CARPETA_DE_CAPTURAS}/zm-${salida.perfil.id}-${slug}-fondo-real.png`, pintarLaZonaMuerta(F, F, banda))
    writeFileSync(`${CARPETA_DE_CAPTURAS}/zm-${salida.perfil.id}-${slug}-sobre-lo-que-se-ve.png`, pintarLaZonaMuerta(C, F, banda))
  }

  const ruta = guardarJson(`c-zona-muerta-${salida.perfil.id}`, { cuando: new Date().toISOString(), zonaMuerta: ZONA_MUERTA, ...salida })
  console.log(`\n  ${ruta} · ${((Date.now() - t0) / 1000).toFixed(0)} s`)
  console.log(`  capturas pintadas: ${CARPETA_DE_CAPTURAS}/zm-${salida.perfil.id}-*.png (magenta = zona muerta, verde = banda de la columna)`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
