/**
 * s87 · [B11] LAS CAJAS DEL CHROME Y DEL CHAT, por ancho y con los tokens — el modelo sin navegador de «el chat no pisa el chrome».
 *
 * Cada caja sale de un token del tema (`theme-develop.css`, por `s10-css`) o de un número escrito en la fuente de quien la pinta, y
 * `s87-chat` afirma que esas fuentes siguen diciendo lo que el modelo supone (si el chrome se muda, el modelo falla en vez de mentir).
 * Las cajas que dependen del texto (la pastilla, Contacto y Login, el cartel del sonido, el globo del chat) van por su COTA del lado
 * seguro: más grandes de lo que se pintan, así que «no se pisan» en el modelo implica que tampoco en pantalla. Lo que mide el navegador,
 * con las cajas de verdad, es `scripts-carga/chrome-en-los-anchos.ts`.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { RAIZ } from '../../_lib/__tests__/s3-archivos'
import { BREAKPOINTS, tokenPx } from '../../_lib/__tests__/s10-css'

export const leer = (r: string): string => readFileSync(path.join(RAIZ, r), 'utf8').replace(/\r\n/g, '\n')

export interface Caja {
  readonly pieza: string
  readonly x0: number
  readonly x1: number
  readonly y0: number
  readonly y1: number
}

export interface Cuadro {
  readonly ancho: number
  readonly alto: number
}

/** Los anchos del pedido, con el alto de su aparato; y los mismos anchos al alto del banco (800). */
export const CUADROS: readonly Cuadro[] = [
  { ancho: 360, alto: 800 },
  { ancho: 390, alto: 844 },
  { ancho: 768, alto: 1024 },
  { ancho: 1024, alto: 768 },
  { ancho: 1440, alto: 900 },
  { ancho: 1920, alto: 1080 },
  ...[390, 768, 1024, 1440, 1920].map((ancho) => ({ ancho, alto: 800 })),
  // Un teléfono chico: el globo del chat es lo más alto que hay abajo.
  { ancho: 360, alto: 640 },
]

const px = (token: string): number => tokenPx(token, 1440)

/** Los números del chat, leídos de su fuente (el widget del sitio vivo y su globo). */
export interface MedidasDelChat {
  readonly margen: number
  readonly lado: number
  readonly aireDelGlobo: number
  readonly globoMaxPx: number
  readonly globoMaxVw: number
}

export function medidasDelChat(companion: string, globo: string): MedidasDelChat {
  const derecha = /right: 'max\((\d+)px, env\(safe-area-inset-right\)\)'/.exec(companion)
  const abajo = /bottom: 'max\((\d+)px, env\(safe-area-inset-bottom\)\)'/.exec(companion)
  const lado = /getAvatarRenderSize\(config\.avatarStyle, (\d+)\)/.exec(companion)
  const aire = /absolute bottom-full mb-(\d+)/.exec(globo)
  const ancho = /maxWidth: 'min\((\d+)px, (\d+)vw\)'/.exec(globo)
  if (derecha === null || abajo === null || lado === null || aire === null || ancho === null) throw new Error('el chat ya no dice dónde va')
  if (derecha[1] !== abajo[1]) throw new Error('el chat ya no va al mismo margen de los dos bordes')
  // `mb-N` de Tailwind: N × 0,25 rem.
  return { margen: Number(derecha[1]), lado: Number(lado[1]), aireDelGlobo: Number(aire[1]) * 0.25 * 16, globoMaxPx: Number(ancho[1]), globoMaxVw: Number(ancho[2]) }
}

/**
 * El alto del globo, por su cota: seis renglones de `text-xs` (12 px) con `leading-relaxed` (1,625), su relleno (`py-3`, 12 px) y el
 * borde. Los mensajes del bot son cortos (una pregunta); con 142 px de renglón, seis renglones son ~120 caracteres.
 */
export const ALTO_DEL_GLOBO = 6 * 12 * 1.625 + 2 * 12 + 2

export function cajasDelChat(c: Cuadro, m: MedidasDelChat): Caja[] {
  const boton: Caja = { pieza: 'chat', x0: c.ancho - m.margen - m.lado, x1: c.ancho - m.margen, y0: c.alto - m.margen - m.lado, y1: c.alto - m.margen }
  const anchoDelGlobo = Math.min(m.globoMaxPx, (m.globoMaxVw / 100) * c.ancho)
  const globo: Caja = { pieza: 'globo del chat', x0: boton.x1 - anchoDelGlobo, x1: boton.x1, y0: boton.y0 - m.aireDelGlobo - ALTO_DEL_GLOBO, y1: boton.y0 - m.aireDelGlobo }
  return [boton, globo]
}

/** El aire mínimo entre la pastilla centrada y la esquina, de `BarraDelHome.tsx` (sin él, la barra no se muestra: el menú del teléfono). */
export function aireDeLaEsquina(barra: string): number {
  const m = /const AIRE_DE_LA_ESQUINA = (\d+)/.exec(barra)
  if (m === null) throw new Error('la barra ya no declara su aire con la esquina')
  return Number(m[1])
}

/**
 * Lo más angosta que puede ser la esquina de Contacto y Login, SIN su texto: su relleno, el hueco, el relleno del botón de Login y
 * los dos bordes (`barra.css`). Es un piso: con el texto es más ancha, y la pastilla, más lejos del chat.
 */
export const ESQUINA_MINIMA = px('--spacing-2') + px('--spacing-1') + px('--spacing-2') + 2 * px('--spacing-3') + 2 * px('--border-hairline')

/**
 * Las cajas del chrome a un cuadro. La barra (la pastilla y la esquina) existe desde `medio` y sólo si entra; si no, el menú del
 * teléfono. Desde `medio` el modelo pone LAS DOS (las dos ramas, juntas: del lado seguro).
 *
 * La pastilla, por la regla con la que la barra decide mostrarse (`BarraDelHome`, `modoDelChrome`): centrada, y su borde derecho a no
 * menos de `pad-lateral-compacto + esquina + aire` del borde de la ventana. Arriba (pegada, o en una página) y al pie de la primera
 * pantalla (el home al cargar). El desplegable de Servicios no entra: se abre con el puntero y vive sobre la pastilla.
 */
export function cajasDelChrome(c: Cuadro, aire: number): Caja[] {
  const escritorio = c.ancho >= BREAKPOINTS.escritorio
  const conBarra = c.ancho >= BREAKPOINTS.medio
  const cajas: Caja[] = []
  // El parlante (`EsquinaDelSonido` + `ControlDelSonido`): arriba a la izquierda; desde 1024, del alto de la barra y en su fila.
  const parlante = escritorio ? px('--spacing-3') * 2 + px('--text-cuerpo') * px('--leading-texto') : px('--spacing-12')
  const px0 = escritorio ? px('--pad-lateral-compacto') : px('--spacing-4')
  const py0 = escritorio ? px('--spacing-6') : px('--spacing-4')
  cajas.push({ pieza: 'parlante', x0: px0, x1: px0 + parlante, y0: py0, y1: py0 + parlante })
  // Su cartel, debajo (cota: 240 × 64, dos renglones de `micro` con su relleno).
  const cy0 = py0 + parlante + px('--spacing-2')
  cajas.push({ pieza: 'cartel del sonido', x0: px0, x1: px0 + 240, y0: cy0, y1: cy0 + 64 })
  // El botón del menú del teléfono: arriba, al centro (en todo ancho: también arriba de `medio`, si la barra no entra).
  const menu = px('--spacing-12')
  cajas.push({ pieza: 'botón del menú', x0: (c.ancho - menu) / 2, x1: (c.ancho + menu) / 2, y0: px('--spacing-4'), y1: px('--spacing-4') + menu })
  if (conBarra) {
    const alto = px('--spacing-3') * 2 + px('--text-cuerpo') * px('--leading-texto')
    const reposo = px('--spacing-6')
    const margenAlPie = px('--spacing-6')
    const pad = px('--pad-lateral-compacto')
    const derecha = c.ancho - pad - ESQUINA_MINIMA - aire
    const izquierda = c.ancho - derecha
    cajas.push({ pieza: 'píldora (arriba)', x0: izquierda, x1: derecha, y0: reposo, y1: reposo + alto })
    cajas.push({ pieza: 'píldora (al pie)', x0: izquierda, x1: derecha, y0: c.alto - margenAlPie - alto, y1: c.alto - margenAlPie })
    // Contacto y Login: arriba a la derecha (cota: hasta el medio de la ventana).
    cajas.push({ pieza: 'contacto y login', x0: c.ancho / 2, x1: c.ancho - pad, y0: reposo, y1: reposo + alto })
  }
  return cajas
}

/** Dos cajas se pisan si se cruzan en los dos ejes (tocarse no es pisarse). */
export const sePisan = (a: Caja, b: Caja): boolean => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1

/** Lo que el chat pisa en un cuadro (y si se sale de la ventana). Vacío: no pisa nada. */
export function loQuePisa(c: Cuadro, chat: readonly Caja[], chrome: readonly Caja[]): string[] {
  const malas: string[] = []
  for (const a of chat) {
    if (a.x0 < 0 || a.x1 > c.ancho || a.y0 < 0 || a.y1 > c.alto) malas.push(`${a.pieza} se sale de ${String(c.ancho)}×${String(c.alto)}`)
    for (const b of chrome) if (sePisan(a, b)) malas.push(`${a.pieza} pisa ${b.pieza} a ${String(c.ancho)}×${String(c.alto)}`)
  }
  return malas
}
