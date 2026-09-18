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

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { NIVEL_DE_LA_NOCHE } from '../lightArc'
import { EMISION_EN_LA_NOCHE, emisionDelLogoEn, escribirEmisionDelLogo } from '../logoEmision'
import { brilloDeLaNocheEn } from '../particleGlow'
import { RIM_NIGHT_LEVEL } from '../probeLighting'
import { INK_COLOR, INK_ROUGHNESS } from '../probeScene'
import { vistaEn } from './cuadro'
import { equivaleSinEmision, shadeConEmision } from './logoEmitido'

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
