/**
 * [PULIDO 2] 1 · EL ENCUADRE DEL FINAL DETRÁS DEL PIE, abajo de 1024. Sin el escenario de PULIDO 1 P22, el final corre al
 * fondo con los elementos del pie encima (el titular, los contactos, los enlaces, el formulario de vidrio, los íconos),
 * que quedan donde están. Centrado en la pantalla, el logo caía detrás de los enlaces y del vidrio y no se leía.
 *
 * Ahora la cámara de arriba lo pone EN EL HUECO MÁS GRANDE ENTRE LOS ELEMENTOS: con las cajas del pie tal como quedan al
 * fondo de la página (más la barra y los controles fijos), se busca el rectángulo libre más grande con la forma de la
 * huella del logo (la del hueco: es la misma) y el logo va ahí, centrado y del tamaño de ese hueco (con tope). Si ningún
 * hueco le da un tamaño legible (un teléfono chico: los huecos miden 60 px), se busca entre lo PESADO (el titular, la caja
 * de vidrio y lo fijo) y el logo queda detrás del texto chico (los contactos, los enlaces, los íconos), que se lee encima
 * (la mezcla de abajo de 1024) y entre el que se lee el logo. Si tampoco (un teléfono apaisado chico: el formulario ocupa
 * casi todo), va detrás del vidrio, que lo deja ver desenfocado. Se mide al montarse, al asomarse el pie y al cambiar algo
 * de tamaño (no con el teclado abierto: `teclado.ts`), nunca por cuadro.
 */
export interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export interface EncuadreEnPantalla {
  /** El centro de la huella del logo y su ancho, en px de la vista. */
  readonly cx: number
  readonly cy: number
  readonly ancho: number
  /** Dónde quedó: en un hueco entre los elementos, detrás del texto chico, o detrás del vidrio. */
  readonly donde: 'hueco' | 'texto' | 'vidrio' | 'centro'
}

export const ENCUADRE_DEL_PIE = {
  /** La celda de la grilla con que se buscan los huecos (px). */
  celda: 6,
  /** El aire alrededor de cada elemento (px) y el de los bordes de la vista: el logo no los roza. */
  aire: 6,
  borde: 16,
  /** Cuánto del hueco ocupa la huella (el hueco del piso es un poco más grande que el logo). */
  llena: 0.9,
  /** Cuánto más chico puede ir para quedar en el eje de la vista. */
  cede: 0.85,
  /** El ancho mínimo de la huella para leerse y su tope, en fracción de la dimensión que la limita (el ancho, o el alto con su forma). */
  minimo: 0.3,
  maximo: 0.62,
  /** Detrás del vidrio (sin hueco): la fracción de la dimensión que limita. */
  enElVidrio: 0.5,
} as const

/** El hueco más grande con la forma de la huella (`aspecto` = ancho / fondo) entre las cajas ocupadas; `null` si no hay. */
export function huecoMasGrande(vista: { readonly ancho: number; readonly alto: number }, ocupadas: readonly Caja[], aspecto: number): { cx: number; cy: number; ancho: number } | null {
  const { celda, aire } = ENCUADRE_DEL_PIE
  const columnas = Math.max(1, Math.floor(vista.ancho / celda))
  const filas = Math.max(1, Math.floor(vista.alto / celda))
  // La tabla de sumas de lo ocupado (por celda): un rectángulo está libre si su suma es cero.
  const suma = new Int32Array((columnas + 1) * (filas + 1))
  const ocupada = new Uint8Array(columnas * filas)
  for (const c of ocupadas) {
    const x0 = Math.max(0, Math.floor((c.x - aire) / celda))
    const y0 = Math.max(0, Math.floor((c.y - aire) / celda))
    const x1 = Math.min(columnas, Math.ceil((c.x + c.ancho + aire) / celda))
    const y1 = Math.min(filas, Math.ceil((c.y + c.alto + aire) / celda))
    for (let y = y0; y < y1; y += 1) for (let x = x0; x < x1; x += 1) ocupada[y * columnas + x] = 1
  }
  for (let y = 0; y < filas; y += 1) {
    for (let x = 0; x < columnas; x += 1) suma[(y + 1) * (columnas + 1) + x + 1] = ocupada[y * columnas + x] + suma[y * (columnas + 1) + x + 1] + suma[(y + 1) * (columnas + 1) + x] - suma[y * (columnas + 1) + x]
  }
  const libre = (x: number, y: number, w: number, h: number): boolean => x + w <= columnas && y + h <= filas && suma[(y + h) * (columnas + 1) + x + w] - suma[y * (columnas + 1) + x + w] - suma[(y + h) * (columnas + 1) + x] + suma[y * (columnas + 1) + x] === 0
  let mejor: { x: number; y: number; w: number } | null = null
  for (let y = 0; y < filas; y += 1) {
    for (let x = 0; x < columnas; x += 1) {
      if (ocupada[y * columnas + x] === 1) continue
      // El ancho más grande (en celdas) que entra desde esta esquina, con el alto de la forma.
      let w: number = mejor === null ? 1 : mejor.w + 1
      if (!libre(x, y, w, Math.max(1, Math.round(w / aspecto)))) continue
      while (libre(x, y, w + 1, Math.max(1, Math.round((w + 1) / aspecto)))) w += 1
      mejor = { x, y, w }
    }
  }
  if (mejor === null) return null
  // De los lugares donde entra un tamaño, el más cerca del eje de la vista (y después, del medio de su alto): la primera
  // esquina que se encontró es la de más arriba a la izquierda, y un logo corrido a un costado se lee como un descuido. Si
  // centrado sólo entra un poco más chico (hasta `cede`), va centrado y un poco más chico.
  const lugarPara = (w: number): { x: number; y: number; eje: number; d: number } | null => {
    const alto = Math.max(1, Math.round(w / aspecto))
    let lugar: { x: number; y: number; eje: number; d: number } | null = null
    for (let y = 0; y + alto <= filas; y += 1) {
      for (let x = 0; x + w <= columnas; x += 1) {
        if (!libre(x, y, w, alto)) continue
        const eje = Math.abs(x + w / 2 - columnas / 2)
        const d = eje * 4 + Math.abs(y + alto / 2 - filas / 2)
        if (lugar === null || d < lugar.d) lugar = { x, y, eje, d }
      }
    }
    return lugar
  }
  let w = mejor.w
  let lugar = lugarPara(w)
  for (let chico = mejor.w - 1; chico >= Math.ceil(mejor.w * ENCUADRE_DEL_PIE.cede) && lugar !== null && lugar.eje > 1; chico -= 1) {
    const otro = lugarPara(chico)
    if (otro !== null && otro.eje <= 1) {
      w = chico
      lugar = otro
    }
  }
  if (lugar === null) return null
  const alto = Math.max(1, Math.round(w / aspecto))
  return { cx: (lugar.x + w / 2) * celda, cy: (lugar.y + alto / 2) * celda, ancho: w * celda }
}

/** Dónde va el logo: en el hueco más grande si se lee; si no, entre lo pesado (detrás del texto chico); si no, detrás del vidrio. */
export function encuadreEntreLasCajas(vista: { readonly ancho: number; readonly alto: number }, ocupadas: readonly Caja[], pesadas: readonly Caja[], vidrio: Caja | null, huella: { readonly ancho: number; readonly fondo: number }): EncuadreEnPantalla {
  const E = ENCUADRE_DEL_PIE
  const aspecto = huella.ancho / huella.fondo
  const limita = Math.min(vista.ancho, vista.alto * aspecto)
  const tope = E.maximo * limita
  // Los bordes de la vista, como cajas ocupadas.
  const b = E.borde
  const bordes: Caja[] = [{ x: 0, y: 0, ancho: vista.ancho, alto: b }, { x: 0, y: vista.alto - b, ancho: vista.ancho, alto: b }, { x: 0, y: 0, ancho: b, alto: vista.alto }, { x: vista.ancho - b, y: 0, ancho: b, alto: vista.alto }]
  for (const [cajas, donde] of [[ocupadas, 'hueco'], [pesadas, 'texto']] as const) {
    const hueco = huecoMasGrande(vista, [...cajas, ...bordes], aspecto)
    const ancho = hueco === null ? 0 : Math.min(hueco.ancho * E.llena, tope)
    if (hueco !== null && ancho >= E.minimo * limita) return { cx: hueco.cx, cy: hueco.cy, ancho, donde }
  }
  const enElVidrio = E.enElVidrio * limita
  if (vidrio !== null) return { cx: vidrio.x + vidrio.ancho / 2, cy: vidrio.y + vidrio.alto / 2, ancho: enElVidrio, donde: 'vidrio' }
  return { cx: vista.ancho / 2, cy: vista.alto / 2, ancho: enElVidrio, donde: 'centro' }
}

/** Lo que el pie tiene encima de la escena (el texto, los enlaces, los campos, los íconos) y lo pesado (el titular). */
const LO_QUE_TAPA = 'h2, p, a, label, input, textarea, button, select'
const LO_PESADO = 'h2'
const LO_FIJO = '[data-parte="boton-del-menu"], [data-pieza="sonido-de-la-esquina"], [data-pieza="infinito-del-recorrido"]'

/** El encuadre en vivo (lo lee el cuadro del final abajo de 1024): `null` hasta medirlo. */
export const ENCUADRE_EN_VIVO: { valor: EncuadreEnPantalla | null; vista: { ancho: number; alto: number } } = { valor: null, vista: { ancho: 0, alto: 0 } }

/** Mide el pie COMO QUEDA AL FONDO de la página (desde cualquier scroll) y guarda dónde va el logo. */
export function medirElEncuadreDelPie(huella: { readonly ancho: number; readonly fondo: number }): EncuadreEnPantalla | null {
  const pie = document.getElementById('cierre')
  const vista = { ancho: window.innerWidth, alto: window.innerHeight }
  if (pie === null || vista.ancho <= 0 || vista.alto <= 0) return null
  // Al fondo, todo lo del documento sube lo que falta para llegar: `maximo − scrollY`.
  const corre = Math.max(0, document.documentElement.scrollHeight - vista.alto) - window.scrollY
  const enElFondo = (r: DOMRect): Caja => ({ x: r.left, y: r.top - corre, ancho: r.width, alto: r.height })
  const ocupadas: Caja[] = []
  const pesadas: Caja[] = []
  for (const e of pie.querySelectorAll(LO_QUE_TAPA)) {
    const r = e.getBoundingClientRect()
    if (r.width <= 1 || r.height <= 1) continue
    ocupadas.push(enElFondo(r))
    if (e.matches(LO_PESADO)) pesadas.push(enElFondo(r))
  }
  const caja = pie.querySelector('[data-material="vidrio"]')
  const vidrio = caja === null ? null : enElFondo(caja.getBoundingClientRect())
  if (vidrio !== null) ocupadas.push(vidrio)
  if (vidrio !== null) pesadas.push(vidrio)
  // Lo fijo (la barra, los controles de las esquinas) no se corre con el scroll.
  for (const e of document.querySelectorAll(LO_FIJO)) {
    const r = e.getBoundingClientRect()
    if (r.width <= 1 || r.height <= 1) continue
    ocupadas.push({ x: r.left, y: r.top, ancho: r.width, alto: r.height })
    pesadas.push({ x: r.left, y: r.top, ancho: r.width, alto: r.height })
  }
  const valor = encuadreEntreLasCajas(vista, ocupadas, pesadas, vidrio, huella)
  ENCUADRE_EN_VIVO.valor = valor
  ENCUADRE_EN_VIVO.vista = vista
  return valor
}

/**
 * [PULIDO 2] 1 · EL PIE MIENTRAS CORRE EL FINAL (abajo de 1024): la mezcla del pie (`difference`) invierte bien sobre el
 * negro del logo y el blanco del piso, pero la cinemática pasa por grises (la tapa satinada del logo inclinado, su sombra,
 * el borde del hueco) y ahí pinta el mismo gris que el fondo: los enlaces llegaban a 1,1:1 (medido). Al fondo y mientras
 * corre, el pie lleva `data-final-del-pie` y `banda.css` le saca la mezcla: la tinta con un halo denso del papel (D2).
 */
let pieMarcado: HTMLElement | null = null
let marcado = false
export function marcarElPie(corre: boolean): void {
  if (corre === marcado) return
  pieMarcado ??= document.getElementById('cierre')
  if (pieMarcado === null) return
  marcado = corre
  if (corre) pieMarcado.setAttribute('data-final-del-pie', '')
  else pieMarcado.removeAttribute('data-final-del-pie')
}
