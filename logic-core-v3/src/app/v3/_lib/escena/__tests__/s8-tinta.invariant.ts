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
 * ── ⚠️ POR QUÉ HAY UN `noCorre` Y NO UN ROJO ───────────────────────────────
 *
 * Porque la sección donde falla —`por-que-develop`— cae donde cae por el mapeo
 * **PROVISIONAL** de `recorrido.ts`, y el mapeo del recorrido al scroll está
 * declarado ABIERTO desde S9 (§7.2). Poner esa afirmación en rojo sería poner en
 * rojo el gate del repo por una decisión que este sprint no tiene permiso de
 * tomar; ponerla en verde sería peor. `noCorre` es la tercera salida del arnés:
 * **imprime que no corrió, por qué, y con qué número**, y hace que el resumen
 * diga en voz alta que este verde es parcial.
 */

import { CELOSIA_BAR, celosiaSkyFactor } from '../probeCelosia'
import { MOIRE_MISMATCH } from '../probeMoire'
import { MAPEO_PROVISIONAL } from '../recorrido'
import { TINTA_HEX } from '../../superficies'
import { sampleFrame } from '@/app/probe-escena/__tests__/frameProbe'
import {
  afirmar,
  cerrar,
  controlPositivo,
  noCorre,
  razonDeContraste,
  titulo,
} from '../../__tests__/afirmar'
import { grisHex, muestrearCuadro, percentil, vistaEn } from './cuadro'

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
titulo('4 · LAS DOS SECCIONES TRANSPARENTES, con el mapeo PROVISIONAL')

const transparentes = MAPEO_PROVISIONAL.filter((f) => f.dejaVerLaEscena)
afirmar(transparentes.length === 2, 'son dos y salen de la tabla del home', transparentes.map((f) => f.id).join(' · '))

for (const fila of transparentes) {
  const puntos = [fila.seVeDesde, fila.llenaDesde, fila.llenaHasta, fila.seVeHasta]
  const peor = Math.min(...puntos.map((p) => contrasteEn(p, 0)))
  const peorP05 = Math.min(...puntos.map((p) => contrasteEn(p, 0.05)))
  console.log(
    `  ${fila.id.padEnd(16)} se ve en p=[${fila.seVeDesde.toFixed(3)}, ${fila.seVeHasta.toFixed(3)}]` +
      ` · llena el cuadro en p=${fila.llenaDesde.toFixed(3)}` +
      ` · peor caso ${peor.toFixed(2)}:1 (mín) · ${peorP05.toFixed(2)}:1 (p05)`,
  )
}

const hero = transparentes[0]
const heroPeor = Math.min(
  ...[hero.seVeDesde, hero.llenaDesde, hero.llenaHasta, hero.seVeHasta].map((p) => contrasteEn(p, 0)),
)

/**
 * El Hero SÍ se afirma, y no depende del provisional: **cualquier** mapeo
 * monótono que arranque en 0 pone al Hero adentro del tramo `hero` de la
 * coreografía, que además es un sostén —la cámara no se mueve su pantalla
 * entera—. La afirmación vale para todos ellos.
 */
afirmar(
  heroPeor >= AA,
  'HERO — la tinta pasa AA sobre la escena real en toda la ventana en que el Hero se ve',
  `peor caso ${heroPeor.toFixed(2)}:1 · también pasa AAA (${AAA}:1): ${heroPeor >= AAA ? 'sí' : 'no'}`,
)

const diferencial = transparentes[1]
const difLlena = contrasteEn(diferencial.llenaDesde, 0)
const difP05 = contrasteEn(diferencial.llenaDesde, 0.05)
const difMedia = contrasteEn(diferencial.llenaDesde, 0.5)

/**
 * ⚠️ **LA DECISIÓN YA SE TOMÓ, Y ES POR QUÉ ESTO SIGUE EN `noCorre` Y NO EN ROJO.**
 *
 * El humano decidió en la parada de SITIO-S8: **se resuelve por el MAPEO**, que
 * es la opción (a) de la lista de abajo. El razonamiento es que este número es
 * *downstream* de un mapeo que este mismo sprint declaró provisional y mal en
 * tres formas — o sea que arreglarlo acá sería tapar el síntoma de otra cosa. Y
 * el número lo permite: el cruce está en p=0,878 y **cualquier mapeo que deje el
 * diferencial abajo de ese progreso lo resuelve sin tocar la escena**.
 *
 * Las cuatro salidas, con la decisión al lado, para que nadie las vuelva a
 * recorrer:
 *
 *   (a) **MOVER LA SECCIÓN EN EL RECORRIDO** — ✅ **ELEGIDA.** Depende de que se
 *       decida el mapeo (§7.2). No toca la escena, no toca las superficies.
 *   (b) **COMPONER LA SALIDA Y LA VUELTA DE LA ESCENA** (§7.4) — la reserva: si
 *       después del mapeo sigue fallando, ésta es la salida. §2.4 ya la pide con
 *       todas las letras («la escena se apaga después del cierre y vuelve para el
 *       diferencial»), y si al volver arranca en una pose clara el problema
 *       desaparece por construcción.
 *   (c) pasar `por-que-develop` a `papel-opaco` — ❌ **DESCARTADA**: mata uno de
 *       los tres momentos de escena, y el recorrido de superficies fue una
 *       decisión deliberada (SITIO-S5 §0.2).
 *   (d) aclarar el cierre del arco de luz — ❌ **DESCARTADA acá**: es §7.14, con
 *       sus cuatro palancas ya analizadas, y es otra cosa.
 *   (·) un velo o una superficie intermedia detrás del texto — ❌ **NUNCA.**
 */
noCorre(
  `POR QUÉ DEVELOP — la tinta NO pasa AA con el mapeo provisional (${difLlena.toFixed(2)}:1)`,
  'el mapeo del recorrido al scroll está SIN DECIDIR (§7.2 de DIRECCION-ESCENA.md) y este ' +
    'sprint eligió la recta más conservadora que pudo defender. Afirmar AA acá sería afirmar ' +
    'ESE provisional, no una propiedad del código. ' +
    `MEDIDO: con la recta, "${diferencial.id}" llena el cuadro en p=${diferencial.llenaDesde.toFixed(3)} ` +
    `y ahí la tinta da ${difLlena.toFixed(2)}:1 (mín), ${difP05.toFixed(2)}:1 (p05) y ${difMedia.toFixed(2)}:1 (mediana) ` +
    `— los tres abajo de ${AA}:1. La escena cruza AA en p=${cruceAA.toFixed(4)}, así que cualquier mapeo ` +
    `que ponga esta sección abajo de ese progreso la deja legible. ` +
    'DECIDIDO EN LA PARADA DE SITIO-S8: se resuelve por el MAPEO (opción a); si después del mapeo ' +
    'sigue fallando, la salida es componer la vuelta de la escena (§7.4). Descartadas: cambiar la ' +
    'superficie y aclarar el cierre. Un velo, nunca. Ver el bloque de arriba.',
)

afirmar(
  difLlena < AA,
  '  y el instrumento lo ve: la medición del diferencial está por debajo del umbral, no cerca',
  `${difLlena.toFixed(2)}:1 contra ${AA}:1 — la afirmación es sobre la MEDICIÓN, no sobre la decisión`,
)

cerrar('s8-tinta.invariant')
