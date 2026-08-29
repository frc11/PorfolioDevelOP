/**
 * INVARIANTE — la tabla de traducción, equivalencia por equivalencia.
 *
 * Corre con `npm run test:s2-traduccion`.
 *
 * Es la comprobación de la TRAMPA 3 del sprint —"el plugin de CSS reescribe la
 * propiedad"—, que SCROLL.md §9.5 llama trampa 2. Cada fila de
 * `TABLA_DE_TRADUCCION` se recorre y se afirma que `traducir()` escribe
 * exactamente las propiedades que la fila declara, ni una más ni una menos.
 *
 * Los controles positivos son traducciones INGENUAS —las que uno escribiría sin
 * leer la medición— y el mismo predicado tiene que rechazarlas. Sin eso, la
 * tabla podría estar describiendo algo que la función no hace.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { PATRONES, ORDEN_DE_PATRONES } from '../patrones'
import {
  ORDEN_DE_COMPOSICION,
  ORDEN_DE_MOTION,
  TABLA_DE_TRADUCCION,
  conmutar,
  neutroDe,
  traducir,
  type ClaveDeclarada,
  type PropiedadReal,
  type PropiedadesReales,
  type ValoresDeclarados,
} from '../traduccion'

/** Qué propiedades reales escribió una traducción. */
const escritas = (p: PropiedadesReales): PropiedadReal[] => {
  const salida: PropiedadReal[] = []
  if (p.transform !== undefined) salida.push('transform')
  if (p.opacity !== undefined) salida.push('opacity')
  if (p.visibility !== undefined) salida.push('visibility')
  if (p.pointerEvents !== undefined) salida.push('pointerEvents')
  return salida
}

/** Un valor NO neutro para cada clave, para que la traducción tenga qué emitir. */
const VALOR_DE_PRUEBA: Readonly<Record<ClaveDeclarada, number | 'auto' | 'none'>> = {
  xPercent: 25,
  yPercent: 120,
  x: 140,
  y: 100,
  translateZ: -3000,
  scale: 0.3,
  rotationX: 60,
  rotationY: 80,
  rotationZ: 45,
  opacity: 0.3,
  autoAlpha: 0,
  pointerEvents: 'none',
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · Cada clave declarada escribe EXACTAMENTE lo que dice su fila')

const CLAVES = Object.keys(TABLA_DE_TRADUCCION) as ClaveDeclarada[]
afirmarIgual(CLAVES.length, 12, 'la tabla cubre doce claves declaradas')

for (const clave of CLAVES) {
  const fila = TABLA_DE_TRADUCCION[clave]
  const entrada = { [clave]: VALOR_DE_PRUEBA[clave] } as ValoresDeclarados
  const salida = traducir(entrada)
  afirmarIgual(
    escritas(salida).sort(),
    [...fila.propiedadesReales].sort(),
    `${clave} → ${fila.propiedadesReales.join(' + ')}`,
  )
  if (fila.funcionDeTransform !== null) {
    const funcion = fila.funcionDeTransform.replace('()', '(')
    afirmar(
      (salida.transform ?? '').includes(funcion),
      `  y su transform usa ${fila.funcionDeTransform}`,
      salida.transform,
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('T2 · autoAlpha — la clave que no es CSS')

afirmarIgual(
  traducir({ autoAlpha: 0 }),
  { opacity: 0, visibility: 'hidden' },
  'autoAlpha 0 escribe opacity 0 Y visibility hidden',
)
afirmarIgual(
  traducir({ autoAlpha: 1 }),
  { opacity: 1, visibility: 'visible' },
  'autoAlpha 1 escribe opacity 1 Y visibility visible',
)
afirmarIgual(
  traducir({ autoAlpha: 0.5 }).visibility,
  'visible',
  'con cualquier opacidad distinta de 0, visible — la conmutación es en el 0 exacto',
)

controlPositivo(
  'una traducción INGENUA de autoAlpha (solo opacity) no pasa el chequeo',
  (v: number): PropiedadesReales => ({ opacity: v }),
  (ingenua) => escritas(ingenua(0)).includes('visibility'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T3 · translateZ y rotationZ — los dos nombres que no existen en CSS')

const conZ = traducir({ translateZ: -3000 })
afirmar(
  (conZ.transform ?? '').includes('translate3d(0px, 0px, -3000px)'),
  'translateZ viaja como la tercera componente de translate3d()',
  conZ.transform,
)
afirmar(
  !Object.prototype.hasOwnProperty.call(conZ, 'z'),
  '  y NO se escribe una propiedad `z`: en CSS no existe y no haría nada',
)

const conRz = traducir({ rotationZ: 45 })
afirmar((conRz.transform ?? '').includes('rotate(45deg)'), 'rotationZ se aplica como rotate()')
afirmar(
  !(conRz.transform ?? '').includes('rotateZ'),
  '  y no como rotateZ(): GSAP lo llama `rotation`, y ése es el nombre que viaja',
)

controlPositivo(
  'una traducción INGENUA que escribe `z` como propiedad no pasa el chequeo',
  { z: -3000 } as Record<string, number>,
  (ingenua) => (JSON.stringify(ingenua).includes('translate3d') ? true : false),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T4 · yPercent — porcentaje del ALTO PROPIO, no del contenedor')

afirmarIgual(
  traducir({ yPercent: 120 }).transform,
  'translate(0%, 120%)',
  'yPercent 120 emite un porcentaje, no un píxel',
)
afirmar(
  traducir({ yPercent: 120 }).transform !== traducir({ y: 120 }).transform,
  '  y no es lo mismo que y: 120 — uno es relativo al elemento y el otro absoluto',
  `${traducir({ yPercent: 120 }).transform} vs ${traducir({ y: 120 }).transform}`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T5 · El orden de composición NO es el de motion/react')

afirmar(
  ORDEN_DE_COMPOSICION.join(',') !== ORDEN_DE_MOTION.join(','),
  'los dos órdenes son distintos: armar el string a mano no es una indirección vacía',
)
const iScaleGsap = ORDEN_DE_COMPOSICION.indexOf('scale')
const iRotGsap = ORDEN_DE_COMPOSICION.indexOf('rotationZ')
const iScaleMotion = ORDEN_DE_MOTION.indexOf('scale')
const iRotMotion = ORDEN_DE_MOTION.indexOf('rotationZ')
afirmar(iRotGsap < iScaleGsap, 'GSAP compone rotate ANTES que scale')
afirmar(iScaleMotion < iRotMotion, 'motion compone scale ANTES que rotate')

const completo = traducir({
  yPercent: 120,
  translateZ: -3000,
  rotationZ: 45,
  rotationY: 80,
  rotationX: 60,
  scale: 0.3,
})
afirmarIgual(
  completo.transform,
  'translate(0%, 120%) translate3d(0px, 0px, -3000px) rotate(45deg) rotateY(80deg) rotateX(60deg) scale(0.3)',
  'la cadena completa sale en el orden de GSAP',
)

controlPositivo(
  'el chequeo del orden ve una cadena con scale adelantado',
  'scale(0.3) rotate(45deg)',
  (cadena: string) => cadena.indexOf('rotate(') < cadena.indexOf('scale('),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T6 · Neutros — lo que no anima, no se escribe')

afirmarIgual(traducir({}), {}, 'sin claves no se escribe nada — ni transform: none')
afirmarIgual(
  traducir({ scale: 1, yPercent: 0, x: 0 }),
  {},
  'las claves en su neutro tampoco: el scale 1 → 1 de P1 no crea una capa',
)
afirmar(neutroDe('scale') === 1 && neutroDe('yPercent') === 0, 'el neutro de scale es 1 y el de yPercent 0')

controlPositivo(
  'el chequeo de neutros ve una traducción que sí emite en el neutro',
  { transform: 'scale(1)' } as PropiedadesReales,
  (p) => escritas(p).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T7 · pointerEvents — discreta, no interpolada')

afirmarIgual(conmutar(0, 'auto', 'none'), 'auto', 'en progreso 0 exacto, el valor inicial')
afirmarIgual(conmutar(0.0001, 'auto', 'none'), 'none', 'apenas el progreso deja de ser 0, el final')
afirmarIgual(conmutar(1, 'auto', 'none'), 'none', 'y en 1, el final')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T8 · Los nueve patrones solo declaran claves de la tabla')

for (const id of ORDEN_DE_PATRONES) {
  const patron = PATRONES[id]
  const claves = [...patron.claves, ...(patron.tramos ?? []).flatMap((t) => t.claves)]
  const fuera = claves.filter((k) => !(k.clave in TABLA_DE_TRADUCCION))
  afirmarIgual(fuera, [], `${id} declara solo claves traducibles (${claves.length} claves)`)
}

cerrar('traduccion.invariant')
