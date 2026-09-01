/**
 * INVARIANTE — SITIO-S10 · LA COMPOSICIÓN DEL LOGO CONTRA EL TEXTO.
 *
 *     npx tsx src/app/v3/_lib/escena/__tests__/s10-logo.invariant.ts
 *
 * ── LA PREGUNTA, Y POR QUÉ NADIE LA TENÍA CONTESTADA ───────────────────────
 *
 * `s8-tinta` mide el contraste del texto de los paneles transparentes contra
 * **el fondo**, y para eso **descarta los píxeles del logo** (`sinLogo` en
 * `cuadro.ts`) con su razón escrita: sobre el logo el contraste es ~1:1 por
 * construcción, *«y por eso la composición pone el contenido del lado que el
 * logo deja libre»*. Este frente pregunta lo otro: **¿el logo deja el lado
 * libre?** Si no lo deja, esa exclusión deja de ser decisión de método y pasa a
 * ser un agujero de medición.
 *
 * ── LO PRIMERO, Y ES UN HALLAZGO: en cuatro de los cinco anchos NO APLICA ──
 *
 * `_lib/compuerta.ts` monta el escenario sólo desde 1025 (`CONSULTA_ESCENARIO`)
 * y abajo del umbral el bundle ni se descarga: no hay logo con el que competir,
 * así que van con `noCorre` y su motivo. **El eje que sí varía y que nadie miró
 * es la RELACIÓN DE ASPECTO** (§7.6, abierto por escrito: *«en vertical el logo
 * no entra igual»*): a 1025 con los tres altos declarados el cuadro va de 1,139
 * a 1,537, contra el 1,600 de la referencia con la que se compuso el recorrido.
 *
 * **Regla 13:** se **afirma** lo que es propiedad del instrumento o geometría
 * estable, y se **publica con `console.log`** todo juicio de composición que
 * este sprint mide y no arregla. Un defecto no arreglado no se escribe en rojo.
 *
 * ⚠ **La afirmación del §3 sobre el Hero es un guardián deliberado.** Hoy el
 * logo entra ENTERO en el cuadro del Hero en los cuatro aspectos, así que la
 * premisa *«queda cortado por el borde»* con la que llegó este frente **no se
 * reproduce** (regla 11: una instrucción es una fuente, y una fuente que se
 * equivoca se corrige con su medición al lado). Si algún día se decide recortar
 * el Hero a propósito, este invariante se pone en rojo — y ése es el lugar donde
 * esa decisión hay que escribirla, igual que §7.29 hizo con `s8-tinta`.
 */

import { afirmar, cerrar, controlPositivo, noCorre, razonDeContraste, titulo } from '../../__tests__/afirmar'
import { ANCHOS } from '../../__tests__/s10-banco'
import { tokenPx, variantesActivas } from '../../__tests__/s10-css'
import { TINTA_HEX } from '../../superficies'
import { ESCENARIO_MIN_ANCHO_PX } from '../../compuerta'
import { CHOREO_KEYFRAMES } from '../choreography'
import { fuenteDe } from './s8-escena-soporte'
import { muestrearCuadro, vistaEn } from './cuadro'
// prettier-ignore
import { ARRIBA_DEL_CERO, CAMARAS, CUADROS_SIN_CAMBIO, DEFECTO_7_ABIERTO, MAS_ANGOSTO, PEOR_RECORRIDO, PISTA_CON_FRAME_Y, PISTA_REAL, RECORRIDOS, aspectoDeRecorridoNulo, coincidenLasCamaras, frameYMaximo, palancasDeComposicion, tablaDeRecorridos, type RecorridoMedido } from './s10-logo-encuadre'
import { muestrearLogo } from './s10-logo'
// prettier-ignore
import { ESCENA_REAL, TINTA_DEL_LOGO, VENTANAS, fraccionDentro, muestra, superposicion } from './s10-logo-lectura'
import { SUPUESTOS_DE_LAS_CAJAS } from './s10-logo-cajas'
// prettier-ignore
import { MEJOR_SOBRE_EL_LOGO, PEOR_SOBRE_EL_FONDO, TINTA_CONTRA_TINTA, declaraElRecorte, tablaDeContraste, tablaDeFraccion, tablaDeSuperposicion } from './s10-logo-tablas'

const AA = 4.5
const pct = (v: number, n = 1): string => `${(v * 100).toFixed(n).padStart(n === 0 ? 4 : 6)}%`

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · LA COMPUERTA — en cuatro de los cinco anchos la pregunta NO APLICA')

const sinEscena = `abajo de ${ESCENARIO_MIN_ANCHO_PX} \`EscenarioCompuerta\` no monta el canvas (\`_lib/compuerta.ts\`, \`CONSULTA_ESCENARIO\`) y el bundle ni se descarga: no hay logo con el que competir`
for (const a of ANCHOS.filter((w) => w < ESCENARIO_MIN_ANCHO_PX)) noCorre(`el logo contra el texto a ${a}px`, sinEscena)
afirmar(
  ESCENARIO_MIN_ANCHO_PX === tokenPx('--breakpoint-escritorio', 0),
  'el umbral de la compuerta y el breakpoint del tema son el MISMO número',
  `${ESCENARIO_MIN_ANCHO_PX}px`,
)
afirmar(
  !variantesActivas(ESCENARIO_MIN_ANCHO_PX - 1).includes('escritorio') &&
    variantesActivas(ESCENARIO_MIN_ANCHO_PX).includes('escritorio'),
  '  y la escena y la variante `escritorio:` conmutan en el mismo píxel',
  `${ESCENARIO_MIN_ANCHO_PX - 1} → sin · ${ESCENARIO_MIN_ANCHO_PX} → con`,
)
controlPositivo(
  'el detector de «acá hay escena» sabe rechazar el ancho de justo abajo',
  ESCENARIO_MIN_ANCHO_PX - 1,
  (a: number) => a >= ESCENARIO_MIN_ANCHO_PX,
)
console.log(`  los cuadros medidos: ${VENTANAS.map((v) => `${v.etiqueta} (${v.aspecto.toFixed(3)})`).join(' · ')}`)
console.log(`  supuestos de las cajas:\n${SUPUESTOS_DE_LAS_CAJAS.map((s) => `   · ${s}`).join('\n')}`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · EL CONTROL DE EQUIVALENCIA — este muestreador ES el de S8/S10/S11')

for (const p of [0, 0.75, 0.9]) {
  const suyo = muestrearCuadro(p, vistaEn(p), ESCENA_REAL, 200, 113)
  const mio = muestrearLogo(p, 16 / 9, ESCENA_REAL, 200, 113, 1)
  let suma = 0
  for (let i = 0; i < mio.celdasDeLogo; i += 1) suma += mio.valor[i]
  let sumaSinLogo = 0
  for (const v of suyo.sinLogo) sumaSinLogo += v
  const esperada = suyo.media * suyo.total - sumaSinLogo
  afirmar(
    mio.celdasDeLogo === suyo.enLogo,
    `p=${p.toFixed(3)} — la MÁSCARA cuenta los mismos píxeles de logo que \`muestrearCuadro\``,
    `${mio.celdasDeLogo} contra ${suyo.enLogo}`,
  )
  afirmar(
    Math.abs(suma - esperada) < 1e-6,
    '  y el SOMBREADO cierra contra su complemento: Σ logo = media × total − Σ sinLogo',
    `${suma.toFixed(3)} contra ${esperada.toFixed(3)}`,
  )
}
controlPositivo(
  'el comparador de máscara vería una divergencia: no compara un número consigo mismo',
  1,
  (desvio: number) =>
    muestrearLogo(0, 16 / 9, ESCENA_REAL, 60, 34, 1).celdasDeLogo + desvio ===
    muestrearCuadro(0, vistaEn(0), ESCENA_REAL, 60, 34).enLogo,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · CUÁNTO LOGO ENTRA EN EL CUADRO, por sección y por relación de aspecto')

const FRACCION = tablaDeFraccion()
for (const linea of FRACCION.lineas) console.log(`  ${linea}`)
afirmar(
  FRACCION.encerrado,
  'LA GRILLA EXTENDIDA ENCIERRA AL LOGO en las 32 muestras: ningún total está truncado',
  'sin este encierro, «entra entero» y «la grilla lo cortó» darían la misma cifra',
)
afirmar(
  FRACCION.heroEntero,
  'HERO — el logo entra ENTERO en el cuadro en los cuatro aspectos y en toda su ventana',
  'la premisa «queda cortado por el borde del cuadro» NO se reproduce con este instrumento',
)
controlPositivo(
  'y el detector sabe ver un logo que se sale: el diferencial en su pose no da 1,000',
  0.75,
  (p: number) => fraccionDentro(muestra(p, VENTANAS[0].aspecto)) >= 1,
)
console.log(
  `  EL DIFERENCIAL SÍ SE SALE, por arriba: la caja del logo llega a y=${FRACCION.arribaMaxima.toFixed(2)} con el borde del cuadro en\n` +
    `  +1,00, y entra al ${(FRACCION.peorFraccionDentro * 100).toFixed(1)}% en el peor cuadro. Es poca ÁREA y mucha MASA: ocupa hasta el ` +
    `${(FRACCION.mayorCobertura.valor * 100).toFixed(1)}% del cuadro a\n  ${FRACCION.mayorCobertura.cuadro}. Desde SITIO-S11 es una DECISIÓN escrita, no un defecto: ver §6.`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · CUÁNTO SE SUPERPONE CON EL TEXTO — banda derivada, alto modelado, y la posición vertical BARRIDA en vez de inventada')

const SUPERPOSICIONES = tablaDeSuperposicion()
for (const linea of SUPERPOSICIONES.lineas) console.log(`  ${linea}`)
controlPositivo(
  'el medidor de superposición sabe devolver CERO: una caja fuera de la caja del logo',
  { x0: -1, x1: -0.99, y0: -1, y1: -0.99 },
  (c: { x0: number; x1: number; y0: number; y1: number }) =>
    superposicion(muestra(0.75, VENTANAS[0].aspecto), c).fraccion > 0,
)
console.log(
  `  🔴 DEFECTO 7 — en el diferencial la superposición mínima del titular es MAYOR QUE CERO (${SUPERPOSICIONES.inevitable ? 'sí' : 'no'}): entre ` +
    `${pct(SUPERPOSICIONES.minimaDelDiferencial.menor, 0).trim()} y ${pct(SUPERPOSICIONES.minimaDelDiferencial.mayor, 0).trim()}\n` +
    '  sobre los cuatro cuadros, o sea que no hay altura de pantalla en la que ese bloque quede limpio: la banda del logo\n' +
    '  cruza la columna de texto entera. En el Hero el mínimo SÍ es cero — ahí es de posición vertical, no de banda.\n' +
    '  ⚠ RE-MEDIDO DESPUÉS del arreglo del encuadre (§7). Sigue abierto; las salidas están en el §8.',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · 🔴 EL CONTRASTE DONDE SE SUPERPONEN — el número que nadie tenía')

for (const linea of tablaDeContraste()) console.log(`  ${linea}`)
afirmar(
  MEJOR_SOBRE_EL_LOGO < PEOR_SOBRE_EL_FONDO,
  'las dos poblaciones son DISJUNTAS: el mejor píxel del logo es peor que el peor del fondo',
  `${MEJOR_SOBRE_EL_LOGO.toFixed(2)}:1 contra ${PEOR_SOBRE_EL_FONDO.toFixed(2)}:1 — la exclusión de \`sinLogo\` no es conservadora`,
)
afirmar(
  TINTA_CONTRA_TINTA(TINTA_DEL_LOGO) < 3 && MEJOR_SOBRE_EL_LOGO < AA,
  '  y es por construcción: la tinta del texto y la del logo son el mismo negro',
  `${TINTA_CONTRA_TINTA(TINTA_DEL_LOGO).toFixed(2)}:1 sin sombrear · sombreado no llega a AA (${AA}:1) ni a 3:1 de texto grande`,
)
controlPositivo('razonDeContraste sabe reprobar: la tinta contra sí misma no pasa AA', TINTA_HEX, (h: string) =>
  razonDeContraste(TINTA_HEX, h) >= AA,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · DEFECTO O DECISIÓN — lo que el keyframe declara por escrito')

/**
 * ⚠ **LA SEGUNDA AFIRMACIÓN ES NUEVA DE SITIO-S11, Y CIERRA EL DEFECTO 18.**
 *
 * SITIO-S10 midió que `demos` no sólo llena el cuadro: **se sale por arriba**, y
 * que `choreography.ts` no mencionaba un recorte en ninguna línea. Llenar y
 * salirse no son lo mismo, y un recorte que nadie escribió se lee como error.
 * El valor NO se tocó —la pose está calibrada a ojo y aprobada por grabación—:
 * lo que se agregó es la declaración, con su medición al lado. Desde acá, si
 * alguien la borra, esta afirmación se pone en rojo.
 */
const CHOREO = fuenteDe('src/app/v3/_lib/escena/choreography.ts')
afirmar(
  CHOREO_KEYFRAMES.some((k) => k.name === 'demos' && k.pose.frameX === 1),
  'DECISIÓN — que `demos` LLENE el cuadro está escrito en `choreography.ts` y en §2.2',
  '«Es la única pose donde el logo llena el cuadro —81% del alto en tinta— y es la excepción que la arquitectónica se reserva»',
)
afirmar(
  declaraElRecorte(CHOREO, 'demos'),
  'DECISIÓN — y que se SALGA por arriba también está declarado ahora, en el docblock de esa pose',
  `medido: y=${FRACCION.arribaMaxima.toFixed(2)} contra el borde en +1,00, ${(100 - FRACCION.peorFraccionDentro * 100).toFixed(1)}% del área afuera en el peor cuadro`,
)
controlPositivo(
  'el detector del recorte no da verde contra cualquier keyframe: el del Hero no lo declara',
  'hero',
  (nombre: string) => declaraElRecorte(CHOREO, nombre),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · EL ENCUADRE LATERAL — el codo en cero, sacado (SITIO-S11, defecto 14)')

/**
 * ⚠ **ESTA SECCIÓN CAMBIÓ DE SUJETO EN SITIO-S11.** En SITIO-S10 afirmaba que la
 * palanca `frameX` de `demos` estaba **INERTE** en el cuadro más alto: `travelX =
 * max(0, medioAncho − LOGO_W/2) × 0,88` tenía un codo en cero en aspecto 1,213
 * (arnés) y 1,162 (rig), y 1025×900 da 1,139 — abajo de los dos. Era el censo de
 * un DEFECTO, y el defecto se arregló en `_lib/escena/encuadre.ts`.
 *
 * **Ahora custodia las DOS mitades del arreglo**, y hacen falta las dos: que la
 * perilla vuelva a mover el logo en los cuatro cuadros y en las dos cámaras, y
 * que **donde ya funcionaba no se haya movido nada** — que es lo que garantiza
 * que ninguna pose calibrada a ojo cambió. Sin la segunda, esto sería un retoque
 * de composición disfrazado de arreglo.
 */
for (const linea of tablaDeRecorridos()) console.log(`  ${linea}`)

afirmar(
  PEOR_RECORRIDO > 0,
  'PALANCA `frameX` de `demos` — vuelve a MOVER el logo en los CUATRO cuadros y en las DOS cámaras',
  `el más chico de los ocho recorridos es ${PEOR_RECORRIDO.toFixed(4)} de mundo, y en ${MAS_ANGOSTO.etiqueta} era 0,0000`,
)
afirmar(
  ARRIBA_DEL_CERO.length === 6 && ARRIBA_DEL_CERO.every((f) => f.corregido === f.conCodo),
  '  y donde la perilla YA funcionaba no se movió un bit: las dos fórmulas dan el MISMO número',
  `${ARRIBA_DEL_CERO.length} de los 8 cuadros caen arriba del aspecto de recorrido nulo, y en los ${ARRIBA_DEL_CERO.length} coinciden`,
)
controlPositivo(
  'el comparador no mide la fórmula nueva contra sí misma: con el codo, el cuadro más alto daba CERO',
  RECORRIDOS[0].filas.filter((f) => f.ventana.etiqueta === MAS_ANGOSTO.etiqueta),
  (filas: readonly RecorridoMedido[]) => filas.length > 0 && filas.every((f) => f.conCodo > 0),
)
afirmar(
  CAMARAS.every((c) => MAS_ANGOSTO.aspecto < aspectoDeRecorridoNulo('demos', c.anchoDeLaCaja)),
  '  el cuadro más alto SIGUE estando abajo del aspecto de recorrido nulo: por eso el codo lo mataba',
  `${MAS_ANGOSTO.etiqueta} da ${MAS_ANGOSTO.aspecto.toFixed(3)} contra ` +
    CAMARAS.map((c) => `${aspectoDeRecorridoNulo('demos', c.anchoDeLaCaja).toFixed(3)} (${c.id})`).join(' y '),
)
afirmar(
  aspectoDeRecorridoNulo('hero', CAMARAS[0].anchoDeLaCaja) < MAS_ANGOSTO.aspecto,
  '  el Hero nunca estuvo inerte: su aspecto de recorrido nulo queda abajo de todos los medidos',
  `${aspectoDeRecorridoNulo('hero', CAMARAS[0].anchoDeLaCaja).toFixed(3)} contra ${MAS_ANGOSTO.aspecto.toFixed(3)}`,
)

/**
 * ⚠ **LA CÁMARA CON LA QUE SE MIDE ES LA DE PRODUCCIÓN, Y ESO SE COMPRUEBA.**
 * `harness.ts:93-94` conserva su copia de la fórmula —con el codo— y este frente
 * no puede escribir en `/probe-escena`, así que el muestreo pasó a
 * `camaraEnCuadro`, que le pide el recorrido a `encuadre.ts`. Las dos tienen que
 * coincidir **bit a bit** arriba del recorrido nulo y separarse SÓLO abajo: si
 * coincidieran abajo, el arreglo no habría llegado al muestreo; si se separaran
 * arriba, la composición del encuadre estaría mal armada.
 */
afirmar(
  CUADROS_SIN_CAMBIO.length === 3 && CUADROS_SIN_CAMBIO.every((v) => coincidenLasCamaras(v.aspecto)),
  'la cámara del muestreo ES la del arnés donde la corrección es un no-op: coinciden bit a bit',
  `posición y las tres direcciones de pantalla, en los ${CUADROS_SIN_CAMBIO.length} cuadros de arriba del recorrido nulo`,
)
controlPositivo(
  'y NO coinciden en el cuadro donde el codo mataba la perilla: el arreglo sí llega al muestreo',
  MAS_ANGOSTO.aspecto,
  coincidenLasCamaras,
)

/**
 * ⚠ **EL EJE VERTICAL SE ARREGLÓ IGUAL, Y ES UN NO-OP COMPROBADO.** El codo
 * estaba en los dos ejes, así que la corrección va en los dos. En el vertical no
 * puede mover nada: `frameY` es cero en los ocho keyframes **y entre ellos**, y
 * el término `frameY × travelY` es cero valga lo que valga `travelY`. Se afirma
 * sobre el MUESTREO del track, que es donde una interpolación podría sorprender.
 */
afirmar(
  frameYMaximo(PISTA_REAL) === 0,
  'el arreglo del eje VERTICAL no puede mover una composición: `frameY` es 0 en todo el recorrido',
  'máximo de |frameY| sobre 2001 progresos muestreados del track real',
)
controlPositivo(
  'el barrido de `frameY` SÍ ve una perilla vertical distinta de cero',
  PISTA_CON_FRAME_Y,
  (pista: typeof PISTA_REAL) => frameYMaximo(pista, 50) === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · LO QUE EL ARREGLO NO CERRÓ — las palancas del defecto 7, con su número')

console.log(`  ${DEFECTO_7_ABIERTO}`)
for (const linea of palancasDeComposicion(MAS_ANGOSTO)) console.log(`  ${linea}`)

cerrar('s10-logo.invariant')
