/**
 * CIERRE A-bis — CUATRO RETOQUES. Cada cosa con su control positivo (el detector ve el estado de antes o uno roto a propósito).
 *   A4 · la red de noche se forma más rápido (toda en ~7 s, era ~11), con la estabilidad de CIERRE A (el temblor y el titileo, igual).
 *        [CIERRE A-ter] A4b: más rayos (la densidad del producto, con `?red-densidad=`), sin más grosor ni brillo, y entera en el mismo tiempo.
 *   A8 · gracias y error: la bajada de la placa, el cierre del piso, la apertura y la subida, un 15 % más rápidas (al mismo ritmo).
 *   A10 · las piezas del pie rebotan chico y amortiguado al tocar el piso, cada una con su fase; el golpe sigue en su lugar y se
 *         incrustan cuando terminan. [CIERRE A-ter] A10b: prendido por defecto; `?rebote=no` lo apaga (era `?rebote=si`, apagado).
 *   A11 · la tarjeta de gracias y de error ya no titila con la cámara: su texto, impreso en la placa (la solución de AA1), y el DOM vivo.
 */
import { ARBOL, DENSIDAD_DE_LA_RED, armarElArbol, celdasDelArbol, densidadDeLaRed } from '../escena/energia/arbol'
import { azarConSemilla, crearBrasas } from '../escena/energia/brasas'
import { alfaDelDominio, armarElDominio, crearDominio, poblar } from '../escena/energia/dominio'
import { DIBUJO_DE_LA_RED } from '../escena/energia/dibujo/red'
import { REPOSO, crearRed } from '../escena/energia/reposo'
import { FLOOR_Y } from '../escena/probeScene'
import { pisoDelHundimiento } from '../escena/pie3d/transformacionDelPie'
import { duracionDelCambioDelPie } from '../formularios/volteo'
import { ENTORNO, entornoPedido, pedidoDeLaUrl } from '../escena/entorno'
import { CAIDA_AL_HUECO, caidaIntegrada } from '../escena/final/caidaAlHueco'
import { crearLugar, lugaresEnElPiso, type BaseDelPie, type LugarEnElPiso, type PiezaDePie } from '../escena/final/caidaDelPie'
import { REBOTE_DEL_PIE, altoDelRebote, duracionDelRebote, reboteDeLaPieza } from '../escena/final/reboteDelPie'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { TarjetaDeResultado } from '../../_componentes/formularios/TarjetaDeResultado'
import { IMPRESAS } from '../escena/pie3d/impresas'
import { TARJETA_IMPRESA, subidaDe } from '../escena/pie3d/tarjetaImpresa'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

// ═══════════════════════════════════════════════════════════════════════════
titulo('A4 · La red se forma más rápido, igual de estable')

/**
 * La red por defecto (el árbol repartido, `arbol.ts`) armada con la vista de siempre: cuándo nace el último rayo (s desde que se forma).
 * Con `enciendeS`, cuándo están todos enteros; y cuándo, la mitad.
 */
function nacimientos(semilla: number, densidad: number = densidadDeLaRed()): readonly number[] {
  const az = azarConSemilla(semilla)
  const b = crearBrasas(900, az, FLOOR_Y)
  const d = crearDominio()
  const o = [0, 6.4, 19]
  const largo0 = Math.hypot(o[0], o[1], o[2])
  const f = o.map((x) => -x / largo0)
  const r0 = [-f[2], 0, f[0]]
  const lr = Math.hypot(r0[0], r0[1], r0[2])
  const rr = r0.map((x) => x / lr)
  const uu = [rr[1] * f[2] - rr[2] * f[1], rr[2] * f[0] - rr[0] * f[2], rr[0] * f[1] - rr[1] * f[0]]
  for (let e = 0; e < 3; e += 1) [d.o[e], d.r[e], d.u[e], d.f[e]] = [o[e], rr[e], uu[e], f[e]]
  armarElDominio(d, 35, 1.6, largo0, FLOOR_Y)
  poblar(d, b, az, true)
  for (let i = 0; i < b.n; i += 1) b.vida[i] = alfaDelDominio(d, b.lugar[i * 3], b.lugar[i * 3 + 1], b.lugar[i * 3 + 2])
  const r = crearRed(900)
  r.modo = 'toda'
  armarElArbol(r, b, d, REPOSO.vidaMinima, REPOSO.formaS, az, densidad)
  return Array.from(r.nace.subarray(0, r.n)).sort((x, y) => x - y)
}
interface DeLaFormacion {
  readonly enteraS: number
  readonly mitadS: number
  readonly temblor: number
  readonly titileo: number
}
/** Con una escala de los nacimientos (las de antes: `0,7 / enciende` del árbol) y un encendido por rayo. */
const formacion = (nace: readonly number[], escala: number, enciendeS: number): DeLaFormacion => ({
  enteraS: nace[nace.length - 1] * escala + enciendeS,
  mitadS: nace[Math.floor(nace.length / 2)] * escala + enciendeS,
  temblor: DIBUJO_DE_LA_RED.uRed[3],
  titileo: DIBUJO_DE_LA_RED.uRed[2],
})
const NACE = nacimientos(7)
const AHORA = formacion(NACE, 1, REPOSO.enciendeS)
const ANTES = formacion(NACE, 0.7 / ARBOL.enciende, 0.6)
// Más rápida que la de CIERRE A (entre el 55 y el 75 %), con al menos dos segundos de formación; y la estabilidad de CIERRE A A4.
const formacionBien = (x: DeLaFormacion): boolean =>
  NACE.length > 20 && x.enteraS >= 2 && x.enteraS <= 0.75 * 11.1 && x.enteraS >= 0.55 * 11.1 && x.mitadS < x.enteraS && x.temblor <= 0.0024 && x.titileo <= 0.12
afirmar(formacionBien(AHORA), `  ${String(NACE.length)} rayos: la mitad enteros a los ${AHORA.mitadS.toFixed(2)} s y todos a los ${AHORA.enteraS.toFixed(2)} s (antes ${ANTES.mitadS.toFixed(2)} y ${ANTES.enteraS.toFixed(2)}); el temblor ${String(AHORA.temblor)} y el titileo ${String(AHORA.titileo)}, los de CIERRE A`)
controlPositivo('  el detector VE la formación de CIERRE A (~11 s)', ANTES, formacionBien)
controlPositivo('  y una rápida que volvió a temblar (el temblor de antes)', { ...AHORA, temblor: 0.012 }, formacionBien)

// [CIERRE A-ter] A4b · MÁS RAYOS: con la densidad del producto, más rayos que en A-bis (la grilla del reparto, 9 × √densidad), sin más
// grosor ni brillo por rayo (el canal y el golpe de A-bis; el tope del brillo de noche no baja ninguno) y la red entera en el mismo tiempo.
interface DeLaDensidad {
  readonly densidad: number
  readonly antes: readonly (readonly number[])[]
  readonly ahora: readonly (readonly number[])[]
  readonly ancho: number
  readonly golpe: readonly number[]
  readonly tope: number
}
const SEMILLAS_A4B = [3, 7, 11, 19]
const enteraDe = (nace: readonly number[]): number => formacion(nace, 1, REPOSO.enciendeS).enteraS
const promedio = (xs: readonly number[]): number => xs.reduce((a, x) => a + x, 0) / xs.length
const densidadBien = (x: DeLaDensidad): boolean => {
  const razon = promedio(x.ahora.map((n) => n.length)) / promedio(x.antes.map((n) => n.length))
  return (DENSIDAD_DE_LA_RED.variantes as readonly number[]).includes(x.densidad) && x.densidad > 1 && razon >= 1 + 0.6 * (x.densidad - 1) && razon <= 1.25 * x.densidad &&
    x.ahora.every((n, k) => Math.abs(enteraDe(n) - enteraDe(x.antes[k])) <= 0.35 && enteraDe(n) <= 7.5) &&
    x.ancho === 1.35 && x.golpe[0] === 1.3 && x.golpe[1] === 0.55 && Math.max(...x.ahora.map((n) => n.length)) <= x.tope
}
const DENSIDAD_A4B: DeLaDensidad = { densidad: densidadDeLaRed(), antes: SEMILLAS_A4B.map((k) => nacimientos(k, 1)), ahora: SEMILLAS_A4B.map((k) => nacimientos(k)), ancho: DIBUJO_DE_LA_RED.ancho, golpe: DIBUJO_DE_LA_RED.uRed, tope: DIBUJO_DE_LA_RED.noche.tope }
afirmar(densidadBien(DENSIDAD_A4B), `  la densidad ${String(DENSIDAD_A4B.densidad)} (la grilla de ${String(celdasDelArbol(DENSIDAD_A4B.densidad))} por lado, era ${String(ARBOL.celdas)}): ${DENSIDAD_A4B.ahora.map((n) => n.length).join(', ')} rayos contra ${DENSIDAD_A4B.antes.map((n) => n.length).join(', ')} de A-bis; enteros a los ${DENSIDAD_A4B.ahora.map((n) => enteraDe(n).toFixed(2)).join(', ')} s (A-bis ${DENSIDAD_A4B.antes.map((n) => enteraDe(n).toFixed(2)).join(', ')}); el canal y el golpe de A-bis`)
controlPositivo('  el detector VE la red de A-bis (la misma cantidad de rayos)', { ...DENSIDAD_A4B, densidad: 1, ahora: DENSIDAD_A4B.antes }, densidadBien)
controlPositivo('  y más rayos con el canal más grueso', { ...DENSIDAD_A4B, ancho: 1.6 }, densidadBien)
controlPositivo('  y más rayos que tardan más en encenderse (un tercio más)', { ...DENSIDAD_A4B, ahora: DENSIDAD_A4B.ahora.map((n) => n.map((t) => t * 1.35)) }, densidadBien)
controlPositivo('  y tantos que el tope del brillo de noche los baja a todos', { ...DENSIDAD_A4B, tope: 60 }, densidadBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A8 · Gracias y error, un 15 % más rápido: las cuatro fases del cambio al mismo ritmo')

/** Lo que dura cada fase del cambio (s): la bajada de la placa, el cierre del piso y, a la vuelta, la apertura y la subida. */
function fasesDelCambio(D: number): readonly number[] {
  const N = 4000
  const en = (f: (t: number) => boolean, desde: number): number => {
    for (let i = desde; i <= N; i += 1) if (f(i / N)) return i
    return N
  }
  const abajo = en((t) => pisoDelHundimiento(t).baja >= 1, 0)
  const cerrado = en((t) => pisoDelHundimiento(t).cerrado >= 1, abajo)
  const abre = en((t) => pisoDelHundimiento(t).cerrado < 1, cerrado)
  const abierto = en((t) => pisoDelHundimiento(t).cerrado <= 0, abre)
  const sube = en((t) => pisoDelHundimiento(t).baja < 1, abierto)
  const arriba = en((t) => pisoDelHundimiento(t).baja <= 0, sube)
  return [abajo, cerrado - abajo, abierto - abre + 1, arriba - sube + 1].map((x) => (x / N) * D)
}
// En CIERRE A, 0,6 s cada una: ahora el 85 %, las cuatro iguales.
const fasesBien = (f: readonly number[]): boolean => f.every((d) => Math.abs(d - 0.6 * 0.85) < 0.015)
const FASES = fasesDelCambio(duracionDelCambioDelPie(false))
afirmar(fasesBien(FASES), `  la bajada ${FASES[0].toFixed(3)} s, el cierre ${FASES[1].toFixed(3)}, la apertura ${FASES[2].toFixed(3)} y la subida ${FASES[3].toFixed(3)} (en CIERRE A, 0,6 cada una: el 85 %)`)
controlPositivo('  el detector VE el cambio de CIERRE A (0,6 s cada fase)', fasesDelCambio(2.4), fasesBien)
controlPositivo('  y uno más rápido sólo en la bajada', [0.45, 0.51, 0.51, 0.51] as const, fasesBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A10 · El rebote al caer (A10b: en el producto; `?rebote=no` lo apaga): chico, amortiguado y desfasado; el golpe en su lugar')

// [CIERRE A-ter] A10b · la bandera al revés: sin nada, el rebote (los saltos); `?rebote=no`, suelto en la URL, lo apaga (pide `sin-rebote`,
// nombrada por lo que pide: sin URL ninguna prueba pide nada); cualquier otro valor (el `si` de A-bis incluido) es el producto.
interface BanderaDelRebote {
  readonly url: typeof pedidoDeLaUrl
  readonly traductor: typeof entornoPedido
  readonly saltaPorDefecto: number
}
const banderaBien = (b: BanderaDelRebote): boolean => {
  const apagado = b.url('?rebote=no')
  return Object.values(ENTORNO.pruebas).every((v) => v === 'no') && apagado !== null && b.traductor(apagado).pruebas['sin-rebote'] === 'si' &&
    ['producto', 'producto,rebote=si', 'producto,rebote=otro'].every((x) => b.traductor(x).pruebas['sin-rebote'] === 'no') && b.saltaPorDefecto > 0 && duracionDelRebote() === duracionDelRebote(true)
}
const BANDERA_A10B: BanderaDelRebote = { url: pedidoDeLaUrl, traductor: entornoPedido, saltaPorDefecto: reboteDeLaPieza(0, 0.1) }
afirmar(banderaBien(BANDERA_A10B), `  prendido por defecto (sin la bandera, el primer salto sube ${BANDERA_A10B.saltaPorDefecto.toFixed(2)} u a los 0,1 s); \`?rebote=no\` lo apaga`)
controlPositivo('  el detector VE el rebote de A-bis (apagado por defecto: ni un salto sin la bandera)', { ...BANDERA_A10B, saltaPorDefecto: reboteDeLaPieza(0, 0.1, false) }, banderaBien)
controlPositivo('  y una URL que no lee `?rebote=` (la bandera no llega)', { ...BANDERA_A10B, url: (q: string) => pedidoDeLaUrl(q.replace('rebote', 'otra')) }, banderaBien)
controlPositivo('  y un traductor que apaga con cualquier valor', { ...BANDERA_A10B, traductor: (x: string) => { const e = entornoPedido(x); return x.includes('rebote=') ? { ...e, pruebas: { ...e.pruebas, 'sin-rebote': 'si' as const } } : e } }, banderaBien)

/** Los saltos de una pieza: sus altos máximos y cuándo vuelve a quedar en el piso del todo (s del reloj desde el golpe). */
interface DelRebote {
  readonly picos: readonly number[]
  readonly terminaS: number
  readonly antes: number
}
function saltosDe(subeA: (u: number) => number): DelRebote {
  const picos: number[] = []
  let [subiendo, antes, termina] = [false, 0, 0]
  for (let k = 1; k <= 2000; k += 1) {
    const u = k / 1000
    const y = subeA(u)
    if (y < antes && subiendo) picos.push(antes)
    subiendo = y > antes
    if (y > 1e-6) termina = u
    antes = y
  }
  return { picos, terminaS: termina, antes: subeA(0) + subeA(-0.1) }
}
const PIEZAS_A10 = [0, 1, 2, 3, 4, 5]
const SALTOS = PIEZAS_A10.map((i) => saltosDe((u) => reboteDeLaPieza(i, u, true)))
// Chico (el primero, a lo sumo 1,5 u: visto de frente, unos % de la pieza), amortiguado (cada uno, menos de la mitad del anterior; al menos dos), sin moverse antes del golpe y
// terminado dentro de lo que el reloj le da (antes de incrustarse); y desfasados: las piezas no vuelven al piso todas a la vez.
const reboteBien = (xs: readonly DelRebote[]): boolean =>
  xs.every((x) => x.antes === 0 && x.picos.length >= 2 && x.picos[0] <= 1.5 && x.picos[0] >= 0.05 && x.picos.every((p, k) => k === 0 || p < 0.5 * x.picos[k - 1]) && x.terminaS <= duracionDelRebote(true) + 1e-3) &&
  Math.max(...xs.map((x) => x.terminaS)) - Math.min(...xs.map((x) => x.terminaS)) > 0.05
afirmar(reboteBien(SALTOS), `  ${String(SALTOS[0].picos.length)} saltos (el primero de ${SALTOS.map((x) => x.picos[0].toFixed(2)).join(', ')} u, cada uno con ${String(REBOTE_DEL_PIE.restitucion)} de la velocidad), terminados entre los ${Math.min(...SALTOS.map((x) => x.terminaS)).toFixed(2)} y los ${Math.max(...SALTOS.map((x) => x.terminaS)).toFixed(2)} s del golpe: cada pieza con su fase`)
controlPositivo('  el detector VE todas en fase (el mismo alto)', PIEZAS_A10.map(() => saltosDe((u) => reboteDeLaPieza(0, u, true))), reboteBien)
controlPositivo('  y un rebote grande (el triple de alto)', PIEZAS_A10.map((i) => saltosDe((u) => 3 * reboteDeLaPieza(i, u, true))), reboteBien)
controlPositivo('  y uno sin amortiguar (saltos iguales)', PIEZAS_A10.map((i) => saltosDe((u) => reboteDeLaPieza(i, u % 0.3, true))), reboteBien)

// En el piso: el golpe (tocar) sigue en su lugar del reloj y la columna se incrusta cuando terminan los saltos; sin el rebote, como antes.
const COLUMNAS_A10: readonly PiezaDePie[] = [{ ancho: 3, alto: 5, espesor: 0.2, x: -6, y: FLOOR_Y, z: 0 }, { ancho: 3, alto: 4, espesor: 0.3, x: 6, y: FLOOR_Y, z: 0 }]
const BASE_A10: BaseDelPie = { derechaX: 1, derechaZ: 0, atrasX: 0, atrasZ: -1, logoX: 0, logoZ: 0, logoAncho: 6.9, logoFondo: 4.78 }
const lugaresA10 = (rebote: number): readonly LugarEnElPiso[] => {
  const lugares = COLUMNAS_A10.map(() => crearLugar())
  lugaresEnElPiso(COLUMNAS_A10, COLUMNAS_A10.length, COLUMNAS_A10.map((p) => caidaIntegrada(p)), BASE_A10, lugares, rebote)
  return lugares
}
const [SIN, CON] = [lugaresA10(0), lugaresA10(duracionDelRebote(true))]
const enElPisoBien = (sin: readonly LugarEnElPiso[], con: readonly LugarEnElPiso[]): boolean =>
  con.every((l, k) => l.toca === CAIDA_AL_HUECO.golpeS && l.cae === sin[k].cae && l.asentada >= CAIDA_AL_HUECO.golpeS + duracionDelRebote(true) - 1e-9 && l.incrustada > l.asentada) &&
  sin.every((l) => l.asentada < CAIDA_AL_HUECO.golpeS + duracionDelRebote(true))
afirmar(enElPisoBien(SIN, CON), `  tocan en el golpe (${String(CAIDA_AL_HUECO.golpeS)} s del reloj, con y sin el rebote) y se incrustan a los ${CON.map((l) => l.asentada.toFixed(2)).join(' y ')} s (sin el rebote, ${SIN.map((l) => l.asentada.toFixed(2)).join(' y ')}): los saltos terminan antes`)
controlPositivo('  el detector VE una que se incrusta mientras salta', [SIN, SIN] as const, (x: readonly (readonly LugarEnElPiso[])[]) => enElPisoBien(x[0], x[1]))
controlPositivo('  y una que toca después del golpe', [SIN, CON.map((l) => ({ ...l, toca: l.toca + 0.1 }))] as const, (x: readonly (readonly LugarEnElPiso[])[]) => enElPisoBien(x[0], x[1]))
// El alto de cada una, distinto de sus vecinas.
afirmar(PIEZAS_A10.every((i) => i === 0 || Math.abs(altoDelRebote(i) - altoDelRebote(i - 1)) > 0.01), '  cada pieza con su alto (distinto del de sus vecinas)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A11 · La tarjeta de gracias y de error, impresa en su placa: no titila con la cámara')

const leerA11 = (r: string): string => readFileSync(new URL(r, import.meta.url), 'utf8')
interface FuentesA11 {
  readonly impresa: string
  readonly pie: string
  readonly tarjeta: string
}
const FUENTES_A11: FuentesA11 = { impresa: leerA11('../escena/pie3d/tarjetaImpresa.ts'), pie: leerA11('../escena/pie3d/PieDeVolumen.tsx'), tarjeta: renderToStaticMarkup(<TarjetaDeResultado tipo="error" mensaje="x" empieza={false} enVolumen alReintentar={() => undefined} />) }
/**
 * Lo impreso (`tarjetaImpresa.ts`): el bloque de texto de la tarjeta (`data-texto-de-la-tarjeta`, en el marcado) sólo en la pieza armada
 * con la tarjeta; una textura a la escala de AA1 (potencia de dos), con el filtro anisótropo y los colores del DOM (sin luz ni tono); el
 * DOM con su dibujo apagado por `filter` (sigue recibiendo los clics y el foco: ni `visibility` ni `display`). El pie la imprime al
 * rearmar ANTES de compilar la transformación (se compila con la entrante: sin un tirón al aparecer el texto) y en cada cuadro.
 */
const impresaBien = (f: FuentesA11, escala: number): boolean => {
  const rearma = f.pie.indexOf('rearmar(s, g, s.estudio)')
  const imprime = f.pie.indexOf('imprimirLasTarjetas(s.armadas)', rearma)
  return f.tarjeta.includes('data-texto-de-la-tarjeta=""') && f.impresa.includes("a.estado !== 'resultado'") && escala === IMPRESAS.escala && Math.log2(escala) % 1 === 0 &&
    f.impresa.includes('textura.anisotropy = IMPRESAS.anisotropia') && f.impresa.includes('material.toneMapped = false') && f.impresa.includes('material.emissiveMap = textura') &&
    TARJETA_IMPRESA.apagado === 'opacity(0)' && f.impresa.includes('bloque.style.filter = TARJETA_IMPRESA.apagado') && !/style\.(visibility|display)\s*=/.test(f.impresa) &&
    rearma > 0 && imprime > rearma && imprime < f.pie.indexOf('prepararLasTransformaciones(s, gl, escena, camara)') && f.pie.includes('imprimirLasTarjetas(m.current.armadas)')
}
afirmar(impresaBien(FUENTES_A11, TARJETA_IMPRESA.escala), `  el texto de la tarjeta, impreso en su placa a ${String(TARJETA_IMPRESA.escala)}x con los colores del DOM; el DOM, vivo con su dibujo apagado; impresa antes de compilar la transformación`)
controlPositivo('  el detector VE la tarjeta impresa también en la placa del formulario', { ...FUENTES_A11, impresa: FUENTES_A11.impresa.replace("a.estado !== 'resultado'", 'false') }, (x: FuentesA11) => impresaBien(x, TARJETA_IMPRESA.escala))
controlPositivo('  y una escala que no es potencia de dos (la mezcla de mipmaps la ablanda)', 3, (e: number) => impresaBien(FUENTES_A11, e))
controlPositivo('  y el DOM apagado con `visibility` (sin clics)', { ...FUENTES_A11, impresa: `${FUENTES_A11.impresa}\nbloque.style.visibility = 'hidden'` }, (x: FuentesA11) => impresaBien(x, TARJETA_IMPRESA.escala))
controlPositivo('  y la impresa después de compilar', { ...FUENTES_A11, pie: FUENTES_A11.pie.replace(/(rearmar\(s, g, s\.estudio\)\n)[^\n]*\n\s*imprimirLasTarjetas\(s\.armadas\)\n/, '$1').replace('prepararLasTransformaciones(s, gl, escena, camara)', 'prepararLasTransformaciones(s, gl, escena, camara)\n      imprimirLasTarjetas(s.armadas)') }, (x: FuentesA11) => impresaBien(x, TARJETA_IMPRESA.escala))
// La entrada del texto (lo que sube), de la transformada calculada.
afirmar(subidaDe('none') === 0 && subidaDe('matrix(1, 0, 0, 1, 0, 8)') === 8 && subidaDe('matrix(1, 0, 0, 1, 0, 2.5)') === 2.5, '  lo impreso sube con la entrada del texto (la transformada calculada de Motion)')

cerrar('s74-cierre-a-bis')
