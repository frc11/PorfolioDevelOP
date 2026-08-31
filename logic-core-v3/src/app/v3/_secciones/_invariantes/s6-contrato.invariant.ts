/**
 * INVARIANTE — EL CONTRATO: la secuencia, el ancla del pin, la compuerta, las
 * superficies, el ritmo y el escáner de contenido.
 *
 * Corre con `npm run test:s6-contrato`. Es todo función pura: no monta React, no
 * lee el build y no habla con `git`. Lo que afirma es cierto hoy, mañana y
 * después del merge.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { deberiaMontarseElCursor } from '../../_lib/cursor'
import { rangoDeScroll, rangoDegenerado, type ParDeAnclas } from '../../_lib/motion/anclas'
import { CONTENIDO_PROHIBIDO_DE_CONTROL } from './soporte'
import {
  NOMBRES_REALES,
  cifrasSospechosas,
  escanearContenido,
  marcadoresEn,
  numerosSinDeclarar,
  preciosEncontrados,
  textoVisible,
} from '../_contrato/escaneo'
import { MARCADORES } from '../_contrato/marcadores'
import { ANCLA_DEL_PIN, USOS_DECLARADOS, deberiaAnimar, especificacionDe, inerciaDe } from '../_contrato/motion'
import { PATRONES } from '../../_lib/motion/patrones'
import { duracionAplicada } from '../../_lib/motion/cronograma'
import { pantallasDe, seccionDe } from '../_contrato/forma'
import { RITMO_DE_LA_REFERENCIA, ritmoDe } from '../_contrato/ritmo'
import { IDS_DE_S6, SUPERFICIE_ACORDADA } from './soporte'
import {
  MUESTRAS_DEL_BARRIDO,
  cambiosDeTramo,
  canalesSincronizados,
  desincronizaciones,
  limitesDeSecuencia,
  tramoDeSecuencia,
  type LectorDeCanales,
} from '../_contrato/secuencia'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El ancla del pin — rango = alto − viewport, exacto')

const VIEWPORT = 900
const ALTO_DE_TRES_PANTALLAS = VIEWPORT * 3
const CAJA = { topDoc: 5000, alto: ALTO_DE_TRES_PANTALLAS }

const rango = rangoDeScroll(ANCLA_DEL_PIN, CAJA, VIEWPORT)
const ancho = rango.fin - rango.inicio

afirmarIgual(rango.inicio, CAJA.topDoc, 'el progreso vale 0 cuando el tope del bloque llega al tope del viewport')
afirmarIgual(ancho, CAJA.alto - VIEWPORT, 'el rango es exactamente `alto − viewport`, o sea el recorrido del pin')
afirmar(
  ancho === VIEWPORT * 2,
  'con 300svh de sección y un hijo de 100svh, el pin recorre 200svh',
  `${ancho} px con viewport ${VIEWPORT}`,
)
afirmar(
  !rangoDegenerado(ANCLA_DEL_PIN, CAJA, VIEWPORT),
  'el ancla del pin no degenera con la caja declarada',
)

/** Las dos anclas mutiladas: cada una le saca al pin una de sus dos mitades. */
const SIN_EL_TOPE: ParDeAnclas = {
  inicio: { declarado: 'top bottom', elemento: { fraccion: 0, px: 0 }, viewport: { fraccion: 1, px: 0 } },
  fin: ANCLA_DEL_PIN.fin,
}
const SIN_EL_FONDO: ParDeAnclas = {
  inicio: ANCLA_DEL_PIN.inicio,
  fin: { declarado: 'bottom top', elemento: { fraccion: 1, px: 0 }, viewport: { fraccion: 0, px: 0 } },
}

controlPositivo(
  'un ancla sin el `top top` no reproduce el recorrido del pin',
  SIN_EL_TOPE,
  (par) => {
    const r = rangoDeScroll(par, CAJA, VIEWPORT)
    return r.fin - r.inicio === CAJA.alto - VIEWPORT
  },
)
controlPositivo(
  'ni una sin el `bottom bottom`',
  SIN_EL_FONDO,
  (par) => {
    const r = rangoDeScroll(par, CAJA, VIEWPORT)
    return r.fin - r.inicio === CAJA.alto - VIEWPORT
  },
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La secuencia es UN progreso — simultaneidad, con su control')

const TRAMOS = 3

afirmarIgual(desincronizaciones(canalesSincronizados, TRAMOS), [], 'los cinco canales leen el mismo tramo en los 601 puntos del barrido')
afirmar(
  MUESTRAS_DEL_BARRIDO === 601,
  `el barrido tiene ${MUESTRAS_DEL_BARRIDO} puntos y cae exacto en los límites de 1/3`,
)
afirmarIgual(cambiosDeTramo(canalesSincronizados, TRAMOS), TRAMOS - 1, 'el tramo cambia exactamente 2 veces — no 0 ni 3')
afirmarIgual(limitesDeSecuencia(TRAMOS), [1 / 3, 2 / 3], 'los límites están donde tienen que estar')

afirmarIgual(tramoDeSecuencia(0, TRAMOS), { indice: 0, local: 0 }, 'en 0 arranca el primero')
afirmarIgual(tramoDeSecuencia(1 / 3, TRAMOS), { indice: 1, local: 0 }, 'en 1/3 el nombre cambia Y el párrafo se reinicia, en el mismo punto')
afirmarIgual(tramoDeSecuencia(1, TRAMOS), { indice: TRAMOS - 1, local: 1 }, 'en 1 el último queda completo, no salta a un tramo que no existe')

/** EL CONTROL: tres animaciones sueltas, cada una con su propio progreso. */
const canalesSueltos: LectorDeCanales = (progreso, cantidad) => ({
  nombre: tramoDeSecuencia(progreso, cantidad).indice,
  medio: tramoDeSecuencia(Math.min(1, progreso + 0.1), cantidad).indice,
  acento: tramoDeSecuencia(Math.max(0, progreso - 0.1), cantidad).indice,
  parrafo: tramoDeSecuencia(progreso * 0.8, cantidad),
  lista: tramoDeSecuencia(Math.min(1, progreso * 1.2), cantidad),
})

controlPositivo(
  'tres progresos desfasados NO pasan el predicado de simultaneidad',
  canalesSueltos,
  (lector) => desincronizaciones(lector, TRAMOS).length === 0,
)
controlPositivo(
  'y un lector clavado en el primer tramo tampoco pasa el contrapeso de los cambios',
  ((p, c) => ({ nombre: 0, medio: 0, acento: 0, parrafo: tramoDeSecuencia(p, c), lista: tramoDeSecuencia(p, c) })) as LectorDeCanales,
  (lector) => cambiosDeTramo(lector, TRAMOS) === TRAMOS - 1,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La compuerta — la tabla de verdad entera, con sus dos controles')

const TABLA: readonly [boolean, boolean, boolean][] = [
  [true, false, true],
  [false, false, false],
  [true, true, false],
  [false, true, false],
]
for (const [arriba, reducido, esperado] of TABLA) {
  afirmarIgual(
    deberiaAnimar(arriba, reducido),
    esperado,
    `arriba=${arriba} · reducido=${reducido} → anima=${esperado}`,
  )
}

controlPositivo('la compuerta no es un `false` constante', TABLA, (t) => !t.some(([a, r]) => deberiaAnimar(a, r)))
controlPositivo('ni un `true` constante: el ancho por sí solo la niega', TABLA, (t) =>
  t.every(([a, r]) => deberiaAnimar(a, r)),
)

const coincide = TABLA.every(([a, r]) => deberiaAnimar(a, r) === deberiaMontarseElCursor(a, r))
afirmar(
  coincide,
  'coincide fila por fila con `deberiaMontarseElCursor` — se publica la coincidencia, no se comparte la implementación',
  'si un día dejan de coincidir va a ser una decisión, no un efecto colateral',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Las superficies — lo propio se afirma, lo heredado se publica')

const secciones = IDS_DE_S6.map(seccionDe)
afirmarIgual(secciones.map((s) => s.id), [...IDS_DE_S6], 'las cuatro secciones existen en `_lib/secciones.ts` y están en orden')

/**
 * ⚠ ESTO ERA UNA PUBLICACIÓN Y AHORA ES UNA AFIRMACIÓN.
 *
 * Mientras los dos lanes corrían en paralelo había dos tablas —la del sitio y
 * la acordada en la instrucción— y la regla 13 mandaba publicar el delta: la
 * superficie era heredada. Con los lanes mergeados hay UNA tabla, así que una
 * diferencia contra lo acordado ya no es herencia: es un error. La comprobación
 * sube de nivel en vez de bajarlo.
 */
console.log('  superficie ACORDADA (§0.2 de la instrucción) contra la que declara la tabla del sitio:')
for (const id of IDS_DE_S6) {
  const enLaTabla = seccionDe(id).superficie
  const acordada = SUPERFICIE_ACORDADA[id]
  const marca = enLaTabla === acordada ? ' ' : '≠'
  console.log(`    ${marca} ${id.padEnd(18)} acordada ${acordada.padEnd(20)} tabla ${enLaTabla}`)
}

afirmarIgual(
  secciones.map((s) => s.superficie),
  IDS_DE_S6.map((id) => SUPERFICIE_ACORDADA[id]),
  'la tabla del sitio dice EXACTAMENTE lo que la instrucción acordó para las cuatro',
)

controlPositivo(
  'el comparador de superficies ve una fila cambiada',
  IDS_DE_S6.map((id) => (id === 'cierre' ? 'papel-opaco' : SUPERFICIE_ACORDADA[id])),
  (tabla: string[]) =>
    JSON.stringify(tabla) === JSON.stringify(IDS_DE_S6.map((id) => SUPERFICIE_ACORDADA[id])),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El ritmo — pantallas declaradas y momentos reales')

/**
 * ⚠ LA CUENTA CAMBIÓ DE DEFINICIÓN, Y NO ES UN AJUSTE.
 *
 * Los dos lanes escribieron su propia versión de "pantallas pinneadas" y no
 * daban lo mismo: el lane A contaba la sección entera, el lane B el recorrido
 * del pin. La integración eligió la del lane B **porque es la que la referencia
 * midió** —`rangoPegado = alto del contenedor − alto del elemento pegado`,
 * SCROLL.md §4— y el módulo unificado (`_contrato/ritmo.ts`) escribe el porqué.
 * Lo que se publica acá sale de esa cuenta.
 */
for (const seccion of secciones) {
  const fila = ritmoDe([seccion])
  console.log(
    `  ${seccion.id.padEnd(18)} ${fila.pantallas.toFixed(1)} pantallas · ${fila.pantallasPinneadas.toFixed(1)} pinneadas · ` +
      `${fila.secuencias} secuencia(s) → ${fila.momentos.toFixed(1)} momentos`,
  )
}
const ritmo = ritmoDe(secciones)
console.log(
  `  TOTAL de las cuatro: ${ritmo.pantallas.toFixed(1)} pantallas declaradas · ${ritmo.momentos.toFixed(1)} momentos reales`,
)
console.log(
  `  la referencia, HOME ENTERA: ${RITMO_DE_LA_REFERENCIA.momentos} momentos en ` +
    `${RITMO_DE_LA_REFERENCIA.pantallas} pantallas (${RITMO_DE_LA_REFERENCIA.fuente}).`,
)
console.log('  ⚠️ Son CUATRO secciones contra OCHO: esta comparación es parcial por construcción.')
console.log('  El ritmo de las OCHO, que sí es comparable, lo produce `test:s7-ritmo`.')

afirmar(ritmo.pantallas > 0 && ritmo.momentos > 0, 'el ritmo no es cero — el derivador miró algo')
afirmar(
  ritmo.momentos < ritmo.pantallas,
  'el pinneado comprime: hay menos momentos que pantallas',
  `${ritmo.momentos.toFixed(1)} contra ${ritmo.pantallas.toFixed(1)}`,
)
afirmarIgual(
  secciones.filter((s) => s.pinneada !== undefined).length,
  1,
  'exactamente una de las cuatro es una secuencia pinneada',
)

controlPositivo('el lector de alturas rechaza una unidad que no es svh', '100vh', (alto: string) => {
  pantallasDe({ ...seccionDe('cierre'), alto })
  return true
})

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El escáner de contenido — con su control positivo')

const hallazgosDelProhibido = escanearContenido(CONTENIDO_PROHIBIDO_DE_CONTROL)
afirmar(
  hallazgosDelProhibido.length > 0,
  `la frase de control produce ${hallazgosDelProhibido.length} hallazgos`,
  hallazgosDelProhibido.map((h) => h.fragmento).join(' · '),
)
afirmar(cifrasSospechosas(CONTENIDO_PROHIBIDO_DE_CONTROL).length > 0, '  el detector de cifras la ve')
afirmar(preciosEncontrados(CONTENIDO_PROHIBIDO_DE_CONTROL).length > 0, '  el detector de precios la ve')
afirmar(numerosSinDeclarar(CONTENIDO_PROHIBIDO_DE_CONTROL).length > 0, '  el detector de números sueltos la ve')

const LIMPIO = `El panel muestra [MÉTRICA] por proyecto y [CIFRA] de ahorro. Lo usan ${NOMBRES_REALES.join(', ')}.`
afirmarIgual(escanearContenido(LIMPIO), [], 'un texto con marcadores y nombres reales pasa limpio')
afirmar(marcadoresEn(LIMPIO).length === 2, `el contrapeso: el escáner miró un texto con ${marcadoresEn(LIMPIO).length} marcadores`)
afirmar(MARCADORES.length > 0, `${MARCADORES.length} marcadores declarados en el vocabulario`)

afirmarIgual(
  textoVisible('<p>Uno <span aria-hidden="true">dos</span></p>'),
  'Uno dos',
  'el extractor de texto saca las etiquetas y normaliza el espacio',
)
controlPositivo('el extractor no se queda con el contenido de un <script>', '<script>var x = "+340%"</script>', (html) =>
  escanearContenido(textoVisible(html)).length > 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Los patrones se consumen en sus valores medidos, sin perillas')

for (const uso of USOS_DECLARADOS) {
  const patron = PATRONES[uso.patron as keyof typeof PATRONES]
  afirmar(patron !== undefined, `${uso.patron} existe y lo usa ${uso.seccion}`, uso.para)
}
afirmar(USOS_DECLARADOS.length > 0, `${USOS_DECLARADOS.length} usos declarados — el padrón no está vacío`)

const specP4 = especificacionDe(PATRONES.P4, 11)
afirmarIgual(specP4.curva, PATRONES.P4.curva, 'la curva es la del patrón, sin forzar')
afirmarIgual(specP4.cronograma.duracionDeclarada, PATRONES.P4.duracionDeclarada, 'la duración es la declarada, sin factor')
afirmarIgual(specP4.cronograma.escalonado, PATRONES.P4.escalonado, 'el escalonado es el medido, sin factor')
afirmarIgual(duracionAplicada(specP4.cronograma), 2 + 0.2 * 10, 'P4 con once ítems: 2 s declarados → 4 s aplicados')

afirmarIgual(inerciaDe(PATRONES.P8), 2, 'P8 declara `scrub: 2` — el arrastre más pesado del sitio')
afirmarIgual(inerciaDe(PATRONES.P2), null, 'P2 declara `scrub: true` — sin inercia')

controlPositivo(
  'la especificación NO aplica un factor de duración',
  { ...PATRONES.P4, duracionDeclarada: 99 },
  (p) => especificacionDe(p, 11).cronograma.duracionDeclarada === PATRONES.P4.duracionDeclarada,
)

cerrar('s6-contrato.invariant')
