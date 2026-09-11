/**
 * INVARIANTE — B13 · QUE EL LOGO EMITA.
 *
 *     npm run test:s22-emision
 *
 * Lo que afirma, y por qué:
 *
 *   1. **EL CONTROL DE EQUIVALENCIA.** `logoEmitido.ts` re-escribe la cadena de
 *      sombreado de S7 para meter el término de emisiva ADENTRO del tone
 *      mapping. Con la emisiva en 0 tiene que devolver **exactamente** lo que
 *      devuelve `shadeSurface`, o ninguna cifra de este bloque se puede comparar
 *      con las de S7–S12, B8 y B11.
 *   2. **LA CURVA.** Cero con luz (nivel ≥ `RIM_NIGHT_LEVEL`), el tope en la
 *      noche, monótona y suave entre medio, y **la misma banda que el brillo de
 *      las motas**: el logo y el polvo se encienden juntos. Que sea exactamente
 *      cero con luz es lo que deja intacto todo lo que se midió con la sala
 *      iluminada — y se afirma sobre las seis anclas, no de palabra.
 *   3. **LO QUE COMPRA, con la vara de la referencia.** En la noche el logo pasa
 *      de indistinguible a la banda que nk.studio tiene medida, y la tinta CLARA
 *      que Trabajos escribe encima sigue pasando AA.
 *   4. **LO QUE CUESTA, declarado.** En la vuelta el logo cruza el valor de la
 *      sala y el contraste cae a 1,08:1. Es topológico: para pasar de oscuro
 *      sobre claro a claro sobre oscuro hay que pasar por la igualdad.
 *   5. **CERO COLOR y EL CABLEADO.** Un escalar, tres canales iguales, escrito
 *      en el mismo cuadro que la luz y que el brillo de las motas.
 *   6. **EL PRELOADER NO SE TOCA.** Su logo es otro objeto con su propio
 *      material; ni él ni su relevo importan nada de acá.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import * as THREE from 'three'

import { afirmar, afirmarIgual, cerrar, controlPositivo, deudaDeclarada, razonDeContraste, titulo } from '../../__tests__/afirmar'
import { TINTA_HEX } from '../../superficies'
import { DEUDAS_DE_B13 } from '../../__tests__/deudas-b13'
import { NIVEL_DE_LA_NOCHE, VUELTA } from '../lightArc'
import { EMISION_EN_LA_NOCHE, emisionDelLogoEn, escribirEmisionDelLogo } from '../logoEmision'
import { brilloDeLaNocheEn } from '../particleGlow'
import { RIM_NIGHT_LEVEL } from '../probeLighting'
import { INK_COLOR, INK_ROUGHNESS } from '../probeScene'
import { levelAt } from '@/app/probe-escena/__tests__/shading'
import { muestrearCuadro, percentil, vistaEn } from './cuadro'
import { equivaleSinEmision, shadeConEmision } from './logoEmitido'
import { muestrearLogo } from './s10-logo'
import { ESCENA_REAL, TRANSPARENTES, gris, percentilDe } from './s10-logo-lectura'

const RAIZ = process.cwd()
const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8')

/**
 * El fuente SIN comentarios. Los detectores de abajo preguntan por CÓDIGO —«¿el
 * módulo escribe un color?», «¿abre un segundo lazo?»— y la prosa de este repo
 * nombra las dos cosas para explicar por qué NO están. Un detector que lea la
 * prosa se pone rojo por hablar del tema, que es el modo de falla contrario al
 * que interesa.
 */
const codigo = (rel: string): string =>
  leer(rel)
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\r\n]*/g, '$1 ')

const ASPECTO = 16 / 9
const AA = 4.5
/** La tinta clara de las secciones invertidas: el papel dado vuelta (`theme-develop.css`). */
const TINTA_CLARA = '#F7F7F5'

/**
 * LA BANDA DE LA REFERENCIA, medida y no citada: `scripts-b13/b-referencia.ts`
 * recorrió nk.studio a 1920 en 44 paradas (`outputs/b13/referencia-emision-nk-1920.json`).
 * Su objeto aparece en 21, es MÁS CLARO que su sala en 20 de esas 21, y el
 * contraste de su barra contra su sala va de 1,92:1 a 7,90:1 con mediana 2,9:1.
 */
const REFERENCIA = { min: 1.92, mediana: 2.9, max: 7.9 } as const

/** Los valores en pantalla del logo en un progreso, con la emisión que le toca. */
function logoEn(progreso: number, emisiva?: number): { readonly p50: number; readonly mejor: number; readonly peor: number } {
  const m = muestrearLogo(progreso, ASPECTO, ESCENA_REAL, 300, 220, 2.6, undefined, emisiva)
  const o = m.valor.slice()
  o.sort()
  return { p50: percentilDe(o, 0.5), mejor: percentilDe(o, 1), peor: percentilDe(o, 0) }
}

const salaEn = (progreso: number): number =>
  percentil(muestrearCuadro(progreso, vistaEn(progreso), ESCENA_REAL, 200, 113).sinLogo, 0.5)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · EL CONTROL DE EQUIVALENCIA — con la emisiva en 0, la cadena es la de S7')

const control = equivaleSinEmision()
afirmar(control.casos > 3000, `la malla no está vacía: ${control.casos} casos (5 normales × 5 profundidades × 3 gobos × 2 cielos × 21 progresos)`)
afirmarIgual(
  control.discrepancias.length,
  0,
  '  y `shadeConEmision(..., 0)` devuelve EXACTAMENTE `shadeSurface` en todos: no «parecido», el mismo doble',
)
controlPositivo(
  'el comparador no compara un número consigo mismo: con emisiva ≠ 0 la cadena SÍ se mueve',
  0.16,
  (e: number) => shadeConEmision(INK_COLOR, [0, 0, 1], vistaEn(0.5), 20, 1, 1, e) === shadeConEmision(INK_COLOR, [0, 0, 1], vistaEn(0.5), 20, 1, 1, 0),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · LA CURVA — cero con luz, el tope en la noche, y la banda del polvo')

afirmarIgual(emisionDelLogoEn(1), 0, 'a mediodía no emite: cero exacto, no un casi cero')
afirmarIgual(emisionDelLogoEn(RIM_NIGHT_LEVEL), 0, `  y en la frontera de la noche (${RIM_NIGHT_LEVEL}) tampoco: la misma que el contraluz y que las motas`)
afirmarIgual(emisionDelLogoEn(0.643), 0, '  ni en la mañana del diferencial y del Cierre (0,643)')
afirmarIgual(emisionDelLogoEn(NIVEL_DE_LA_NOCHE), EMISION_EN_LA_NOCHE, `en la noche (${NIVEL_DE_LA_NOCHE}) emite el tope: ${EMISION_EN_LA_NOCHE} lineal`)
afirmarIgual(emisionDelLogoEn(0), EMISION_EN_LA_NOCHE, '  y por debajo de la noche no pasa del tope')
const niveles = Array.from({ length: 201 }, (_, i) => 1 - i / 200)
const curva = niveles.map(emisionDelLogoEn)
afirmar(curva.every((v, i) => i === 0 || v >= curva[i - 1]), 'la curva sube monótona a medida que la luz baja: nunca parpadea')
afirmar(
  niveles.every((n) => Math.abs(emisionDelLogoEn(n) - brilloDeLaNocheEn(n) * EMISION_EN_LA_NOCHE) < 1e-12),
  'es la MISMA rampa del brillo de las motas, escalada: el logo y el polvo se encienden juntos, con las mismas dos constantes',
  'ninguna de las dos escribe un literal de nivel: las dos importan `NIVEL_DE_LA_NOCHE` y `RIM_NIGHT_LEVEL`',
)
controlPositivo('la curva no es un cero constante: en la noche se mueve', NIVEL_DE_LA_NOCHE, (n: number) => emisionDelLogoEn(n) === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · CERO CON LUZ ⇒ NADA DE LO MEDIDO SE MOVIÓ — sobre las seis anclas')

for (const f of TRANSPARENTES) {
  const nivel = levelAt(f.llenaDesde)
  const emision = emisionDelLogoEn(nivel)
  const esDeNoche = emision > 0
  if (esDeNoche) {
    afirmar(
      f.id === 'trabajos',
      `${f.id.padEnd(16)} p=${f.llenaDesde.toFixed(4)} — la ÚNICA sección con emisión es Trabajos: la noche del arco`,
      `nivel ${nivel.toFixed(4)} → emisiva ${emision.toFixed(4)}`,
    )
    continue
  }
  const conEmision = logoEn(f.llenaDesde)
  const sinNada = logoEn(f.llenaDesde, 0)
  afirmar(
    conEmision.p50 === sinNada.p50 && conEmision.mejor === sinNada.mejor && conEmision.peor === sinNada.peor,
    `${f.id.padEnd(16)} p=${f.llenaDesde.toFixed(4)} — emisión 0 y el logo vale lo MISMO que antes de B13, bit a bit`,
    `nivel ${nivel.toFixed(4)} · logo ${sinNada.p50.toFixed(1)} de 255`,
  )
}
controlPositivo(
  'el comparador vería un movimiento: con una emisiva puesta a mano, el hero cambia',
  0.1,
  (e: number) => logoEn(0, e).p50 === logoEn(0, 0).p50,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · LO QUE COMPRA — la noche de Trabajos, contra la vara de la referencia')

const P_TRABAJOS = 0.5
const salaDeTrabajos = salaEn(P_TRABAJOS)
const antes = logoEn(P_TRABAJOS, 0)
const despues = logoEn(P_TRABAJOS)
const cAntes = razonDeContraste(gris(antes.p50), gris(salaDeTrabajos))
const cDespues = razonDeContraste(gris(despues.p50), gris(salaDeTrabajos))
afirmar(
  cAntes < 1.5,
  'ANTES el logo era indistinguible de su sala en la noche: un agujero en el campo de estrellas',
  `logo ${antes.p50.toFixed(1)} sobre sala ${salaDeTrabajos.toFixed(1)} = ${cAntes.toFixed(2)}:1`,
)
afirmar(
  cDespues >= REFERENCIA.min && cDespues <= REFERENCIA.max,
  `DESPUÉS cae adentro de la banda de la referencia (${REFERENCIA.min}:1 a ${REFERENCIA.max}:1, mediana ${REFERENCIA.mediana}:1)`,
  `logo ${despues.p50.toFixed(1)} sobre sala ${salaDeTrabajos.toFixed(1)} = ${cDespues.toFixed(2)}:1`,
)
afirmar(
  despues.p50 > salaDeTrabajos,
  '  y es MÁS CLARO que su sala, como el de la referencia en 20 de sus 21 paradas: el objeto emite, no absorbe',
)
const claraEncima = razonDeContraste(TINTA_CLARA, gris(despues.mejor))
afirmar(
  claraEncima >= AA,
  'LA RESTRICCIÓN DE TRABAJOS: es la única invertida que deja ver la sala, y su tinta CLARA encima sigue pasando AA',
  `${claraEncima.toFixed(2)}:1 contra ${AA}:1 — por encima de 0,21 de emisiva se cae, y por eso el tope es ${EMISION_EN_LA_NOCHE}`,
)
const oscuraEncima = razonDeContraste(TINTA_HEX, gris(despues.peor))
console.log(
  `  y la tinta OSCURA sobre el logo en esa pose pasa de ${razonDeContraste(TINTA_HEX, gris(antes.peor)).toFixed(2)}:1 a ` +
    `${oscuraEncima.toFixed(2)}:1 — Trabajos no la usa, pero es el número que dice de qué lado empuja la emisión`,
)
controlPositivo(
  'el medidor de la tinta clara sabe reprobar: contra un logo a emisiva 0,45 no llega a AA',
  0.45,
  (e: number) => razonDeContraste(TINTA_CLARA, gris(logoEn(P_TRABAJOS, e).mejor)) >= AA,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · LO QUE CUESTA — el cruce de la vuelta, declarado con su número')

let peorDeLaVuelta = { progreso: 0, contraste: Infinity }
for (let p = VUELTA.desde; p <= VUELTA.hasta + 1e-9; p += 0.0025) {
  const c = razonDeContraste(gris(logoEn(p).p50), gris(salaEn(p)))
  if (c < peorDeLaVuelta.contraste) peorDeLaVuelta = { progreso: p, contraste: c }
}
deudaDeclarada(
  peorDeLaVuelta.contraste >= 1.5,
  `EN LA VUELTA el logo cruza el valor de la sala y se pierde por un instante (${DEUDAS_DE_B13.cruceDeLaVuelta.numero})`,
  `D-B13.1: ${peorDeLaVuelta.contraste.toFixed(2)}:1 en p=${peorDeLaVuelta.progreso.toFixed(4)}, adentro de la vuelta ` +
    `(${VUELTA.desde.toFixed(4)}–${VUELTA.hasta}) — la pantalla en la que Trabajos se va y Servicios, papel OPACO, entra desde el pie`,
  'es TOPOLÓGICO y no un defecto de calibración: para pasar de oscuro-sobre-claro a claro-sobre-oscuro el valor del logo tiene ' +
    'que cruzar el de la sala, y en el cruce el contraste es 1. Lo único que se elige es DÓNDE y CUÁNTO DURA. Hoy dura ~0,014 de ' +
    'progreso (~0,34 pantallas de scroll) y cae detrás del panel opaco que entra. La palanca para acortarlo es una rampa más ' +
    'empinada que la de las motas, y el precio es un encendido que se lee como parpadeo: se deja a juicio del humano.',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · CERO COLOR y EL CABLEADO')

const material = new THREE.MeshStandardMaterial({ color: INK_COLOR, roughness: INK_ROUGHNESS, metalness: 0 })
const colorAntes = material.color.getHex()
escribirEmisionDelLogo(material, NIVEL_DE_LA_NOCHE)
afirmar(
  material.emissive.r === material.emissive.g && material.emissive.g === material.emissive.b,
  'lo que se escribe es UN escalar: los tres canales quedan iguales. Un logo que emite emite BLANCO',
  `emissive = ${material.emissive.r.toFixed(4)} en los tres`,
)
afirmarIgual(material.emissive.r, EMISION_EN_LA_NOCHE, '  y vale exactamente el tope de la curva: `setScalar` no convierte de espacio')
afirmarIgual(material.color.getHex(), colorAntes, '  y no toca nada más del material: el albedo sigue siendo la tinta de siempre')
escribirEmisionDelLogo(material, 1)
afirmarIgual(material.emissive.r, 0, '  y a pleno sol vuelve a cero: el material es el de antes de B13')
escribirEmisionDelLogo(null, NIVEL_DE_LA_NOCHE)
afirmar(true, 'con el material todavía sin montar (`null`) no tira: el canvas monta por partes')

const modulo = codigo('src/app/v3/_lib/escena/logoEmision.ts')
afirmar(
  !/#[0-9a-fA-F]{3,8}/.test(modulo) && !/setRGB|setHex|new THREE\.Color/.test(modulo) && /setScalar/.test(modulo),
  'el CÓDIGO del módulo no escribe un solo color: ni un hex, ni un `setRGB`, ni un `Color` nuevo — sólo `setScalar`',
)

const rig = codigo('src/app/v3/_lib/escena/OrbitRig.tsx')
afirmar(
  /escribirEmisionDelLogo\(logoMaterialRef\.current, arc\.level\)/.test(rig),
  '`OrbitRig` escribe la emisión desde el nivel del arco, en el mismo `useFrame` que alimenta a `applyLightRig`',
)
afirmar(
  rig.indexOf('applyLightRig(targets, lightInput, scratch.lightCache)') < rig.indexOf('escribirEmisionDelLogo('),
  '  y DESPUÉS de aplicar la luz: la sala, el polvo y la pieza salen del mismo `arc.level` en el mismo cuadro',
)
afirmar(
  rig.indexOf('BRILLO_DE_LA_NOCHE.uNoche.value') < rig.indexOf('escribirEmisionDelLogo('),
  '  y al lado del brillo de las motas, que es la otra mitad de la misma noche',
)
const logo = codigo('src/app/v3/_lib/escena/ProbeLogo.tsx')
afirmar(
  /materialRef\.current = material/.test(logo) && /materialRef\.current = null/.test(logo),
  '`ProbeLogo` publica su material por el ref y lo devuelve a `null` al desmontar: el rig no le escribe a un material liberado',
)
afirmar(!/useFrame/.test(logo), '  y no abre un segundo lazo: un `useFrame` propio leería el nivel un cuadro tarde')
controlPositivo('el detector de cableado no está ciego: NO encuentra la escritura en un archivo que no la tiene', modulo, (fuente: string) =>
  /escribirEmisionDelLogo\(logoMaterialRef\.current, arc\.level\)/.test(fuente),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · EL PRELOADER NO SE TOCA — su logo es otro objeto, con su propio material')

const canvasDelIntro = codigo('src/components/layout/home-intro/IntroLogoCanvas.tsx')
const rigDelIntro = codigo('src/components/layout/home-intro/introRig.ts')
const sombraDelIntro = codigo('src/components/layout/home-intro/introShading.ts')
for (const [nombre, fuente] of [
  ['IntroLogoCanvas.tsx', canvasDelIntro],
  ['introRig.ts', rigDelIntro],
  ['introShading.ts', sombraDelIntro],
] as const) {
  afirmar(
    !/logoEmision|EMISION_EN_LA_NOCHE|emisionDelLogoEn|escribirEmisionDelLogo/.test(fuente),
    `${nombre} no importa nada de \`logoEmision.ts\`: el cambio no lo alcanza`,
  )
}
afirmar(
  /solveEmissiveForSrgb/.test(canvasDelIntro) && /shading\.emissiveMix/.test(canvasDelIntro),
  '  y su emisiva sigue saliendo de su propia bisección contra `NeutralToneMapping` (`introShading.ts`) y de `sampleInkShading`',
)
afirmar(
  /emissiveMix: 1 - t/.test(rigDelIntro),
  '  y su relevo sigue aterrizando en emisiva CERO: en `reveal` 1 el logo del intro está iluminado, no emitiendo',
  'que es exactamente el material de la escena a pleno sol — los dos coinciden en el cuadro del relevo, como antes de B13',
)
controlPositivo('el detector de importaciones no está ciego: SÍ las encuentra donde están', codigo('src/app/v3/_lib/escena/OrbitRig.tsx'), (fuente: string) =>
  !/logoEmision|escribirEmisionDelLogo/.test(fuente),
)

cerrar('s22-emision.invariant')
