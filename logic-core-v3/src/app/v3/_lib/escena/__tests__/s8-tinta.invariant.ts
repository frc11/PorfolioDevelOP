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

import { CELOSIA_BAR, celosiaSkyFactor } from '../probeCelosia'
import { MOIRE_MISMATCH } from '../probeMoire'
import { MAPEO_DE_LAS_SECCIONES } from '../recorrido'
import { TINTA_HEX } from '../../superficies'
import { sampleFrame } from '@/app/probe-escena/__tests__/frameProbe'
import { afirmar, cerrar, controlPositivo, deudaDeclarada, razonDeContraste, titulo } from '../../__tests__/afirmar'
import { DEUDAS_DE_B8 } from '../../__tests__/deudas-b8'
import { COLOR } from '../../__tests__/s10-acceso-color'
import { AMANECER, ANCLA_DEL_DIFERENCIAL, ATARDECER, NOCHE } from '../lightArc'
import { grisHex, muestrearCuadro, percentil, vistaEn } from './cuadro'
import { afirmarElDiferencial } from './s8-tinta-diferencial'
import { contrasteDeLaSeccion, cruceEn, esInvertida, peorDeLaVentana } from './s8-tinta-ventanas'

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
titulo('3 · LA CURVA — el contraste sigue a la luz: cae en el atardecer, vuelve con el sol, y dónde cruza AA')

/**
 * Es una PROPIEDAD DE LA ESCENA y no del mapeo: vale sea cual sea la función que
 * ate el scroll al progreso, porque sólo depende del progreso. Por eso ésta sí
 * se afirma.
 *
 * ⚠️ **B8 · CUSTODIABA «cae monótono con el atardecer y cruza AA en la última
 * pantalla (p entre 0,85 y 0,9)».** Era la forma del arco viejo: una tarde que
 * se apagaba de punta a punta hasta 0,34 en p=1, y una sola bisección sobre
 * [0, 1] bastaba. B8 pone la noche en Trabajos y sostiene la mañana (0,643)
 * desde el ancla del diferencial hasta el final (`lightArc.ts`): la curva tiene
 * DOS cruces —uno hacia abajo adentro del ATARDECER y uno hacia arriba mientras
 * el diferencial entra— y en p=1 queda arriba de AA. La bisección recibe el
 * tramo, porque sobre [0, 1] ya no hay monotonía que la sostenga; lo que se
 * afirma es DÓNDE están los cruces, que es lo que decide qué texto queda
 * debajo (§4), y que la mañana no vuelve a caer.
 */
const bisecar = (umbral: number, cuantil = 0, desde = 0, hasta = 1): number =>
  cruceEn((p) => contrasteEn(p, cuantil), umbral, desde, hasta)

const cruceAA = bisecar(AA, 0, ATARDECER.desde, ATARDECER.hasta)
const cruceAAA = bisecar(AAA, 0, ATARDECER.desde, ATARDECER.hasta)
const vueltaAA = bisecar(AA, 0, AMANECER.desde, ANCLA_DEL_DIFERENCIAL)
console.log(
  `  el peor píxel del cuadro cruza AA (${AA}:1) hacia abajo en p=${cruceAA.toFixed(4)} —AAA (${AAA}:1) en p=${cruceAAA.toFixed(4)}— y vuelve a pasarlo en p=${vueltaAA.toFixed(4)}`,
)

afirmar(
  contrasteEn(0, 0) > contrasteEn(1, 0),
  'el contraste del peor píxel baja de punta a punta del recorrido: el día termina con menos luz de la que empezó',
  `${contrasteEn(0, 0).toFixed(2)}:1 en p=0 → ${contrasteEn(1, 0).toFixed(2)}:1 en p=1`,
)
afirmar(
  cruceAA > ATARDECER.desde && cruceAA < ATARDECER.hasta,
  'cruza AA hacia abajo ADENTRO del atardecer: la pantalla en que Trabajos entra y Números todavía se va',
  `p=${cruceAA.toFixed(4)} en [${ATARDECER.desde}, ${ATARDECER.hasta}] — o sea que la noche entera de Trabajos está abajo de 4,5:1 para la tinta OSCURA, que ahí no se usa`,
)
afirmar(
  contrasteEn(cruceAA - 0.01, 0) >= AA && contrasteEn(cruceAA + 0.01, 0) < AA,
  '  el cruce de bajada es real en las dos direcciones: pasa un centésimo antes y no pasa un centésimo después',
  `${contrasteEn(cruceAA - 0.01, 0).toFixed(2)}:1 contra ${contrasteEn(cruceAA + 0.01, 0).toFixed(2)}:1`,
)
afirmar(
  vueltaAA > AMANECER.hasta && vueltaAA < ANCLA_DEL_DIFERENCIAL,
  'vuelve a pasar AA DESPUÉS de que la escena reanuda y ANTES del ancla del diferencial: mientras el diferencial entra',
  `p=${vueltaAA.toFixed(4)} en (${AMANECER.hasta}, ${ANCLA_DEL_DIFERENCIAL}) — la entrada del diferencial queda abajo, y es la deuda ${DEUDAS_DE_B8.diferencial.numero} de §4`,
)
afirmar(
  contrasteEn(vueltaAA - 0.01, 0) < AA && contrasteEn(vueltaAA + 0.01, 0) >= AA,
  '  y el de subida también es real en las dos direcciones',
  `${contrasteEn(vueltaAA - 0.01, 0).toFixed(2)}:1 contra ${contrasteEn(vueltaAA + 0.01, 0).toFixed(2)}:1`,
)
afirmar(
  contrasteEn(ANCLA_DEL_DIFERENCIAL, 0) >= AA && contrasteEn(1, 0) >= AA,
  'y desde el ancla del diferencial hasta el final la mañana sostiene AA: la tinta oscura no vuelve a caer',
  `${contrasteEn(ANCLA_DEL_DIFERENCIAL, 0).toFixed(2)}:1 en el ancla · ${contrasteEn(1, 0).toFixed(2)}:1 en p=1 — con el arco viejo p=1 daba 2,34:1`,
)
controlPositivo(
  'razonDeContraste sabe reprobar: la tinta contra sí misma no pasa AA',
  TINTA_HEX,
  (hex: string) => razonDeContraste(TINTA_HEX, hex) >= AA,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · LAS SECCIONES TRANSPARENTES, con el ANCLAJE puesto')

const transparentes = MAPEO_DE_LAS_SECCIONES.filter((f) => f.dejaVerLaEscena)
/** ⚠️ B8: eran cuatro (B6-A) y son SEIS — el humano abrió Quiénes somos y Números. Siguen saliendo de la tabla. */
afirmar(
  transparentes.map((f) => f.id).join(' · ') === 'hero · quienes-somos · numeros · trabajos · por-que-develop · cierre',
  'son seis y salen de la tabla del home: las ocho menos Servicios y Tu panel (B8)',
  transparentes.map((f) => f.id).join(' · '),
)

/**
 * ⚠️ **B8 · LA PEOR LECTURA YA NO ESTÁ EN LOS BORDES, Y HAY DOS TINTAS.**
 * Custodiaba el peor de los cuatro bordes de cada ventana con la tinta oscura,
 * y alcanzaba porque el contraste era monótono y las transparentes eran de
 * papel. Ahora cada ventana se barre entera (`s8-tinta-ventanas.ts`) y cada
 * sección se mide con la tinta que lleva: la oscura contra el píxel más oscuro,
 * la invertida (Trabajos, Cierre) contra el más claro.
 */
const lecturas = transparentes.map((f) => ({ f, invertida: esInvertida(f.id), ...peorDeLaVentana(f, ESCENA_REAL) }))
console.log('  sección           tinta    se ve en p=[…]        peor de la ventana      en p=')
for (const l of lecturas) {
  console.log(
    `  ${l.f.id.padEnd(16)}  ${(l.invertida ? 'clara' : 'oscura').padEnd(7)} [${l.f.seVeDesde.toFixed(4)}, ${l.f.seVeHasta.toFixed(4)}]` +
      `   ${l.peor.toFixed(2).padStart(6)}:1 ${l.peor >= AA ? 'pasa AA' : 'NO pasa'}   ${l.en.toFixed(4)}  (${l.muestras} muestras)`,
  )
}
const lectura = (id: string) => {
  const l = lecturas.find((x) => x.f.id === id)
  if (l === undefined) throw new Error(`sin lectura de "${id}"`)
  return l
}

const hero = lectura('hero')
afirmar(
  hero.peor >= AA,
  'HERO — la tinta pasa AA sobre la escena real en toda la ventana en que el Hero se ve',
  `peor caso ${hero.peor.toFixed(2)}:1 · también pasa AAA (${AAA}:1): ${hero.peor >= AAA ? 'sí' : 'no'}`,
)
const quienes = lectura('quienes-somos')
afirmar(
  quienes.peor >= AA,
  'QUIÉNES SOMOS (B8) — la tinta pasa AA sobre la escena real en toda su ventana: la meseta de luz la cubre entera',
  `peor caso ${quienes.peor.toFixed(2)}:1 en p=${quienes.en.toFixed(4)} · también pasa AAA: ${quienes.peor >= AAA ? 'sí' : 'no'}`,
)

/**
 * ⚠️ **LAS CUATRO DEUDAS DE B8 — la condición corre intacta y no se afloja.**
 * Cada una es la MISMA afirmación que las dos de arriba, y B8 la rompió a
 * propósito al abrir la sala y poner la noche en Trabajos. Se declara con su
 * número y con el bloque que la cierra (`deudas-b8.ts`); el agregado la
 * publica aparte de las fallas, y el día que se cierre esto pasa a verde solo.
 */
const numeros = lectura('numeros')
deudaDeclarada(
  numeros.peor >= AA,
  'NÚMEROS (B8) — la tinta pasa AA sobre la escena real en toda su ventana',
  `${DEUDAS_DE_B8.numeros.numero}: peor ${numeros.peor.toFixed(2)}:1 en p=${numeros.en.toFixed(4)} — ${DEUDAS_DE_B8.numeros.que}; pasa AA hasta p=${cruceAA.toFixed(4)}, ${(ATARDECER.hasta - cruceAA).toFixed(4)} de progreso antes de irse`,
  DEUDAS_DE_B8.numeros.cierre,
)
const trabajos = lectura('trabajos')
const trabajosLegible = cruceEn((p) => contrasteDeLaSeccion('trabajos', p, ESCENA_REAL), AA, ATARDECER.desde, ATARDECER.hasta)
deudaDeclarada(
  trabajos.peor >= AA,
  'TRABAJOS (B6-A, sin velo desde B8) — la tinta CLARA pasa AA sobre la sala en toda su ventana',
  `${DEUDAS_DE_B8.trabajos.numero}: peor ${trabajos.peor.toFixed(2)}:1 en p=${trabajos.en.toFixed(4)} — ${DEUDAS_DE_B8.trabajos.que}; se lee desde p=${trabajosLegible.toFixed(4)} y en la noche da ${contrasteDeLaSeccion('trabajos', NOCHE.hasta, ESCENA_REAL).toFixed(2)}:1`,
  DEUDAS_DE_B8.trabajos.cierre,
)
const diferencial = lectura('por-que-develop')
deudaDeclarada(
  diferencial.peor >= AA,
  'POR QUÉ DEVELOP — la tinta pasa AA sobre la escena real en toda su ventana',
  `${DEUDAS_DE_B8.diferencial.numero}: peor ${diferencial.peor.toFixed(2)}:1 en p=${diferencial.en.toFixed(4)} — ${DEUDAS_DE_B8.diferencial.que}: llega a AA en p=${vueltaAA.toFixed(4)} y en el ancla da ${contrasteEn(ANCLA_DEL_DIFERENCIAL, 0).toFixed(2)}:1`,
  DEUDAS_DE_B8.diferencial.cierre,
)
/** ⚠️ **B12 · `D-B8.4` SE SALDA Y LA AFIRMACIÓN SE DA VUELTA (regla 15).** Era
 *  deuda por la tinta CLARA sobre una sala iluminada; B12 le sacó el relleno al
 *  pie y le dio vuelta la tinta: la oscura da 4,98:1 en el ancla y no baja. Lo
 *  que el modelo NO ve —la varianza de la celosía bajo el glifo— la captura sí:
 *  8 de 24 bloques bajo AA a 1920 con las tres palancas. Es `D-B12.2`. */
const cierre = lectura('cierre')
afirmar(
  cierre.peor >= AA,
  'CIERRE (B12: `papel-transparente`, con el pie sin relleno) — la tinta OSCURA pasa AA sobre la sala en toda su ventana',
  `${cierre.peor.toFixed(2)}:1 en p=${cierre.en.toFixed(4)}, y no baja de ahí en toda la ventana — la deuda ${DEUDAS_DE_B8.cierre.numero} de la tinta clara queda saldada; lo que la CAPTURA ve (la varianza de la celosía bajo el glifo) es D-B12.2`,
)
controlPositivo(
  'el medidor de la tinta clara sabe reprobar: contra el papel a pleno sol (248) no llega a 3:1',
  '#F8F8F8',
  (papel: string) => razonDeContraste(COLOR.tintaInvertida, papel) >= 3,
)
afirmar(
  lecturas.filter((l) => l.peor < AA).map((l) => l.f.id).join(' · ') === 'numeros · trabajos · por-que-develop',
  'y las deudas son EXACTAMENTE esas TRES: ni una más sin declarar, ni una declarada que ya esté saldada — el Cierre se saldó en B12 al darle vuelta la tinta',
  lecturas.filter((l) => l.peor < AA).map((l) => `${l.f.id} ${l.peor.toFixed(2)}:1`).join(' · '),
)

afirmarElDiferencial({ contrasteEn, bisecar, cruceAA, vueltaAA, AA, AAA }, transparentes)

cerrar('s8-tinta.invariant')
