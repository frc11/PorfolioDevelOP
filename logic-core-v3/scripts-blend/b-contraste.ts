/**
 * BLEND-1 · B — EL DISCRIMINADOR EMPÍRICO Y LAS TABLAS DE CONTRASTE.
 *
 *     npx tsx scripts-blend/b-contraste.ts --ancho=390 [--destrabar=si] [--solo=hero,numeros]
 *
 * ── Las cuatro capturas, y qué contesta cada una ───────────────────────────
 *
 *   **A** — la tinta apagada (`color: transparent`): el FONDO real debajo de
 *           cada glifo. Es contra esto que se mide todo.
 *   **T** — la escena oculta y el panel con relleno plano: de acá sale la
 *           MÁSCARA de glifo, con el umbral 24 de B1 sin tocar.
 *   **B** — el blend PUESTO sobre la escena viva: lo que el navegador
 *           REALMENTE pinta. Es el discriminador.
 *   **C** — lo que el visitante ve hoy. No entra en ninguna cuenta; va al reporte.
 *
 * ── ⚠️ EL DISCRIMINADOR, QUE ES EL APORTE DE ESTE SCRIPT ──────────────────
 *
 * `difference` con blanco es `255 − fondo` por canal. Entonces, sobre los
 * píxeles de glifo, se comparan DOS tintas:
 *
 *   · **la analítica** — `255 − A`, lo que el blend daría si la cadena de
 *     apilamiento llegara al canvas;
 *   · **la empírica** — `B`, lo que el navegador pintó de verdad.
 *
 * Si coinciden, la cadena está intacta y el blend mezcló contra la escena. Si la
 * empírica es **blanco constante** y la analítica no, la cadena está CORTADA: el
 * texto se mezcló contra un grupo vacío. `a-cadena.ts` lo deriva de
 * `getComputedStyle`; esto lo demuestra en píxeles, que es la evidencia que la
 * lección de agosto pide antes de creerle a una derivación.
 *
 * Sin esta comparación, publicar la cifra analítica sería «verde por arnés» en
 * su forma más pura: el número lindo de un blend que no ocurrió.
 *
 * ── ⚠️ `--destrabar=si`: MEDIR EL BLEND QUE NO EXISTE ─────────────────────
 *
 * Con la cadena cortada en las ocho, la cifra del blend no se puede medir sobre
 * el árbol de hoy. `--destrabar=si` inyecta —**sólo en la página de medición, y
 * revertido al salir**— lo mínimo para que la cadena llegue:
 *
 *   `main` y `[data-panel]` a `z-index: auto` (les saca el contexto de apilado),
 *   `[data-v3]` a `isolation: isolate` (pasa a ser la raíz del grupo de mezcla),
 *   `[data-escena]` a `z-index: -1` (para que el canvas pinte DEBAJO del texto),
 *   y el papel se muda de `[data-v3]` a `body`, porque una capa de z negativo
 *   pinta debajo del fondo de su propio elemento y el papel de `[data-v3]` la
 *   taparía entera.
 *
 * **No es una propuesta de implementación y no se aplica al producto.** Es la
 * entrada del instrumento, igual que `VARIAR_EL_CIERRE` en B8. Y trae su propio
 * control: se compara la captura **A** destrabada contra la **A** de hoy píxel
 * por píxel. Si el fondo no es el mismo, el destrabe cambió la escena y sus
 * cifras no transfieren — y eso se publica en vez de esconderse.
 *
 * ⚠️ Sólo vale a **390**. Arriba de 1025 la coreografía pone `transform` y
 * `will-change: transform` en cada pieza animada (`Pieza.tsx:80,87`), y ésos
 * cortan la cadena POR DEBAJO de la sección: sacarlos es sacar la coreografía,
 * no inyectar una regla. `a-cadena.ts` lo publica sección por sección.
 *
 * ── La zona muerta bajo el glifo, que es lo que decide ────────────────────
 *
 * Por cada píxel de glifo se mira el FONDO en **A** y se cuenta si cae en la
 * banda donde `255 − fondo ≈ fondo` (sRGB 102–153, ver `blend-comun.ts`). Esa
 * cuenta no necesita ni el blend ni el destrabe: es una propiedad del fondo, y
 * es la única cifra del PASO 2 que se puede publicar sobre el árbol de hoy sin
 * ninguna inyección.
 */

import { copyFileSync, mkdirSync } from 'node:fs'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { luminancia, contraste, AA_TEXTO_GRANDE, AA_TEXTO_NORMAL } from '../scripts-b4/color'
import { medir, scrollA } from '../scripts-b4/navegador'
import { ocultarPorSelector } from '../scripts-b5/pagina'
import {
  contrasteBajoElGlifoConOpacidad,
  leerImagen,
  mascaraDeGlifo,
  type Imagen,
  type Mascara,
} from '../scripts-b8/glifo-alfa'
import {
  APAGAR_LA_TINTA,
  ESTILAR_EL_PANEL,
  LECTOR_DEL_DOCUMENTO,
  LECTOR_DE_BLOQUES,
  LECTOR_DE_PANELES,
  type Bloque,
  type TintaApagada,
} from '../scripts-b8/lectores'
import {
  ASENTAMIENTO_DE_BLOQUES_MS,
  BORRAR_LAS_MARCAS,
  CARPETA_DE_CAPTURAS,
  KEYFRAMES,
  PONER_EL_BLEND,
  SELECTOR_DE_LA_ESCENA,
  TEMP,
  VENTANAS,
  argumento,
  asegurarCarpetas,
  asentarElHome,
  conLaPagina,
  cuatro,
  dos,
  enZonaMuerta,
  grisDelPixel,
  guardarJson,
  hayCanvas,
  scrollDelProgreso,
  type BlendPuesto,
  type MarcasBorradas,
} from './blend-comun'

// ─────────────────────────────────────────────────────────────────────────────
// EL DESTRABE — inyección de medición, reversible. Ver el docblock del archivo.
// ─────────────────────────────────────────────────────────────────────────────

const ID_DEL_DESTRABE = 'blend1-destrabe'

const REGLA_DEL_DESTRABE = [
  'body { background-color: var(--color-fondo) !important }',
  '[data-v3] { background-color: transparent !important; isolation: isolate !important }',
  '[data-escena] { z-index: -1 !important }',
  'main { z-index: auto !important }',
  '[data-panel] { z-index: auto !important }',
].join('\n')

function DESTRABAR(poner: boolean): string {
  return `(async () => {
  const viejo = document.getElementById(${JSON.stringify(ID_DEL_DESTRABE)})
  if (viejo !== null) viejo.remove()
  if (${poner}) {
    const estilo = document.createElement('style')
    estilo.id = ${JSON.stringify(ID_DEL_DESTRABE)}
    estilo.textContent = ${JSON.stringify(REGLA_DEL_DESTRABE)}
    document.head.appendChild(estilo)
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const escena = document.querySelector('[data-escena]')
  const raiz = document.querySelector('[data-v3]')
  const principal = document.querySelector('main')
  if (escena === null || raiz === null || principal === null) return { tomo: false, porque: 'falta un nodo' }
  const e = getComputedStyle(escena)
  const r = getComputedStyle(raiz)
  const m = getComputedStyle(principal)
  const esperado = ${poner}
  const bien = esperado
    ? e.zIndex === '-1' && r.isolation === 'isolate' && m.zIndex === 'auto'
    : e.zIndex === '0' && r.isolation === 'auto' && m.zIndex === '10'
  return { tomo: bien, porque: 'escena z=' + e.zIndex + ' · raíz isolation=' + r.isolation + ' · main z=' + m.zIndex }
})()`
}

interface Destrabe {
  readonly tomo: boolean
  readonly porque: string
}

// ─────────────────────────────────────────────────────────────────────────────
// LAS CUENTAS SOBRE LOS PÍXELES
// ─────────────────────────────────────────────────────────────────────────────

const percentil = (ordenadas: readonly number[], q: number): number =>
  ordenadas.length === 0 ? Number.NaN : ordenadas[Math.min(ordenadas.length - 1, Math.floor(q * ordenadas.length))]

/** Lo que una tinta —analítica o empírica— da sobre el fondo de A, píxel por píxel. */
interface LecturaDeTinta {
  readonly pixelesDeGlifo: number
  readonly peorContraste: number
  readonly p01: number
  readonly mediana: number
  readonly bajo45: number
  readonly bajo45Pct: number
  readonly bajo3: number
  readonly bajo3Pct: number
  readonly umbralAA: number
  readonly bajoAA: number
  readonly bajoAAPct: number
}

function leerTinta(
  mascara: Mascara,
  A: Imagen,
  tintaDe: (k: number) => readonly [number, number, number],
  grande: boolean,
): LecturaDeTinta {
  const razones: number[] = []
  for (const i of mascara.indices) {
    const k = i * 4
    const lumFondo = luminancia(A.datos[k], A.datos[k + 1], A.datos[k + 2])
    const t = tintaDe(k)
    razones.push(contraste(luminancia(t[0], t[1], t[2]), lumFondo))
  }
  razones.sort((a, b) => a - b)
  const n = razones.length
  const umbral = grande ? AA_TEXTO_GRANDE : AA_TEXTO_NORMAL
  const bajo = (u: number): number => razones.filter((r) => r < u).length
  const pct = (c: number): number => (n === 0 ? Number.NaN : cuatro(c / n))
  return {
    pixelesDeGlifo: n,
    peorContraste: n === 0 ? Number.NaN : dos(razones[0]),
    p01: dos(percentil(razones, 0.01)),
    mediana: dos(percentil(razones, 0.5)),
    bajo45: bajo(4.5),
    bajo45Pct: pct(bajo(4.5)),
    bajo3: bajo(3),
    bajo3Pct: pct(bajo(3)),
    umbralAA: umbral,
    bajoAA: bajo(umbral),
    bajoAAPct: pct(bajo(umbral)),
  }
}

/** Cuántos píxeles de glifo tienen el FONDO en la banda donde el blend se apaga. */
function zonaMuertaBajoElGlifo(mascara: Mascara, A: Imagen): { readonly pixeles: number; readonly fraccion: number } {
  let n = 0
  for (const i of mascara.indices) if (enZonaMuerta(grisDelPixel(A.datos, i * 4))) n += 1
  return { pixeles: n, fraccion: mascara.indices.length === 0 ? Number.NaN : cuatro(n / mascara.indices.length) }
}

/**
 * EL DISCRIMINADOR: ¿lo que el navegador pintó es `255 − fondo`, o es blanco?
 *
 * ── ⚠️ EL AGUJERO QUE ESTE DISCRIMINADOR TUVO, Y CÓMO SE TAPÓ ─────────────
 *
 * La primera versión comparaba lo pintado contra `255 − fondo` sobre TODOS los
 * píxeles de glifo, y sobre el titular del hero a 390 dio un 53 % de
 * coincidencia — que leído de apuro parecería «la cadena llega a medias». No lo
 * era: **ahí el fondo es el logo, casi negro**, así que `255 − fondo ≈ 255` y la
 * predicción del blend y el blanco de la cadena cortada son EL MISMO NÚMERO. Los
 * dos aciertan y el instrumento no distingue nada.
 *
 * Así que la coincidencia se cuenta sólo donde las dos hipótesis PREDICEN COSAS
 * DISTINTAS: los píxeles cuyo fondo es lo bastante claro como para que
 * `255 − fondo` se separe del blanco (`fondo ≥ 55`, o sea predicción ≤ 200, a 55
 * de distancia del 255 y muy arriba del ±8 de tolerancia). Se publica el tamaño
 * de ese subconjunto al lado de la cifra: una coincidencia calculada sobre
 * pocos píxeles no decide nada, y eso tiene que estar a la vista.
 *
 * Con el subconjunto vacío el veredicto es «no discrimina», que es un resultado
 * y no un fracaso: quiere decir que en ese bloque el fondo es tan oscuro que el
 * blend y el texto blanco pintarían lo mismo.
 */
const FONDO_MINIMO_QUE_DISCRIMINA = 55

interface Discriminador {
  readonly pintadoMediano: number
  readonly predichoMediano: number
  /** Coincidencia sobre TODOS los glifos: se publica, no decide. */
  readonly coincideEnTodos: number
  /** Píxeles donde las dos hipótesis predicen distinto (fondo ≥ 55). */
  readonly pixelesQueDiscriminan: number
  readonly fraccionQueDiscrimina: number
  /** LA CIFRA: coincidencia sobre ese subconjunto. */
  readonly coincide: number
  readonly pintadoEsBlanco: number
  readonly veredicto: 'la cadena llega' | 'la cadena está cortada' | 'no discrimina' | 'sin glifos'
}

function discriminar(mascara: Mascara, A: Imagen, B: Imagen): Discriminador {
  const pintado: number[] = []
  const predicho: number[] = []
  let coincidenEnTodos = 0
  let discriminantes = 0
  let coincidenEnLosQueDiscriminan = 0
  let blancos = 0
  for (const i of mascara.indices) {
    const k = i * 4
    const fondo = grisDelPixel(A.datos, k)
    const p = grisDelPixel(B.datos, k)
    const q = 255 - fondo
    pintado.push(p)
    predicho.push(q)
    if (Math.abs(p - q) <= 8) coincidenEnTodos += 1
    if (p >= 247) blancos += 1
    if (fondo >= FONDO_MINIMO_QUE_DISCRIMINA) {
      discriminantes += 1
      if (Math.abs(p - q) <= 8) coincidenEnLosQueDiscriminan += 1
    }
  }
  const n = pintado.length
  if (n === 0) {
    return {
      pintadoMediano: Number.NaN, predichoMediano: Number.NaN, coincideEnTodos: Number.NaN,
      pixelesQueDiscriminan: 0, fraccionQueDiscrimina: Number.NaN, coincide: Number.NaN,
      pintadoEsBlanco: Number.NaN, veredicto: 'sin glifos',
    }
  }
  pintado.sort((a, b) => a - b)
  predicho.sort((a, b) => a - b)
  // Menos de 200 píxeles discriminantes no alcanzan para decidir un bloque.
  const decide = discriminantes >= 200
  const coincide = discriminantes === 0 ? Number.NaN : cuatro(coincidenEnLosQueDiscriminan / discriminantes)
  return {
    pintadoMediano: dos(percentil(pintado, 0.5)),
    predichoMediano: dos(percentil(predicho, 0.5)),
    coincideEnTodos: cuatro(coincidenEnTodos / n),
    pixelesQueDiscriminan: discriminantes,
    fraccionQueDiscrimina: cuatro(discriminantes / n),
    coincide,
    pintadoEsBlanco: cuatro(blancos / n),
    veredicto: !decide ? 'no discrimina' : coincide >= 0.8 ? 'la cadena llega' : 'la cadena está cortada',
  }
}

/** Cuánto se parecen dos capturas del MISMO fondo: el control del destrabe. */
function distanciaEntreCapturas(X: Imagen, Y: Imagen): { readonly medio: number; readonly p99: number; readonly maximo: number } {
  if (X.ancho !== Y.ancho || X.alto !== Y.alto) throw new Error('las dos capturas no tienen el mismo tamaño')
  const dif: number[] = []
  let suma = 0
  for (let i = 0; i < X.ancho * X.alto; i += 1) {
    const k = i * 4
    const d = Math.max(Math.abs(X.datos[k] - Y.datos[k]), Math.abs(X.datos[k + 1] - Y.datos[k + 1]), Math.abs(X.datos[k + 2] - Y.datos[k + 2]))
    dif.push(d)
    suma += d
  }
  dif.sort((a, b) => a - b)
  return { medio: dos(suma / dif.length), p99: percentil(dif, 0.99), maximo: dif[dif.length - 1] }
}

// ─────────────────────────────────────────────────────────────────────────────

interface PanelLeido {
  readonly id: string
  readonly superficie: string
  readonly alto: number
  readonly top: number
}

interface FilaDeBloque {
  readonly ancho: string
  readonly seccion: string
  readonly pose: string
  readonly scrollY: number
  readonly etiqueta: string
  readonly pieza: string | null
  readonly nivel: string | null
  readonly texto: string
  readonly tamanoPx: number
  readonly grande: boolean
  readonly opacidad: number
  readonly tinta: readonly [number, number, number]
  /** Control: `contrasteBajoElGlifoConOpacidad` sin tocar. */
  readonly sinBlend: LecturaDeTinta
  /** Lo que el blend DARÍA: tinta `255 − fondo`, píxel por píxel. */
  readonly blendAnalitico: LecturaDeTinta
  /** Lo que el navegador PINTÓ con el blend puesto. */
  readonly blendEmpirico: LecturaDeTinta
  readonly discriminador: Discriminador
  readonly zonaMuerta: { readonly pixeles: number; readonly fraccion: number }
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const pedido = argumento('ancho', '390')
  const destrabar = argumento('destrabar', 'no') === 'si'
  const solo = argumento('solo', '').split(',').filter((s) => s.length > 0)
  const perfil = VENTANAS.find((v) => v.id === pedido)
  if (perfil === undefined) throw new Error(`--ancho=${pedido} no es ninguno de ${VENTANAS.map((v) => v.id).join(', ')}`)
  if (destrabar && !perfil.debajoDelUmbral) {
    throw new Error('--destrabar sólo vale abajo de 1025: arriba la coreografía corta la cadena con `transform` por pieza y una regla no lo deshace (ver el docblock)')
  }
  const etiqueta = `${perfil.id}${destrabar ? '-destrabado' : ''}`
  const t0 = Date.now()

  const salida = await conLaPagina(perfil, '/v3', async (s) => {
    const { pagina } = s
    await asentarElHome(s)
    const lienzo = await hayCanvas(pagina)
    if (!lienzo.hay) throw new Error('no hay canvas: sin escena detrás no hay nada que mezclar y la corrida no dice nada')
    const doc = await medir<{ altoDelDocumento: number; ventana: number; ancho: number }>(pagina, LECTOR_DEL_DOCUMENTO)
    const paneles = (await medir<PanelLeido[]>(pagina, LECTOR_DE_PANELES)).filter((p) => solo.length === 0 || solo.includes(p.id))
    const todos = await medir<PanelLeido[]>(pagina, LECTOR_DE_PANELES)
    const secciones = { arriba: Math.min(...todos.map((p) => p.top)), abajo: Math.max(...todos.map((p) => p.top + p.alto)) }
    console.log(`canvas ${lienzo.ancho}×${lienzo.alto} · documento ${doc.altoDelDocumento} · ${paneles.length}/${todos.length} paneles · ${destrabar ? 'DESTRABADO (inyección de medición)' : 'árbol de hoy'}`)

    const filas: FilaDeBloque[] = []
    const controles: unknown[] = []

    for (const panel of paneles) {
      /**
       * ⚠️ **LAS POSES SE DEDUPLICAN POR `y`, y no es cosmética.** El arranque de
       * una sección y un keyframe de la coreografía pueden caer en el MISMO
       * píxel de scroll —pasa en el hero (los dos en y=0) y en el Cierre a 1440
       * (los dos en y=15300)—, y medir dos veces la misma pose duplica los
       * píxeles de glifo de esa sección en todos los agregados. El nombre de la
       * pose se compone con los dos motivos para no perder cuál keyframe es.
       */
      const porY = new Map<number, string[]>()
      const anotar = (y: number, nombre: string): void => {
        const previo = porY.get(y)
        if (previo === undefined) porY.set(y, [nombre])
        else if (!previo.includes(nombre)) previo.push(nombre)
      }
      anotar(Math.round(Math.max(0, Math.min(doc.altoDelDocumento - doc.ventana, panel.top))), 'arranque')
      for (const k of KEYFRAMES) {
        const y = scrollDelProgreso(k.at, secciones, doc.ventana)
        if (y >= panel.top && y < panel.top + panel.alto) anotar(y, `kf ${k.nombre} (${cuatro(k.at)})`)
      }
      const poses = [...porY.entries()].sort((a, b) => a[0] - b[0]).map(([y, nombres]) => ({ pose: nombres.join(' = '), y }))
      console.log(`\n── ${panel.id} (${panel.superficie}, ${dos(panel.alto / doc.ventana)} pantallas desde y=${Math.round(panel.top)}) · ${poses.length} poses ──`)

      for (const pose of poses) {
        const logrado = await scrollA(pagina, pose.y)
        if (Math.abs(logrado - pose.y) > 1 && pose.y < doc.altoDelDocumento - doc.ventana - 1) {
          throw new Error(`${panel.id}: se pidió y=${pose.y} y el scroll quedó en ${logrado}`)
        }
        await esperarElPrimerCuadro(pagina)
        await new Promise((r) => setTimeout(r, ASENTAMIENTO_DE_BLOQUES_MS))

        const limpias = await medir<MarcasBorradas>(pagina, BORRAR_LAS_MARCAS)
        if (limpias.quedan !== 0) throw new Error(`quedaron ${limpias.quedan} marcas: la atribución por sección no sería confiable`)
        const bloques = (await medir<Bloque[]>(pagina, LECTOR_DE_BLOQUES(panel.id))).filter((b) => b.enCuadro)
        if (bloques.length === 0) {
          console.log(`  ${pose.pose.padEnd(24)} y=${String(logrado).padStart(6)} · sin texto en cuadro`)
          continue
        }

        const base = `${TEMP}/${etiqueta}-${panel.id}-${logrado}`
        const rutas = { C: `${base}-C.png`, A: `${base}-A.png`, T: `${base}-T.png`, B: `${base}-B.png`, Ad: `${base}-Ad.png` }

        // C — lo que el visitante ve, en el árbol de hoy y sin nada inyectado.
        await capturar(pagina, rutas.C)

        // El control del destrabe: el fondo de HOY, antes de inyectar nada.
        let controlDelDestrabe: unknown = null
        if (destrabar) {
          const apagadaAntes = await medir<TintaApagada>(pagina, APAGAR_LA_TINTA(true))
          if (!apagadaAntes.tomo) throw new Error(`${panel.id}: la tinta no se apagó — ${JSON.stringify(apagadaAntes.rebeldes)}`)
          await esperarElPrimerCuadro(pagina, 300)
          await capturar(pagina, rutas.Ad)
          await medir(pagina, APAGAR_LA_TINTA(false))
          const puesto = await medir<Destrabe>(pagina, DESTRABAR(true))
          if (!puesto.tomo) throw new Error(`el destrabe no tomó — ${puesto.porque}`)
        }

        // B — el blend puesto sobre la escena viva: lo que el navegador pinta.
        const blend = await medir<BlendPuesto>(pagina, PONER_EL_BLEND(true))
        if (!blend.tomo) throw new Error(`${panel.id}: el blend no tomó en ${blend.rebeldes.length} nodos — ${JSON.stringify(blend.rebeldes.slice(0, 3))}`)
        await esperarElPrimerCuadro(pagina, 300)
        await capturar(pagina, rutas.B)
        await medir(pagina, PONER_EL_BLEND(false))

        // A — el fondo real debajo de cada glifo.
        const apagada = await medir<TintaApagada>(pagina, APAGAR_LA_TINTA(true))
        if (!apagada.tomo) throw new Error(`${panel.id}: la tinta no se apagó — ${JSON.stringify(apagada.rebeldes)}`)
        await esperarElPrimerCuadro(pagina, 300)
        await capturar(pagina, rutas.A)
        await medir(pagina, APAGAR_LA_TINTA(false))

        // T — la máscara: escena oculta y el panel con el relleno plano de su superficie.
        if (!(await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, true))) throw new Error('la escena no quedó oculta')
        const fondoPlano = await medir<string>(pagina, ESTILAR_EL_PANEL(panel.id, { 'background-color': 'var(--color-fondo)' }))
        if (fondoPlano === 'rgba(0, 0, 0, 0)') throw new Error(`${panel.id}: el relleno plano para la máscara no tomó`)
        await capturar(pagina, rutas.T)
        await medir(pagina, ESTILAR_EL_PANEL(panel.id, { 'background-color': null }))
        await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, false)

        if (destrabar) {
          const sacado = await medir<Destrabe>(pagina, DESTRABAR(false))
          if (!sacado.tomo) throw new Error(`el destrabe no se pudo revertir — ${sacado.porque}`)
        }

        const A = leerImagen(rutas.A)
        const T = leerImagen(rutas.T)
        const B = leerImagen(rutas.B)
        if (destrabar) {
          const Ad = leerImagen(rutas.Ad)
          controlDelDestrabe = { seccion: panel.id, pose: pose.pose, scrollY: logrado, distancia: distanciaEntreCapturas(Ad, A) }
          controles.push(controlDelDestrabe)
        }

        for (const b of bloques) {
          const opacidad = b.opacidad * b.alfaDeColor
          if (opacidad < 0.02) continue
          const control = contrasteBajoElGlifoConOpacidad(T, A, b.cajas, b.tinta, opacidad, b.grande)
          if (control.pixelesDeGlifo === 0) continue
          const mascara: Mascara = control.mascara
          const fila: FilaDeBloque = {
            ancho: perfil.id,
            seccion: panel.id,
            pose: pose.pose,
            scrollY: logrado,
            etiqueta: b.etiqueta,
            pieza: b.pieza,
            nivel: b.nivel,
            texto: b.texto,
            tamanoPx: dos(b.tamanoPx),
            grande: b.grande,
            opacidad: cuatro(opacidad),
            tinta: b.tinta,
            sinBlend: leerTinta(mascara, A, (k) => {
              if (opacidad >= 1) return b.tinta as readonly [number, number, number]
              const m = (c: number, f: number): number => Math.round(opacidad * c + (1 - opacidad) * f)
              return [m(b.tinta[0], A.datos[k]), m(b.tinta[1], A.datos[k + 1]), m(b.tinta[2], A.datos[k + 2])]
            }, b.grande),
            blendAnalitico: leerTinta(mascara, A, (k) => [255 - A.datos[k], 255 - A.datos[k + 1], 255 - A.datos[k + 2]], b.grande),
            blendEmpirico: leerTinta(mascara, A, (k) => [B.datos[k], B.datos[k + 1], B.datos[k + 2]], b.grande),
            discriminador: discriminar(mascara, A, B),
            zonaMuerta: zonaMuertaBajoElGlifo(mascara, A),
          }
          filas.push(fila)
        }

        const delPose = filas.filter((f) => f.seccion === panel.id && f.pose === pose.pose)
        const cortadas = delPose.filter((f) => f.discriminador.veredicto === 'la cadena está cortada').length
        const llegan = delPose.filter((f) => f.discriminador.veredicto === 'la cadena llega').length
        const mudas = delPose.filter((f) => f.discriminador.veredicto === 'no discrimina').length
        const zm = delPose.reduce((a, f) => a + f.zonaMuerta.pixeles, 0)
        const px = delPose.reduce((a, f) => a + f.sinBlend.pixelesDeGlifo, 0)
        console.log(
          `  ${pose.pose.padEnd(30).slice(0, 30)} y=${String(logrado).padStart(6)} · ${String(delPose.length).padStart(3)} bloques, ${String(px).padStart(6)} px · cadena: cortada ${cortadas} · llega ${llegan} · no discrimina ${mudas} · zona muerta ${String(zm).padStart(6)} px (${px === 0 ? '—' : `${((zm / px) * 100).toFixed(1)}%`})`,
        )
      }
    }

    return { etiqueta, perfil, destrabar, canvas: lienzo, documento: doc, secciones, filas, controlDelDestrabe: controles }
  })

  // Con el navegador ya cerrado: el JSON y las capturas del reporte.
  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })
  const porSeccion = new Map<string, FilaDeBloque>()
  for (const f of salida.filas) {
    const previa = porSeccion.get(f.seccion)
    if (previa === undefined || f.sinBlend.peorContraste < previa.sinBlend.peorContraste) porSeccion.set(f.seccion, f)
  }
  for (const [sec, f] of porSeccion) {
    for (const cual of ['C', 'A', 'B'] as const) {
      const origen = `${TEMP}/${salida.etiqueta}-${sec}-${f.scrollY}-${cual}.png`
      try {
        copyFileSync(origen, `${CARPETA_DE_CAPTURAS}/${salida.etiqueta}-${sec}-peor-y${f.scrollY}-${cual}.png`)
      } catch {
        console.log(`  (no se pudo copiar ${origen})`)
      }
    }
  }

  console.log('\n══ RESUMEN POR SECCIÓN ══')
  console.log('  sección          bloq   glifos  ── SIN BLEND ──  ── BLEND (analítico) ──  ── BLEND (pintado) ──  ZONA MUERTA   cadena')
  console.log('                                  peor  <4,5  <3    peor  <4,5   <3         peor  coincide         px      %')
  const resumen: unknown[] = []
  for (const sec of [...new Set(salida.filas.map((f) => f.seccion))]) {
    const propias = salida.filas.filter((f) => f.seccion === sec)
    const px = propias.reduce((a, f) => a + f.sinBlend.pixelesDeGlifo, 0)
    const sum = (g: (f: FilaDeBloque) => number): number => propias.reduce((a, f) => a + g(f), 0)
    const peor = (g: (f: FilaDeBloque) => number): number => Math.min(...propias.map(g))
    const zm = sum((f) => f.zonaMuerta.pixeles)
    // La coincidencia se pondera por los píxeles QUE DISCRIMINAN, no por todos:
    // ponderar por todos le daría peso a los bloques donde el instrumento es ciego.
    const discriminantes = sum((f) => f.discriminador.pixelesQueDiscriminan)
    const coincide =
      discriminantes === 0
        ? Number.NaN
        : propias.reduce((a, f) => a + (Number.isNaN(f.discriminador.coincide) ? 0 : f.discriminador.coincide * f.discriminador.pixelesQueDiscriminan), 0) / discriminantes
    const cortadas = propias.filter((f) => f.discriminador.veredicto === 'la cadena está cortada').length
    const fila = {
      seccion: sec,
      bloques: propias.length,
      pixelesDeGlifo: px,
      sinBlend: { peor: peor((f) => f.sinBlend.peorContraste), bajo45: sum((f) => f.sinBlend.bajo45), bajo3: sum((f) => f.sinBlend.bajo3) },
      blendAnalitico: { peor: peor((f) => f.blendAnalitico.peorContraste), bajo45: sum((f) => f.blendAnalitico.bajo45), bajo3: sum((f) => f.blendAnalitico.bajo3) },
      blendEmpirico: { peor: peor((f) => f.blendEmpirico.peorContraste), bajo45: sum((f) => f.blendEmpirico.bajo45), bajo3: sum((f) => f.blendEmpirico.bajo3) },
      zonaMuerta: { pixeles: zm, fraccion: px === 0 ? Number.NaN : cuatro(zm / px) },
      pixelesQueDiscriminan: discriminantes,
      coincidenciaMedia: cuatro(coincide),
      bloquesConCadenaCortada: cortadas,
      bloquesDondeLaCadenaLlega: propias.filter((f) => f.discriminador.veredicto === 'la cadena llega').length,
      bloquesQueNoDiscriminan: propias.filter((f) => f.discriminador.veredicto === 'no discrimina').length,
    }
    resumen.push(fila)
    const p = (v: number, t: number): string => (t === 0 ? '   —' : `${((v / t) * 100).toFixed(1).padStart(5)}%`)
    console.log(
      `  ${sec.padEnd(16)} ${String(propias.length).padStart(4)} ${String(px).padStart(8)}  ${fila.sinBlend.peor.toFixed(2).padStart(5)} ${p(fila.sinBlend.bajo45, px)} ${p(fila.sinBlend.bajo3, px)}   ${fila.blendAnalitico.peor.toFixed(2).padStart(5)} ${p(fila.blendAnalitico.bajo45, px)} ${p(fila.blendAnalitico.bajo3, px)}     ${fila.blendEmpirico.peor.toFixed(2).padStart(5)} ${(Number.isNaN(coincide) ? '    —' : `${(coincide * 100).toFixed(1)}%`).padStart(6)}   ${String(zm).padStart(7)} ${p(zm, px)}  ${cortadas}/${propias.length}`,
    )
  }

  const ruta = guardarJson(`b-contraste-${salida.etiqueta}`, { cuando: new Date().toISOString(), ...salida, resumen })
  console.log(`\n  ${ruta} · ${((Date.now() - t0) / 1000).toFixed(0)} s`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
