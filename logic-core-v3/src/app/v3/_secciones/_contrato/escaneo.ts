/**
 * EL CONTENIDO INVENTADO TIENE QUE PARECER INVENTADO — el vocabulario y el
 * escáner que lo hace cumplir.
 *
 * ── Por qué es una regla dura y no una preferencia ────────────────────────
 *
 * develOP tiene deuda registrada por esto: sus cuatro landings llevan cifras y
 * testimonios fabricados. Este lane no la duplica. La forma de no duplicarla no
 * es "acordarse": es que el relleno lleve una MARCA que nadie pueda confundir
 * con un dato, y que haya un instrumento que rechace lo que se pueda leer como
 * un hecho.
 *
 * ── Qué va y qué no ───────────────────────────────────────────────────────
 *
 *   va                                        no va
 *   ──────────────────────────────────────    ─────────────────────────────
 *   [MÉTRICA] · [CIFRA] · [TESTIMONIO]        +340% · desde $99.000
 *   [CAPTURA DEL PANEL] · [VIDEO]             una imagen de banco
 *   Esquina · El Garage · Banú                clientes inventados
 *   relleno con la longitud correcta          copy que suene a definitivo
 *
 * **Los precios no están cerrados y no se inventan ni de ejemplo.**
 *
 * ── Por qué el escáner mira el TEXTO RENDERIZADO ──────────────────────────
 *
 * Porque es lo que la persona lee. Un escáner sobre los módulos de contenido
 * ve las cadenas que están en un módulo de contenido, y se le escapa cualquier
 * texto escrito adentro de un JSX. Renderizando la sección y leyendo su texto,
 * el origen deja de importar.
 *
 * Las funciones de este archivo son PURAS y viven acá, separadas del
 * invariante, para que el control positivo pueda correr **la misma función**
 * contra una entrada fabricada a propósito. Un detector que se prueba con otra
 * copia del código no prueba nada.
 */

import { SECCIONES } from '../../_lib/secciones'
import { MARCADORES, type Marcador } from './marcadores'

/**
 * Los nombres que SÍ son reales. Son clientes de develOP y por eso se pueden
 * escribir: no son testimonios inventados, son nombres propios verificables.
 *
 * ⚠️ **CORREGIDO EN V3-D, Y ES LA DEUDA QUE ESTE ARCHIVO EXISTE PARA IMPEDIR.**
 *
 * Hasta acá la lista decía **Matsu Automotores**, y ese trabajo NO SE HIZO: el
 * home publicaba como cliente a alguien que no lo es. Entró por una instrucción
 * de sprint, se propagó a cuatro secciones y a cinco instrumentos, y **ninguno
 * de los tres detectores lo vio** — un nombre propio no lleva dígitos, no lleva
 * símbolo y no es un precio. El escáner cuida las cifras; los HECHOS no los
 * cuidaba nadie.
 *
 * El tercer cliente real es **Banú**, y su sitio existe. La lista es ahora la
 * verdadera, y es la única fuente: quien escriba un nombre de cliente en una
 * sección tiene que poder encontrarlo acá.
 */
export const NOMBRES_REALES = ['Esquina', 'El Garage', 'Banú'] as const

/** Un hallazgo del escáner: el fragmento y por qué se rechaza. */
export interface Hallazgo {
  readonly fragmento: string
  readonly razon: string
}

/**
 * UNA ENTRADA DE LA LISTA BLANCA. Cada una lleva su motivo escrito: una lista
 * blanca sin motivos se vuelve el lugar donde se esconde lo que molesta.
 */
export interface Excepcion {
  readonly valor: string
  readonly motivo: string
}

/**
 * Los únicos números que el contenido visible puede llevar.
 *
 * Ninguno es un dato sobre develOP: son estructura de la página o constantes
 * del sistema con instrumento propio.
 *
 * ⚠ **Los números de sección se DERIVAN de la tabla del recorrido** (SITIO-S7).
 * Estaban escritos a mano y eran los cuatro de un lane: `05` a `08`. Al correr
 * el escáner sobre las OCHO —que es lo que este sprint hace— las cuatro
 * primeras secciones aparecieron como cifras sin declarar, y tenían razón: `01`
 * es un número en el contenido visible. Escribir los ocho a mano habría sido la
 * misma clase de lista que se desincroniza sola. Se derivan.
 */
export const NUMEROS_PERMITIDOS: readonly Excepcion[] = [
  ...SECCIONES.map((s) => ({
    valor: s.numero,
    motivo: `número de sección — ${s.nombre}. Estructura del recorrido, no un dato.`,
  })),
  {
    valor: '1025',
    motivo:
      'el umbral de la compuerta, en el aviso de que la coreografía no baja acá. ' +
      'Sale de ESCENARIO_MIN_ANCHO_PX, que un invariante ata a --breakpoint-escritorio.',
  },
]

/**
 * La definición operativa de "una cifra que se puede leer como un hecho": un
 * dígito pegado a `%`, `+`, `×` o `$`, en cualquiera de los dos órdenes.
 *
 * Es la que pide la instrucción (§0.4) y es deliberadamente sintáctica: no
 * intenta entender la frase, intenta que `+340%` y `desde $99.000` no puedan
 * entrar sin que algo se ponga en rojo.
 */
const RE_CIFRA_CON_SIMBOLO =
  /(?:[%+×$]\s*\d[\d.,]*)|(?:\d[\d.,]*\s*[%+×$])|(?:\b[xX]\s*\d[\d.,]*)|(?:\d[\d.,]*\s*[xX]\b)/g

export function cifrasSospechosas(texto: string): Hallazgo[] {
  return [...texto.matchAll(RE_CIFRA_CON_SIMBOLO)].map((m) => ({
    fragmento: m[0],
    razon: 'dígito pegado a % + × o $ — se lee como un dato y no lo es',
  }))
}

/**
 * Los precios, por separado y sin lista blanca posible: **no están cerrados**.
 * Se busca el símbolo, la moneda escrita y las dos formas de decirlo en
 * castellano rioplatense.
 */
const RE_PRECIO =
  /(?:\$|\bUSD\b|\bAR\$|\bARS\b|\bpesos\b|\bd[óo]lares\b|\bdesde\s+\d|\bpor\s+mes\b|\/mes\b|\bpresupuesto\s+de\s+\d)/gi

export function preciosEncontrados(texto: string): Hallazgo[] {
  return [...texto.matchAll(RE_PRECIO)].map((m) => ({
    fragmento: m[0],
    razon: 'forma de precio — los precios no están cerrados y no se inventan ni de ejemplo',
  }))
}

/**
 * Cualquier grupo de dígitos que no esté declarado.
 *
 * Es más ancho que la regla de §0.4 a propósito: "ningún número que se pueda
 * leer como un hecho puede ser inventado" no se agota en los cuatro símbolos.
 * Un `340` suelto en una frase sigue siendo una cifra. La salida es la lista de
 * los que no están en `NUMEROS_PERMITIDOS`.
 */
export function numerosSinDeclarar(
  texto: string,
  permitidos: readonly Excepcion[] = NUMEROS_PERMITIDOS,
): Hallazgo[] {
  const blancos = new Set(permitidos.map((e) => e.valor))
  return [...texto.matchAll(/\d[\d.,]*/g)]
    .map((m) => m[0])
    .filter((n) => !blancos.has(n))
    .map((n) => ({
      fragmento: n,
      razon: 'número en el contenido que no está en la lista blanca declarada',
    }))
}

/** Los tres detectores juntos. Es lo que corre el invariante sobre cada sección. */
export function escanearContenido(
  texto: string,
  permitidos: readonly Excepcion[] = NUMEROS_PERMITIDOS,
): Hallazgo[] {
  return [
    ...cifrasSospechosas(texto),
    ...preciosEncontrados(texto),
    ...numerosSinDeclarar(texto, permitidos),
  ]
}

/**
 * ⚠️ LA ENTRADA DEL CONTROL POSITIVO **NO VIVE ACÁ**, y es a propósito.
 *
 * La frase que hace saltar a los tres detectores contiene, por definición,
 * exactamente lo que este lane no puede escribir: dígitos pegados a `%` y a `$`.
 * Escribirla en un archivo de producto haría fallar al escáner de tokens contra
 * su propio arnés — el mismo problema que S3 declaró cuando sacó los
 * instrumentos del padrón de archivos escaneados.
 *
 * Vive en `_invariantes/soporte.ts`, que es código de instrumento y está
 * declarado como no escaneado. Se llama `CONTENIDO_PROHIBIDO_DE_CONTROL`.
 */

/**
 * El texto visible de un fragmento de HTML.
 *
 * Saca etiquetas, resuelve las cinco entidades que `react-dom/server` emite y
 * normaliza el espacio. No pretende ser un parser: pretende no dejar pasar
 * texto que la persona sí ve.
 */
export function textoVisible(html: string): string {
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number.parseInt(d, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, d: string) => String.fromCodePoint(Number.parseInt(d, 16)))
    .replace(/\s+/g, ' ')
    .trim()
}

/** Cuántos marcadores distintos aparecen en un texto. Es el contrapeso: sin
 *  esto, "cero hallazgos" sería compatible con "cero contenido". */
export function marcadoresEn(texto: string): readonly Marcador[] {
  return MARCADORES.filter((m) => texto.includes(m))
}
