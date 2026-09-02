/**
 * INVARIANTE — V3-B · LA ESCENA QUE SE MUEVE DESDE EL PRIMER SCROLL.
 *
 *     npx tsx src/app/v3/_lib/escena/__tests__/s13b-escena.invariant.ts
 *     npm run test:s13b-escena
 *
 * Las cuatro cosas que V3-B toca o mide, cada una con su instrumento:
 *
 *   §1  **el sostén del hero sacado** — y la velocidad que eso deja en el
 *       arranque, contra la del resto del recorrido, en las dos unidades.
 *   §2  **el encuadre del hero** — cuánto logo entra en el cuadro en 1440, 1920
 *       y 2560, y cuánto se movió el destino del preloader.
 *   §3  **el progreso derivado de las secciones** — contra la regla vieja
 *       corrida sobre el mismo documento, y los dos acoplamientos con el DOM.
 *   §4  **la ventana del diferencial** — cobertura y contraste juntos, y el
 *       espacio ENTERO de anclajes que `TRAMOS_ANCLADOS` puede producir.
 *   §5  **los pendientes** — lo que V3-B dejó rojo o vacío en archivos que la
 *       regla 4 le prohíbe tocar, detectado sobre el fuente y con su arreglo.
 *
 * ⚠ **Lo que este archivo NO hace: arreglar el §4.** La instrucción es explícita
 * —*«si la ventana existe, anclá el diferencial ahí; si NO existe, NO lo
 * arregles»*— y la medición devolvió un tercer caso que no estaba previsto: **la
 * ventana existe y ningún anclaje alcanzable cae adentro**. Mover el diferencial
 * al único otro anclaje posible pone `s8-tinta` §5 en rojo por 3,24:1 contra AA.
 * Se publica la tabla y se frena, que es lo que la regla 13 pide de un defecto
 * que se mide y no se arregla. **La salida elegida —sacarle la cuantización al
 * ancla, sin tocar poses ni `secciones.ts`— está escrita en `anclaje.ts` y es el
 * sprint siguiente.**
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { CHOREO_KEYFRAMES } from '../choreography'
// prettier-ignore
import { PISTA_CON_SOSTEN, PISTA_SIN_SOSTEN, SOSTEN_DEL_HERO, afirmarLosAcoplamientosConElDom, azimutEn, cierreDelTramo, mayorEscalonEnLosNudos, mismaPose, perfilDeSegmentos, picoPorPantalla, poseEn, reconstruirSosten } from './s13b-soporte'
// prettier-ignore
import { CUADROS, CUADROS_DE_V3B, FUENTE_DEL_INTRO, PRIMERO_DEL_ARRAY, cuantoSeMovio, declaraLaVentana, destinoEn, lineasDelDestino, lineasDelHero, tablaDelHero } from './s13b-encuadre'
// prettier-ignore
import { CASOS, REGLA_VIEJA, lineasDeUnCaso, mayorCorrimiento, tablaDeSecciones } from './s13b-progreso'
import { afirmarLaVentanaDelDiferencial } from './s13b-diferencial'
import { afirmarLosPendientes } from './s13b-pendientes'
import { EL_DIFERENCIAL } from './s13b-reparto'
import { muestrearLogo } from './s10-logo'
import { ESCENA_REAL } from './s10-logo-lectura'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · EL SOSTÉN DEL HERO, SACADO — y qué velocidad deja en el arranque')

afirmar(
  !CHOREO_KEYFRAMES.some((k) => k.name === 'hero · sostén'),
  'el keyframe `hero · sostén` NO está en la coreografía',
  `${CHOREO_KEYFRAMES.length} entradas: ${CHOREO_KEYFRAMES.map((k) => k.name).join(' · ')}`,
)
afirmar(
  CHOREO_KEYFRAMES.some((k) => k.name === 'cierre · sostén'),
  '  y el del CIERRE sigue: la instrucción sacaba uno, no el patrón',
)

/**
 * ⚠ **LA RECONSTRUCCIÓN SE VALIDA ANTES DE USARLA.** «Cómo era antes» es un dato
 * que este invariante fabrica, así que primero se le exige que reproduzca un
 * sostén que SÍ existe en el archivo. Sin esto, todo el §1 compararía contra una
 * invención.
 */
const cierreReconstruido = reconstruirSosten('cierre', cierreDelTramo('cierre'), 'arrive', 'literal')
const cierreReal = CHOREO_KEYFRAMES.find((k) => k.name === 'cierre · sostén')
afirmar(
  cierreReconstruido !== null &&
    cierreReal !== undefined &&
    cierreReconstruido.at === cierreReal.at &&
    mismaPose(cierreReconstruido, cierreReal),
  'RECONSTRUCTOR — reconstruir `cierre · sostén` devuelve el keyframe que está en el archivo',
  'la misma función arma el `hero · sostén` de ANTES: no es una pose escrita a mano',
)
controlPositivo(
  'y no reconstruye cualquier cosa: sobre un keyframe que no existe devuelve null',
  'demos · sostén',
  (base: string) => reconstruirSosten(base, 1, 'shift') !== null,
)
afirmar(SOSTEN_DEL_HERO !== null, '  el sostén del hero se reconstruye a partir de la pose `hero`', SOSTEN_DEL_HERO === null ? '' : `at=${SOSTEN_DEL_HERO.at}`)

const CON = perfilDeSegmentos(PISTA_CON_SOSTEN)
const SIN = perfilDeSegmentos(PISTA_SIN_SOSTEN)
console.log('  tramo             pantallas   ritmo     ANTES: /progreso  /pantalla    AHORA: /progreso  /pantalla')
for (let i = 0; i < CON.length; i += 1) {
  console.log(
    `  ${CON[i].tramo.padEnd(16)} ${String(CON[i].pantallas).padStart(6)}  ${CON[i].ritmo.toFixed(5)}` +
      `        ${CON[i].porProgreso.toFixed(3).padStart(8)}  ${CON[i].porPantalla.toFixed(4).padStart(9)}` +
      `           ${SIN[i].porProgreso.toFixed(3).padStart(8)}  ${SIN[i].porPantalla.toFixed(4).padStart(9)}`,
  )
}

afirmar(
  CON[0].porPantalla < 1e-6 && SIN[0].porPantalla > 1e-6,
  'LA ESCENA SE MUEVE DESDE EL PRIMER PÍXEL: el tramo del hero deja de estar quieto',
  `${CON[0].porPantalla.toFixed(4)} → ${SIN[0].porPantalla.toFixed(4)} alturas de cuadro por pantalla de scroll`,
)
afirmar(
  Math.abs(azimutEn(PISTA_CON_SOSTEN, 0.125) - 0) < 1e-9 && azimutEn(PISTA_SIN_SOSTEN, 0.125) > 1,
  '  y la primera pantalla pasa a barrer azimut, que es lo que el humano no veía',
  `${azimutEn(PISTA_CON_SOSTEN, 0.125).toFixed(1)}° → ${azimutEn(PISTA_SIN_SOSTEN, 0.125).toFixed(1)}° · pose en p=0,125: ${poseEn(PISTA_SIN_SOSTEN, 0.125)}`,
)

/**
 * ⚠ **«¿QUEDA VIOLENTO?» SE CONTESTA EN LA UNIDAD DEL SCROLL, NO EN LA DEL
 * PROGRESO.** La instrucción pide la velocidad *«en alturas de cuadro por unidad
 * de progreso»*, que es la unidad con la que `choreography.ts` publica el pico
 * del track — y en esa unidad el arranque marca 27,714, que suena enorme. Pero
 * el progreso no es lo que el humano controla: es el SCROLL, y cada tramo
 * reparte su progreso sobre una cantidad distinta de pantallas. Las dos unidades
 * están arriba, y la afirmación se hace sobre la segunda.
 */
const picoCon = picoPorPantalla(CON)
const picoSin = picoPorPantalla(SIN)
afirmar(
  SIN[0].porPantalla < picoSin,
  'EL ARRANQUE NO ES LO MÁS RÁPIDO DEL RECORRIDO — ni de lejos',
  `arranque ${SIN[0].porPantalla.toFixed(4)} contra el pico ${picoSin.toFixed(4)} del tramo "${SIN.find((s) => s.porPantalla === picoSin)?.tramo}" = ${((100 * SIN[0].porPantalla) / picoSin).toFixed(1)}% del pico`,
)
afirmar(
  picoSin === picoCon,
  '  y el pico del recorrido no se movió: lo que cambia es dónde EMPIEZA a moverse',
  `${picoCon.toFixed(4)} → ${picoSin.toFixed(4)} alturas por pantalla de scroll`,
)
afirmar(
  SIN[1].porPantalla < CON[1].porPantalla,
  '  el tramo SIGUIENTE se descomprime: los 130° dejan de estar apretados en dos pantallas',
  `"${CON[1].tramo}" baja de ${CON[1].porPantalla.toFixed(4)} a ${SIN[1].porPantalla.toFixed(4)} (−${(100 * (1 - SIN[1].porPantalla / CON[1].porPantalla)).toFixed(1)}%)`,
)

/**
 * ⚠ **EL SALTO ENTRE LOS DOS PRIMEROS TRAMOS SE DISUELVE — Y NO ES EL TIRÓN
 * INSTANTÁNEO, QUE NO SE MUEVE.** Son dos cosas distintas y las dos se publican,
 * porque una sola de las dos dejaría el reporte torcido:
 *
 *   · **El salto entre segmentos.** Con el sostén, la primera pantalla iba a 0 y
 *     la segunda llegaba a 5,1959: el recorrido arrancaba de la nada y se comía
 *     los 130° de Quiénes somos en dos pantallas. Sin él los dos primeros
 *     segmentos corren casi a la misma velocidad. **Eso es lo que se afirma.**
 *   · **El tirón instantáneo en el nudo** —el salto de `speedAt` de un lado al
 *     otro de p=0,125— ya era chiquito con el sostén y sigue siéndolo: la curva
 *     `shift` arranca con pendiente cero, así que en el borde no había ningún
 *     salto que sacar. El mayor tirón del recorrido no vive en el hero: vive en
 *     `demos → cierre`, donde el ritmo se multiplica por diez. Se publica para
 *     que quede claro qué NO arregló este lane.
 */
const saltoCon = Math.abs(CON[1].porPantalla - CON[0].porPantalla)
const saltoSin = Math.abs(SIN[1].porPantalla - SIN[0].porPantalla)
afirmar(
  saltoSin < saltoCon / 10,
  '  y el SALTO entre el primer tramo y el segundo se disuelve: el sostén ERA el salto',
  `${saltoCon.toFixed(4)} → ${saltoSin.toFixed(4)} alturas por pantalla de scroll — ×${(saltoCon / saltoSin).toFixed(0)} más chico`,
)
controlPositivo(
  'el comparador de saltos no da cero contra el perfil que SÍ lo tiene',
  CON,
  (perfil: typeof CON) => Math.abs(perfil[1].porPantalla - perfil[0].porPantalla) < 1e-6,
)
const peorCon = mayorEscalonEnLosNudos(PISTA_CON_SOSTEN)
const peorSin = mayorEscalonEnLosNudos(PISTA_SIN_SOSTEN)
afirmar(
  peorSin.valor === peorCon.valor && peorSin.nudo === peorCon.nudo,
  '  el mayor TIRÓN instantáneo del recorrido no se mueve, y no está en el hero: queda publicado',
  `${peorSin.valor.toFixed(4)} en el nudo "${peorSin.nudo}" — ahí el ritmo se multiplica por diez, y eso V3-B no lo toca`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · EL ENCUADRE DEL HERO — cuánto logo entra, y el destino del preloader')

/**
 * ⚠️ **CORRECCIÓN DE LA INSTRUCCIÓN, confirmada por el dueño del proyecto.**
 *
 * La instrucción de V3-B pedía dos cosas que no pueden ser las dos: *«cambia el
 * sostén, **el encuadre del hero**, de dónde sale el progreso y a qué progreso se
 * ancla el diferencial»* y, tres líneas antes, *«este lane NO cambia NINGUNA
 * POSE … **no los valores de las poses**»*. **`frameX` ES un valor de pose** —uno
 * de los cinco canales de `ChoreoPose`— así que "cambiar el encuadre del hero"
 * sin tocar la pose no existe: el encuadre del hero es `frameX: 0.68`, y nada
 * más.
 *
 * **Gana la prohibición, y el dueño lo confirmó al cerrar el sprint.** El valor
 * no se tocó. Lo que este §2 hace en su lugar es lo que la instrucción también
 * pedía y sí se puede: **medirlo**. Y la medición dice que no había nada que
 * arreglar — el logo entra entero en los siete cuadros, con 0,211 de margen en
 * el peor. La premisa *«el logo entra cortado»* no se reproduce, y ésa es la
 * respuesta al defecto 2, no un pendiente.
 *
 * Lo único que este lane le movió al encuadre del hero es **cuánto dura**: con
 * `hero · sostén` sacado, `frameX` deja de estar clavado en 0,68 la pantalla
 * entera y el logo **se centra solo mientras se scrollea** (borde derecho de la
 * caja 0,737 → 0,269 entre p=0 y p=0,125, en la tabla de abajo). Es un efecto
 * del §1, no una edición del encuadre.
 */

for (const [w, h] of [[1440, 810], [1920, 1080], [2560, 1440]] as const) {
  afirmar(
    declaraLaVentana(FUENTE_DEL_INTRO, w, h),
    `el alto de ${w} no se elige acá: \`scene-framing.invariant.ts\` ya declara ${w}×${h}`,
  )
}
controlPositivo(
  'y el detector de ventanas declaradas sabe decir que no: 1920×999 no está en esa lista',
  1080 - 81,
  (alto: number) => declaraLaVentana(FUENTE_DEL_INTRO, 1920, alto),
)

const HERO = tablaDelHero()
for (const linea of lineasDelHero(HERO)) console.log(`  ${linea}`)

afirmar(
  HERO.every((f) => f.dentro >= 1 && !f.tocaElBorde),
  'EL LOGO DEL HERO ENTRA ENTERO en los siete cuadros y en los tres progresos de su ventana',
  `la premisa «el logo entra cortado» NO se reproduce: la fracción dentro es 100,00% en las ${HERO.length} muestras`,
)
afirmar(
  HERO.every((f) => f.margen > 0.2),
  '  y no por un pelo: el borde derecho de la caja queda lejos del borde del cuadro',
  `el margen más chico es ${Math.min(...HERO.map((f) => f.margen)).toFixed(3)} del medio ancho, en ${HERO.reduce((a, b) => (b.margen < a.margen ? b : a)).ventana.etiqueta}`,
)
controlPositivo(
  'el medidor SÍ sabe ver un logo que se sale: la pose del diferencial no da 100%',
  0.75,
  (p: number) => {
    const m = muestrearLogo(p, CUADROS[0].aspecto, ESCENA_REAL, 300, 220, 2.6)
    return m.enCuadro / m.celdasDeLogo >= 1
  },
)

const porAspecto = new Map(CUADROS_DE_V3B.map((v) => [v.etiqueta, HERO.filter((f) => f.ventana.etiqueta === v.etiqueta)]))
const a1440 = porAspecto.get('1440×810') ?? []
afirmar(
  CUADROS_DE_V3B.every((v) => Math.abs(v.aspecto - CUADROS_DE_V3B[0].aspecto) < 1e-12) &&
    CUADROS_DE_V3B.every((v) =>
      (porAspecto.get(v.etiqueta) ?? []).every((f, i) => f.dentro === a1440[i].dentro && f.derecha === a1440[i].derecha),
    ),
  'LOS TRES ANCHOS DAN LO MISMO, y ése es el hallazgo: la proyección sólo depende del ASPECTO',
  '1440×810 · 1920×1080 · 2560×1440 comparten aspecto 1,7778 y devuelven la misma fracción y la misma caja — «en 1920 es peor» no puede ser una cuestión de ancho',
)

afirmar(
  PRIMERO_DEL_ARRAY.name === 'hero',
  'EL DESTINO DEL PRELOADER — `CHOREO_KEYFRAMES[0]` sigue siendo la pose del hero',
  '`scene-framing.ts` lee el ÍNDICE CERO, así que sacar un keyframe del medio no lo toca',
)
const destinos = CUADROS_DE_V3B.map((v) => destinoEn(v))
afirmar(
  destinos.every((d, i) => d !== null && cuantoSeMovio(d, destinoEn(CUADROS_DE_V3B[i], PRIMERO_DEL_ARRAY.pose)!) === 0),
  '  y el destino se movió CERO píxeles: la pose que el intro proyecta no cambió de valor',
  'V3-B no tocó `frameX`, `height`, `distance` ni `angleDeg` del hero — el encuadre que cambió es CUÁNTO DURA, no dónde está',
)
for (const linea of lineasDelDestino(CUADROS_DE_V3B)) console.log(`  ${linea}`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · EL PROGRESO SALE DE LAS SECCIONES — contra la regla vieja, y sus dos acoplamientos')

afirmarLosAcoplamientosConElDom()

for (const c of CASOS) for (const linea of lineasDeUnCaso(c)) console.log(`  ${linea}`)

const hoy = CASOS[0]
const conPie = CASOS.slice(1)
afirmarIgual(
  mayorCorrimiento(tablaDeSecciones(hoy), (f) => f.conLaReglaVieja).delta,
  0,
  'con el documento de HOY las dos reglas dan lo mismo: el cambio no mueve nada mientras nada sobre',
)
for (const c of conPie) {
  const filas = tablaDeSecciones(c)
  const vieja = mayorCorrimiento(filas, (f) => f.conLaReglaVieja)
  const nueva = mayorCorrimiento(filas, (f) => f.conLaReglaNueva)
  afirmar(
    nueva.delta === 0 && vieja.delta > 0,
    `${c.etiqueta} — CON EL PIE AFUERA la regla vieja corre el anclaje y la nueva NO mueve un bit`,
    `vieja: hasta ${vieja.delta.toFixed(4)} de progreso (en "${vieja.id}") · nueva: ${nueva.delta.toFixed(4)}`,
  )
  const dif = filas.find((f) => f.id === EL_DIFERENCIAL)
  if (dif !== undefined) {
    console.log(
      `  ${EL_DIFERENCIAL}: 0,7500 → ${dif.conLaReglaVieja.toFixed(4)} con la regla vieja CORRIDA` +
        ` · ${dif.deLaCita.toFixed(4)} con la aproximación lineal de la cita de §7.46` +
        ` · ${dif.conLaReglaNueva.toFixed(4)} con la nueva`,
    )
  }
}
controlPositivo(
  'la regla vieja no es una copia inerte: con más documento devuelve MENOS pantalla',
  hoy,
  (c: typeof hoy) => REGLA_VIEJA(10800, c.secciones + 485, c.ventana) === REGLA_VIEJA(10800, c.secciones, c.ventana),
)

afirmarLaVentanaDelDiferencial()
afirmarLosPendientes()

cerrar('s13b-escena.invariant')
