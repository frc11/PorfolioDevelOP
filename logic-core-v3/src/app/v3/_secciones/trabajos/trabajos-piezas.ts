/**
 * PIEZAS DEL INVARIANTE DE TRABAJOS — la parte que no entró en 300 líneas.
 *
 * Son detectores puros, y viven aparte por la misma razón que `s3-escaneo.ts`:
 * el control positivo tiene que poder correr **la misma función** contra una
 * entrada deliberadamente rota. Un detector que se prueba a sí mismo con otra
 * copia del código no prueba nada.
 *
 * ⚠ Este archivo es INSTRUMENTO, no pantalla: está declarado en
 * `ARCHIVOS_DE_APOYO` del padrón y queda fuera del escaneo de tokens y de
 * cifras, porque sus entradas equivocadas llevan a propósito lo que esos
 * escáneres persiguen.
 */

/** Los elementos que no cierran, para que la pila de ancestros no se desbalancee. */
const VACIOS = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source'])

/** La cadena de ancestros abiertos sobre la primera aparición de una aguja. */
export function ancestrosDe(html: string, aguja: string): string[] {
  const corte = html.indexOf(aguja)
  if (corte < 0) return []
  const pila: string[] = []
  for (const m of html.slice(0, corte).matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g)) {
    if (m[1] === '/') pila.pop()
    else if (!m[3].trimEnd().endsWith('/') && !VACIOS.has(m[2].toLowerCase())) pila.push(m[0])
  }
  return pila
}

const OCULTA = /\bhidden\b|\bopacity-0\b|\bsr-only\b|visibility:\s*hidden|display:\s*none/
/** La métrica se ve: existe en el marcado Y ningún ancestro suyo la esconde.
 *  `aria-hidden` se saca antes de mirar: contiene la palabra y no oculta nada. */
export function metricaVisible(html: string): boolean {
  const cadena = ancestrosDe(html, '[MÉTRICA]')
  return cadena.length > 0 && cadena.every((t) => !OCULTA.test(t.replace(/aria-hidden="[^"]*"/g, '')))
}

/**
 * LAS MEDIDAS REALES DE UN ARCHIVO WEBP, leídas de sus bytes (V3-D).
 *
 * ── Por qué hace falta ────────────────────────────────────────────────────
 *
 * Porque el defecto que este lector previene ya pasó: `GEOMETRIA` declaraba
 * `1600 × 800` y los archivos que llegaron miden `1920 × 1080`. Con la relación
 * declarada distinta de la del archivo, el navegador reserva una caja, carga la
 * imagen, descubre otra y **la caja crece** — el salto de layout que declarar
 * las dimensiones existe para evitar, producido por la declaración misma.
 *
 * Ninguna comprobación sobre el marcado lo ve: el marcado dice lo que la
 * constante dice. La única forma de atraparlo es abrir el archivo, y por eso se
 * abre.
 *
 * ── El formato, en tres cabeceras ─────────────────────────────────────────
 *
 * `RIFF....WEBP` y después un chunk que dice cuál de las tres variantes es.
 * Se leen las tres porque `sharp` elige la que le conviene según la imagen:
 * `VP8L` para el diseño plano de Esquina —sin pérdida pesa menos— y `VP8 ` para
 * las dos fotos. Un lector que sólo entendiera una daría un rojo falso el día
 * que alguien recomprima una captura.
 */
export interface MedidasDeImagen {
  readonly ancho: number
  readonly alto: number
}

export function medidasDeWebp(bytes: Uint8Array): MedidasDeImagen {
  const texto = (desde: number, largo: number): string =>
    String.fromCharCode(...bytes.subarray(desde, desde + largo))
  if (texto(0, 4) !== 'RIFF' || texto(8, 4) !== 'WEBP') {
    throw new Error('no es un WEBP: falta la firma RIFF/WEBP')
  }
  const leU16 = (i: number): number => bytes[i] | (bytes[i + 1] << 8)
  const chunk = texto(12, 4)
  if (chunk === 'VP8X') {
    const leU24 = (i: number): number => bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16)
    return { ancho: leU24(24) + 1, alto: leU24(27) + 1 }
  }
  if (chunk === 'VP8 ') {
    // Cabecera del cuadro clave: 3 bytes de tag, la firma 0x9D012A, y los dos
    // tamaños en 14 bits — los 2 de arriba son la escala, que no se usa.
    return { ancho: leU16(26) & 0x3fff, alto: leU16(28) & 0x3fff }
  }
  if (chunk === 'VP8L') {
    // 1 byte de firma (0x2F) y después 14 bits de ancho−1 y 14 de alto−1,
    // empaquetados en little-endian sobre los cuatro bytes siguientes.
    const bits = bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24)
    return { ancho: (bits & 0x3fff) + 1, alto: ((bits >>> 14) & 0x3fff) + 1 }
  }
  throw new Error(`chunk de WEBP no reconocido: ${JSON.stringify(chunk)}`)
}

/**
 * LOS DETECTORES DE LAS CAPTURAS Y LOS ENLACES (V3-D).
 *
 * Viven acá por la razón que declara el padrón: el invariante no entra en 300
 * líneas y lo que sale son las funciones. Los cuatro devuelven **la lista de lo
 * que está mal** y no un booleano, porque "hay un enlace inventado" no dice
 * cuál — y porque una lista vacía se afirma con `afirmarIgual` y se lee sola.
 */

/** Los proyectos cuyo `alt` no llega al marcado, o cuya captura no llega
 *  codificada como la escribe `next/image`. Devuelve el nombre, no un índice. */
export function capturasQueNoLlegan(
  html: string,
  proyectos: readonly { nombre: string; captura: { fuente: string } }[],
): string[] {
  return proyectos.filter((p) => !html.includes(encodeURIComponent(p.captura.fuente))).map((p) => p.nombre)
}

/** Los `href` del marcado que NO salen de la lista de enlaces del contenido.
 *  Es la comprobación que reemplaza al viejo «cero enlaces». */
export function enlacesFueraDelContenido(html: string, declarados: readonly string[]): string[] {
  return [...html.matchAll(/<a [^>]*href="([^"]*)"/g)]
    .map((m) => m[1])
    .filter((href) => !declarados.includes(href))
}

/** Los nombres que NO son un `h3` con su enlace adentro. El enlace en el medio
 *  es la forma que de verdad sale desde que las tarjetas llevan al sitio. */
export function nombresQueNoSonEncabezado(html: string, nombres: readonly string[]): string[] {
  return nombres.filter((n) => !new RegExp(`<h3[^>]*>\s*<a [^>]*>${n}</a>\s*</h3>`).test(html))
}

/** Los enlaces cuyo nombre accesible NO es exactamente el nombre del cliente.
 *  Si la métrica se metiera adentro del `<a>`, un lector la anunciaría con él. */
export function enlacesConNombreSucio(
  html: string,
  proyectos: readonly { nombre: string; enlace: string }[],
): string[] {
  return proyectos
    .filter((p) => !new RegExp(`href="${p.enlace}"[^>]*>${p.nombre}</a>`).test(html))
    .map((p) => p.nombre)
}

/**
 * LAS MEDIDAS DE LAS CAPTURAS, contra la relación declarada (V3-D).
 *
 * Abre los archivos de `public/` y devuelve los que NO miden lo que
 * `GEOMETRIA` declara. Es la comprobación que faltaba y que habría evitado el
 * defecto: `1600 × 800` declarado sobre archivos de `1920 × 1080` reserva una
 * caja 2:1, carga 16:9 y la caja crece — el salto de layout producido por la
 * declaración misma. Ningún chequeo sobre el marcado lo ve: el marcado dice lo
 * que dice la constante.
 *
 * `leer` entra por parámetro para que el control positivo pueda darle un
 * archivo de otra relación sin tocar el disco.
 */
export function capturasConOtraRelacion(
  proyectos: readonly { nombre: string; captura: { fuente: string } }[],
  declarada: MedidasDeImagen,
  leer: (rutaWeb: string) => Uint8Array,
): string[] {
  return proyectos
    .filter((p) => {
      const m = medidasDeWebp(leer(p.captura.fuente))
      return m.ancho !== declarada.ancho || m.alto !== declarada.alto
    })
    .map((p) => p.nombre)
}

/** Los tres colores que §10 necesita del tema, derivados del CSS de una sola
 *  pasada. Tira si el archivo cambió de forma: un color que no se pudo leer no
 *  puede convertirse en un verde silencioso. */
export interface ColoresDelTema {
  readonly fondo: string
  readonly tinta: string
  readonly acentos: readonly string[]
}

export function coloresDelTema(css: string): ColoresDelTema {
  const bloque = /(\[data-seccion="invertida"\][\s\S]*?\n\})/.exec(css)
  if (bloque === null) throw new Error('no se pudo leer el bloque invertido del CSS')
  const hex = (fuente: string, patron: RegExp): string => {
    const m = patron.exec(fuente)
    if (m === null) throw new Error(`no se pudo leer del CSS: ${patron.source}`)
    return m[1]
  }
  return {
    fondo: hex(bloque[1], /--color-fondo:\s*(#[0-9A-Fa-f]{6})/),
    tinta: hex(bloque[1], /--color-tinta:\s*(#[0-9A-Fa-f]{6})/),
    acentos: [...css.matchAll(/--color-acento-[a-z-]+:\s*(#[0-9A-Fa-f]{6})/g)].map((m) => m[1]),
  }
}
