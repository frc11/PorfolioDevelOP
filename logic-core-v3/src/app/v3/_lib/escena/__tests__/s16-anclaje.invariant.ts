/**
 * INVARIANTE — V3-E · EL ANCLA DEL DIFERENCIAL, DESCUANTIZADA.
 *
 *     npx tsx src/app/v3/_lib/escena/__tests__/s16-anclaje.invariant.ts
 *     npm run test:s16-anclaje
 *
 * Mide **una sola cosa**: que el ancla de `por-que-develop` haya dejado de estar
 * atada a un borde de tramo y pase a ser un valor declarado, **sin que el mapeo
 * deje de ser monótono y exactamente reversible** y sin que se muevan las anclas
 * de las demás. No mide poses, no mide layout y no mide la tinta del Hero.
 *
 * ⚠ **DÓNDE VIVE CADA COSA.** La decisión y su valor, en `anclaje.ts`. La
 * aritmética y sus guardianes, en `anclajeDerivacion.ts`. Los detectores y los
 * agregados, en `s16-anclaje-soporte.ts`, para que el control positivo corra la
 * MISMA función contra una entrada rota. La ventana medida —dónde el titular
 * queda limpio y dónde el fondo deja de llegar a AA— en `s13b-diferencial.ts`, y
 * de ahí se consume: **acá no se define ni un umbral ni una rejilla**.
 */

import { CHOREO_TRAMOS } from '../choreography'
import { ANCLAJE } from '../anclaje'
import { progresoEntre } from '../anclajeDerivacion'
// prettier-ignore
import { PANTALLAS_DE_SCROLL, RITMO_POR_SEGMENTO, pantallaDeProgreso, progresoDePantalla, progresoEnNudos } from '../recorrido'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
// prettier-ignore
import { AA, CAJAS_DEL_DIFERENCIAL, superposicionMinima, ventanaDelDiferencial } from './s13b-diferencial'
import { EL_DIFERENCIAL } from './s13b-reparto'
import { contrasteSobreElFondo } from './s10-logo-lectura'
// prettier-ignore
import { ANCLAJE_HEREDADO, DECLARADA, I_DECLARADO, anclaDe, bordeConTitularEscalado, casosQueElGuardianRechaza, corrimientoDe, creceEstrictamente, errorDeLaVuelta, pantallasDelBarrido, superposicionFina } from './s16-anclaje-soporte'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · LA TABLA DE LAS OCHO, ANTES Y DESPUÉS — qué se movió y qué no')

console.log('  sección           ancla ANTES   ancla DESPUÉS   Δ')
const movidas: string[] = []
for (const g of ANCLAJE.geometria) {
  const antes = anclaDe(ANCLAJE_HEREDADO, g.id)
  const despues = anclaDe(ANCLAJE, g.id)
  if (antes !== despues) movidas.push(`${g.id} ${antes.toFixed(4)}→${despues.toFixed(4)}`)
  console.log(
    `  ${g.id.padEnd(16)} ${antes.toFixed(6).padStart(10)}   ${despues.toFixed(6).padStart(12)}   ` +
      `${despues === antes ? '—' : `${despues - antes >= 0 ? '+' : ''}${(despues - antes).toFixed(6)}`}`,
  )
}

afirmarIgual(
  anclaDe(ANCLAJE, EL_DIFERENCIAL),
  DECLARADA,
  `EL ANCLA DEL DIFERENCIAL ES EL VALOR DECLARADO, al bit — era ${anclaDe(ANCLAJE_HEREDADO, EL_DIFERENCIAL)}`,
)
afirmarIgual(
  movidas.length,
  2,
  `de las OCHO secciones se movieron DOS y las otras SEIS no un bit — ${movidas.join(' · ')}`,
)

/**
 * ⚠ **`tu-panel` SE MUEVE, Y ES EL PRECIO DEL MODELO, NO UN DESCUIDO.** Con siete
 * nudos —uno por tramo— el nudo que lleva el progreso 0,750 no puede estar en la
 * pantalla 12 y no estarlo a la vez: si se queda, el ancla del diferencial ES
 * 0,750; si se corre, el segmento que lo precede cambia de ritmo y `tu-panel`, que
 * cae adentro de ese segmento, se corre con él. Lo que sí se afirma es **que sea
 * invisible**: `tu-panel` es un panel OPACO, así que su ancla no se ve, y el tramo
 * que corre por debajo sigue corriendo escondido (§6).
 */
const tuPanel = ANCLAJE.geometria.find((g) => g.id === 'tu-panel')
afirmar(
  tuPanel !== undefined && !tuPanel.dejaVerLaEscena,
  '  y la ÚNICA que se movió sin ser el diferencial es un panel OPACO: su ancla no se ve',
  `${anclaDe(ANCLAJE_HEREDADO, 'tu-panel').toFixed(4)} → ${anclaDe(ANCLAJE, 'tu-panel').toFixed(4)}` +
    ` = +${(anclaDe(ANCLAJE, 'tu-panel') - anclaDe(ANCLAJE_HEREDADO, 'tu-panel')).toFixed(4)} de progreso, detrás de una superficie que no deja ver el canvas`,
)
afirmarIgual(
  ANCLAJE_HEREDADO.nudos.map((n) => [n.pantalla, n.progreso]),
  [[0, 0], [1, 0.125], [4, 0.375], [8, 0.5], [11, 0.625], [16, 0.75], [17, 1]],
  'CONTROL DEL ANTES — sin la declaración, la MISMA función de producción devuelve el anclaje cuantizado',
)
controlPositivo(
  'y el «antes» no es una copia del «después»: los dos anclajes NO tienen los mismos nudos',
  ANCLAJE.nudos,
  (nudos: typeof ANCLAJE.nudos) => JSON.stringify(nudos) === JSON.stringify(ANCLAJE_HEREDADO.nudos),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · LA ARITMÉTICA DE LA DECLARACIÓN — la recta que pasa por el ancla')

/**
 * ⚠ **`progresoEntre` ES UNA COPIA DE UNA LÍNEA DE `recorrido.ts`, y por eso se
 * afirma.** `anclajeDerivacion.ts` no puede importar `recorrido.ts` —aquél
 * importa `anclaje.ts`, que importa éste—, así que la interpolación con la que la
 * derivación comprueba que el ancla vuelve está escrita dos veces. Si las dos
 * dejaran de coincidir, la declaración diría un número y el mapeo devolvería otro.
 */
const NUDO = ANCLAJE.nudos[I_DECLARADO]
const FIN = ANCLAJE.nudos[I_DECLARADO + 1]
const DEL_SEGMENTO = Array.from(
  { length: 41 },
  (_, i) => NUDO.pantalla + ((FIN.pantalla - NUDO.pantalla) * i) / 40,
)
const porLaCopia = DEL_SEGMENTO.map((p) =>
  progresoEntre(NUDO.pantalla, NUDO.progreso, FIN.pantalla, FIN.progreso, p),
)
afirmar(
  JSON.stringify(porLaCopia) === JSON.stringify(DEL_SEGMENTO.map((p) => progresoEnNudos(ANCLAJE.nudos, p))),
  `la copia de la interpolación y la de \`recorrido.ts\` coinciden AL BIT en las ${DEL_SEGMENTO.length} muestras del segmento declarado`,
  `de la pantalla ${NUDO.pantalla.toFixed(6)} a la ${FIN.pantalla}, progreso ${NUDO.progreso} → ${FIN.progreso}`,
)
controlPositivo(
  'el comparador no compara la copia consigo misma: una recta corrida un milésimo no pasa',
  1e-3,
  (delta: number) =>
    JSON.stringify(
      DEL_SEGMENTO.map((p) => progresoEntre(NUDO.pantalla, NUDO.progreso + delta, FIN.pantalla, FIN.progreso, p)),
    ) === JSON.stringify(porLaCopia),
)

const GEO = ANCLAJE.geometria.find((g) => g.id === EL_DIFERENCIAL)
if (GEO === undefined) throw new Error('la geometría no tiene al diferencial')
afirmar(
  progresoDePantalla(GEO.desdePantalla) === DECLARADA && pantallaDeProgreso(DECLARADA) === GEO.desdePantalla,
  'EL ANCLA VUELVE EXACTA DEL MAPEO, en los dos sentidos: sin épsilon',
  `progresoDePantalla(${GEO.desdePantalla}) = ${progresoDePantalla(GEO.desdePantalla)} y pantallaDeProgreso(${DECLARADA}) = ${pantallaDeProgreso(DECLARADA)}`,
)
console.log(
  `  el tramo "${CHOREO_TRAMOS[I_DECLARADO - 1].name}" cierra en la pantalla ${NUDO.pantalla.toFixed(6)} en vez de en la ` +
    `${ANCLAJE_HEREDADO.nudos[I_DECLARADO].pantalla}: es la que hace que la recta pase por (${GEO.desdePantalla}, ${DECLARADA})`,
)
for (const [caso, correr] of casosQueElGuardianRechaza()) {
  controlPositivo(`el guardián RECHAZA ${caso}`, correr, (f: () => unknown) => {
    f()
    return true
  })
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · MONÓTONO Y EXACTAMENTE REVERSIBLE — barrido del rango ENTERO')

/**
 * ⚠ **NO SON TRES MUESTRAS: ES EL RANGO.** Los nueve patrones del sistema de
 * motion asumen que el progreso es estrictamente creciente y que la ida y la
 * vuelta cierran; romperlo los rompe a todos. El barrido va con paso fijo sobre
 * las trece pantallas **y además clava los siete nudos con su entorno inmediato**,
 * que es donde un mapeo por tramos se rompe si se rompe — y el nudo que la
 * declaración corrió no cae en ninguna grilla regular.
 */
const PANTALLAS = pantallasDelBarrido()
const PROGRESOS = Array.from({ length: 100001 }, (_, i) => i / 100000)
const progresos = PANTALLAS.map(progresoDePantalla)

afirmar(
  creceEstrictamente(progresos),
  `el progreso crece ESTRICTAMENTE en las ${PANTALLAS.length} muestras del rango entero [0, ${PANTALLAS_DE_SCROLL}]`,
  'paso 0,001 más los siete nudos con su entorno de ±1e-6 y ±1e-9, deduplicado',
)
controlPositivo(
  'el detector de monotonía no está ciego: ve UN solo par que no crece entre trece mil',
  progresos.map((v, i) => (i === 7000 ? progresos[6999] : v)),
  creceEstrictamente,
)

const errorIda = errorDeLaVuelta(progresoDePantalla, pantallaDeProgreso, PANTALLAS)
const errorVuelta = errorDeLaVuelta(pantallaDeProgreso, progresoDePantalla, PROGRESOS)
afirmar(
  errorIda < 1e-12 && errorVuelta < 1e-12,
  `la vuelta cierra en los DOS sentidos sobre ${PANTALLAS.length} pantallas y ${PROGRESOS.length} progresos`,
  `error máximo ${errorIda.toExponential(2)} (pantalla→progreso→pantalla) y ${errorVuelta.toExponential(2)} (progreso→pantalla→progreso)`,
)
controlPositivo(
  'y el medidor de vuelta ve una inversa mentirosa corrida un millonésimo',
  (p: number) => pantallaDeProgreso(p) + 1e-6,
  (mentirosa: (p: number) => number) => errorDeLaVuelta(progresoDePantalla, mentirosa, PANTALLAS) < 1e-12,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · LA SUPERPOSICIÓN DEL TITULAR EN EL ANCLA — cero en los cuatro cuadros')

const fina = CAJAS_DEL_DIFERENCIAL.map((c) => superposicionFina(c, DECLARADA))
const gruesa = CAJAS_DEL_DIFERENCIAL.map((c) => superposicionMinima(c, DECLARADA))
afirmar(
  fina.every((s) => s === 0) && gruesa.every((s) => s === 0),
  `LA SUPERPOSICIÓN MÍNIMA DEL TITULAR ES CERO EN LOS ${CAJAS_DEL_DIFERENCIAL.length} CUADROS, en las DOS rejillas`,
  `publicación (300×220): ${fina.map((s) => `${(100 * s).toFixed(2)}%`).join(' · ')} · barrido (160×118): ${gruesa.map((s) => `${(100 * s).toFixed(2)}%`).join(' · ')}`,
)
controlPositivo(
  'el medidor NO devuelve cero siempre: en el ancla heredada la superposición existe en los cuatro cuadros',
  anclaDe(ANCLAJE_HEREDADO, EL_DIFERENCIAL),
  (p: number) => CAJAS_DEL_DIFERENCIAL.every((c) => superposicionFina(c, p) === 0),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · POR QUÉ ESE VALOR — los tres márgenes, medidos')

const VENTANA = ventanaDelDiferencial(CAJAS_DEL_DIFERENCIAL)
afirmar(
  DECLARADA > VENTANA.desde && DECLARADA < VENTANA.hasta,
  `el ancla cae ADENTRO de la ventana medida p=[${VENTANA.desde.toFixed(4)}, ${VENTANA.hasta.toFixed(4)}]`,
  `+${(DECLARADA - VENTANA.desde).toFixed(4)} del borde de abajo y −${(VENTANA.hasta - DECLARADA).toFixed(4)} del cruce de AA`,
)

/**
 * ⚠ **EL BORDE DE ABAJO ES UN ESCALÓN, Y POR ESO EL ANCLA NO VA EN EL CENTRO.**
 * El criterio del titular es binario —queda limpio o no—, así que su borde salta
 * de golpe cuando la caja de texto crece. Medido: aguanta un titular **6% más
 * alto** sin moverse, y en el 7% salta. El ancla se pone ARRIBA de ese peldaño
 * para que una recomposición tipográfica no devuelva el defecto 7, y **lo más
 * bajo que lo cumple**, porque del otro lado el contraste cae rápido y el
 * corrimiento de `tu-panel` crece con el ancla.
 */
const PELDANOS = [1, 1.06, 1.07].map((f): readonly [number, number] => [f, bordeConTitularEscalado(f)])
console.log(
  `  el borde de abajo con el titular escalado: ${PELDANOS.map(([f, p]) => `×${f.toFixed(2)} → ${p.toFixed(4)}`).join(' · ')}`,
)
const PELDANO = PELDANOS[PELDANOS.length - 1][1]
afirmar(
  DECLARADA > PELDANO,
  '  y el ancla queda ARRIBA del peldaño siguiente: aguanta un titular 7% más alto sin que vuelva la superposición',
  `${DECLARADA} contra ${PELDANO.toFixed(4)}`,
)
controlPositivo(
  'el escalón es real y el medidor lo ve: el ancla heredada NO queda arriba de ese peldaño',
  anclaDe(ANCLAJE_HEREDADO, EL_DIFERENCIAL),
  (p: number) => p > PELDANO,
)

const contraste = contrasteSobreElFondo(DECLARADA)
afirmar(
  contraste >= AA,
  `  el contraste del peor píxel del fondo en el ancla pasa AA: ${contraste.toFixed(2)}:1`,
  `${(100 * (contraste / AA - 1)).toFixed(1)}% de aire · en 0,8750 quedaría ${contrasteSobreElFondo(0.875).toFixed(2)}:1 (${(100 * (contrasteSobreElFondo(0.875) / AA - 1)).toFixed(1)}%)`,
)

/**
 * ⚠ **EL TERCER COSTO, MEDIDO Y NO ARGUMENTADO: el corrimiento de `tu-panel`
 * CRECE con el ancla**, porque cuanto más tarde ancla el diferencial, antes tiene
 * que cerrar el tramo anterior y más rápido corre el segmento que lo contiene. Es
 * la razón por la que adentro de la ventana se elige el valor más bajo que
 * despeja el escalón, y no el más alto ni el centro.
 */
const CANDIDATOS = [0.8375, DECLARADA, 0.875]
const corrimientos = CANDIDATOS.map((a) => corrimientoDe('tu-panel', a))
console.log(
  `  el corrimiento de tu-panel según el ancla: ${CANDIDATOS.map((a, i) => `${a.toFixed(4)} → +${corrimientos[i].toFixed(4)}`).join(' · ')}`,
)
afirmar(
  creceEstrictamente(corrimientos),
  '  y crece monótono con el ancla: bajar adentro de la ventana lo abarata',
  `+${corrimientos[0].toFixed(4)} → +${corrimientos[corrimientos.length - 1].toFixed(4)} sobre los ${CANDIDATOS.length} candidatos`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · LOS DOS CONSUMIDORES DEL CONTRATO SIGUEN CERRANDO')

afirmarIgual(
  RITMO_POR_SEGMENTO.map((r) => Number(r.progreso.toFixed(12))),
  CHOREO_TRAMOS.map((t) => Number((t.to - t.from).toFixed(12))),
  'RECORRIDO — sigue habiendo UN segmento por tramo y cada uno cubre EXACTAMENTE el progreso de su tramo',
)
afirmarIgual(
  ANCLAJE.ventanasDeLaEscena.length,
  ANCLAJE_HEREDADO.ventanasDeLaEscena.length,
  'VISIBILIDAD — la escena sigue teniendo las mismas ventanas: la declaración mueve CUÁNDO, no CUÁNTAS',
)

/**
 * ⚠ **LA PROPIEDAD QUE LA REASIGNACIÓN DE `demos` PROMETE, Y QUE ES LA QUE
 * CAMBIÓ.** El tramo `demos` existe para «avanzar sin que nadie lo vea»: corre
 * detrás de dos paneles opacos. Con la declaración deja de cerrar en el borde de
 * `tu-panel` y pasa a cerrar ADENTRO — sigue escondido, y eso se afirma buscando
 * qué sección contiene esa pantalla en vez de nombrarla.
 */
const DEMOS = CHOREO_TRAMOS[I_DECLARADO - 1]
const EN_PANTALLA = pantallaDeProgreso(DEMOS.to)
const tapando = ANCLAJE.geometria.find(
  (g) => EN_PANTALLA >= g.desdePantalla && EN_PANTALLA < g.hastaPantalla,
)
afirmar(
  tapando !== undefined && !tapando.dejaVerLaEscena,
  `el tramo "${DEMOS.name}" SIGUE CERRANDO ESCONDIDO: su pose se alcanza detrás de un panel opaco`,
  `progreso ${DEMOS.to} en la pantalla ${EN_PANTALLA.toFixed(4)}, adentro de "${tapando?.id}" — antes cerraba en el borde de la pantalla ${ANCLAJE_HEREDADO.nudos[I_DECLARADO].pantalla}`,
)
controlPositivo(
  'el buscador de la sección que tapa no devuelve cualquiera: en la pantalla 0 encuentra una que SÍ deja ver la escena',
  0,
  (p: number) => {
    const g = ANCLAJE.geometria.find((f) => p >= f.desdePantalla && p < f.hastaPantalla)
    return g !== undefined && !g.dejaVerLaEscena
  },
)

cerrar('s16-anclaje.invariant')
