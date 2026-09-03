/**
 * §1 DE `s9-instrumentos.invariant.ts` — EL MARCADOR DEL LANE DE LA ESCENA.
 *
 * ⚠ **Vive acá desde V3-E**, por el mismo corte que §2 (`s9-acoplamiento.ts`) y
 * §4 (`s9-scrollPadding.ts`): la reescritura del censo hizo cruzar las 300
 * líneas al invariante. El corte es por tema y no comparte constantes con lo que
 * queda allá.
 *
 * ── QUÉ CUSTODIA, Y QUÉ DEJÓ DE CUSTODIAR ──────────────────────────────────
 *
 * **El marcador es el prefijo `control positivo — ` en la ETIQUETA de un
 * `check()`. Nada más cuenta: ni un título de `section()`, ni un docblock, ni el
 * detalle de una comprobación.** La razón completa de esa elección la escribió
 * SITIO-S9 y sigue valiendo: la unidad tiene que ser la misma en los dos lanes o
 * el número no se puede comparar; el patrón anclado a la FORMA DE LA LÍNEA se
 * conserva intacto (§7.25 ya mordió acá una vez, con un contador que se contaba
 * a sí mismo describiéndose); y el otro patrón, `[control positivo]`, NO queda
 * sin uso porque es el que emite `controlPositivo()` de `afirmar.ts`.
 *
 * ── ⚠ LO QUE V3-E CAMBIÓ: TRES CIFRAS ESCRITAS, TRES PROPIEDADES DERIVADAS ──
 *
 * Acá había tres cardinalidades a mano —34 archivos, 80 etiquetas, 27 archivos
 * con marcador— y **las tres se rompieron por tercera vez** cuando el merge de
 * los cuatro lanes de V3 trajo las cuatro suites de `s15e`: 34→38, 80→93, 27→31.
 * El propio docblock declaraba el patrón: *«el frente que mueve el censo no lo
 * toca y la re-medición la hace el agente principal en la integración»*. Eso
 * funciona una vez; a la tercera es un instrumento que pide mantenimiento
 * manual cada vez que alguien hace su trabajo.
 *
 * Es la regla 14 —**los agregados se derivan**— y lo que se afirma ahora son
 * propiedades, no números:
 *
 *   1. **El lane cierra contra las suites.** `archivosDelLaneDeLaEscena()` sale
 *      de los scripts `test:sNe-*`; `derivarSuites()` sale de TODOS los scripts
 *      `test:sN-*` y agrupa por suite. Las dos derivaciones tienen que dar el
 *      mismo conjunto para las suites que terminan en `e`, y todos los archivos
 *      tienen que existir en disco. Un archivo nuevo entra solo; uno que se
 *      cablee mal, no entra y se ve.
 *   2. **Los dos instrumentos ven lo mismo.** Cada etiqueta marcada del fuente
 *      se renderiza como la imprime el arnés y se le pasa a `contarControles`.
 *      La cuenta estática y la del contador de la corrida tienen que coincidir
 *      —era la comparación que SITIO-S9 hizo A MANO (36 y 36)— y ahora se hace
 *      en cada corrida. El total se PUBLICA; no se afirma contra un número.
 *   3. **La deuda no crece.** Los archivos del lane que no declaran un solo
 *      control positivo se declaran POR NOMBRE, no por cantidad. Uno nuevo sin
 *      controles pone esto en rojo; uno que los escriba sale de la lista y sólo
 *      se publica. Es la misma forma de `heredadosQueCrecieron()`: sólo falla en
 *      la dirección que importa.
 *
 * `contarControles` **no se tocó**, y ésa sigue siendo la parte que importa: el
 * anclaje a la forma de la línea —la protección de §7.25— queda intacto.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'
import { contarControles } from './s4-corrida'
import { derivarSuites, scriptsDe } from './s4-suites'
import {
  archivosDelLaneDeLaEscena,
  etiquetasDeControl,
  etiquetasMarcadas,
  existe,
  leer,
  reclamaSerControl,
  titulosDeSeccion,
} from './s9-instrumentos'

/**
 * LOS ARCHIVOS DEL LANE QUE NO DECLARAN UN SOLO CONTROL POSITIVO.
 *
 * ⚠ **Se declaran por NOMBRE y no por cantidad, y ésa es toda la diferencia.**
 * Una cifra («27 de 34 tienen marcador») no dice cuáles, se rompe cuando el lane
 * crece por una razón legítima, y no distingue «apareció uno sin controles» de
 * «alguien escribió los que faltaban». Esta lista sí: un archivo del lane que no
 * esté acá y no declare ninguno pone el invariante en rojo, y uno de acá que
 * escriba los suyos simplemente deja de aparecer en el publicado.
 *
 * Es deuda, no decisión: §7.33 la abrió con esas palabras —*«corren invariantes
 * y afirmaciones sin un solo control positivo. No es un problema de marcador: no
 * existen»*— y SITIO-S10 cerró diez de los que estaban. **V3-E cerró uno más,
 * `scene-framing.invariant.ts`**, al reescribir sus tres afirmaciones contra la
 * pose nueva del hero: la lista lo publicó como sobrante en la misma corrida en
 * que dejó de deberlo, que es exactamente para lo que se declara por nombre.
 * Quedan cinco.
 */
export const SIN_CONTROL_DECLARADO: readonly string[] = [
  'src/app/probe-escena/__tests__/s12-barrido.invariant.ts',
  'src/components/layout/home-intro/introFlight.invariant.ts',
  'src/components/layout/home-intro/introShading.invariant.ts',
  'src/components/layout/home-intro/introSilhouette.invariant.ts',
  'src/components/layout/home-intro/introTimeline.invariant.ts',
]

/** Lo que está en una lista y no en la otra, en los dos sentidos. */
function difieren(a: readonly string[], b: readonly string[]): string[] {
  const enA = new Set(a)
  const enB = new Set(b)
  return [...a.filter((x) => !enB.has(x)), ...b.filter((x) => !enA.has(x))].sort()
}

/** Los archivos que las suites `sNe` corren, según `s4-suites.ts`. */
function archivosDeLasSuitesE(): string[] {
  const datos: unknown = JSON.parse(leer('package.json'))
  return derivarSuites(scriptsDe(datos))
    .permanentes.filter((suite) => /^s\d+e$/.test(suite.nombre))
    .flatMap((suite) => suite.invariantes.map((invariante) => invariante.archivo))
    .sort()
}

export function afirmarElCensoDelLane(): void {
  titulo('1 · EL MARCADOR DEL LANE DE LA ESCENA — uno solo, y el contador lo ve')

  // ── 1 · El lane cierra contra las suites y contra el disco ────────────────

  const LANE = archivosDelLaneDeLaEscena()
  const PORSUITE = archivosDeLasSuitesE()
  afirmarIgual(
    difieren(LANE, PORSUITE),
    [],
    `los archivos del lane de la escena cierran contra las suites \`sNe\` — ${LANE.length} archivos, derivados de \`package.json\` por dos caminos distintos`,
  )
  afirmar(LANE.length > 0, `el lane no está vacío: ${LANE.length} archivos`, 'no es verde por vacío')
  afirmarIgual(
    LANE.filter((archivo) => !existe(archivo)),
    [],
    'y todos existen en el disco',
  )
  controlPositivo(
    'el cierre contra las suites NO da verde contra cualquier lista',
    [...LANE, 'src/app/probe-escena/__tests__/inventado.invariant.ts'],
    (lista: readonly string[]) => difieren(lista, PORSUITE).length === 0,
  )

  // ── 2 · Los dos instrumentos ven lo mismo ─────────────────────────────────

  const etiquetas = LANE.flatMap((archivo) => etiquetasDeControl(leer(archivo)))
  const vistasPorElContador = etiquetas.reduce(
    (n, etiqueta) => n + contarControles(`  ok  ${etiqueta}  · el detalle`),
    0,
  )
  afirmarIgual(
    vistasPorElContador,
    etiquetas.length,
    `las ${etiquetas.length} etiquetas marcadas del fuente son EXACTAMENTE las que \`contarControles\` ve en la salida — el censo estático y el de la corrida ya no se comparan a mano`,
  )
  afirmarIgual(
    LANE.reduce((n, archivo) => n + etiquetasMarcadas(leer(archivo)), 0),
    etiquetas.length,
    '  y el contador de etiquetas y el extractor de su texto dan lo mismo: el segundo no se come ninguna',
  )
  console.log(
    `  · censo DERIVADO: ${etiquetas.length} controles positivos en ${LANE.length} archivos del lane` +
      ` — 14 → 36 al unificar la unidad (SITIO-S9) → 80 al escribir los que faltaban (SITIO-S10) → ${etiquetas.length} hoy`,
  )

  /** El contador SÍ ve una etiqueta marcada, en la forma exacta que imprime el arnés. */
  afirmarIgual(
    contarControles('  ok  control positivo — algo  · 3 de 4'),
    1,
    'el contador ve una etiqueta marcada',
  )

  /**
   * ⚠ **EL CONTROL QUE PROTEGE §7.25, Y ES UNA LÍNEA REAL DEL REPO.**
   *
   * `s11-celosia.invariant.ts` cierra su control con el detalle «sin control
   * positivo, un buscador roto daría "una sola vez" contra cualquier cosa». Si el
   * patrón buscara la frase suelta, esa línea sumaría DOS donde hay uno — el
   * escáner contándose a sí mismo describiéndose. Se dejó el texto tal cual, a
   * propósito: es el espécimen vivo de la trampa.
   */
  controlPositivo(
    'el contador NO cuenta la frase cuando vive en el DETALLE de la comprobación',
    '  ok  el buscador del ancla sabe decir que NO está  · sin control positivo, un buscador roto daría "una sola vez"',
    (linea: string) => contarControles(linea) === 1,
  )
  controlPositivo(
    'ni cuando vive en el título de una `section()`',
    '\n── control positivo — el instrumento detecta el cruce ─────────',
    (linea: string) => contarControles(linea) === 1,
  )

  /** Ningún título de sección reclama ser un control: ése era el marcador viejo. */
  const titulosQueReclaman = LANE.flatMap((archivo) =>
    titulosDeSeccion(leer(archivo))
      .filter(reclamaSerControl)
      .map((texto) => `${archivo}: ${texto}`),
  )
  afirmarIgual(titulosQueReclaman, [], 'ningún `section()` del lane se declara control positivo')
  controlPositivo(
    'el detector de títulos SÍ ve uno que reclama serlo',
    "section('control positivo — que estas comprobaciones puedan fallar')",
    (fuente: string) => titulosDeSeccion(fuente).filter(reclamaSerControl).length === 0,
  )

  /** El patrón de corchetes NO quedó sin uso: es el del lane del SITIO. */
  afirmar(
    leer('src/app/v3/_lib/__tests__/afirmar.ts').includes('[control positivo]'),
    '`contarControles` conserva sus DOS patrones porque los dos se usan: el de corchetes lo emite `controlPositivo()` de `afirmar.ts`',
  )
  afirmarIgual(
    contarControles('  ok   [control positivo] lo que sea'),
    1,
    'y el de corchetes sigue contando',
  )

  // ── 3 · La deuda de controles no crece ────────────────────────────────────

  const sinControl = LANE.filter((archivo) => etiquetasDeControl(leer(archivo)).length === 0)
  afirmarIgual(
    sinControl.filter((archivo) => !SIN_CONTROL_DECLARADO.includes(archivo)),
    [],
    `ningún archivo del lane corre sin un solo control positivo salvo los ${SIN_CONTROL_DECLARADO.length} declarados`,
  )
  const yaLosEscribieron = SIN_CONTROL_DECLARADO.filter((archivo) => !sinControl.includes(archivo))
  console.log(
    `  · deuda de controles: ${sinControl.length} de ${LANE.length} archivos sin ninguno` +
      (yaLosEscribieron.length === 0
        ? ' — la lista declarada describe exactamente los que hay'
        : ` · ${yaLosEscribieron.length} ya los escribió y SOBRA en la lista: ${yaLosEscribieron.join(' · ')}`),
  )
  controlPositivo(
    'el detector de deuda VE un archivo del lane sin controles que no esté declarado',
    LANE,
    (lista: readonly string[]) =>
      lista
        .filter((archivo) => etiquetasDeControl(leer(archivo)).length === 0)
        .filter((archivo) => !SIN_CONTROL_DECLARADO.slice(1).includes(archivo)).length === 0,
  )
}
