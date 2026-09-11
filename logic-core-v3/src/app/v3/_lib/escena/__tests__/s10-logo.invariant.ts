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

import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, razonDeContraste, titulo } from '../../__tests__/afirmar'
import { ANCHOS } from '../../__tests__/s10-banco'
import { tokenPx, variantesActivas } from '../../__tests__/s10-css'
import { TINTA_HEX } from '../../superficies'
import { ESCENARIO_MIN_ANCHO_PX } from '../../compuerta'
import { CHOREO_KEYFRAMES } from '../choreography'
import { fuenteDe } from './s8-escena-soporte'
import { muestrearCuadro, vistaEn } from './cuadro'
// prettier-ignore
import { ARRIBA_DEL_CERO, CAMARAS, CUADROS_SIN_CAMBIO, MAS_ANGOSTO, PEOR_RECORRIDO, PISTA_CON_FRAME_Y, PISTA_REAL, aspectoDeRecorridoNulo, coincidenLasCamaras, frameYMaximo, palancasDeComposicion, parrafoDelDefecto7, recorridosDe, tablaDeRecorridos, type RecorridoMedido } from './s10-logo-encuadre'
import { muestrearLogo } from './s10-logo'
// prettier-ignore
import { ESCENA_REAL, TINTA_DEL_LOGO, VENTANAS, conPose, fraccionDentro, muestra, superposicion } from './s10-logo-lectura'
import { SUPUESTOS_DE_LAS_CAJAS } from './s10-logo-cajas'
import { afirmarLaPalancaDeLayout } from './s10-logo-columna'
import { afirmarElEncuadreLateral } from './s10-logo-lateral'
// prettier-ignore
import { INVERTIDAS_TRANSPARENTES, MEJOR_SOBRE_EL_LOGO, PEOR_SOBRE_EL_FONDO, TINTA_CONTRA_TINTA, declaraEnElBloque, tablaDeContraste, tablaDeFraccion, tablaDeSuperposicion } from './s10-logo-tablas'

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
/**
 * ⚠️ **B13 · EL LOGO YA NO SE SALE, Y POR ESO ESTA AFIRMACIÓN SE DIO VUELTA.**
 * Hasta B12 el control positivo le daba de comer `demos` esperando que NO diera
 * 1,000. Con la pose a distancia 14 el logo entra entero y ese control quedaría
 * CIEGO, así que se afirma lo contrario y el control pasa a ser la distancia
 * VIEJA (9), la única que todavía lo recorta.
 */
afirmar(
  FRACCION.peorFraccionDentro >= 1,
  'B13 — el logo entra ENTERO en las 32 muestras: ninguna pose lo recorta ya',
  `el peor cuadro entra al ${(FRACCION.peorFraccionDentro * 100).toFixed(1)}% y la caja llega a y=${FRACCION.arribaMaxima.toFixed(2)} con el borde en +1,00`,
)
controlPositivo(
  'y el detector no está ciego: con la distancia VIEJA de `demos` (9) el logo SÍ se sale',
  9,
  (d: number) => fraccionDentro(conPose('demos', { distance: d }, 0.75, VENTANAS[0].aspecto)) >= 1,
)
console.log(
  `  LA MASA, que es la otra mitad: el logo ocupa hasta el ${(FRACCION.mayorCobertura.valor * 100).toFixed(1)}% del cuadro a ${FRACCION.mayorCobertura.cuadro}.\n` +
    '  Con las distancias viejas eran 36,1% en 1025×900 —el máximo de todo el recorrido—, y bajarlo es lo que §2 de B13 pidió.',
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
  `  DEFECTO 7 — ¿la superposición mínima del titular del diferencial es MAYOR QUE CERO? ${SUPERPOSICIONES.inevitable ? '🔴 SÍ' : '✅ NO'}: entre ` +
    `${pct(SUPERPOSICIONES.minimaDelDiferencial.menor, 0).trim()} y ${pct(SUPERPOSICIONES.minimaDelDiferencial.mayor, 0).trim()}\n` +
    '  sobre los cuatro cuadros. ⚠️ V3-E LO CERRÓ CON EL ANCLA, no con el layout ni con una pose: el diferencial dejó de\n' +
    '  llenar el cuadro sobre la pose `demos` y lo llena en su ancla DECLARADA (`anclaje.ts`), donde el logo ya se alejó.\n' +
    '  La medición se hace en `fila.llenaDesde`, así que este renglón sigue vivo: si alguien devuelve el ancla, vuelve el 🔴.',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · 🔴 EL CONTRASTE DONDE SE SUPERPONEN — el número que nadie tenía')

for (const linea of tablaDeContraste()) console.log(`  ${linea}`)
afirmar(MEJOR_SOBRE_EL_LOGO < PEOR_SOBRE_EL_FONDO, 'las dos poblaciones son DISJUNTAS en las secciones cuya tinta ES `TINTA_HEX`: el mejor píxel del logo es peor que el peor del fondo', `${MEJOR_SOBRE_EL_LOGO.toFixed(2)}:1 contra ${PEOR_SOBRE_EL_FONDO.toFixed(2)}:1 — la exclusión de \`sinLogo\` no es conservadora`)
/** ⚠️ B12 · La INVERTIDA queda afuera —su tinta es el papel, no `TINTA_HEX`, y
 *  con la noche en 0,04 la sala da 1,00:1 contra una tinta que no usa— y hoy es
 *  UNA: el Cierre pasó a `papel-transparente` cuando el pie dejó de pintar. */
afirmarIgual([...INVERTIDAS_TRANSPARENTES].sort(), ['trabajos'], '  y la invertida se mide aparte, con SU tinta: la exclusión sale de `superficies.ts`')
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
 * SITIO-S10 midió que `demos` no sólo llena el cuadro: **se sale por arriba**, y
 * que `choreography.ts` no mencionaba un recorte en ninguna línea. Llenar y
 * salirse no son lo mismo, y un recorte que nadie escribió se lee como error. El
 * valor NO se tocó —la pose está calibrada y aprobada por grabación—: lo que se
 * agregó es la declaración. Desde acá, si alguien la borra, esto se pone en rojo.
 */
const CHOREO = fuenteDe('src/app/v3/_lib/escena/choreography.ts')
/** El mismo fuente en finales de línea de Unix: el detector tiene que ver los dos. */
const CHOREO_LF = CHOREO.replace(/\r\n/g, '\n')
afirmar(
  CHOREO_KEYFRAMES.some((k) => k.name === 'demos' && k.pose.frameX === 1),
  'la perilla de encuadre de `demos` sigue en su extremo: `frameX` = 1',
  'lo que B13 revocó es «llena el cuadro», no el encuadre lateral: el logo sigue pegado al costado, más chico',
)
/**
 * ⚠️ **B13 · LA DECISIÓN SE REVOCÓ, Y LA DECLARACIÓN CAMBIÓ DE LUGAR.** S11
 * declaró que `demos` llena el cuadro y se sale por arriba; el humano lo revocó
 * —«de ~40 % a ~15 %»— y la pose se alejó a 14. Afirmar que el recorte sigue
 * declarado sería verde por vacío: no existe.
 *
 * ⚠️ **Y la declaración nueva NO puede vivir adentro del array.** Esos
 * comentarios los emite el exportador desde `choreographyNotes.ts`
 * (`/probe-escena/_components/`) y `s7-export.invariant.ts` compara el
 * round-trip byte por byte: escribir ahí obligaría a tocar un directorio que la
 * instrucción protege. Vive en la CABECERA del archivo, que es «comentario de
 * verdad» y el editor no toca. Así que se afirman las dos cosas: que la cabecera
 * lo declara **y que el bloque del keyframe NO lo lleva** —o sea que el
 * round-trip sigue pudiendo cerrar—.
 */
const CABECERA = CHOREO.slice(0, CHOREO.indexOf('export const CHOREO_SCREENS'))
afirmar(
  /de 11,5 a 14 y `demos` de 9 a 14/.test(CABECERA) && /15,64/.test(CABECERA),
  'DECISIÓN — la CABECERA de `choreography.ts` declara el alejamiento de B13, su porqué y el margen que queda',
  `y la medición lo confirma: el logo entra al ${(FRACCION.peorFraccionDentro * 100).toFixed(1)}% en el peor cuadro`,
)
afirmar(
  !declaraEnElBloque(CHOREO, 'demos', /B13/) && !declaraEnElBloque(CHOREO_LF, 'demos', /B13/),
  '  y el bloque del keyframe NO la lleva: es del exportador, y el round-trip de `s7-export` tiene que poder cerrar',
  'lo encuentra con los DOS finales de línea (era el rojo que V3-B arregló)',
)
controlPositivo(
  'el detector del bloque no está ciego: el del `demos` SÍ lleva el recorte que S11 declaró',
  'demos',
  (nombre: string) => !declaraEnElBloque(CHOREO, nombre, /recorte por arriba/i),
)

// §7 vive en `s10-logo-lateral.ts` desde B13: la regla de las 300 líneas, y el
// mismo corte que ya se le hizo al §9.
afirmarElEncuadreLateral()

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · EL DEFECTO 7 — su estado, derivado, y las palancas con su número')

console.log(`  ${parrafoDelDefecto7(SUPERPOSICIONES)}`)
for (const linea of palancasDeComposicion(MAS_ANGOSTO)) console.log(`  ${linea}`)

// ═══════════════════════════════════════════════════════════════════════════
// §9 vive en `s10-logo-columna.ts`: el barrido de la palanca de layout cruzó
// este archivo las 300 líneas. El corte es por tema — es la única sección que
// pregunta por el ANCHO de la columna, y no comparte constante con lo de acá.
afirmarLaPalancaDeLayout()
cerrar('s10-logo.invariant')
