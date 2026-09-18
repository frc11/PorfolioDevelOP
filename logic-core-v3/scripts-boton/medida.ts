/**
 * EL PROTOCOLO — los mismos ocho pasos sobre cualquiera de los tres botones.
 *
 * `a-referencia.ts` y `b-nuestro.ts` no tienen lógica de medición propia: le
 * pasan a `medirElBoton` un origen, una ruta y cómo encontrar el CTA. Todo lo
 * demás —el orden de los estados, cuánto se espera, cómo se mueve el puntero,
 * cuándo se saca cada foto— sale de acá. Es la única forma de que la columna
 * «qué hace nk» y la columna «qué hacemos nosotros» de la tabla del PASO 5 se
 * puedan restar.
 *
 * ── Los ocho pasos ────────────────────────────────────────────────────────
 *
 *   1. encontrar el CTA y asomarlo al centro del viewport
 *   2. verificar que el punto que se va a tocar LO TOCA (`elementFromPoint`)
 *   3. foto de REPOSO — el subárbol entero, con las declaradas
 *   4. dos ciclos de entrar/salir muestreados por cuadro
 *   5. foto de DESPUÉS DE SALIR, sin mover nada — la respuesta del PASO 1
 *   6. hover, el censo de animaciones vivas, y foto de HOVER PLENO
 *   7. la tira de cuadros congelada, si el gesto es de la API de animaciones
 *   8. las cuatro capturas de estado
 *
 * ── ⚠️ Por qué el paso 5 va ANTES del 6 ───────────────────────────────────
 *
 * Porque «después de salir» sólo significa algo si lo que hubo antes fue un
 * hover COMPLETO y una salida completa, y eso es exactamente lo que deja el
 * paso 4. Sacar esa foto después del paso 6 la ensuciaría con el hover del
 * censo. El orden no es una preferencia: es la pregunta.
 *
 * ── ⚠️ El recorte es UNO SOLO por botón, y se calcula recién en el paso 7 ──
 *
 * La ventana del CTA CRECE en el hover, así que un recorte derivado de la caja
 * de cada instante daría 22 imágenes de tamaños distintos: una tira de cuadros
 * en la que cada cuadro está encuadrado distinto no deja ver qué se movió. El
 * recorte se calcula una vez, como la UNIÓN de la caja de reposo y la de hover
 * pleno —las dos ya medidas cuando llega el paso 7— y todas las fotos del botón
 * salen con él.
 */

import { mkdirSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'

import {
  ESPERA_MS,
  animaciones,
  caja,
  capturarRecorte,
  centroDe,
  ciclo,
  dos,
  esperar,
  foto,
  golpea,
  moverPorCamino,
  preparar,
  puntoDeReposo,
  recorteDe,
  type AnimacionViva,
  type CapturaHecha,
  type Punto,
  type Recorte,
  type Sesion,
} from './boton-comun'
import type { Grabacion, NodoEstatico, Preparacion } from './pagina-de-boton'

/**
 * Los instantes de la tira de cuadros, en ms desde el arranque del gesto.
 *
 * Denso al principio y ralo al final a propósito: el intercambio con
 * `ease.salida` gasta la mitad de su recorrido en el primer cuarto del tiempo,
 * así que un paso uniforme dejaría ocho cuadros idénticos al final y ninguno
 * donde el gesto de verdad se mueve. El último, 2.200, está más allá de todo lo
 * conocido (1.300 del intercambio, 400 + 600 del subrayado) y existe para que
 * un tramo que nadie midió todavía tenga dónde aparecer.
 */
export const INSTANTES_DE_LA_TIRA: readonly number[] = [
  0, 80, 160, 240, 320, 400, 480, 560, 650, 750, 850, 1000, 1150, 1300, 1450, 1650, 1900, 2200,
]

/**
 * «A mitad del hover» es la mitad del INTERCAMBIO, que es el gesto principal y
 * el más largo: 1.300 ms medidos en `COMPONENTS.md` §3.2 para la referencia, y
 * los mismos 1.300 derivados en `cta.css` para el nuestro. 650 ms es esa mitad,
 * y es el mismo número de los dos lados **a propósito**: si cada botón se
 * fotografiara en la mitad de su propio gesto, las dos capturas mostrarían
 * instantes distintos y no se podrían comparar.
 */
export const MITAD_DEL_HOVER_MS = 650

/**
 * EL INSTANTE DEL HUECO MÁS ANCHO, derivado y no elegido.
 *
 * El hueco del subrayado es la curva `ease.principal` evaluada con el desfase
 * de diferencia, así que su ancho es máximo donde esa curva es más empinada:
 * a los **384 ms** llega al 51,95 % del ancho de la raya (`BOTON-1.md` §2.4 lo
 * midió en 51,92 % sobre la referencia, y `s3-cta.invariant` §7 lo vuelve a
 * derivar de los números de la hoja). 650 ms —la mitad del intercambio— cae
 * cuando el hueco ya casi se cerró, así que una sola captura no muestra los dos
 * gestos: van las dos.
 */
export const HUECO_MAXIMO_MS = 384

/**
 * ⚠️ **LO QUE HAY QUE ADELANTARSE PARA QUE EL CUADRO CAIGA DONDE SE DECLARA.**
 *
 * Una captura no congela el instante en que se pide: el cuadro sale unos
 * milisegundos después, y antes del pedido hay dos lecturas de CDP. El número
 * se calibró con el propio gesto, que es un reloj de 700 ms con posiciones
 * conocidas: se capturó con el pedido lanzado a los 134,9 y a los 400,5 ms del
 * hover, se midió sobre el PÍXEL qué tramo de la raya estaba pintado, y se
 * invirtió contra la tabla del hueco. Las dos dieron **el pedido + ~45 ms**
 * (gap de 0,6–6,3 % ⇒ t ≈ 180; gap de 61,4–88,9 % ⇒ t ≈ 455). Sumadas las dos
 * lecturas previas (~25 ms), la espera se adelanta 70.
 *
 * No hace falta que sea exacto: cada captura publica su corchete
 * (`desdeElHover`) y el reporte cita el corchete, no la intención.
 */
export const LATENCIA_DEL_CUADRO_MS = 70

export interface DescripcionDelBoton {
  /** Va en los nombres de archivo. Sin espacios ni acentos. */
  readonly id: string
  readonly nombre: string
  readonly texto?: string
  readonly selector?: string
  readonly indice?: number
  /**
   * ⚠️ **Prohíbe congelar, y hay que usarlo cuando el gesto vive en un
   * pseudo-elemento.**
   *
   * `BOTON-1.md` §0.3 midió que el congelado por API de animaciones es fiel en
   * su contabilidad y en los elementos REALES, pero que **el pintado de un
   * `::before`/`::after` no lo sigue**: seis de dieciocho cuadros de la tira de
   * la referencia salieron sin la raya que los tiempos declarados ponían al
   * 60-100 %. Desde que nuestro subrayado pasó a ser dos pseudo-elementos, la
   * captura «a mitad del hover» de nuestros CTA tiene que salir por RELOJ, con
   * su corchete de tiempo declarado, y no congelada.
   */
  readonly sinCongelar?: boolean
}

export interface MedidaDelBoton {
  readonly id: string
  readonly nombre: string
  readonly preparacion: Preparacion
  readonly cajaMedida: readonly number[]
  readonly puntoDeReposo: Punto
  readonly centro: Punto
  readonly golpeEnElCentro: { readonly hay: boolean; readonly dentro: boolean; readonly etiqueta: string }
  readonly golpeEnElReposo: { readonly hay: boolean; readonly dentro: boolean; readonly etiqueta: string }
  readonly scrollY: number
  readonly reposo: readonly NodoEstatico[]
  readonly despuesDeSalir: readonly NodoEstatico[]
  readonly hoverPleno: readonly NodoEstatico[]
  readonly animacionesAlEntrar: readonly AnimacionViva[]
  readonly grabacion: Grabacion
  readonly recorte: Recorte
  readonly capturas: readonly CapturaHecha[]
  readonly tira: readonly CapturaHecha[]
  readonly tiraCongelada: boolean
}

/**
 * ⚠️ **DOS SISTEMAS DE COORDENADAS, Y LA FOTO USA EL OTRO.**
 *
 * El puntero y `elementFromPoint` hablan en coordenadas de la VENTANA. El
 * recorte se calcula y se acota contra la ventana —que es donde está lo que se
 * ve— y la foto se saca entera y se recorta en Node, así que no hace falta
 * traducir nada: la traducción al documento era necesaria cuando el recorte
 * viajaba en el `clip`, y ése es justo el parámetro que apagaba el `:hover`
 * (ver `capturarRecorte`).
 *
 * Cada captura lleva la caja del CTA **antes y después** de sacarla. Es el
 * control del defecto que este banco encontró: si una foto de hover volviera a
 * salir con la caja de reposo, la cifra está en el JSON y no hay que descubrirlo
 * mirando los píxeles.
 */
async function capturarEstado(
  s: Sesion,
  carpeta: string,
  id: string,
  estado: string,
  congelada: number,
  recorte: Recorte,
  relojDeEntrada?: number,
): Promise<CapturaHecha> {
  const cajaAntes = await caja(s.pagina)
  const archivo = `${carpeta}/${id}-${estado}.png`
  const relojAntes = await medir<number>(s.pagina, 'window.__boton.reloj()')
  const bytes = await capturarRecorte(s.pagina, archivo, recorte)
  const relojDespues = await medir<number>(s.pagina, 'window.__boton.reloj()')
  const cajaDespues = await caja(s.pagina)
  const desdeElHover =
    relojDeEntrada === undefined
      ? null
      : ([Math.round((relojAntes - relojDeEntrada) * 10) / 10, Math.round((relojDespues - relojDeEntrada) * 10) / 10] as const)
  return {
    estado,
    archivo,
    bytes,
    relojAntes,
    relojDespues,
    desdeElHover,
    congelada,
    recorte,
    cajaAntes,
    cajaDespues,
  }
}

function union(a: readonly number[], b: readonly number[]): readonly number[] {
  const x = Math.min(a[0], b[0])
  const y = Math.min(a[1], b[1])
  const x2 = Math.max(a[0] + a[2], b[0] + b[2])
  const y2 = Math.max(a[1] + a[3], b[1] + b[3])
  return [x, y, x2 - x, y2 - y]
}

export async function medirElBoton(
  s: Sesion,
  b: DescripcionDelBoton,
  carpeta: string,
): Promise<MedidaDelBoton> {
  mkdirSync(carpeta, { recursive: true })

  // ── 1 · encontrar y asomar ──────────────────────────────────────────────
  const preparacion = await preparar(s.pagina, { texto: b.texto, selector: b.selector, indice: b.indice })
  if (!preparacion.encontrado) {
    throw new Error(`no se encontró el CTA «${b.nombre}»: ${preparacion.motivo}`)
  }
  // ⚠️ El scroll es el ÚLTIMO recurso, no el primero. Un sitio con scroll
  // suave —el nuestro tiene Lenis y la referencia tiene el suyo— puede pelearle
  // a `scrollTo` y devolver la caja a otro lado; si el CTA ya está cómodo en la
  // ventana, no se toca nada y no hay con qué pelear.
  const yaComodo = (c: readonly number[]): boolean => c[1] >= 80 && c[1] + c[3] <= s.perfil.alto - 120
  let scrollY = preparacion.scrollY
  if (!yaComodo(await caja(s.pagina))) {
    scrollY = await medir<number>(s.pagina, 'window.__boton.asomar()')
    await esperar(1200)
  }
  let cajaA = await caja(s.pagina)
  await esperar(800)
  let cajaMedida = await caja(s.pagina)
  for (let intento = 0; intento < 2 && Math.abs(cajaA[1] - cajaMedida[1]) > 1; intento += 1) {
    await esperar(1500)
    cajaA = await caja(s.pagina)
    await esperar(800)
    cajaMedida = await caja(s.pagina)
  }
  if (Math.abs(cajaA[1] - cajaMedida[1]) > 1) {
    throw new Error(
      `la caja del CTA no se quedó quieta (${dos(cajaA[1])} → ${dos(cajaMedida[1])}): ` +
        'algo la sigue moviendo y cualquier hover caería en otro lado',
    )
  }

  // ── 2 · verificar el hit-test ───────────────────────────────────────────
  // ⚠️ El centro geométrico no siempre es el punto que toca: un CTA con la
  // ventana de recorte arriba y el subrayado abajo deja el centro en el aire
  // entre los dos, y una capa de cursor propia puede taparlo entero. Se prueban
  // cinco puntos del interior y se usa el primero que de verdad lo golpea.
  const candidatos: readonly Punto[] = [
    centroDe(cajaMedida),
    { x: Math.round(cajaMedida[0] + cajaMedida[2] * 0.5), y: Math.round(cajaMedida[1] + cajaMedida[3] * 0.3) },
    { x: Math.round(cajaMedida[0] + cajaMedida[2] * 0.25), y: Math.round(cajaMedida[1] + cajaMedida[3] * 0.3) },
    { x: Math.round(cajaMedida[0] + cajaMedida[2] * 0.75), y: Math.round(cajaMedida[1] + cajaMedida[3] * 0.5) },
    { x: Math.round(cajaMedida[0] + cajaMedida[2] * 0.5), y: Math.round(cajaMedida[1] + cajaMedida[3] * 0.7) },
  ]
  let centro = candidatos[0]
  let golpeEnElCentro = await golpea(s.pagina, centro)
  for (let i = 1; i < candidatos.length && !golpeEnElCentro.dentro; i += 1) {
    centro = candidatos[i]
    golpeEnElCentro = await golpea(s.pagina, centro)
  }
  const reposoP = puntoDeReposo(cajaMedida, s.perfil)
  if (!golpeEnElCentro.dentro) {
    throw new Error(
      `ninguno de los ${candidatos.length} puntos del interior del CTA lo toca; en el último hay ` +
        `un <${golpeEnElCentro.etiqueta}>. Un hover despachado ahí mediría otra cosa.`,
    )
  }
  const golpeEnElReposo = await golpea(s.pagina, reposoP)
  if (golpeEnElReposo.dentro) {
    throw new Error('el punto de reposo cae ADENTRO del CTA: no habría estado de reposo que medir')
  }

  // ── 3 · REPOSO ──────────────────────────────────────────────────────────
  await moverPorCamino(s.pagina, centro, reposoP)
  await esperar(ESPERA_MS)
  const reposo = await foto(s.pagina)

  // ── 4 · los dos ciclos, muestreados ─────────────────────────────────────
  const grabacion = await ciclo(s, reposoP, centro, 2)

  // ── 5 · DESPUÉS DE SALIR, sin tocar nada ────────────────────────────────
  const despuesDeSalir = await foto(s.pagina)

  // ── 6 · hover: el censo de animaciones y el HOVER PLENO ─────────────────
  await moverPorCamino(s.pagina, reposoP, centro)
  await esperar(60)
  const animacionesAlEntrar = await animaciones(s.pagina)
  await esperar(ESPERA_MS)
  const hoverPleno = await foto(s.pagina)

  // El recorte ÚNICO del botón: la unión de las dos cajas, con su aire.
  const cajaDeReposo = reposo[0].rect ?? cajaMedida
  const cajaDeHover = hoverPleno[0].rect ?? cajaMedida
  const recorte = recorteDe(union(cajaDeReposo, cajaDeHover), s.perfil)

  // ── 7 · la tira de cuadros ──────────────────────────────────────────────
  const tiraCongelada = animacionesAlEntrar.length > 0 && b.sinCongelar !== true
  await moverPorCamino(s.pagina, centro, reposoP)
  await esperar(ESPERA_MS)
  const tira: CapturaHecha[] = []
  await moverPorCamino(s.pagina, reposoP, centro)
  if (tiraCongelada) {
    for (const t of INSTANTES_DE_LA_TIRA) {
      const cuantas = await medir<number>(s.pagina, `window.__boton.congelar(${t})`)
      await esperar(40)
      tira.push(await capturarEstado(s, carpeta, b.id, `tira-${String(t).padStart(4, '0')}`, cuantas, recorte))
    }
    await medir<number>(s.pagina, 'window.__boton.congelar(900000)')
    await medir<number>(s.pagina, 'window.__boton.soltar()')
  } else {
    // Sin animaciones de la API web el gesto lo escribe JavaScript: la tira se
    // saca a reloj, lo más seguido que el protocolo deje, y cada cuadro lleva
    // su corchete de tiempo en vez de un instante exacto.
    for (let i = 0; i < INSTANTES_DE_LA_TIRA.length; i += 1) {
      tira.push(await capturarEstado(s, carpeta, b.id, `tira-libre-${String(i).padStart(2, '0')}`, 0, recorte))
    }
  }
  await moverPorCamino(s.pagina, centro, reposoP)
  await esperar(ESPERA_MS)

  // ── 8 · las cuatro capturas de estado ───────────────────────────────────
  const capturas: CapturaHecha[] = []
  capturas.push(await capturarEstado(s, carpeta, b.id, '1-reposo', 0, recorte))

  await moverPorCamino(s.pagina, reposoP, centro)
  const relojAlEntrar = await medir<number>(s.pagina, 'window.__boton.reloj()')
  if (tiraCongelada) {
    const cuantas = await medir<number>(s.pagina, `window.__boton.congelar(${MITAD_DEL_HOVER_MS})`)
    await esperar(60)
    capturas.push(await capturarEstado(s, carpeta, b.id, '2-mitad', cuantas, recorte, relojAlEntrar))
    await medir<number>(s.pagina, 'window.__boton.congelar(900000)')
    await medir<number>(s.pagina, 'window.__boton.soltar()')
    await moverPorCamino(s.pagina, centro, reposoP)
    await esperar(ESPERA_MS)
    await moverPorCamino(s.pagina, reposoP, centro)
  } else {
    // Por reloj, adelantándose lo que tarda el cuadro. Primero el hueco más
    // ancho, después la mitad del intercambio: los dos gestos, en orden.
    await esperar(Math.max(0, HUECO_MAXIMO_MS - LATENCIA_DEL_CUADRO_MS))
    capturas.push(await capturarEstado(s, carpeta, b.id, '2b-hueco-maximo', 0, recorte, relojAlEntrar))
    const yaPasado = (await medir<number>(s.pagina, 'window.__boton.reloj()')) - relojAlEntrar
    await esperar(Math.max(0, MITAD_DEL_HOVER_MS - LATENCIA_DEL_CUADRO_MS - yaPasado))
    capturas.push(await capturarEstado(s, carpeta, b.id, '2-mitad', 0, recorte, relojAlEntrar))
  }
  await esperar(ESPERA_MS)
  capturas.push(await capturarEstado(s, carpeta, b.id, '3-hover-pleno', 0, recorte))

  await moverPorCamino(s.pagina, centro, reposoP)
  await esperar(ESPERA_MS)
  capturas.push(await capturarEstado(s, carpeta, b.id, '4-despues-de-salir', 0, recorte))

  return {
    id: b.id,
    nombre: b.nombre,
    preparacion,
    cajaMedida,
    puntoDeReposo: reposoP,
    centro,
    golpeEnElCentro,
    golpeEnElReposo,
    scrollY,
    reposo,
    despuesDeSalir,
    hoverPleno,
    animacionesAlEntrar,
    grabacion,
    recorte,
    capturas,
    tira,
    tiraCongelada,
  }
}
