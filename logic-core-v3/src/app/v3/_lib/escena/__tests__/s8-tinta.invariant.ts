/**
 * INVARIANTE — SITIO-S8 · EL CONTRASTE DE LA TINTA CONTRA LA ESCENA REAL.
 *
 *     npx tsx src/app/v3/_lib/escena/__tests__/s8-tinta.invariant.ts
 *     npm run test:s8-tinta
 *
 * ── LA PREGUNTA, Y POR QUÉ NO ESTABA CONTESTADA ────────────────────────────
 *
 * Los contrastes de los paneles transparentes se midieron contra el MARCADOR DE
 * POSICIÓN —`s6-contraste.invariant.ts` §2, **13,62:1 en el peor caso**—, que es
 * un canvas plano que pinta dos tokens del sistema. Ese archivo ya avisa por
 * escrito que la escena real no hereda ese número, y tiene razón: **la sala real
 * es un gradiente con bandas de celosía, moiré y partículas, y se apaga al
 * atardecer.** Acá se mide contra ESA escena.
 *
 * ── EL MÉTODO, declarado antes que cualquier cifra ─────────────────────────
 *
 * - **Qué se mide:** la razón WCAG 2.x entre `--color-tinta` (`TINTA_HEX`,
 *   `#111111`, el color del texto de los paneles) y el valor del cuadro de la
 *   escena que le queda detrás. `razonDeContraste` es la del arnés del repo.
 * - **Qué región:** el cuadro ENTERO, 16:9, **menos los píxeles que son la tinta
 *   del logo 3D**. Sobre el logo el contraste es ~1:1 por construcción —los dos
 *   son negro— y por eso la composición pone el contenido del lado que el logo
 *   deja libre (§2.1). Descontarlo no es aflojar la medición: es medirla donde
 *   la pregunta existe. Cuánto cuadro ocupa el logo se publica pose por pose.
 * - **Cuántas muestras:** 200 × 113 = 22.600 rayos por pose —la misma grilla con
 *   la que S11 publicó sus seis valores medios— y 160 × 90 = 14.400 en el
 *   barrido del recorrido, que es una curva y no una cifra.
 * - **Qué estadístico:** se publican **mínimo, p01, p05 y mediana**. El mínimo es
 *   el peor caso literal (una línea de la envolvente); p05 es el peor caso
 *   ROBUSTO, que es el que decide si un párrafo es legible. Se afirma sobre el
 *   mínimo, que es el más exigente de los cuatro.
 * - **Qué NO cubre:** todo lo que `cuadro.ts` declara en su cabecera — la cámara
 *   de `harness.ts` (§7.15, hasta 1,28% del ancho del cuadro), las partículas
 *   (bajan el valor medio de 0 a 8 puntos, o sea que **empujan el contraste
 *   hacia abajo**), la sombra proyectada del logo y el especular. **Las cifras
 *   de acá son un techo, no un piso.**
 *
 * ── ⚠️ EL `noCorre` SE FUE: SITIO-S9 ANCLÓ EL MAPEO Y LA CIFRA CAMBIÓ ──────
 *
 * SITIO-S8 dejó la afirmación del diferencial fuera de ventana —**no en rojo y
 * no en verde**— porque la sección caía donde caía por un mapeo declarado
 * PROVISIONAL. Con el anclaje construido (§7.2) la afirmación se hace: **el
 * diferencial llena el cuadro sobre la pose `demos`, en p=0,750.**
 *
 * ⚠ **Y hay una segunda cifra que NO se afirma, y el porqué es la regla 13.** La
 * ventana en la que la sección SE VE termina en p=1,000, en penumbra — y eso no
 * lo decide el mapeo: es la anteúltima sección y la última mide una pantalla, así
 * que su borde sale del cuadro en el final del scroll con **cualquier** mapeo
 * monótono. §5 lo afirma y publica la cola con su dueño: §7.4.
 */

import { ANCLAJE } from '../anclaje'
import { CELOSIA_BAR, celosiaSkyFactor } from '../probeCelosia'
import { MOIRE_MISMATCH } from '../probeMoire'
import { MAPEO_DE_LAS_SECCIONES, pantallaDeProgreso } from '../recorrido'
import { TINTA_HEX } from '../../superficies'
import { sampleFrame } from '@/app/probe-escena/__tests__/frameProbe'
import { afirmar, cerrar, controlPositivo, razonDeContraste, titulo } from '../../__tests__/afirmar'
import { grisHex, muestrearCuadro, percentil, vistaEn } from './cuadro'
import { MAPEO_PROVISIONAL_HISTORICO } from './tablas'

/** La escena real: envolvente puesta, desajuste del panel y celosía con su cielo. */
const ESCENA_REAL = {
  backdrop: true,
  mismatch: MOIRE_MISMATCH,
  celosia: { bar: CELOSIA_BAR, sky: celosiaSkyFactor(CELOSIA_BAR) },
} as const

/** AA para texto normal. AAA es 7:1 y se publica, no se afirma. */
const AA = 4.5
const AAA = 7

/** Las seis poses del recorrido, con el `at` que S11 usa para cada una. */
const POSES: readonly (readonly [string, number])[] = [
  ['hero', 0],
  ['quiénes somos', 0.375],
  ['números', 0.5],
  ['trabajos', 0.625],
  ['demos', 0.75],
  ['cierre', 0.95],
]

const contrasteEn = (progreso: number, cuantil: number, columnas = 160, filas = 90): number => {
  const h = muestrearCuadro(progreso, vistaEn(progreso), ESCENA_REAL, columnas, filas)
  return razonDeContraste(TINTA_HEX, grisHex(percentil(h.sinLogo, cuantil)))
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · EL CONTROL DE EQUIVALENCIA — este muestreador ES el de S10/S11')

for (const [nombre, at] of POSES) {
  const vista = vistaEn(at)
  const mio = muestrearCuadro(at, vista, ESCENA_REAL, 200, 113)
  const suyo = sampleFrame(at, vista, ESCENA_REAL, 200, 113)
  afirmar(
    Math.abs(mio.media - suyo.mean) < 1e-9,
    `en "${nombre}" la media coincide con sampleFrame hasta la novena cifra`,
    `${mio.media.toFixed(4)} contra ${suyo.mean.toFixed(4)}`,
  )
}

controlPositivo(
  'y el comparador vería una divergencia: no está comparando un número consigo mismo',
  0.5,
  (desplazamiento: number) => {
    const vista = vistaEn(0)
    const mio = muestrearCuadro(0, vista, ESCENA_REAL, 60, 34)
    const suyo = sampleFrame(0, vista, ESCENA_REAL, 60, 34)
    return Math.abs(mio.media + desplazamiento - suyo.mean) < 1e-9
  },
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · LA TABLA — la tinta #111111 contra la escena real, pose por pose')

console.log('  pose            %logo    mín    p01    p05    p50  |  C(mín)  C(p05)  C(p50)')
for (const [nombre, at] of POSES) {
  const h = muestrearCuadro(at, vistaEn(at), ESCENA_REAL, 200, 113)
  const q = (x: number) => percentil(h.sinLogo, x)
  const c = (x: number) => razonDeContraste(TINTA_HEX, grisHex(q(x))).toFixed(2)
  console.log(
    `  ${nombre.padEnd(14)} ${((h.enLogo / h.total) * 100).toFixed(1).padStart(5)}%` +
      ` ${q(0).toFixed(1).padStart(6)} ${q(0.01).toFixed(1).padStart(6)}` +
      ` ${q(0.05).toFixed(1).padStart(6)} ${q(0.5).toFixed(1).padStart(6)}  | ` +
      ` ${c(0).padStart(6)}  ${c(0.05).padStart(6)}  ${c(0.5).padStart(6)}`,
  )
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · LA CURVA — el contraste cae monótono con el atardecer, y dónde cruza AA')

/**
 * Es una PROPIEDAD DE LA ESCENA y no del mapeo: vale sea cual sea la función que
 * ate el scroll al progreso, porque sólo depende del progreso. Por eso ésta sí
 * se afirma.
 */
const bisecar = (umbral: number): number => {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 16; i += 1) {
    const m = (lo + hi) / 2
    if (contrasteEn(m, 0) >= umbral) lo = m
    else hi = m
  }
  return (lo + hi) / 2
}

const cruceAA = bisecar(AA)
const cruceAAA = bisecar(AAA)
console.log(
  `  el peor píxel del cuadro cruza AA (${AA}:1) en p=${cruceAA.toFixed(4)} y AAA (${AAA}:1) en p=${cruceAAA.toFixed(4)}`,
)

afirmar(
  contrasteEn(0, 0) > contrasteEn(1, 0),
  'el contraste del peor píxel baja de punta a punta del recorrido',
  `${contrasteEn(0, 0).toFixed(2)}:1 en p=0 → ${contrasteEn(1, 0).toFixed(2)}:1 en p=1`,
)
afirmar(
  cruceAA > 0.85 && cruceAA < 0.9,
  `y cruza AA en la última pantalla del recorrido, no antes`,
  `p=${cruceAA.toFixed(4)} — o sea que TODO el tramo de cierre está abajo de 4,5:1`,
)
afirmar(
  contrasteEn(0.87, 0) >= AA && contrasteEn(0.89, 0) < AA,
  '  el umbral es real en las dos direcciones: pasa en p=0,87 y no pasa en p=0,89',
  `${contrasteEn(0.87, 0).toFixed(2)}:1 contra ${contrasteEn(0.89, 0).toFixed(2)}:1`,
)
controlPositivo(
  'razonDeContraste sabe reprobar: la tinta contra sí misma no pasa AA',
  TINTA_HEX,
  (hex: string) => razonDeContraste(TINTA_HEX, hex) >= AA,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · LAS DOS SECCIONES TRANSPARENTES, con el ANCLAJE puesto')

const transparentes = MAPEO_DE_LAS_SECCIONES.filter((f) => f.dejaVerLaEscena)
afirmar(
  transparentes.length === 2,
  'son dos y salen de la tabla del home',
  transparentes.map((f) => f.id).join(' · '),
)

const bordesDe = (f: (typeof transparentes)[number]): readonly number[] => [
  f.seVeDesde,
  f.llenaDesde,
  f.llenaHasta,
  f.seVeHasta,
]

console.log('  sección           se ve en p=[…]        llena   C(mín)  C(p05)  C(p50)   peor de la ventana')
for (const fila of transparentes) {
  const peor = Math.min(...bordesDe(fila).map((p) => contrasteEn(p, 0)))
  console.log(
    `  ${fila.id.padEnd(16)} [${fila.seVeDesde.toFixed(3)}, ${fila.seVeHasta.toFixed(3)}]` +
      `   ${fila.llenaDesde.toFixed(3)}   ${contrasteEn(fila.llenaDesde, 0).toFixed(2).padStart(6)}` +
      `  ${contrasteEn(fila.llenaDesde, 0.05).toFixed(2).padStart(6)}` +
      `  ${contrasteEn(fila.llenaDesde, 0.5).toFixed(2).padStart(6)}   ${peor.toFixed(2)}:1`,
  )
}

/**
 * ⚠ **LA RAZÓN DE ESTA AFIRMACIÓN SE CAYÓ CON `hero · sostén` (V3-B).** Decía que
 * la ventana del Hero era un SOSTÉN y que por eso *«el cuadro no cambia en toda
 * la ventana y el peor caso es el mismo en los cuatro bordes»*. V3-B sacó ese
 * keyframe: el cuadro **sí** cambia —la cámara va de azimut 0°/altura
 * 6,40/distancia 19,00 a 59,4°/1,83/15,57 entre p=0 y p=0,125— así que el
 * `Math.min` de abajo dejó de ser una formalidad. El peor caso bajó de **9,73:1 a
 * 8,71:1**: es lo que cuesta que la escena se mueva desde el primer píxel.
 */
const hero = transparentes[0]
const heroPeor = Math.min(...bordesDe(hero).map((p) => contrasteEn(p, 0)))
afirmar(
  heroPeor >= AA,
  'HERO — la tinta pasa AA sobre la escena real en toda la ventana en que el Hero se ve',
  `peor caso ${heroPeor.toFixed(2)}:1 · también pasa AAA (${AAA}:1): ${heroPeor >= AAA ? 'sí' : 'no'}`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · 🔴 EL DIFERENCIAL — la cifra que decide §7.29, y la que no la decide')

const diferencial = transparentes[1]
const difLlena = contrasteEn(diferencial.llenaDesde, 0)
const difP05 = contrasteEn(diferencial.llenaDesde, 0.05)
const difMedia = contrasteEn(diferencial.llenaDesde, 0.5)

/**
 * ⚠️ **ESTA ES LA AFIRMACIÓN QUE SITIO-S8 NO PODÍA HACER.** Su `noCorre` decía,
 * con todas las letras, que el número era *downstream* de un mapeo provisional y
 * que **cualquier mapeo que dejara al diferencial abajo de p=0,878 lo resolvía
 * sin tocar la escena**. El anclaje lo deja en p=0,750. Es la opción (a) que la
 * parada de SITIO-S8 eligió, y se cierra con el número, no con el argumento.
 */
const viejo = MAPEO_PROVISIONAL_HISTORICO.find((f) => f.id === diferencial.id)
if (viejo === undefined) throw new Error('el mapeo histórico no tiene al diferencial')
const difViejo = contrasteEn(viejo.llenaDesde, 0)

afirmar(
  difLlena >= AA,
  `POR QUÉ DEVELOP — la tinta PASA AA donde la sección llena el cuadro (p=${diferencial.llenaDesde.toFixed(3)})`,
  `${difLlena.toFixed(2)}:1 (mín) · ${difP05.toFixed(2)}:1 (p05) · ${difMedia.toFixed(2)}:1 (mediana), contra ${AA}:1`,
)
afirmar(
  diferencial.llenaDesde < cruceAA,
  '  y no por poco: llena el cuadro ANTES del cruce de AA de la escena',
  `p=${diferencial.llenaDesde.toFixed(4)} contra el cruce en p=${cruceAA.toFixed(4)}`,
)
afirmar(
  difLlena > difViejo,
  `  contra el provisional, que la ponía en p=${viejo.llenaDesde.toFixed(3)}`,
  `${difViejo.toFixed(2)}:1 → ${difLlena.toFixed(2)}:1 — la sección se movió ${(viejo.llenaDesde - diferencial.llenaDesde).toFixed(3)} de progreso hacia atrás`,
)
afirmar(
  difMedia >= AAA,
  '  y la mediana del cuadro pasa AAA, que el provisional no alcanzaba ni en AA',
  `${difMedia.toFixed(2)}:1 contra ${AAA}:1`,
)

/**
 * ⚠️ **LA COLA QUE NO SE AFIRMA, Y POR QUÉ NO ES AFLOJAR (regla 13).**
 *
 * La ventana en la que el diferencial SE VE termina en p=1,000, donde el peor
 * píxel da 2,34:1. Podría parecer que la afirmación de arriba se hizo sobre el
 * punto cómodo. No lo es, y la razón se afirma abajo: el borde inferior de
 * `por-que-develop` sale del cuadro **exactamente en el final del scroll**, así
 * que su ventana termina en p=1,000 **con cualquier mapeo monótono que complete
 * el recorrido**, y un criterio que ningún mapeo puede cumplir no distingue un
 * mapeo de otro. Lo que SÍ controla el mapeo es dónde cae la sección. Lo que
 * queda —qué pasa mientras el panel se va y el Cierre lo tapa— es **§7.4**, la
 * reserva (b) que la parada de SITIO-S8 ya había nombrado.
 */
const finDeLaVentana = contrasteEn(diferencial.seVeHasta, 0)
const cruceEnPantallas = pantallaDeProgreso(cruceAA)
const geometria = ANCLAJE.geometria.find((g) => g.id === diferencial.id)
if (geometria === undefined) throw new Error('la geometría no tiene al diferencial')
const enCuadroAlCruzar = Math.max(0, Math.min(1, geometria.hastaPantalla - cruceEnPantallas))

afirmar(
  geometria.hastaPantalla === ANCLAJE.pantallasDeScroll,
  'LA COLA NO ES DEL MAPEO: el diferencial sale del cuadro en el final del scroll, por geometría',
  `su borde inferior está en la pantalla ${geometria.hastaPantalla} de ${ANCLAJE.pantallasDeScroll} — con cualquier mapeo, su ventana termina en p=1`,
)
controlPositivo(
  'y el detector distingue una sección que NO termina con el scroll',
  'hero',
  (id: string) => {
    const g = ANCLAJE.geometria.find((f) => f.id === id)
    return g !== undefined && g.hastaPantalla === ANCLAJE.pantallasDeScroll
  },
)
console.log(
  `  la cola, publicada con su dueño (§7.4): la tinta cruza AA en p=${cruceAA.toFixed(4)}, que es la pantalla ` +
    `${cruceEnPantallas.toFixed(3)} de ${ANCLAJE.pantallasDeScroll}. Ahí el diferencial todavía ocupa el ` +
    `${(enCuadroAlCruzar * 100).toFixed(1)}% del cuadro —el resto ya es el Cierre, que es opaco— y al terminar de salir ` +
    `da ${finDeLaVentana.toFixed(2)}:1. El mapeo no puede moverlo; componer la salida de la escena, sí.`,
)

cerrar('s8-tinta.invariant')
