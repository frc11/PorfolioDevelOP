/**
 * [SERVICIOS S1b] LOS DETECTORES DE `pagina.invariant.tsx` — funciones puras sobre el marcado (un string).
 *
 * Viven aparte para que el invariante se lea de arriba abajo y para que cada detector pueda recibir una entrada armada a
 * propósito: el control positivo de cada comprobación corre ESTE MISMO detector contra un marcado equivocado.
 *
 * ⚠ Ninguna clase arbitraria de Tailwind se escribe entera en este archivo (el escaneo de Tailwind 4 lee hasta los
 * comentarios): los controles la arman por partes.
 */

import type { Servicio } from '../tipos'

/** Los ids que el home busca por nombre (el viaje y el final del pie actúan sobre ellos): prohibidos en las páginas de servicio. */
export const IDS_RESERVADOS: readonly string[] = [
  'hero',
  'quienes-somos',
  'numeros',
  'trabajos',
  'servicios',
  'tu-panel',
  'por-que-develop',
  'cierre',
  'contacto',
]
/** Desde B1.1b, los deep links del Portfolio también: `portfolio-el-garage`, `portfolio-la-tuya`… */
export const PREFIJO_RESERVADO = 'portfolio-'
/** Atributos que la escena o el registro del home leen: nunca en estas páginas. */
export const ATRIBUTOS_RESERVADOS: readonly string[] = ['data-panel', 'data-seccion-id', 'data-signo-de-la-tuya']

/** Las entidades que React escribe, decodificadas. */
function decodificar(texto: string): string {
  return texto
    .replace(/&#x([0-9a-fA-F]+);/g, (_t, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_t, dec: string) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

/** El texto que se lee: sin etiquetas, sin atributos y sin lo que no se ve (`script`, `style`). Sin dejar hueco, como un lector. */
export function textoVisible(html: string): string {
  return decodificar(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '').replace(/<[^>]*>/g, ''))
}

/** Las etiquetas de APERTURA de un elemento, tal cual salieron (`<h1 id="…" class="…">`), en orden de documento. */
export function aperturas(html: string, etiqueta: string): string[] {
  return [...html.matchAll(new RegExp(`<${etiqueta}(?=[\\s>/])[^>]*>`, 'g'))].map((m) => m[0])
}

/** Los valores de un atributo, en todo el marcado. El espacio de antes evita confundir `id` con `data-id`. */
export function valoresDe(html: string, atributo: string): string[] {
  return [...html.matchAll(new RegExp(`\\s${atributo}="([^"]*)"`, 'g'))].map((m) => decodificar(m[1] ?? ''))
}

/**
 * [S3b] El marcado entero del `div` que lleva el atributo (la intro: `data-intro-de-servicio`), con sus `div` balanceados, o `null`
 * si no está. El marcado de `renderToStaticMarkup` está bien formado: alcanza con contar aperturas y cierres de `div`.
 */
export function elementoConAtributo(html: string, atributo: string): string | null {
  const inicio = html.search(new RegExp(`<div(?=\\s)[^>]*\\s${atributo}(?=[=\\s>])`))
  if (inicio < 0) return null
  const etiquetas = /<(\/?)div(?=[\s>])/g
  etiquetas.lastIndex = inicio
  let profundidad = 0
  for (let etiqueta = etiquetas.exec(html); etiqueta !== null; etiqueta = etiquetas.exec(html)) {
    profundidad += etiqueta[1] === '/' ? -1 : 1
    if (profundidad === 0) return html.slice(inicio, etiqueta.index + '</div>'.length)
  }
  return null
}

/** La etiqueta de apertura de un marcado (`<div data-…="…" class="…">`), o `''`. */
export function aperturaDe(marcado: string | null): string {
  return /^<[^>]+>/.exec(marcado ?? '')?.[0] ?? ''
}

/** [S3b] Los nombres de las custom properties que declara el bloque `@theme static` del tema (sin los comentarios, que citan otras). */
export function tokensDelTema(css: string): Set<string> {
  const sinComentariosDeCss = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const inicio = sinComentariosDeCss.indexOf('@theme static {')
  if (inicio < 0) return new Set()
  const bloque = sinComentariosDeCss.slice(inicio, sinComentariosDeCss.indexOf('}', inicio))
  return new Set([...bloque.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1] ?? ''))
}

/**
 * [S3b] Qué token es el acento de cada servicio SEGÚN EL TEMA: sus reglas de contexto (`[data-servicio="web"]` con
 * `--color-acento: var(--color-acento-web)`, y las otras dos). Es la fuente con la que se compara la página, ajena a su código.
 */
export function acentosDelTemaPorServicio(css: string): Map<string, string> {
  const sinComentariosDeCss = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const reglas = sinComentariosDeCss.matchAll(/\[data-servicio="([^"]+)"\]\s*\{\s*--color-acento:\s*var\((--[a-z0-9-]+)\);\s*\}/g)
  return new Map([...reglas].map((m) => [m[1] ?? '', m[2] ?? '']))
}

/** El contenido de un elemento por su `data-bloque` (la sección o el pie entero), o `null` si no está montado. */
export function bloqueDe(html: string, nombre: string): string | null {
  const inicio = html.search(new RegExp(`<(section|footer)[^>]*data-bloque="${nombre}"`))
  if (inicio < 0) return null
  const etiqueta = /^<(section|footer)/.exec(html.slice(inicio))?.[1] ?? 'section'
  const fin = html.indexOf(`</${etiqueta}>`, inicio)
  return fin < 0 ? null : html.slice(inicio, fin + etiqueta.length + 3)
}

/** Los `data-bloque` en orden de documento. */
export function bloquesEnOrden(html: string): string[] {
  return valoresDe(html, 'data-bloque')
}

/** ¿La secuencia respeta el orden de referencia (cada nombre después del anterior, sin repetirse)? Puede faltar alguno. */
export function respetaElOrden(secuencia: readonly string[], referencia: readonly string[]): boolean {
  const posiciones = secuencia.map((nombre) => referencia.indexOf(nombre))
  return posiciones.every((p, i) => p >= 0 && (i === 0 || p > (posiciones[i - 1] ?? -1)))
}

/** Los niveles de encabezado en orden de documento. */
export function nivelesDeEncabezado(html: string): number[] {
  return [...html.matchAll(/<h([1-6])(?=[\s>])/g)].map((m) => Number(m[1]))
}

/** ¿Hay un salto de nivel (de h1 a h3), o el primero no es h1? */
export function saltaNiveles(niveles: readonly number[]): boolean {
  return niveles.some((nivel, i) => (i === 0 ? nivel !== 1 : nivel > (niveles[i - 1] ?? 0) + 1))
}

/** Todo hex del marcado, en orden. Las entidades no cuentan. [S3b] Sin excepción: quién puede tener uno lo dice el invariante. */
export function hexSueltos(html: string): string[] {
  return html.replace(/&#x?[0-9a-fA-F]+;/g, '').match(/#[0-9a-fA-F]{3,8}(?![0-9a-zA-Z])/g) ?? []
}

/**
 * Lo reservado que aparece en el marcado, descrito. `[]` = limpio. `data-seccion` solo vale una vez, `invertida`, y [S3b] en la
 * apertura de la intro (el elemento con `atributoDeLaIntro`): ya no en la raíz.
 */
export function reservadosEnElMarcado(html: string, atributoDeLaIntro: string): string[] {
  const hallados: string[] = []
  for (const id of valoresDe(html, 'id')) {
    if (IDS_RESERVADOS.includes(id) || id.startsWith(PREFIJO_RESERVADO)) hallados.push(`id="${id}"`)
  }
  for (const atributo of ATRIBUTOS_RESERVADOS) {
    if (html.includes(` ${atributo}=`) || html.includes(` ${atributo} `)) hallados.push(atributo)
  }
  const secciones = valoresDe(html, 'data-seccion')
  for (const valor of secciones) if (valor !== 'invertida') hallados.push(`data-seccion="${valor}"`)
  if (secciones.length > 1) hallados.push('data-seccion repetido')
  const enLaIntro = aperturaDe(elementoConAtributo(html, atributoDeLaIntro)).includes(' data-seccion="invertida"')
  if (secciones.length === 1 && !enLaIntro) hallados.push('data-seccion fuera de la intro')
  return hallados
}

/** Los números del texto visible, sin separadores de miles y sin ceros a la izquierda («1.000» → «1000», «01» → «1»). */
export function numerosDelTexto(html: string): string[] {
  const texto = decodificar(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]*>/g, ' '))
  return (texto.match(/\d[\d.,]*/g) ?? []).map((n) => String(Number(n.replace(/[.,]/g, ''))))
}

/** Los números que los datos del servicio autorizan: los de sus textos y cifras, y los números de lugar de sus pasos. */
export function numerosPermitidos(servicio: Servicio): Set<string> {
  const deLosDatos = (JSON.stringify(servicio).match(/\d+/g) ?? []).map((n) => String(Number(n)))
  const deLosPasos = servicio.proceso.pasos.map((_paso, indice) => String(indice + 1))
  return new Set([...deLosDatos, ...deLosPasos])
}

/** Los números del texto que ningún dato respalda. `[]` = ninguna cifra inventada. */
export function numerosInventados(html: string, servicio: Servicio): string[] {
  const permitidos = numerosPermitidos(servicio)
  return numerosDelTexto(html).filter((n) => !permitidos.has(n))
}

/** Las clases de tramo en columnas o fila SIN prefijo de ancho: lo que NO apila por debajo de 1024. `[]` = todo apila. */
export function clasesQueNoApilan(html: string): string[] {
  const clases = valoresDe(html, 'class').flatMap((valor) => valor.split(/\s+/))
  return clases.filter((clase) => /^(grid-cols-([2-9]|1\d)|flex-row(-reverse)?|col-span-\d+|col-start-\d+|row-span-\d+)$/.test(clase))
}

/** Las clases arbitrarias (con corchetes) que no leen un token con `var()`. `[]` = todas leen un token. */
export function arbitrariasSinToken(html: string): string[] {
  const clases = valoresDe(html, 'class').flatMap((valor) => valor.split(/\s+/))
  return clases.filter((clase) => clase.includes('[') && !clase.includes('var('))
}

/** Los enlaces internos (empiezan con `/`) del marcado. */
export function enlacesInternos(html: string): string[] {
  return valoresDe(html, 'href').filter((href) => href.startsWith('/'))
}

/** Las clases de cada elemento que pinta un fondo OPACO del tema (`bg-fondo`, `bg-superficie-N`). `[]` = ninguno. */
export function fondosOpacos(html: string): string[] {
  return valoresDe(html, 'class').filter((clases) => clases.split(/\s+/).some((c) => c === 'bg-fondo' || /^bg-superficie-\d$/.test(c)))
}

/** [S3b] Cuántos `backdrop-filter` hay en el marcado (con prefijo o sin él): un vidrio es eso. Con el cuerpo en papel, ninguno. */
export function vidrios(html: string): number {
  return (html.match(/backdrop-filter/g) ?? []).length
}

/** Los textos que `PROYECTOS` guarda y servicios NUNCA lee: los valores no nulos de esos campos, para buscarlos en el marcado. */
export interface ProyectoConLoProhibido {
  readonly resena: { readonly texto: string; readonly autor: string } | null
  readonly problemaResuelto: string | null
  readonly problemaCliente: string | null
  readonly queHicimos: string | null
  readonly resultado: string | null
}
export function valoresProhibidos(proyectos: readonly ProyectoConLoProhibido[]): string[] {
  return proyectos
    .flatMap((p) => [p.resena?.texto, p.resena?.autor, p.problemaResuelto, p.problemaCliente, p.queHicimos, p.resultado])
    .filter((valor): valor is string => typeof valor === 'string' && valor.length > 0)
}

/** Los marcadores de la llave del contenido inventado: no son «[a definir]»; si salen, la página leyó lo que no debía. */
export const MARCADORES_DE_LA_LLAVE: readonly string[] = ['[TEXTO]', '[TESTIMONIO]', '[NOMBRE]']

/** Saca los comentarios de un fuente (los de bloque y los de línea) para buscar nombres en el CÓDIGO y no en lo que lo explica. */
export function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}
