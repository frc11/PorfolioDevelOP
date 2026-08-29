/**
 * LA TABLA DE TRADUCCIÓN — de las claves declaradas de GSAP a CSS real.
 *
 * ⚠ ESTE ARCHIVO ES EL TRABAJO DE NO USAR GSAP.
 *
 * SCROLL.md §9.5, trampa 2: "Lo que se declara no es lo que se aplica".
 * `autoAlpha` no es una propiedad de CSS; `translateZ` se aplica como `z`;
 * `rotationZ` se aplica como `rotation`; `scale` se expande a `scaleX`/`scaleY`.
 * La conclusión de la medición es literal: "Reproducir esto con las claves
 * declaradas y sin GSAP **no da el mismo resultado**: hay que reproducir la
 * traducción, no la declaración."
 *
 * Acá está la traducción entera, como una función pura, y
 * `__tests__/traduccion.invariant.ts` la comprueba equivalencia por
 * equivalencia con su control positivo.
 *
 * ── El orden de composición ────────────────────────────────────────────────
 *
 * Las funciones de `transform` NO conmutan, así que el orden es parte de la
 * traducción. GSAP compone en este orden (CSSPlugin, `_renderCSSTransforms`):
 *
 *     perspective → translate(%) → translate3d(px) → rotate → rotateY
 *                 → rotateX → skew → scale
 *
 * `motion/react` compone en OTRO orden —`transformPropOrder` de `motion-dom`
 * pone `scale` ANTES de las rotaciones—, y por eso este módulo arma la cadena a
 * mano y la entrega como un único string en `style.transform`. `motion` lo
 * soporta explícitamente: `buildHTMLStyles` saltea su propia construcción
 * cuando `latestValues.transform` ya viene puesto.
 *
 * ⚠ Declarado como DECIDIDO, no medido: SCROLL.md registra QUÉ propiedades se
 * aplican, no en qué orden las serializa GSAP. Para el único patrón que combina
 * escala con rotación (P8) el orden es indistinguible —la escala es uniforme y
 * una escala uniforme conmuta con cualquier rotación—, así que la decisión no
 * cambia ningún píxel hoy; cambiaría el día que un patrón use escala no
 * uniforme. Queda como hueco declarado.
 *
 * ── Por qué los dos translate son intercambiables entre sí ─────────────────
 *
 * `translate(x%, y%)` y `translate3d(x, y, z)` son ambos traslaciones y suman:
 * el orden entre ellas no cambia el resultado. Los porcentajes de `translate`
 * se resuelven contra la caja del propio elemento —la misma semántica que
 * `yPercent` en GSAP— y esa resolución no depende de las funciones que la
 * precedan en la cadena. Que las dos vayan ANTES que `scale` sí importa, y va
 * en el orden de GSAP.
 */

/** Las claves que la referencia declara. La lista es la de SCROLL.md §9.5-9.7. */
export type ClaveDeclarada =
  | 'xPercent'
  | 'yPercent'
  | 'x'
  | 'y'
  | 'translateZ'
  | 'scale'
  | 'rotationX'
  | 'rotationY'
  | 'rotationZ'
  | 'opacity'
  | 'autoAlpha'
  | 'pointerEvents'

/**
 * Las claves cuyo valor es un número y por lo tanto se interpolan.
 * `pointerEvents` queda afuera: es discreta y se conmuta, no se interpola.
 */
export type ClaveNumerica = Exclude<ClaveDeclarada, 'pointerEvents'>

/** Los dos estados que la referencia conmuta en `pointerEvents` (P7). */
export type ValorPointerEvents = 'auto' | 'none'

/**
 * El resultado de traducir: propiedades de CSS de verdad, listas para `style`.
 * `transform` sale ausente —no `'none'`— cuando ninguna clave de transformada
 * participa: escribir `transform: none` crearía una capa de composición que el
 * elemento no pidió.
 */
export interface PropiedadesReales {
  readonly transform?: string
  readonly opacity?: number
  readonly visibility?: 'visible' | 'hidden'
  readonly pointerEvents?: ValorPointerEvents
}

/** Los valores declarados de un fotograma, ya interpolados. */
export type ValoresDeclarados = Partial<Record<ClaveNumerica, number>> & {
  readonly pointerEvents?: ValorPointerEvents
}

/** Las propiedades de CSS que este sistema puede llegar a escribir. */
export type PropiedadReal = 'transform' | 'opacity' | 'visibility' | 'pointerEvents'

/**
 * LA TABLA. Cada clave declarada, qué propiedades reales escribe, y por qué.
 * Es la tabla que el sprint pide documentar; el invariante la recorre entera y
 * comprueba que la función de traducción escribe exactamente esas propiedades.
 */
export interface FilaDeTraduccion {
  /** Las propiedades de CSS que efectivamente se escriben. */
  readonly propiedadesReales: readonly PropiedadReal[]
  /** La función de `transform` que emite, si emite alguna. */
  readonly funcionDeTransform: string | null
  /** Qué hace la traducción, en una línea. */
  readonly nota: string
}

export const TABLA_DE_TRADUCCION: Readonly<Record<ClaveDeclarada, FilaDeTraduccion>> = {
  xPercent: {
    propiedadesReales: ['transform'],
    funcionDeTransform: 'translate()',
    nota: 'porcentaje del ANCHO propio del elemento; viaja en el mismo translate() que yPercent',
  },
  yPercent: {
    propiedadesReales: ['transform'],
    funcionDeTransform: 'translate()',
    nota: 'porcentaje del ALTO propio del elemento, no del contenedor. Es P1 (120) y P2 (60)',
  },
  x: {
    propiedadesReales: ['transform'],
    funcionDeTransform: 'translate3d()',
    nota: 'pixeles reales sobre el eje horizontal. Es P6 (140 a -140)',
  },
  y: {
    propiedadesReales: ['transform'],
    funcionDeTransform: 'translate3d()',
    nota: 'pixeles reales sobre el eje vertical. Es P4 (100 a 0)',
  },
  translateZ: {
    propiedadesReales: ['transform'],
    funcionDeTransform: 'translate3d()',
    nota: 'GSAP lo aplica como z, que NO es una propiedad de CSS: es la tercera componente de translate3d(). Escribir style.z no hace nada',
  },
  scale: {
    propiedadesReales: ['transform'],
    funcionDeTransform: 'scale()',
    nota: 'GSAP lo expande a scaleX + scaleY; con un unico valor, scale(v) es la misma matriz',
  },
  rotationX: {
    propiedadesReales: ['transform'],
    funcionDeTransform: 'rotateX()',
    nota: 'grados. Necesita perspective en un ancestro para verse como profundidad',
  },
  rotationY: {
    propiedadesReales: ['transform'],
    funcionDeTransform: 'rotateY()',
    nota: 'grados. Idem perspective',
  },
  rotationZ: {
    propiedadesReales: ['transform'],
    funcionDeTransform: 'rotate()',
    nota: 'GSAP lo aplica como rotation, que en CSS es rotate(), no rotateZ(). Son equivalentes en matriz, pero el nombre declarado no existe',
  },
  opacity: {
    propiedadesReales: ['opacity'],
    funcionDeTransform: null,
    nota: 'la unica clave que se traduce a si misma',
  },
  autoAlpha: {
    propiedadesReales: ['opacity', 'visibility'],
    funcionDeTransform: null,
    nota: 'NO es CSS: es azucar de GSAP. Anima opacity Y ADEMAS conmuta visibility a hidden cuando la opacidad llega a 0. Traducirla solo como opacity deja el elemento capturando el foco y el lector de pantalla',
  },
  pointerEvents: {
    propiedadesReales: ['pointerEvents'],
    funcionDeTransform: null,
    nota: 'discreta: GSAP no interpola valores no numericos, los conmuta al valor final apenas el progreso deja de ser 0 (ratio ? fin : inicio)',
  },
}

/**
 * El orden de composición, como dato. Lo consume `componer()` y lo afirma el
 * invariante, que además comprueba que NO coincide con el orden de
 * `motion/react` — si coincidiera, armar el string a mano no tendría sentido y
 * este módulo sería una capa de indirección sin motivo.
 */
export const ORDEN_DE_COMPOSICION: readonly ClaveNumerica[] = [
  'xPercent',
  'yPercent',
  'x',
  'y',
  'translateZ',
  'rotationZ',
  'rotationY',
  'rotationX',
  'scale',
]

/**
 * El orden que usa `motion/react` (motion-dom, `transformPropOrder`), acotado a
 * las claves que este sistema usa. Solo existe para el contraste.
 */
export const ORDEN_DE_MOTION: readonly ClaveNumerica[] = [
  'x',
  'y',
  'translateZ',
  'scale',
  'rotationZ',
  'rotationX',
  'rotationY',
]

/**
 * Redondeo de salida. Cuatro decimales alcanzan para sub-píxel y evitan que el
 * string cambie por ruido de coma flotante en cada cuadro.
 */
const redondear = (n: number): number => Math.round(n * 1e4) / 1e4

/** Valores neutros: si una clave llega en su neutro, no se emite su función. */
const NEUTRO: Readonly<Record<ClaveNumerica, number>> = {
  xPercent: 0,
  yPercent: 0,
  x: 0,
  y: 0,
  translateZ: 0,
  scale: 1,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  opacity: 1,
  autoAlpha: 1,
}

/** El neutro de cada clave, expuesto para que los patrones no lo repitan. */
export function neutroDe(clave: ClaveNumerica): number {
  return NEUTRO[clave]
}

/**
 * Traduce un fotograma declarado a las propiedades de CSS que realmente se
 * escriben. Es una función pura: mismo objeto de entrada, mismo string.
 */
export function traducir(valores: ValoresDeclarados): PropiedadesReales {
  const partes: string[] = []

  // Las dos traslaciones van juntas y primero, en el orden de GSAP.
  const xp = valores.xPercent ?? NEUTRO.xPercent
  const yp = valores.yPercent ?? NEUTRO.yPercent
  if (xp !== NEUTRO.xPercent || yp !== NEUTRO.yPercent) {
    partes.push('translate(' + redondear(xp) + '%, ' + redondear(yp) + '%)')
  }

  const x = valores.x ?? NEUTRO.x
  const y = valores.y ?? NEUTRO.y
  const z = valores.translateZ ?? NEUTRO.translateZ
  if (x !== NEUTRO.x || y !== NEUTRO.y || z !== NEUTRO.translateZ) {
    partes.push(
      'translate3d(' + redondear(x) + 'px, ' + redondear(y) + 'px, ' + redondear(z) + 'px)',
    )
  }

  // `rotationZ` se aplica como `rotation`, o sea `rotate()`.
  const rz = valores.rotationZ ?? NEUTRO.rotationZ
  if (rz !== NEUTRO.rotationZ) partes.push('rotate(' + redondear(rz) + 'deg)')

  const ry = valores.rotationY ?? NEUTRO.rotationY
  if (ry !== NEUTRO.rotationY) partes.push('rotateY(' + redondear(ry) + 'deg)')

  const rx = valores.rotationX ?? NEUTRO.rotationX
  if (rx !== NEUTRO.rotationX) partes.push('rotateX(' + redondear(rx) + 'deg)')

  const escala = valores.scale ?? NEUTRO.scale
  if (escala !== NEUTRO.scale) partes.push('scale(' + redondear(escala) + ')')

  // `autoAlpha` gobierna DOS propiedades. Si además vino `opacity`, gana
  // `autoAlpha`: es la que trae la conmutación de visibilidad atada.
  const alfa = valores.autoAlpha
  const opacidad = alfa ?? valores.opacity

  const resultado: {
    transform?: string
    opacity?: number
    visibility?: 'visible' | 'hidden'
    pointerEvents?: ValorPointerEvents
  } = {}

  if (partes.length > 0) resultado.transform = partes.join(' ')
  if (opacidad !== undefined) resultado.opacity = redondear(opacidad)
  if (alfa !== undefined) resultado.visibility = alfa === 0 ? 'hidden' : 'visible'
  if (valores.pointerEvents !== undefined) resultado.pointerEvents = valores.pointerEvents

  return resultado
}

/**
 * La conmutación discreta de GSAP para propiedades no numéricas: el valor final
 * apenas el progreso deja de ser 0, el inicial en 0 exacto.
 * (`_renderPropTweens`: `t.set(t.t, t.p, ratio ? t.e : t.b, t)`.)
 *
 * ⚠ DECIDIDO a partir del comportamiento conocido de la librería, no medido en
 * SCROLL.md, que registra que P7 conmuta `pointerEvents` entre `initial` y
 * `none` pero no en qué punto del progreso lo hace. Queda como hueco.
 */
export function conmutar<T>(progreso: number, inicial: T, final: T): T {
  return progreso > 0 ? final : inicial
}

/** Interpola una clave numérica entre dos valores con el progreso ya curvado. */
export function interpolar(desde: number, hasta: number, t: number): number {
  return desde + (hasta - desde) * t
}
