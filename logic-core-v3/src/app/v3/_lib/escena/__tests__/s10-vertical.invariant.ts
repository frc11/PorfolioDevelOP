/**
 * INVARIANTE — EL ENCUADRE EN VERTICAL, a 390×844. La afirmación que §7.60 dice
 * que no existe.
 *
 * Corre con `npm run test:s10-vertical`. Vive en la suite `s10` y no en una
 * propia para que `verificar` siga teniendo 30 pasos: lo que cambia es que el
 * agregado `s10` pasa de 7 invariantes a 8.
 *
 * ── QUÉ HUECO CIERRA, citado ──────────────────────────────────────────────
 *
 * §7.60 de `DIRECCION-ESCENA.md`, textual: *«FUERA DEL ASPECTO 1,7778 NO HAY
 * NINGUNA AFIRMACIÓN QUE CLAVE LA POSICIÓN HORIZONTAL DEL LOGO … el lane entero
 * declara aspectos de 1,1389 a 1,7778 … ningún instrumento del gate mide jamás
 * debajo del codo … la única afirmación de posición que existe ahí es la que
 * clava el defecto, y cuando se la saque no queda ninguna en su lugar.»*
 *
 * Ésta es la que queda en su lugar. Mide a **0,4621**, que es un orden de
 * magnitud debajo de todo lo que el gate miraba.
 *
 * ── ⚠️ Y QUÉ **NO** HACE, QUE ES LA MITAD DE LA DECISIÓN ──────────────────
 *
 * **No mueve un solo `frameX`.** VERTICAL-1 salió a componer con esa perilla y
 * la medición dijo que no es la perilla: los §3, §5b y §6 de abajo son por qué, y
 * cada uno es una afirmación que puede fallar el día que alguien lo arregle.
 *
 * Los 🔴 de este archivo son **defectos declarados, no propiedades deseadas**. La
 * diferencia con `todosCentradosHoy` —la afirmación que §7.60 manda sacar— es
 * exactamente ésa: aquélla afirmaba que un valor producido por un `max(0, …)`
 * roto era el valor correcto; éstas dicen «esto está mal, mide tanto, y esta
 * línea se pone en rojo cuando deje de estarlo».
 *
 * ── ⚠️ TAPADO-1 · EL §5 DE ESTE ARCHIVO PUBLICABA UNA CIFRA QUE NO ERA ────
 *
 * Decía «LA SUPERPOSICIÓN CON LA COLUMNA — 0 % en seis de siete» y lo que medía
 * era el MÍNIMO sobre posiciones verticales hipotéticas. El humano vio el logo
 * tapando el titular entero en una captura mientras esto estaba en verde. El §5
 * de hoy mide en la posición REAL del bloque (derivada en `s10-logo-alto.ts`) y
 * el barrido bajó al §5b con el nombre de lo que contesta: si la superposición
 * es EVITABLE. La historia completa está en el docblock del §5.
 */

import { CHOREO_KEYFRAMES } from '../choreography'
import { MAPEO_DE_LAS_SECCIONES } from '../recorrido'
import { SCENE_ENTRY_POSE, frameScenePose } from '@/lib/scene-framing'
import { makeTrack, type Track } from '@/app/probe-escena/__tests__/harness'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { aCuadroAlto, aCuadroX } from './s10-logo-cajas'
import { muestrearLogo } from './s10-logo'
import { ESCENA_REAL, barridoVertical, cajaDelLogo, fraccionDentro, mayorCaja } from './s10-logo-lectura'
// prettier-ignore
import { SUPUESTOS_DEL_ALTO, conDistribucion, repartoVertical, superposicionReal } from './s10-logo-alto'

// ── El banco ────────────────────────────────────────────────────────────────

/** 390×844: el viewport de layout del teléfono que la instrucción nombra. */
const ANCHO = 390
const ALTO = 844
const ASPECTO = ANCHO / ALTO

/** La malla fina, la misma de `s16-encuadre-soporte`. Celda = 0,01733 NDC = 3,38 px. */
const COL = 300
const FIL = 220
/** La gruesa, para los barridos: 41 × 7 muestras con la fina no cierran en tiempo. */
const COL_B = 120
const FIL_B = 88

/**
 * ⚠️ **EL CAMPO ×2,6 ES PARTE DE LA MEDICIÓN, NO UN PARÁMETRO SUELTO.** Con ×1
 * el muestreo cubre EXACTAMENTE el cuadro: la caja envolvente queda recortada al
 * borde, `fraccionDentro` devuelve 1,000 siempre y el centro de todo keyframe que
 * se salga da **0,5000 exacto por construcción**. §1 lo afirma.
 */
const CAMPO = 2.6

const pistaCon = (nombre: string, frameX: number): Track =>
  makeTrack(CHOREO_KEYFRAMES.map((k) => (k.name === nombre ? { ...k, pose: { ...k.pose, frameX } } : k)))

const PISTA = makeTrack(CHOREO_KEYFRAMES)

function caja(progreso: number, pista: Track, campo = CAMPO, col = COL, fil = FIL) {
  const m = muestrearLogo(progreso, ASPECTO, ESCENA_REAL, col, fil, campo, pista)
  const c = cajaDelLogo(m)
  if (c === null) throw new Error(`sin tinta del logo en p=${progreso}`)
  return { m, c, centroNdc: (c.x0 + c.x1) / 2, ancho: c.x1 - c.x0, dentro: fraccionDentro(m) }
}

const enPx = (centroNdc: number): number => ((centroNdc + 1) / 2) * ANCHO
const pct = (v: number): string => `${(v * 100).toFixed(1)} %`

/** La sección TRANSPARENTE que llena el cuadro en un progreso, si la hay. */
function seccionQueLlena(progreso: number): string | null {
  const enPantalla = MAPEO_DE_LAS_SECCIONES.filter((s) => progreso >= s.seVeDesde && progreso <= s.seVeHasta)
  const llena = enPantalla.find((s) => progreso >= s.llenaDesde && progreso <= s.llenaHasta)
  if (llena !== undefined && llena.dejaVerLaEscena) return llena.id
  return enPantalla.filter((s) => s.dejaVerLaEscena).at(-1)?.id ?? null
}

/** La superposición MÍNIMA sobre todas las alturas del bloque de texto. */
function minimaEn(progreso: number, id: string, pista: Track, col = COL_B, fil = FIL_B): number {
  const c = mayorCaja(id, ANCHO)
  const x0 = aCuadroX(c.banda.izquierda, ANCHO)
  const x1 = aCuadroX(c.banda.izquierda + c.banda.ancho, ANCHO)
  const m = muestrearLogo(progreso, ASPECTO, ESCENA_REAL, col, fil, CAMPO, pista)
  return barridoVertical(m, x0, x1, aCuadroAlto(c.altoPx, ALTO), 100).minima
}

/** Los cinco con encuadre lateral. Los dos del cierre van en `frameX` 0. */
const CON_ENCUADRE = CHOREO_KEYFRAMES.filter((k) => k.pose.frameX !== 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · LA VENTANA Y EL CAMPO — y el control de la clase de error que ya se cometió')

afirmarIgual([ANCHO, ALTO], [390, 844], 'se mide a 390×844, el viewport de layout del teléfono')
afirmar(ASPECTO < 0.5, `el aspecto es ${ASPECTO.toFixed(6)}: un orden debajo de los 1,1389–1,7778 que el gate miraba`)

/**
 * ⚠️ **ESTE CONTROL NO COMPARA UN VALOR: COMPARA UNA CLASE DE ERROR.** En
 * MOVIL-1 el script de posiciones corrió con campo ×1 y publicó **0,5000 exacto
 * en tres de los siete keyframes**, que se lee igual que «está centrado» y no lo
 * es: es la caja recortada a la primera y la última celda de la malla. Lo que
 * sigue afirma que el campo ×1 PRODUCE ese artefacto y que ×2,6 NO, así que si
 * alguien devuelve el campo a 1, esto falla.
 */
const RECORTABLES = ['hero', 'números', 'trabajos'] as const
for (const nombre of RECORTABLES) {
  const k = CHOREO_KEYFRAMES.find((x) => x.name === nombre)
  if (k === undefined) continue
  const conUno = caja(k.at, PISTA, 1)
  const conCampo = caja(k.at, PISTA)
  afirmar(
    Math.abs(conUno.centroNdc) < 1e-9,
    `  con campo ×1, \`${nombre}\` da el centro geométrico EXACTO — el artefacto del recorte`,
    `x0 ${conUno.c.x0.toFixed(4)} · x1 ${conUno.c.x1.toFixed(4)} — la primera y la última celda`,
  )
  afirmar(
    Math.abs(conCampo.centroNdc) > 1e-6,
    `  y con campo ×${CAMPO} NO: la caja es la del logo y el centro es otro`,
    `${enPx(conCampo.centroNdc).toFixed(2)} px contra los ${enPx(conUno.centroNdc).toFixed(2)} px del artefacto`,
  )
}
controlPositivo(
  'el detector del artefacto no está ciego: con campo ×2,6 el `hero` no da el centro exacto',
  CAMPO,
  (campo: number) => Math.abs(caja(0, PISTA, campo).centroNdc) < 1e-9,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · `frameX` ESTÁ VIVO EN VERTICAL — y el preloader, al lado, NO lo está')

/**
 * La mitad que faltaba: que la perilla MUEVA el logo debajo del codo. En /v3 se
 * cumple desde SITIO-S11 —`encuadre.ts` usa `Math.abs`— y **nunca se afirmó a
 * este aspecto**.
 */
for (const k of CON_ENCUADRE) {
  const menos = enPx(caja(k.at, pistaCon(k.name, -1)).centroNdc)
  const mas = enPx(caja(k.at, pistaCon(k.name, 1)).centroNdc)
  afirmar(
    Math.abs(mas - menos) > 20,
    `\`${k.name}\`: de \`frameX\` −1 a +1 el logo RECORRE el cuadro`,
    `${menos.toFixed(1)} px → ${mas.toFixed(1)} px (${(mas - menos).toFixed(1)} px de recorrido)`,
  )
}

/**
 * ⚠️ **EL CONTROL ES LA OTRA COPIA DE LA FÓRMULA, MEDIDA AL LADO — Y CORRIGE LA
 * PREMISA DE §7.60.** Aquel ítem dice que `todosCentradosHoy` se pondrá en rojo
 * «el día que el reencuadre por aspecto funcione en vertical». En /v3 YA
 * funciona —lo acaba de afirmar el bloque de arriba— y aquella comprobación
 * sigue en verde, porque **no depende de /v3**: depende de `lib/scene-camera.ts`,
 * que conserva el `max(0, …)`. A 390 su `travelX` se clava en 0 y el aterrizaje
 * del preloader da 195,00 px **para cualquier `frameX`**.
 *
 * O sea que este sprint no podía ponerla en rojo ni queriendo, y la que la va a
 * mover es la que adopte `recorridoDeEncuadre` en el preloader.
 */
const ATERRIZAJES = [-1, -0.5, 0, 0.5, 1].map((frameX) => frameScenePose({ ...SCENE_ENTRY_POSE, frameX }, ANCHO, ALTO)?.centerXPx ?? Number.NaN)
afirmar(
  new Set(ATERRIZAJES.map((x) => x.toFixed(6))).size === 1 && Math.abs(ATERRIZAJES[0] - ANCHO / 2) < 1e-6,
  '🔴 y el PRELOADER, con la misma perilla, es INERTE a 390: cinco `frameX` y un solo aterrizaje',
  `${ATERRIZAJES[0].toFixed(2)} px = ${ANCHO}/2 — es \`lib/scene-camera.ts\` con su \`max(0, …)\`, la copia que §7.44 censó`,
)
controlPositivo(
  'el detector no está ciego: a 1440×810 el MISMO preloader sí se mueve con `frameX`',
  1440,
  (w: number) =>
    new Set([-1, 0, 1].map((frameX) => (frameScenePose({ ...SCENE_ENTRY_POSE, frameX }, w, 810)?.centerXPx ?? 0).toFixed(6))).size === 1,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · 🔴 EL LOGO NO ENTRA EN EL CUADRO — el defecto que VERTICAL-1 midió y NO arregló')

/**
 * El criterio (a) del sprint era *«el logo ENTERO adentro del cuadro — 100 %, no
 * 89»*. **Es inalcanzable moviendo `frameX`, y la razón es de una línea: la
 * perilla TRASLADA y la caja es más ancha que el cuadro.** El cuadro mide 2,0 en
 * esta unidad; la tinta del logo mide 2,27–2,37 en los cinco con encuadre.
 */
const ANCHOS = CHOREO_KEYFRAMES.map((k) => ({ nombre: k.name, ...caja(k.at, PISTA) }))
for (const a of ANCHOS.filter((x) => CON_ENCUADRE.some((k) => k.name === x.nombre))) {
  afirmar(
    a.ancho > 2,
    `🔴 \`${a.nombre}\`: la tinta es MÁS ANCHA que el cuadro`,
    `${a.ancho.toFixed(4)} contra 2,0000 — ${((a.ancho / 2 - 1) * 100).toFixed(1)} % de más; entra el ${(a.dentro * 100).toFixed(1)} %`,
  )
}
afirmar(
  ANCHOS.filter((a) => !CON_ENCUADRE.some((k) => k.name === a.nombre)).every((a) => a.ancho <= 2 && a.dentro >= 1),
  '  y los DOS del cierre SÍ entran: el detector no dice que nada entra nunca',
  `${ANCHOS.filter((a) => a.ancho <= 2).map((a) => `${a.nombre} ${a.ancho.toFixed(4)}`).join(' · ')} — es la distancia 27, la más lejana del recorrido`,
)
controlPositivo(
  'el detector de «no entra» no está ciego: con la caja del cierre daría que SÍ entra',
  1.750667,
  (ancho: number) => ancho > 2,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · LA POSICIÓN HORIZONTAL DE LOS SIETE — la que §7.60 pide, clavada')

/**
 * ⚠️ **ESTOS SON LOS VALORES DE HOY, Y ESO ES LA DECISIÓN DE VERTICAL-1.** No se
 * movió ninguno porque la medición dijo que la perilla no resuelve ni (a) ni (b)
 * —§3 y §5—, y porque `frameX` no sabe de aspecto: el mismo número gobierna
 * 1440, 1920 y, en el hero, el aterrizaje del preloader del sitio VIVO
 * (`SCENE_ENTRY_POSE === CHOREO_KEYFRAMES[0].pose`).
 *
 * La tolerancia es de media celda de la malla (la celda mide 3,38 px a este
 * ancho): cualquier corrimiento real de un keyframe pone esto en rojo.
 */
const POSICIONES: readonly (readonly [string, number])[] = [
  ['hero', 215.28],
  ['quiénes somos', 59.8],
  ['números', 179.79],
  ['trabajos', 171.34],
  ['demos', 282.88],
  ['cierre', 195.0],
  ['cierre · sostén', 195.0],
]
for (const [nombre, esperado] of POSICIONES) {
  const k = CHOREO_KEYFRAMES.find((x) => x.name === nombre)
  if (k === undefined) {
    afirmar(false, `existe el keyframe \`${nombre}\``)
    continue
  }
  const px = enPx(caja(k.at, PISTA).centroNdc)
  afirmar(
    Math.abs(px - esperado) < 1.7,
    `\`${nombre}\` (p=${k.at.toFixed(3)}, frameX ${k.pose.frameX}) centra la tinta en ${esperado} px`,
    `medido ${px.toFixed(2)} px · el centro geométrico de la pantalla es ${ANCHO / 2}`,
  )
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · 🔴 LA SUPERPOSICIÓN DONDE EL TEXTO ESTÁ — la cifra que este archivo publicaba mal')

/**
 * ⚠️ **ACÁ HABÍA UN 0 % QUE LA PANTALLA DESMENTÍA, Y ESTE BLOQUE ES SU
 * ARREGLO.**
 *
 * Lo que §5 publicaba, con el título «LA SUPERPOSICIÓN CON LA COLUMNA — 0 % en
 * seis de siete», era `barridoVertical(...).minima`: el **mínimo sobre todas las
 * posiciones verticales que la caja podría ocupar**. La línea de cada afirmación
 * lo decía —*«existe una altura con superposición CERO»*— y era verdad. Lo que
 * no era verdad es la lectura que el título inducía, porque **el bloque no está
 * en esa altura**: estaba donde lo ponía `justify-center`, o sea el medio de la
 * pantalla, o sea exactamente donde está el logo.
 *
 * La causa, con su línea: `minimaEn` —abajo en este mismo archivo— devolvía
 * `.minima` de `barridoVertical` (`s10-logo-lectura.ts`), y **la posición
 * vertical del bloque no se derivaba en ningún lado**: `s10-logo-cajas.ts` lo
 * declaraba como su supuesto 4. El instrumento se fabricaba la posición
 * favorable y después afirmaba sobre ella, que es la falla que este repo llama
 * «verde por arnés».
 *
 * El discriminador empírico, medido sobre el píxel con
 * `scripts-tapado/a-verdad.ts` en la misma ventana donde esto decía 0 %:
 * **54,8 % de la tinta del titular sobre la masa negra del logo, con el 54,7 %
 * de ella por debajo de AA**. El humano lo vio antes que el instrumento.
 *
 * Lo que sigue mide en la posición REAL, derivada en `s10-logo-alto.ts` con las
 * mismas clases que el reparto horizontal ya leía. El barrido no se borra: baja
 * al §5b con el nombre de la pregunta que sí contesta.
 */
const REPARTO_DE_HOY = repartoVertical('hero', ANCHO, ALTO)
const MUESTRA_DEL_HERO = muestrearLogo(0, ASPECTO, ESCENA_REAL, COL, FIL, 1)
const REAL_HOY = superposicionReal(MUESTRA_DEL_HERO, REPARTO_DE_HOY)
const REAL_CENTRADO = superposicionReal(
  MUESTRA_DEL_HERO,
  repartoVertical('hero', ANCHO, ALTO, { clasesDe: conDistribucion('center') }),
)

afirmar(
  REPARTO_DE_HOY.sinModelar.length === 0,
  'el reparto vertical del hero no encontró una sola clase que no sepa modelar',
  'si aparece una, sale acá con su nombre en vez de desaparecer adentro de una cifra',
)
for (const c of REAL_HOY.porCaja) {
  console.log(`  ${c.etiqueta.padEnd(5)} ${pct(c.fraccion)} — «${c.texto.slice(0, 34)}»`)
}
afirmar(
  REAL_CENTRADO.fraccion > 0.2,
  '🔴 CON EL BLOQUE CENTRADO — la composición de la captura del humano — el hero NO está limpio',
  `${pct(REAL_CENTRADO.fraccion)} del área del texto sobre tinta del logo; el navegador midió 54,8 % de la TINTA del titular`,
)
afirmar(
  REAL_HOY.fraccion < REAL_CENTRADO.fraccion,
  '  y la composición de HOY —`justify-end` abajo del breakpoint— baja esa cifra',
  `${pct(REAL_CENTRADO.fraccion)} → ${pct(REAL_HOY.fraccion)} · peor caja: «${REAL_HOY.peor?.texto.slice(0, 26) ?? 'n/d'}» al ${pct(REAL_HOY.peor?.fraccion ?? 0)}`,
)
/**
 * ⚠️ **EL CONTROL POSITIVO ES LA COMPOSICIÓN DE LA CAPTURA DEL HUMANO.** Le da
 * de comer al medidor el hero CENTRADO —el estado en el que el logo se come el
 * titular entero— y exige que NO lo lea como limpio. El segundo control corre el
 * instrumento VIEJO sobre esa misma composición y comprueba que sí estaba ciego:
 * su mínimo da 0 % ahí. Los dos juntos son lo que impide que alguien vuelva a
 * publicar un mínimo con el nombre de una superposición.
 */
controlPositivo(
  'el medidor de superposición REAL no está ciego: con el bloque centrado no devuelve «limpio»',
  'center',
  (como: string) =>
    superposicionReal(
      MUESTRA_DEL_HERO,
      repartoVertical('hero', ANCHO, ALTO, { clasesDe: conDistribucion(como) }),
    ).fraccion < 0.01,
)
controlPositivo(
  '  y el barrido VIEJO SÍ estaba ciego: sobre esa misma composición su mínimo da cero',
  0.01,
  (umbral: number) => {
    const c = mayorCaja('hero', ANCHO)
    return (
      barridoVertical(
        MUESTRA_DEL_HERO,
        aCuadroX(c.banda.izquierda, ANCHO),
        aCuadroX(c.banda.izquierda + c.banda.ancho, ANCHO),
        aCuadroAlto(c.altoPx, ALTO),
        100,
      ).minima > umbral
    )
  },
)
console.log(`  supuestos del alto:\n${SUPUESTOS_DEL_ALTO.map((x) => `   · ${x}`).join('\n')}`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5b · ¿ES EVITABLE MOVIENDO EL BLOQUE? — el barrido, con el nombre de lo que mide')

/**
 * El criterio (b) era *«cero superposición con la columna de texto»*. A 390 la
 * columna es UNA sola en las ocho secciones —x = 32, ancho = 326, el 83,6 % del
 * viewport— y el logo es MÁS ANCHO que el cuadro, así que **la columna está
 * siempre adentro del rango horizontal del logo**: la única separación posible
 * es vertical, y ésa la mide `barridoVertical`, no `frameX`.
 *
 * ⚠️ **UN 0 % ACÁ NO DICE «NO SE SUPERPONE»: DICE «SE PUEDE EVITAR».** Es el
 * mínimo sobre todas las alturas que la caja podría ocupar, no sobre la que
 * ocupa. Cuánto se superpone de verdad está arriba, en §5. Los dos hacen falta y
 * ninguno reemplaza al otro: éste dice si mover el texto alcanza, aquél dice
 * cuánto hay que moverlo.
 */
const MINIMAS = CHOREO_KEYFRAMES.map((k) => {
  const id = seccionQueLlena(k.at)
  return { nombre: k.name, progreso: k.at, id, minima: id === null ? 0 : minimaEn(k.at, id, PISTA) }
})
for (const m of MINIMAS) {
  if (m.id === null) continue
  if (m.minima < 1e-6) {
    afirmar(true, `\`${m.nombre}\` sobre \`${m.id}\`: EVITABLE — existe una altura con superposición cero`)
  } else {
    afirmar(
      m.minima > 0,
      `🔴 \`${m.nombre}\` sobre \`${m.id}\`: INEVITABLE — no existe una altura sin superposición`,
      `la mínima es ${(m.minima * 100).toFixed(1)} % — el \`h2\` de esa sección mide 8 renglones a 390 y no entra en el hueco`,
    )
  }
}
afirmarIgual(
  MINIMAS.filter((m) => m.id !== null && m.minima > 1e-6).map((m) => m.nombre),
  ['demos'],
  '  y es UNO solo: seis de los siete se pueden componer moviendo el texto, sin tocar la escena',
)
controlPositivo(
  'el medidor de superposición sabe devolver algo mayor que cero',
  'demos',
  (nombre: string) => {
    const k = CHOREO_KEYFRAMES.find((x) => x.name === nombre)
    const id = k === undefined ? null : seccionQueLlena(k.at)
    return k === undefined || id === null || minimaEn(k.at, id, PISTA) < 1e-6
  },
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · POR QUÉ NO SE MOVIÓ NINGUNA PERILLA DE ESCENA — la mínima es PLANA en el barrido')

/**
 * La prueba de que `frameX` no es la palanca de (b): barriendo la perilla de −1
 * a +1, la superposición mínima **no cambia** en los seis que ya están en cero.
 * En `demos` sí cambia, y para PEOR — lo que confirma que el detector no está
 * ciego y que mover la perilla ahí sería empeorar.
 */
const EXTREMOS = [-1, 0, 1]
for (const m of MINIMAS) {
  if (m.id === null || m.nombre === 'demos') continue
  const valores = EXTREMOS.map((fx) => minimaEn(m.progreso, m.id as string, pistaCon(m.nombre, fx)))
  afirmar(
    valores.every((v) => v < 1e-6),
    `\`${m.nombre}\`: la mínima sigue en 0 % con \`frameX\` −1, 0 y +1 — la perilla no la toca`,
  )
}
const DEMOS = MINIMAS.find((m) => m.nombre === 'demos')
if (DEMOS !== undefined && DEMOS.id !== null) {
  const valores = EXTREMOS.map((fx) => minimaEn(DEMOS.progreso, DEMOS.id as string, pistaCon('demos', fx)))
  afirmar(
    Math.max(...valores) - Math.min(...valores) > 1e-3,
    '  control — en `demos` el barrido SÍ mueve la mínima: el detector no está ciego',
    `${valores.map((v) => `${(v * 100).toFixed(1)} %`).join(' · ')} para frameX −1 · 0 · +1`,
  )
  afirmar(
    valores[2] <= Math.min(...valores) + 1e-6,
    '  y el `frameX` de HOY (1) ya es el mejor de los tres: moverlo sería empeorar',
    `hoy ${(valores[2] * 100).toFixed(1)} % contra ${(valores[0] * 100).toFixed(1)} % en −1`,
  )
}

cerrar('s10-vertical.invariant')
