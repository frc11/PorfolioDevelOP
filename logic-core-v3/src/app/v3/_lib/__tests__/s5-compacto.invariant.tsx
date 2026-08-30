/**
 * INVARIANTE TRANSVERSAL — las cuatro rinden ABAJO DE 1025, sin coreografía, y
 * el foco se ve en todo lo interactivo.
 *
 * Corre con `npm run test:s5-compacto`.
 *
 * ── Por qué se puede comprobar sin navegador, y por qué eso importa acá ───
 *
 * `useAnchoMinimo` es `useSyncExternalStore` con snapshot de servidor en
 * `false`: en un render de servidor **la rama que sale es exactamente la de
 * abajo del umbral**. O sea que el HTML que produce `renderToStaticMarkup` ES
 * la pantalla de mobile, sin simular nada.
 *
 * Y hay una razón de método para no mirarlo en un navegador: en este repo está
 * pagada la lección de que **con la pestaña oculta toda medición de layout da
 * cero** —`window.innerWidth` devuelve 0 y el navegador saltea los rendering
 * steps—, así que una verificación automatizada de ancho que no garantice la
 * pestaña visible no vale. Ésta no depende de eso.
 *
 * ── Las dos mitades, y ninguna sirve sola ─────────────────────────────────
 *
 *   · abajo de 1025 **no hay una sola transformada** y el contenido está
 *     COMPLETO — todas las cadenas del contenido llegan al marcado;
 *   · arriba, la coreografía SÍ cambia el árbol. Sin esta segunda mitad, la
 *     primera pasaría en verde con un sistema que no anima nunca.
 */

import { MotionConfig } from 'motion/react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ProveedorDeCoreografia, type ModoDeCoreografia } from '../../secciones-a/_contrato/coreografia'
import { textosDe } from '../../secciones-a/_contrato/marcadores'
import { REGISTRO } from '../../secciones-a/_contrato/registro'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

function marcar(indice: number, modo: ModoDeCoreografia): string {
  const { Componente, seccion } = REGISTRO[indice]
  return renderToStaticMarkup(
    <MotionConfig reducedMotion="never">
      <ProveedorDeCoreografia modo={modo}>
        <Componente seccion={seccion} />
      </ProveedorDeCoreografia>
    </MotionConfig>,
  )
}

/** React escapa el texto al serializar; la búsqueda tiene que escapar igual o
 *  daría falsos negativos en cualquier frase con comillas o ampersand. */
function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

const VACIAS = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'path', 'circle'])

/**
 * Los elementos focalizables que quedan adentro de una caja recortada.
 *
 * No es una precaución teórica: el anillo del sistema tiene desplazamiento
 * POSITIVO (`--foco-desplazamiento`, 2px), y un anillo dibujado por fuera de un
 * elemento cuyo ancestro tiene `overflow: hidden` **desaparece sin dejar
 * rastro**. Es la misma comprobación que S3 hace pieza por pieza sobre el
 * chrome, acá sobre las cuatro secciones enteras.
 */
export function focalizablesRecortados(html: string): string[] {
  const etiqueta = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g
  const pila: { nombre: string; recorta: boolean }[] = []
  const hallados: string[] = []
  let m: RegExpExecArray | null

  while ((m = etiqueta.exec(html)) !== null) {
    const [entero, cierre, nombre, atributos, autocierre] = m
    const esCierre = cierre === '/'
    const esVacia = autocierre === '/' || VACIAS.has(nombre.toLowerCase())

    if (esCierre) {
      for (let i = pila.length - 1; i >= 0; i--) {
        if (pila[i].nombre === nombre) {
          pila.length = i
          break
        }
      }
      continue
    }

    const focalizable =
      (nombre === 'a' && /\shref\s*=/.test(atributos)) ||
      nombre === 'button' ||
      /\stabindex\s*=\s*["']0["']/.test(atributos)

    if (focalizable && pila.some((p) => p.recorta)) hallados.push(entero.slice(0, 80))

    if (!esVacia) {
      pila.push({
        nombre,
        recorta: /overflow-hidden|overflow:\s*hidden/.test(atributos),
      })
    }
  }
  return hallados
}

/** Los focalizables nativos que hay en un marcado. */
function focalizablesDe(html: string): string[] {
  return [...html.matchAll(/<(a\s[^>]*href=|button[\s>])/g)].map((m) => m[0])
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Abajo de 1025 no se escribe una sola transformada')

for (let i = 0; i < REGISTRO.length; i++) {
  const { id } = REGISTRO[i]
  const quieto = marcar(i, 'nunca')
  afirmar(!quieto.includes('transform:'), `\`${id}\` — ninguna transformada en la rama quieta`)
  afirmar(!quieto.includes('will-change'), `  ni una capa de composición promovida`)
  afirmar(quieto.length > 0, `  y el marcado no está vacío`, `${quieto.length} caracteres`)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · CONTROL POSITIVO — arriba del umbral la coreografía SÍ cambia el árbol')

/**
 * Se compara el árbol y no "hay una transformada": en un render de servidor los
 * efectos no corren, así que P1 sale en su fase de MEDICIÓN —palabras sueltas
 * en flujo plano, todavía sin transformada— y exigirle una daría un falso rojo
 * sobre código correcto. Lo que sí cambia siempre es la forma del árbol.
 */
let seccionesQueCambian = 0
for (let i = 0; i < REGISTRO.length; i++) {
  const { id } = REGISTRO[i]
  const quieto = marcar(i, 'nunca')
  const coreografiado = marcar(i, 'siempre')
  const cambia = quieto !== coreografiado
  afirmar(cambia, `\`${id}\` — con la compuerta abierta el árbol es OTRO`)
  if (cambia) seccionesQueCambian += 1
}
afirmarIgual(seccionesQueCambian, 4, 'las cuatro cambian: ninguna está quieta en los dos lados')

/** Y al menos una escribe transformada de verdad en el primer cuadro: P2, P4 y
 *  P7 sí lo hacen. Sin esto, "el árbol cambia" podría ser sólo el envoltorio. */
const conTransformada = REGISTRO.map((m, i) => ({ id: m.id, html: marcar(i, 'siempre') })).filter((r) =>
  r.html.includes('transform:'),
)
afirmar(
  conTransformada.length > 0,
  `${conTransformada.length} sección(es) escriben transformada en el primer cuadro`,
  conTransformada.map((r) => r.id).join(' · '),
)

controlPositivo(
  'el comparador de árboles vería dos marcados iguales',
  marcar(0, 'nunca'),
  (html: string) => html !== marcar(0, 'nunca'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Abajo de 1025 el contenido está COMPLETO')

/**
 * Todas las cadenas del contenido tienen que llegar al marcado de la rama
 * quieta. Es la mitad que impide que "sin coreografía" signifique "sin la
 * mitad del texto": un bloque que sólo se renderiza cuando hay progreso es
 * exactamente el defecto que esto caza.
 *
 * Se exceptúan las cadenas que no son texto de pantalla —rutas, ids y anclas—
 * declarando el criterio: una cadena que empieza con `#`, `/` o `.` es una
 * referencia y puede aparecer en un atributo con otra forma.
 */
const esReferencia = (t: string): boolean => /^[#/.]/.test(t)

for (let i = 0; i < REGISTRO.length; i++) {
  const { id, contenido } = REGISTRO[i]
  const html = marcar(i, 'nunca')
  const textos = textosDe(contenido).filter((h) => !esReferencia(h.valor))
  const ausentes = textos.filter((h) => !html.includes(escapar(h.valor)))
  afirmarIgual(
    ausentes.map((h) => `${h.ruta}: ${h.valor.slice(0, 40)}`),
    [],
    `\`${id}\` — las ${textos.length} cadenas de contenido llegan al marcado sin coreografía`,
  )
  afirmar(textos.length > 0, `  y hay ${textos.length} cadenas que revisar`, 'no es verde por vacío')
}

controlPositivo(
  'el comparador ve una cadena que no llegó al marcado',
  { html: '<p>hola</p>', textos: ['hola', 'falta'] },
  (caso: { html: string; textos: string[] }) =>
    caso.textos.filter((t) => !caso.html.includes(escapar(t))).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El foco: nativo, y nunca adentro de una caja recortada')

let focalizablesTotales = 0
for (let i = 0; i < REGISTRO.length; i++) {
  const { id } = REGISTRO[i]
  for (const modo of ['nunca', 'siempre'] as const) {
    const html = marcar(i, modo)
    const recortados = focalizablesRecortados(html)
    afirmarIgual(
      recortados,
      [],
      `\`${id}\` (${modo}) — ningún focalizable adentro de una caja con overflow oculto`,
    )
    if (modo === 'nunca') focalizablesTotales += focalizablesDe(html).length
  }
}
console.log(`  focalizables en las cuatro secciones, rama quieta: ${focalizablesTotales}`)
afirmar(
  focalizablesTotales > 0,
  'y hay focalizables que revisar: la comprobación no es verde por vacío',
  `${focalizablesTotales}`,
)

controlPositivo(
  'el detector ve un <a href> adentro de un overflow-hidden',
  '<div class="overflow-hidden"><span><a href="#x">y</a></span></div>',
  (html: string) => focalizablesRecortados(html).length === 0,
)
controlPositivo(
  'y no marca uno que está FUERA de la caja recortada',
  '<div class="overflow-hidden"><span>x</span></div><a href="#x">y</a>',
  (html: string) => focalizablesRecortados(html).length > 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Ningún nivel tipográfico pierde su clase de tamaño')

/**
 * ⚠ ESTE CHEQUEO EXISTE POR UN DEFECTO HEREDADO QUE YA SE COBRÓ UNA PIEZA.
 *
 * `tailwind-merge` no distingue un `text-<tamaño>` de un `text-<color>` —se
 * escriben igual— y sin una lista que se lo diga los mete en el MISMO grupo y
 * **descarta el primero, en silencio**. Esa lista existe para los tokens del
 * sistema viejo (`DS_FONT_SIZE_CLASSES`) y **no para los de /v3**:
 *
 *     cn('text-fluido-micro', 'text-tinta-media')  →  'text-tinta-media'
 *
 * Verificado en runtime, y **no era teórico**: los cinco rótulos de Números
 * salían sin una sola clase de tamaño —a tamaño heredado en vez de a los 10 px
 * de `micro`— justo en la sección cuyo punto entero es la asimetría de escala.
 * Se rodeó localmente porque `src/lib/utils.ts` está fuera de este lane.
 *
 * El chequeo va sobre el MARCADO RENDERIZADO y no sobre la fuente: ahí el
 * defecto es invisible —el componente pide su tamaño, el llamador su color, y
 * los dos parecen correctos— y sólo se ve en la salida. `Titular` y los cinco
 * textos escriben `data-nivel`, así que el detector agarra por ahí.
 */
export function nivelesSinTamano(html: string): string[] {
  const sinTamano: string[] = []
  for (const m of html.matchAll(/<[a-zA-Z][^>]*\sdata-nivel="([a-z0-9-]+)"[^>]*>/g)) {
    const [etiqueta, nivel] = m
    const clases = /class="([^"]*)"/.exec(etiqueta)?.[1] ?? ''
    const tieneTamano = new RegExp(`\\btext-(?:fluido-)?${nivel}\\b`).test(clases)
    if (!tieneTamano) sinTamano.push(`${nivel}: ${clases}`)
  }
  return sinTamano
}

let nivelesMirados = 0
for (let i = 0; i < REGISTRO.length; i++) {
  const { id } = REGISTRO[i]
  for (const modo of ['nunca', 'siempre'] as const) {
    const html = marcar(i, modo)
    afirmarIgual(
      nivelesSinTamano(html),
      [],
      `\`${id}\` (${modo}) — todo nivel declarado conserva su clase de tamaño`,
    )
    if (modo === 'nunca') nivelesMirados += (html.match(/data-nivel="/g) ?? []).length
  }
}
afirmar(
  nivelesMirados > 0,
  `el detector miró ${nivelesMirados} elementos con nivel declarado`,
  'no es verde por vacío',
)

controlPositivo(
  'el detector ve un nivel al que tailwind-merge le comió el tamaño',
  '<p data-nivel="micro" class="font-cuerpo leading-micro text-tinta-media">x</p>',
  (html: string) => nivelesSinTamano(html).length === 0,
)
controlPositivo(
  'y acepta tanto la fija como la fluida',
  '<p data-nivel="micro" class="text-micro">a</p><p data-nivel="micro" class="text-fluido-micro">b</p>',
  (html: string) => nivelesSinTamano(html).length > 0,
)

cerrar('s5-compacto.invariant')
