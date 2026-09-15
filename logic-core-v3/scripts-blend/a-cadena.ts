/**
 * BLEND-1 · A — LA CADENA DE APILAMIENTO. **La compuerta del sprint.**
 *
 *     npx tsx scripts-blend/a-cadena.ts [--ancho=390|1440|1920|todos]
 *
 * ── Qué contesta ──────────────────────────────────────────────────────────
 *
 * `mix-blend-mode` mezcla contra lo que hay pintado debajo **dentro del mismo
 * contexto de apilamiento**. Si entre el nodo de texto y el `<canvas>` de la
 * escena hay un ancestro que abre uno propio, el texto se mezcla contra el
 * contenido de ESE grupo —que no incluye la escena— y sale blanco sobre blanco.
 *
 * Así que la pregunta es una sola, por bloque de texto: **¿cuál es el ancestro
 * más cercano que abre un contexto de apilamiento, y el canvas está adentro?**
 *
 *   · adentro  → la cadena llega: el blend puede mezclar contra la escena.
 *   · afuera   → la cadena está cortada ahí, y el blend no puede funcionar.
 *
 * ── ⚠️ POR QUÉ ESTO SE LEE DEL NAVEGADOR Y NO DEL FUENTE ──────────────────
 *
 * Porque lo que abre un contexto de apilamiento es el valor COMPUTADO, y en
 * este árbol casi nada está escrito a mano: Framer Motion pone `transform` y
 * `opacity` inline por cuadro, Tailwind los pone por clase, y la coreografía
 * los pone desde un `useTransform`. Derivar del fuente diría «acá hay un
 * `motion.div`» y no diría si en el instante medido su `transform` es `none`
 * (Framer lo borra cuando la animación termina) o una matriz. `getComputedStyle`
 * contesta lo segundo, que es lo que el navegador usa para apilar.
 *
 * El fuente entra igual, y para lo que sirve: **la atribución.** Cada nodo de la
 * cadena se publica con su etiqueta, sus clases y sus `data-*`, que es con lo
 * que el reporte lo señala en un archivo. Y para que el resultado no dependa del
 * instante, se mide **en dos poses** —el arranque de cada sección y su keyframe—
 * y se publica la unión: un ancestro que corta en CUALQUIERA de las dos corta.
 *
 * ── ⚠️ LO QUE ESTE SCRIPT NO HACE ─────────────────────────────────────────
 *
 * **No pone el blend.** Lee la cadena que HOY existe. Poner `isolation: isolate`
 * en algún ancestro para «destrabarlo» sería construir producto; lo que haría
 * falta se reporta con su costo y no se aplica.
 *
 * La confirmación empírica —el texto pintado contra `255 − fondo`— la hace
 * `b-contraste.ts`, que es el que sí pone el blend y lo fotografía. Este script
 * es la derivación; ése es el discriminador.
 */

import {
  ASENTAMIENTO_DE_BLOQUES_MS,
  BORRAR_LAS_MARCAS,
  KEYFRAMES,
  VENTANAS,
  argumento,
  asentarElHome,
  conLaPagina,
  cuatro,
  guardarJson,
  hayCanvas,
  scrollDelProgreso,
  type MarcasBorradas,
} from './blend-comun'
import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { LECTOR_DEL_DOCUMENTO, LECTOR_DE_BLOQUES, LECTOR_DE_PANELES, type Bloque } from '../scripts-b8/lectores'

/**
 * LO QUE ABRE UN CONTEXTO DE APILAMIENTO, tal como el navegador lo computa.
 *
 * La lista es la de CSS Positioned Layout §9 más la de CSS Compositing §5.1, y
 * cada rama devuelve el VALOR que la abrió, no un booleano: el reporte tiene que
 * poder decir «`transform: matrix(...)` en el nodo tal», no «algo».
 *
 * ⚠️ `will-change` entra sólo si nombra una propiedad que abriría uno. Un
 * `will-change: scroll-position` no apila nada, y contarlo daría un corte
 * inventado. El caso conocido del hero (`will-change: transform`) sí entra, y
 * por eso la rama mira la lista y no la presencia.
 */
const FUENTE_DEL_DETECTOR = `
  const PROPIEDADES_QUE_APILAN = ['transform','opacity','filter','backdrop-filter','perspective','clip-path','mask','mask-image','mix-blend-mode','isolation','z-index','contain','translate','rotate','scale','offset-path','view-transition-name']
  const apila = (el) => {
    const cs = getComputedStyle(el)
    const razones = []
    if (el === document.documentElement) razones.push({ propiedad: '(raíz)', valor: 'documentElement' })
    if (cs.position === 'fixed' || cs.position === 'sticky') razones.push({ propiedad: 'position', valor: cs.position })
    if ((cs.position === 'absolute' || cs.position === 'relative') && cs.zIndex !== 'auto') razones.push({ propiedad: 'position+z-index', valor: cs.position + ' / ' + cs.zIndex })
    if (parseFloat(cs.opacity) < 1) razones.push({ propiedad: 'opacity', valor: cs.opacity })
    if (cs.mixBlendMode !== 'normal') razones.push({ propiedad: 'mix-blend-mode', valor: cs.mixBlendMode })
    if (cs.transform !== 'none') razones.push({ propiedad: 'transform', valor: cs.transform })
    if (cs.translate !== 'none' && cs.translate !== '') razones.push({ propiedad: 'translate', valor: cs.translate })
    if (cs.rotate !== 'none' && cs.rotate !== '') razones.push({ propiedad: 'rotate', valor: cs.rotate })
    if (cs.scale !== 'none' && cs.scale !== '') razones.push({ propiedad: 'scale', valor: cs.scale })
    if (cs.filter !== 'none') razones.push({ propiedad: 'filter', valor: cs.filter })
    if (cs.backdropFilter !== 'none' && cs.backdropFilter !== '') razones.push({ propiedad: 'backdrop-filter', valor: cs.backdropFilter })
    if (cs.perspective !== 'none') razones.push({ propiedad: 'perspective', valor: cs.perspective })
    if (cs.transformStyle === 'preserve-3d') razones.push({ propiedad: 'transform-style', valor: cs.transformStyle })
    if (cs.clipPath !== 'none') razones.push({ propiedad: 'clip-path', valor: cs.clipPath })
    if (cs.maskImage !== 'none' && cs.maskImage !== '') razones.push({ propiedad: 'mask-image', valor: cs.maskImage })
    if (cs.isolation === 'isolate') razones.push({ propiedad: 'isolation', valor: cs.isolation })
    if (cs.contain !== 'none' && /\\b(paint|layout|strict|content)\\b/.test(cs.contain)) razones.push({ propiedad: 'contain', valor: cs.contain })
    if (cs.contentVisibility === 'auto' || cs.contentVisibility === 'hidden') razones.push({ propiedad: 'content-visibility', valor: cs.contentVisibility })
    if (cs.containerType !== undefined && cs.containerType !== 'normal' && cs.containerType !== '') razones.push({ propiedad: 'container-type', valor: cs.containerType })
    if (cs.viewTransitionName !== undefined && cs.viewTransitionName !== 'none' && cs.viewTransitionName !== '') razones.push({ propiedad: 'view-transition-name', valor: cs.viewTransitionName })
    if (cs.willChange !== 'auto' && cs.willChange !== '') {
      const nombradas = cs.willChange.split(',').map((s) => s.trim()).filter((s) => PROPIEDADES_QUE_APILAN.includes(s))
      if (nombradas.length > 0) razones.push({ propiedad: 'will-change', valor: cs.willChange })
    }
    const padre = el.parentElement
    if (padre !== null && cs.zIndex !== 'auto' && /flex|grid/.test(getComputedStyle(padre).display)) {
      razones.push({ propiedad: 'hijo de flex/grid + z-index', valor: getComputedStyle(padre).display + ' / ' + cs.zIndex })
    }
    return razones
  }
  const describir = (el) => {
    const datos = {}
    for (const a of el.attributes) if (a.name.startsWith('data-') && !a.name.startsWith('data-b8-')) datos[a.name] = String(a.value).slice(0, 40)
    const cs = getComputedStyle(el)
    return {
      etiqueta: el.tagName.toLowerCase(),
      id: el.id === '' ? null : el.id,
      clases: (typeof el.className === 'string' ? el.className : '').slice(0, 160),
      datos,
      estiloInline: (el.getAttribute('style') ?? '').slice(0, 160),
      position: cs.position,
      zIndex: cs.zIndex,
    }
  }
`

/**
 * LA CADENA DE CADA BLOQUE MARCADO, hasta el ancestro que la corta.
 *
 * Corre DESPUÉS de `LECTOR_DE_BLOQUES`, que es el que pone `data-b8-bloque`: así
 * el conjunto de bloques es EXACTAMENTE el que el control de contraste mide, y
 * las dos tablas del reporte hablan de los mismos nodos.
 */
const LECTOR_DE_LA_CADENA = `(() => {
  ${FUENTE_DEL_DETECTOR}
  const lienzo = document.querySelector('canvas')
  const escena = document.querySelector('[data-escena]')
  const bloques = [...document.querySelectorAll('[data-b8-bloque], [data-b8-campo]')]
  const salida = []
  for (const el of bloques) {
    const cadena = []
    let corte = null
    let n = el.parentElement
    while (n !== null) {
      const razones = apila(n)
      const nodo = { ...describir(n), razones, contieneElCanvas: lienzo !== null && n.contains(lienzo) }
      cadena.push(nodo)
      if (razones.length > 0 && corte === null) corte = nodo
      if (n === document.documentElement) break
      n = n.parentElement
    }
    const r = el.getBoundingClientRect()
    salida.push({
      n: Number(el.getAttribute('data-b8-bloque') ?? el.getAttribute('data-b8-campo')),
      bloque: describir(el),
      razonesPropias: apila(el),
      texto: (el.textContent ?? '').replace(/\\s+/g, ' ').trim().slice(0, 40),
      caja: { x: r.left, y: r.top, ancho: r.width, alto: r.height },
      enCuadro: r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && r.right > 0,
      /** El ancestro más cercano que abre contexto: la raíz del grupo de mezcla. */
      grupo: corte,
      /** LA RESPUESTA: el canvas está adentro del grupo donde el texto se mezclaría. */
      llegaAlCanvas: corte === null ? lienzo !== null : corte.contieneElCanvas,
      largoDeLaCadena: cadena.length,
      cadena,
    })
  }
  return {
    hayCanvas: lienzo !== null,
    hayEscena: escena !== null,
    canvas: lienzo === null ? null : { ...describir(lienzo), ancho: lienzo.width, alto: lienzo.height },
    escena: escena === null ? null : describir(escena),
    /** La cadena del canvas hacia arriba: para saber en qué grupo se pinta la escena. */
    cadenaDelCanvas: (() => {
      if (lienzo === null) return []
      const c = []
      let n = lienzo
      while (n !== null) {
        c.push({ ...describir(n), razones: apila(n) })
        if (n === document.documentElement) break
        n = n.parentElement
      }
      return c
    })(),
    bloques: salida,
  }
})()`

interface RazonDeApilado {
  readonly propiedad: string
  readonly valor: string
}

interface NodoDescrito {
  readonly etiqueta: string
  readonly id: string | null
  readonly clases: string
  readonly datos: Readonly<Record<string, string>>
  readonly estiloInline: string
  readonly position: string
  readonly zIndex: string
  readonly razones: readonly RazonDeApilado[]
  readonly contieneElCanvas?: boolean
}

interface CadenaDeBloque {
  readonly n: number
  readonly bloque: NodoDescrito
  readonly razonesPropias: readonly RazonDeApilado[]
  readonly texto: string
  readonly caja: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }
  readonly enCuadro: boolean
  readonly grupo: NodoDescrito | null
  readonly llegaAlCanvas: boolean
  readonly largoDeLaCadena: number
  readonly cadena: readonly NodoDescrito[]
}

interface LecturaDeLaCadena {
  readonly hayCanvas: boolean
  readonly hayEscena: boolean
  readonly canvas: (NodoDescrito & { readonly ancho: number; readonly alto: number }) | null
  readonly escena: NodoDescrito | null
  readonly cadenaDelCanvas: readonly NodoDescrito[]
  readonly bloques: readonly CadenaDeBloque[]
}

interface PanelLeido {
  readonly id: string
  readonly superficie: string
  readonly alto: number
  readonly top: number
}

/** Un bloque, resumido para la tabla: quién corta y con qué. */
interface FilaDeBloque {
  readonly ancho: string
  readonly seccion: string
  readonly pose: string
  readonly scrollY: number
  readonly n: number
  readonly texto: string
  readonly etiqueta: string
  readonly llega: boolean
  readonly propiedad: string
  readonly valor: string
  readonly nodo: string
  readonly datosDelNodo: Readonly<Record<string, string>>
  readonly saltos: number
}

function nombreDelNodo(n: NodoDescrito): string {
  const clases = n.clases.split(/\s+/).filter((c) => c.length > 0).slice(0, 4).join('.')
  const datos = Object.entries(n.datos).map(([k, v]) => `[${k}="${v}"]`).join('')
  return `${n.etiqueta}${n.id === null ? '' : `#${n.id}`}${clases === '' ? '' : `.${clases}`}${datos}`
}

async function principal(): Promise<void> {
  const pedido = argumento('ancho', 'todos')
  const ventanas = pedido === 'todos' ? VENTANAS : VENTANAS.filter((v) => v.id === pedido)
  if (ventanas.length === 0) throw new Error(`--ancho=${pedido} no es ninguno de ${VENTANAS.map((v) => v.id).join(', ')}`)

  const porVentana: Record<string, unknown> = {}
  const filas: FilaDeBloque[] = []

  for (const perfil of ventanas) {
    console.log(`\n══════ ${perfil.ancho}×${perfil.alto} (${perfil.nombre}) ══════`)
    // eslint-disable-next-line no-await-in-loop
    const lectura = await conLaPagina(perfil, '/v3', async (s) => {
      const { pagina } = s
      await asentarElHome(s)
      const lienzo = await hayCanvas(pagina)
      const doc = await medir<{ altoDelDocumento: number; ventana: number; ancho: number }>(pagina, LECTOR_DEL_DOCUMENTO)
      const paneles = await medir<PanelLeido[]>(pagina, LECTOR_DE_PANELES)
      if (paneles.length === 0) throw new Error('no hay paneles: la página no es el home')
      const secciones = {
        arriba: Math.min(...paneles.map((p) => p.top)),
        abajo: Math.max(...paneles.map((p) => p.top + p.alto)),
      }
      console.log(
        `  canvas ${lienzo.hay ? `${lienzo.ancho}×${lienzo.alto}` : 'NO HAY'} · documento ${doc.altoDelDocumento} px · ${paneles.length} paneles · secciones [${Math.round(secciones.arriba)}, ${Math.round(secciones.abajo)}]`,
      )

      /**
       * Las poses de cada sección: su ARRANQUE (donde el texto entra en cuadro)
       * y los keyframes de la coreografía que caen adentro de su tramo. Un
       * ancestro que corta en cualquiera de las dos corta, así que se publican
       * las dos y el veredicto es la unión.
       */
      const poses: { readonly seccion: string; readonly pose: string; readonly y: number }[] = []
      for (const p of paneles) {
        const tope = Math.max(0, Math.min(doc.altoDelDocumento - doc.ventana, p.top))
        poses.push({ seccion: p.id, pose: 'arranque', y: Math.round(tope) })
        for (const k of KEYFRAMES) {
          const y = scrollDelProgreso(k.at, secciones, doc.ventana)
          if (y >= p.top && y < p.top + p.alto) poses.push({ seccion: p.id, pose: `kf ${k.nombre} (${cuatro(k.at)})`, y })
        }
      }

      const lecturas: { readonly seccion: string; readonly pose: string; readonly scrollY: number; readonly lectura: LecturaDeLaCadena }[] = []
      for (const pose of poses) {
        // eslint-disable-next-line no-await-in-loop
        const logrado = await scrollA(pagina, pose.y)
        // eslint-disable-next-line no-await-in-loop
        await esperarElPrimerCuadro(pagina)
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, ASENTAMIENTO_DE_BLOQUES_MS))
        // Las marcas de la pose anterior, fuera: si no, un bloque de otra
        // sección que todavía asoma se le atribuye a ésta (ver `BORRAR_LAS_MARCAS`).
        // eslint-disable-next-line no-await-in-loop
        const limpias = await medir<MarcasBorradas>(pagina, BORRAR_LAS_MARCAS)
        if (limpias.quedan !== 0) throw new Error(`quedaron ${limpias.quedan} marcas sin borrar: la atribución por sección no sería confiable`)
        // eslint-disable-next-line no-await-in-loop
        const bloques = await medir<Bloque[]>(pagina, LECTOR_DE_BLOQUES(pose.seccion))
        // eslint-disable-next-line no-await-in-loop
        const cadena = await medir<LecturaDeLaCadena>(pagina, LECTOR_DE_LA_CADENA)
        const enCuadro = cadena.bloques.filter((b) => b.enCuadro)
        const cortados = enCuadro.filter((b) => !b.llegaAlCanvas)
        console.log(
          `  ${pose.seccion.padEnd(16)} ${pose.pose.padEnd(24)} y=${String(logrado).padStart(6)} · ${bloques.length} bloques leídos, ${enCuadro.length} en cuadro · CORTAN ${cortados.length}/${enCuadro.length}`,
        )
        for (const b of enCuadro) {
          filas.push({
            ancho: perfil.id,
            seccion: pose.seccion,
            pose: pose.pose,
            scrollY: logrado,
            n: b.n,
            texto: b.texto,
            etiqueta: b.bloque.etiqueta,
            llega: b.llegaAlCanvas,
            propiedad: b.grupo === null ? '(ninguna: llega a la raíz)' : b.grupo.razones.map((r) => r.propiedad).join(' + '),
            valor: b.grupo === null ? '' : b.grupo.razones.map((r) => r.valor).join(' + ').slice(0, 120),
            nodo: b.grupo === null ? '(raíz)' : nombreDelNodo(b.grupo),
            datosDelNodo: b.grupo === null ? {} : b.grupo.datos,
            saltos: b.grupo === null ? b.largoDeLaCadena : b.cadena.findIndex((c) => c.razones.length > 0) + 1,
          })
        }
        lecturas.push({ seccion: pose.seccion, pose: pose.pose, scrollY: logrado, lectura: cadena })
      }
      return { canvas: lienzo, documento: doc, paneles, secciones, lecturas }
    })
    porVentana[perfil.id] = lectura
  }

  // ── El veredicto por sección y ancho: un bloque que corta en CUALQUIER pose, corta ──
  console.log('\n══ VEREDICTO — sección · corta la cadena SÍ/NO · qué propiedad · en qué nodo ══')
  console.log('  ancho sección          bloques  lect. cortan  corta  propiedad @ nodo')
  const veredictos: unknown[] = []
  for (const perfil of ventanas) {
    const delAncho = filas.filter((f) => f.ancho === perfil.id)
    for (const sec of [...new Set(delAncho.map((f) => f.seccion))]) {
      const propias = delAncho.filter((f) => f.seccion === sec)
      const cortan = propias.filter((f) => !f.llega)
      const bloquesDistintos = new Set(propias.map((f) => f.n)).size
      const cortantes = [...new Set(cortan.map((f) => `${f.propiedad} @ ${f.nodo}`))]
      const etiqueta = cortan.length === propias.length ? 'SÍ (todas)' : cortan.length > 0 ? 'SÍ (parcial)' : 'NO'
      veredictos.push({
        ancho: perfil.id,
        seccion: sec,
        bloquesEnCuadro: bloquesDistintos,
        lecturas: propias.length,
        lecturasQueCortan: cortan.length,
        cortaLaCadena: cortan.length > 0,
        todasCortan: cortan.length === propias.length,
        cortantes,
      })
      console.log(
        `  ${perfil.id.padEnd(5)} ${sec.padEnd(16)} ${String(bloquesDistintos).padStart(7)}  ${String(cortan.length).padStart(5)}/${String(propias.length).padEnd(4)} ${etiqueta.padEnd(12)} ${(cortantes[0] ?? '—').slice(0, 80)}`,
      )
      for (const c of cortantes.slice(1, 8)) console.log(`  ${''.padEnd(5)} ${''.padEnd(16)} ${''.padEnd(7)}  ${''.padEnd(10)} ${''.padEnd(12)} ${c.slice(0, 80)}`)
    }
  }

  const ruta = guardarJson('a-cadena', { cuando: new Date().toISOString(), anchos: ventanas.map((v) => v.id), veredictos, filas, porVentana })
  console.log(`\n  ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
