/**
 * LOS DETECTORES DE LA SECCIÓN — funciones puras sobre marcado, separadas del
 * instrumento que las corre.
 *
 * Viven acá por la misma razón que `_lib/__tests__/s3-escaneo.ts` y que
 * `_invariantes/soporte.ts`: **un detector se prueba corriendo la MISMA función
 * contra una entrada rota**, y para eso la función tiene que estar afuera del
 * archivo que la usa. Un detector que se prueba a sí mismo con otra copia del
 * código no prueba nada.
 *
 * No hay ni un dato de prueba acá: las entradas rotas —la frase con cifras
 * inventadas, el hex, el párrafo con las palabras pegadas— viven en el
 * invariante, que es el archivo declarado como no escaneado.
 */

import { NIVELES_TIPOGRAFICOS, type Nivel } from '../../_lib/tipografia'
import { valoresDeAcentoDelTema } from '../_invariantes/soporte'
import { CAPA_APAGADA, CAPA_VIGENTE, CLASE_DE_CAPA_APAGADA } from './geometria'

/** Cuántas veces casa una expresión en un texto. */
export function cuenta(texto: string, aguja: RegExp): number {
  return (texto.match(aguja) ?? []).length
}

/**
 * El texto SIN insertar separadores donde había etiquetas. `textoVisible` pone
 * un espacio por etiqueta: correcto para escanear contenido, INSERVIBLE para
 * cazar el rótulo pegado, porque con él `<span>Pomelo</span><span>Explore</span>`
 * se lee separado aunque en pantalla no lo esté. Acá la etiqueta se borra sin
 * dejar nada y el espacio se colapsa igual que lo colapsa el navegador.
 */
export function textoPegado(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

const ETIQUETAS_VACIAS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr',
])

/**
 * El interior del primer elemento con `atributo="valor"`, contando profundidad:
 * una expresión regular perezosa cortaría en el primer `</div>`, que acá es el
 * del contenedor de piezas y no el del canal.
 */
export function interiorDe(html: string, atributo: string, valor: string): string {
  const pos = html.indexOf(`${atributo}="${valor}"`)
  if (pos < 0) return ''
  const abre = html.indexOf('>', pos)
  if (abre < 0) return ''
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g
  re.lastIndex = abre + 1
  let profundidad = 1
  let m = re.exec(html)
  while (m !== null) {
    if (m[1] === '/') {
      profundidad -= 1
      if (profundidad === 0) return html.slice(abre + 1, m.index)
    } else if (!ETIQUETAS_VACIAS.has(m[2].toLowerCase()) && !m[3].trimEnd().endsWith('/')) {
      profundidad += 1
    }
    m = re.exec(html)
  }
  return ''
}

/**
 * Los elementos que entran en el orden de tabulación. Las mismas tres
 * exclusiones que S3: un `<a>` sin `href`, un control `disabled` y un
 * `tabindex="-1"`, que es enfocable por código pero no por Tab.
 */
export function focalizablesDe(html: string): string[] {
  const hallados: string[] = []
  for (const m of html.matchAll(/<(a|button|input|select|textarea|summary)\b([^>]*)>/gi)) {
    if (/\sdisabled(?:[=\s>]|$)/i.test(m[2])) continue
    if (m[1].toLowerCase() === 'a' && !/\shref=/.test(m[2])) continue
    hallados.push(`<${m[1].toLowerCase()}`)
  }
  for (const m of html.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*\btabindex="(?!-1)[^"]*"[^>]*>/gi)) {
    hallados.push(`<${m[1].toLowerCase()} tabindex`)
  }
  return hallados
}

/**
 * Los acentos CONCRETOS —el token por servicio y su valor— leídos del tema y no
 * escritos. Una lista a mano quedaría vieja y el detector pasaría en verde
 * sobre un color que ya no es ése; y además metería los hex en el repositorio,
 * que es justo lo que la regla prohíbe.
 */
export function acentosConcretos(texto: string): string[] {
  return valoresDeAcentoDelTema().flatMap(({ token, valor }) =>
    [token, valor].filter((aguja) => texto.includes(aguja)),
  )
}

/**
 * LOS TAMAÑOS QUE `cn()` SE COMIÓ.
 *
 * `cn` es `twMerge` sobre `clsx`, y **no conoce los nombres del sistema v3**:
 * mete `text-<tamaño>` y `text-<color>` en el mismo grupo, y `font-<familia>` y
 * `font-<peso>` en otro. Pasarle un color por `className` a `<Titular>`,
 * `<Caption>` o `<Micro>` le borra el TAMAÑO; pasarle una familia le borra la
 * familia y el peso. Sin error de build, sin error de tipos, sin nada en
 * consola: el elemento queda del tamaño que herede.
 *
 * Se puede afirmar sobre el marcado porque los componentes de tipografía
 * publican su nivel en `data-nivel` —y `<Titular>` además su régimen en
 * `data-fluido`—, así que se le puede exigir a cada elemento la clase que
 * `NIVELES_TIPOGRAFICOS` declara para su nivel. Es la MISMA tabla que consume
 * el componente: no hay una segunda copia que se pueda desviar.
 */
export function tamanosPerdidos(html: string): string[] {
  const perdidos: string[] = []
  for (const m of html.matchAll(/<[a-z][a-z0-9]*\b[^>]*\bdata-nivel="([a-z-]+)"[^>]*>/gi)) {
    const etiqueta = m[0]
    const definicion = NIVELES_TIPOGRAFICOS[m[1] as Nivel]
    if (definicion === undefined) continue
    // Sin `data-fluido="no"` el elemento está en su régimen fluido, que es el
    // defecto de los cinco componentes de texto y de `<Titular>`.
    const fluido = !etiqueta.includes('data-fluido="no"')
    const esperada = fluido ? (definicion.claseFluida ?? definicion.claseFija) : definicion.claseFija
    const clases = (/\sclass="([^"]*)"/.exec(etiqueta)?.[1] ?? '').split(/\s+/)
    if (!clases.includes(esperada)) perdidos.push(`${m[1]}: falta ${esperada}`)
  }
  return perdidos
}

/** Cuántos elementos tipográficos del sistema hay en un marcado. Es el
 *  contrapeso de `tamanosPerdidos`: cero perdidos sobre cero elementos no dice
 *  nada. */
export function elementosTipograficos(html: string): number {
  return cuenta(html, /\bdata-nivel="/g)
}

/**
 * LAS FAMILIAS QUE `cn()` SE COMIÓ, partidas por GRAVEDAD.
 *
 * ── La tercera variante de la trampa, que no estaba medida ────────────────
 *
 * Las dos conocidas entran por `className`: un color se come el tamaño, una
 * familia se come la familia y el peso. Hay una tercera y **no necesita
 * `className` ninguno**: `twMerge` no conoce `font-medio`, `font-semi` ni
 * `font-fuerte` —sus pesos conocidos son `font-medium`, `font-semibold`…— así
 * que los clasifica como FAMILIA y pisan a `font-cuerpo`/`font-titulo`. O sea:
 * **cualquier `<Caption peso="medio">` pierde su familia, sin que nadie le pase
 * una sola clase.**
 *
 * ── Por qué se parte en dos y no se afirma todo junto ─────────────────────
 *
 * Porque el daño no es el mismo y el instrumento no puede mentir sobre eso. El
 * `layout.tsx` de /v3 pone `font-cuerpo` en el elemento raíz:
 *
 *   · perder `font-cuerpo` → se hereda `font-cuerpo` de la raíz. **Invisible.**
 *     Se PUBLICA, con las clases que quedaron, y no se afirma en cero: los que
 *     quedan son de piezas compartidas que este lane no toca.
 *   · perder `font-titulo` → el encabezado cae a la familia de cuerpo.
 *     **Se ve.** Eso sí se afirma en cero.
 */
function familiaPerdidaEn(html: string, deTitulo: boolean): string[] {
  const perdidas: string[] = []
  for (const m of html.matchAll(/<[a-z][a-z0-9]*\b[^>]*\bdata-nivel="([a-z-]+)"[^>]*>/gi)) {
    const esTitulo = m[1].startsWith('titulo-')
    if (esTitulo !== deTitulo) continue
    const clases = (/\sclass="([^"]*)"/.exec(m[0])?.[1] ?? '').split(/\s+/)
    const esperada = deTitulo ? 'font-titulo' : 'font-cuerpo'
    // El hallazgo lleva las clases que SÍ quedaron: sin ellas no se puede saber
    // quién se comió a quién, que es lo único accionable.
    if (!clases.includes(esperada)) perdidas.push(`${m[1]} sin ${esperada} → "${clases.join(' ')}"`)
  }
  return perdidas
}

/** La grave: un titular que perdió `font-titulo` se ve en la familia de cuerpo. */
export function familiasDeTituloPerdidas(html: string): string[] {
  return familiaPerdidaEn(html, true)
}

/** La invisible: se publica, no se afirma en cero. Ver el bloque de arriba. */
export function familiasDeCuerpoPerdidas(html: string): string[] {
  return familiaPerdidaEn(html, false)
}


// ── LAS CAPAS DE SERVICIO: quién está en el árbol y quién está pintado ──────

/**
 * UNA CAPA DE SERVICIO — una caja `[data-servicio]` con la forma que declara.
 *
 * Existe por el arreglo del defecto 1 de SITIO-S10, mitad de arriba. Hasta S10
 * la rama pinneada montaba UN servicio, así que la voz única —un acento por
 * contexto, nunca los tres— se podía afirmar contando el atributo. Con los TRES
 * en el árbol esa cuenta ya no dice nada, y lo que hay que afirmar es lo que la
 * regla siempre quiso decir: **de las capas que existen, hay exactamente UNA
 * pintada.** El porqué de las dos formas está entero en `geometria.ts`; acá
 * está sólo cómo se leen: se cruza lo que la capa DICE ser (`data-capa`) con lo
 * que su clase HACE (`sr-only`, o su ausencia). Una sola de las dos fuentes
 * podría mentir sin que nadie lo note; las dos juntas, no.
 */
export interface CapaDeServicio {
  readonly id: string
  readonly clases: readonly string[]
  /** Dice `vigente` y no lleva la clase que esconde: es la que se ve. */
  readonly vigente: boolean
  /** Dice `apagada` y lleva la clase: está en el árbol y no se pinta. */
  readonly apagada: boolean
}

/**
 * La etiqueta de apertura de una capa, entera. Se lee el TAG y no una pareja de
 * atributos pegados: el orden en el que React los emite es el del JSX, y atarse
 * a él dejaba al instrumento ciego ante un reordenamiento inofensivo.
 */
const ETIQUETA_DE_CAPA = /<[a-z][a-z0-9]*\b[^>]*\bdata-servicio="([^"]*)"[^>]*>/gi

/** Las capas de servicio de un marcado, en orden del documento. */
export function capasDeServicio(html: string): CapaDeServicio[] {
  return [...html.matchAll(ETIQUETA_DE_CAPA)].map((m) => {
    const clases = (/\bclass="([^"]*)"/.exec(m[0])?.[1] ?? '').split(/\s+/)
    const dice = /\bdata-capa="([^"]*)"/.exec(m[0])?.[1] ?? ''
    const esconde = clases.includes(CLASE_DE_CAPA_APAGADA)
    return {
      id: m[1],
      clases,
      vigente: dice === CAPA_VIGENTE && !esconde,
      apagada: dice === CAPA_APAGADA && esconde,
    }
  })
}

/** Los servicios que se PINTAN. En la rama pinneada tiene que ser exactamente uno. */
export function serviciosVigentes(html: string): string[] {
  return capasDeServicio(html).filter((c) => c.vigente).map((c) => c.id)
}

/** Los servicios que están en el árbol y NO se pintan. */
export function serviciosApagados(html: string): string[] {
  return capasDeServicio(html).filter((c) => c.apagada).map((c) => c.id)
}

/**
 * Las capas que no declaran NINGUNA de las dos formas, o declaran las DOS. Es el
 * contrapeso de las dos de arriba: sin esto, una capa a la que alguien le borre
 * las clases se caería de las dos listas y las dos seguirían pareciendo
 * correctas. Vacío o hay defecto.
 */
export function capasSinDeclararSuForma(html: string): string[] {
  return capasDeServicio(html)
    .filter((c) => c.vigente === c.apagada)
    .map((c) => `${c.id}: "${c.clases.join(' ')}"`)
}

/**
 * Las capas que no piden al menos una pantalla de alto. Se mide sobre las TRES
 * CAJAS y no sobre todo el marcado: contar `min-h-svh` en el documento ataría
 * esta sección a las clases de su envoltorio, que no son suyas.
 */
export function capasSinPantalla(html: string): string[] {
  return capasDeServicio(html).filter((c) => !c.clases.includes('min-h-svh')).map((c) => c.id)
}

/**
 * LAS CAPAS QUE SE CAERÍAN DEL ÁRBOL DE ACCESIBILIDAD.
 *
 * ⚠️ **Es el detector del defecto que el arreglo existe para no reintroducir.**
 * Apagar una capa con cualquiera de estas cinco formas la saca del árbol, y
 * volveríamos exactamente a los 24 encabezados y los 33 marcadores que
 * `s10-acceso` midió. El único apagado admitido es `opacity`, que apaga la
 * pintura y deja el nodo entero para un lector de pantalla.
 *
 * Mira la etiqueta de apertura de la capa, que es donde vivirían las cinco. Lo
 * que un `<style>` externo le haga no se ve desde el marcado: límite declarado.
 */
const FORMAS_QUE_SACAN_DEL_ARBOL: readonly { readonly aguja: RegExp; readonly que: string }[] = [
  { aguja: /\baria-hidden="true"/, que: 'aria-hidden="true"' },
  { aguja: /\shidden(?:[=\s>]|$)/, que: 'el atributo `hidden`' },
  { aguja: /\binert(?:[=\s>]|$)/, que: 'el atributo `inert`' },
  { aguja: /(^|\s)(?:invisible|hidden)(\s|")/, que: 'una clase que apaga la caja entera' },
  { aguja: /(?:display|content-visibility)\s*:\s*(?:none|hidden)/, que: 'un estilo que la esconde' },
]

export function capasFueraDelArbol(html: string): string[] {
  const salida: string[] = []
  for (const m of html.matchAll(ETIQUETA_DE_CAPA)) {
    for (const forma of FORMAS_QUE_SACAN_DEL_ARBOL) {
      if (forma.aguja.test(m[0])) salida.push(`${m[1]}: ${forma.que}`)
    }
  }
  return salida
}
