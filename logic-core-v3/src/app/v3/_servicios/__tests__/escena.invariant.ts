/**
 * INVARIANTE — La variante de Páginas web, preparada SIN MONTAR. **[SERVICIOS V0]**
 *
 * Corre a mano: `npx tsx src/app/v3/_servicios/__tests__/escena.invariant.ts`. Plan: `docs/servicios/SPRINT-V0.md`.
 *
 * Prueba las funciones puras de `_servicios/escena/`: la luz de la escena en cada avance de la intro (de la composición compartida al
 * estado encendido, quieto desde la mitad), la salida que vuelve a la composición, que el color vaya solo en la luz, que la calidad
 * compacta baje el costo sin cambiar la escena ni el piso, y que nada de la página la monte todavía. Cada comprobación lleva su control
 * positivo: el MISMO detector contra una entrada armada para fallar.
 */

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import {
  AJUSTE_POR_CALIDAD, CANALES, COMPOSICION_COMPARTIDA, DESTINO_DE_CADA_CANAL, DURACION_DE_LA_SALIDA_MS, ENCENDIDO_HASTA, costoRelativo,
  parametrosDeLaSalida, type Canal, type ParametrosDeLaEscena,
} from '../escena/estructura'
import { PRESUPUESTO_DE_LA_VARIANTE } from '../escena/firmas'
import { TRAMOS_DE_WEB, presetDeWeb } from '../escena/presetDeWeb'
import { TOKEN_DE_LA_LUZ, WEB_ENCENDIDA, escenaDeWeb, parametrosDeWeb } from '../escena/varianteDeWeb'
import { ATRIBUTO_DE_LA_INTRO } from '../Intro'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const SERVICIOS = path.join(AQUI, '..')
const ESCENA = path.join(SERVICIOS, 'escena')
const RAIZ = path.join(SERVICIOS, '../../../..')

const igual = (a: ParametrosDeLaEscena, b: ParametrosDeLaEscena): boolean => CANALES.every((c) => a[c] === b[c])
const armar = (f: (c: Canal) => number): ParametrosDeLaEscena => ({ noche: f('noche'), brilloDelPiso: f('brilloDelPiso'), tinteDelPiso: f('tinteDelPiso'), tinteDeLaEnergia: f('tinteDeLaEnergia') })
const AVANCES = Array.from({ length: 101 }, (_, i) => i / 100)
type Curva = (avance: number, reducido: boolean) => ParametrosDeLaEscena
const enTexto = (p: ParametrosDeLaEscena): string => CANALES.map((c) => `${c} ${String(Number(p[c].toFixed(3)))}`).join(', ')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · En el avance 0, la composición compartida: de noche, con el piso apenas encendido')

const arrancaEnLaComposicion = (curva: Curva): boolean => igual(curva(0, false), COMPOSICION_COMPARTIDA)
afirmar(arrancaEnLaComposicion(parametrosDeWeb), `en el avance 0 la luz es exactamente la de la composición compartida (${enTexto(COMPOSICION_COMPARTIDA)}): ahí se aplica el velo`)
controlPositivo('  una curva que arranca encendida se detecta', ((a, r) => parametrosDeWeb(Math.max(a, 0.2), r)) as Curva, arrancaEnLaComposicion)
const composicionComoDice = (p: ParametrosDeLaEscena): boolean => p.noche === 1 && p.brilloDelPiso > 0 && p.brilloDelPiso <= 0.2 && p.tinteDelPiso === 0 && p.tinteDeLaEnergia === 0
afirmar(composicionComoDice(COMPOSICION_COMPARTIDA), '  y la composición es de noche (1), con el piso apenas encendido (más de 0 y no más de 0,2) y la luz sin teñir')
controlPositivo('  una composición de día se detecta', { ...COMPOSICION_COMPARTIDA, noche: 0 }, composicionComoDice)
controlPositivo('  y una con el piso apagado', { ...COMPOSICION_COMPARTIDA, brilloDelPiso: 0 }, composicionComoDice)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · En la mitad, brillo y color completos; de ahí a 1, quietos')

const completaALaMitadYQuieta = (curva: Curva): boolean => AVANCES.filter((a) => a >= ENCENDIDO_HASTA).every((a) => igual(curva(a, false), WEB_ENCENDIDA))
afirmar(ENCENDIDO_HASTA === 0.5 && completaALaMitadYQuieta(parametrosDeWeb), `a la mitad de la intro (0,5) la variante está completa (${enTexto(WEB_ENCENDIDA)}), y de 0,5 a 1 (51 avances) no se mueve: el título 3D se lee`)
controlPositivo('  una que sigue subiendo hasta el final se detecta', ((a, r) => parametrosDeWeb(a / 2, r)) as Curva, completaALaMitadYQuieta)
const soloSube = (curva: Curva): boolean => CANALES.every((c) => AVANCES.every((a, i) => i === 0 || curva(a, false)[c] >= curva(AVANCES[i - 1] ?? 0, false)[c]))
afirmar(soloSube(parametrosDeWeb), '  y en la primera mitad cada canal solo sube: ninguno baja ni parpadea')
controlPositivo('  una que baja y vuelve a subir se detecta', ((a, r) => parametrosDeWeb(a > 0.2 && a < 0.3 ? 0.1 : a, r)) as Curva, soloSube)
/** Suave en las dos puntas: en el primer y en el último centésimo del encendido se mueve menos del 1 % del camino (sin saltos). */
const suaveEnLasPuntas = (curva: Curva): boolean => CANALES.every((c) => {
  const camino = WEB_ENCENDIDA[c] - COMPOSICION_COMPARTIDA[c]
  if (camino === 0) return true
  const paso = (a: number, b: number): number => Math.abs(curva(b, false)[c] - curva(a, false)[c]) / Math.abs(camino)
  return paso(0, 0.01) < 0.01 && paso(ENCENDIDO_HASTA - 0.01, ENCENDIDO_HASTA) < 0.01
})
afirmar(suaveEnLasPuntas(parametrosDeWeb), '  suave en las puntas: arranca y llega sin un salto (menos del 1 % del camino en el primer y en el último centésimo)')
controlPositivo('  un encendido lineal (arranca de golpe) se detecta', ((a, r) => {
  const t = Math.min(1, a / ENCENDIDO_HASTA)
  return r ? WEB_ENCENDIDA : armar((c) => COMPOSICION_COMPARTIDA[c] * (1 - t) + WEB_ENCENDIDA[c] * t)
}) as Curva, suaveEnLasPuntas)
const encendidaComoDice = (p: ParametrosDeLaEscena): boolean => p.noche === 1 && p.brilloDelPiso === 1 && p.tinteDelPiso === 1 && p.tinteDeLaEnergia === 1
afirmar(encendidaComoDice(WEB_ENCENDIDA), '  la encendida de web: de noche, el piso con toda su luz, y el celeste en la luz del piso y en la de la energía (brasas, arcos y red)')
controlPositivo('  una encendida sin el celeste en la energía se detecta', { ...WEB_ENCENDIDA, tinteDeLaEnergia: 0 }, encendidaComoDice)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Al irse, la luz vuelve a la composición compartida, rápida y calma')

type Salida = (desde: ParametrosDeLaEscena, transcurridoMs: number, reducido: boolean) => ParametrosDeLaEscena
const DESDES: readonly ParametrosDeLaEscena[] = [WEB_ENCENDIDA, parametrosDeWeb(0.25, false)]
const TIEMPOS = Array.from({ length: 43 }, (_, i) => i * 10)
const vuelve = (salida: Salida): boolean =>
  DESDES.every((d) => igual(salida(d, 0, false), d) && igual(salida(d, DURACION_DE_LA_SALIDA_MS, false), COMPOSICION_COMPARTIDA) && igual(salida(d, 5000, false), COMPOSICION_COMPARTIDA))
afirmar(vuelve(parametrosDeLaSalida), `al irse, desde la encendida o desde la mitad del encendido, la luz arranca donde estaba y a los ${String(DURACION_DE_LA_SALIDA_MS)} ms está exacta en la composición compartida, y ahí se queda`)
controlPositivo('  una salida que se queda a mitad de camino se detecta', ((d, ms, r) => parametrosDeLaSalida(d, Math.min(ms, 200), r)) as Salida, vuelve)
/** Rápida: a la mitad del tiempo ya hizo el 80 % del camino. Calma: avanza siempre hacia la composición, sin pasarse ni volver. */
const rapidaYCalma = (salida: Salida): boolean => DESDES.every((d) => CANALES.every((c) => {
  const camino = COMPOSICION_COMPARTIDA[c] - d[c]
  if (camino === 0) return TIEMPOS.every((ms) => salida(d, ms, false)[c] === d[c])
  const hecho = (ms: number): number => (salida(d, ms, false)[c] - d[c]) / camino
  return hecho(DURACION_DE_LA_SALIDA_MS / 2) >= 0.8 && TIEMPOS.every((ms, i) => hecho(ms) >= 0 && hecho(ms) <= 1 && (i === 0 || hecho(ms) >= hecho(TIEMPOS[i - 1] ?? 0)))
}))
afirmar(rapidaYCalma(parametrosDeLaSalida), `  rápida y calma: a la mitad del tiempo (${String(DURACION_DE_LA_SALIDA_MS / 2)} ms) ya hizo el 80 % del camino o más, y en todo el camino avanza sin pasarse ni volver`)
const conLaCurva = (curva: (t: number) => number): Salida => (d, ms) => {
  const t = curva(Math.min(1, ms / DURACION_DE_LA_SALIDA_MS))
  return armar((c) => d[c] * (1 - t) + COMPOSICION_COMPARTIDA[c] * t)
}
controlPositivo('  una salida lineal (lenta al principio) se detecta', conLaCurva((t) => t), rapidaYCalma)
controlPositivo('  y una que se pasa y vuelve (un rebote)', conLaCurva((t) => 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2), rapidaYCalma)
const inmediataConReducido = (salida: Salida): boolean => DESDES.every((d) => igual(salida(d, 0, true), COMPOSICION_COMPARTIDA))
afirmar(inmediataConReducido(parametrosDeLaSalida), '  y con movimiento reducido la salida es inmediata: en 0 ms ya está en la composición')
controlPositivo('  una salida animada con reducido se detecta', ((d, ms) => parametrosDeLaSalida(d, ms, false)) as Salida, inmediataConReducido)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El color va solo en la luz: ningún parámetro de color de superficie')

const SUPERFICIE = /color|superficie|material|albedo|difus|base|fondo|pintura|papel/i
const soloLuz = (destinos: Readonly<Record<string, { readonly luz: string; readonly tipo: string }>>): boolean =>
  Object.entries(destinos).every(([canal, d]) => d.tipo === 'luz' && !SUPERFICIE.test(canal))
afirmar(soloLuz(DESTINO_DE_CADA_CANAL) && JSON.stringify(Object.keys(DESTINO_DE_CADA_CANAL)) === JSON.stringify([...CANALES]), `los ${String(CANALES.length)} canales (${CANALES.join(', ')}) son de luz, y ninguno es el color de una superficie`)
controlPositivo('  un canal de color de superficie se detecta', { ...DESTINO_DE_CADA_CANAL, colorDelPiso: { luz: 'el material de los bloques', tipo: 'luz' } }, soloLuz)
controlPositivo('  y uno que apunta a una superficie', { ...DESTINO_DE_CADA_CANAL, tinteDelPiso: { luz: 'el material de los bloques', tipo: 'superficie' } }, soloLuz)
const soloLosCanales = (p: Readonly<Record<string, number>>): boolean => JSON.stringify(Object.keys(p).sort()) === JSON.stringify([...CANALES].sort())
afirmar(soloLosCanales(WEB_ENCENDIDA) && soloLosCanales(COMPOSICION_COMPARTIDA) && soloLosCanales(parametrosDeWeb(0.3, false)), '  y la variante, la composición y la curva no llevan nada más que esos canales')
controlPositivo('  una encendida con un color para los bloques se detecta', { ...WEB_ENCENDIDA, colorDeLosBloques: 1 }, soloLosCanales)
const CSS = readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8')
const esElClaroDeWeb = (token: string): boolean =>
  token === '--color-acento-web-claro' && new RegExp(`^\\s*${token}:\\s*#[0-9A-Fa-f]{6};`, 'm').test(CSS) &&
  /\[data-servicio="web"\]\s*\{[^}]*--color-acento-claro:\s*var\(--color-acento-web-claro\)/.test(CSS)
afirmar(esElClaroDeWeb(TOKEN_DE_LA_LUZ), '  la luz toma el celeste de web del token claro (--color-acento-web-claro, theme-develop.css:356), el que [data-servicio="web"] pone en el alias claro: nunca un hex')
controlPositivo('  el oscuro de web (el de las superficies en papel) se detecta', '--color-acento-web', esElClaroDeWeb)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · En el celular, la calidad compacta baja el costo sin cambiar la escena ni la cantidad de bloques')

type Escena = typeof escenaDeWeb
const mismaEscenaMasBarata = (escena: Escena): boolean =>
  AVANCES.every((a) => [false, true].every((r) => igual(escena(a, 'plena', r).parametros, escena(a, 'compacta', r).parametros))) &&
  costoRelativo(escena(0.5, 'compacta', false).ajuste) < costoRelativo(escena(0.5, 'plena', false).ajuste)
afirmar(mismaEscenaMasBarata(escenaDeWeb), `en la compacta (abajo de 1024) la luz es la misma en los 101 avances, con y sin reducido, y la variante cuesta ${String(costoRelativo(AJUSTE_POR_CALIDAD.compacta))} de la plena (el campo de la luz a media resolución)`)
controlPositivo('  una compacta que apaga el tinte se detecta', ((a, c, r) => {
  const e = escenaDeWeb(a, c, r)
  return c === 'compacta' ? { ...e, parametros: { ...e.parametros, tinteDeLaEnergia: 0 } } : e
}) as Escena, mismaEscenaMasBarata)
controlPositivo('  y una que cuesta lo mismo', ((a, c, r) => ({ ...escenaDeWeb(a, c, r), ajuste: AJUSTE_POR_CALIDAD.plena })) as Escena, mismaEscenaMasBarata)
/** El ajuste por calidad solo trae perillas de costo: ninguna toca el piso de bloques (la cantidad, el radio o el lado). */
const PERILLAS_DE_COSTO = ['resolucionDelCampo']
const sinTocarLosBloques = (ajustes: Readonly<Record<string, object>>): boolean => Object.values(ajustes).every((a) => Object.keys(a).every((k) => PERILLAS_DE_COSTO.includes(k)))
afirmar(sinTocarLosBloques(AJUSTE_POR_CALIDAD) && CANALES.every((c) => !/bloque/i.test(c)), '  y ni el ajuste ni los canales tocan el piso de bloques: la cantidad es la del home en las dos calidades (5.852, bloques.ts:99-112)')
controlPositivo('  una compacta con la mitad de los bloques se detecta', { ...AJUSTE_POR_CALIDAD, compacta: { resolucionDelCampo: 0.5, bloquesDelPiso: 0.5 } }, sinTocarLosBloques)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Con movimiento reducido, el estado final quieto')

const quietaConReducido = (curva: Curva): boolean => AVANCES.every((a) => igual(curva(a, true), WEB_ENCENDIDA))
afirmar(quietaConReducido(parametrosDeWeb), 'con movimiento reducido, en los 101 avances, la variante está en su estado final y no se mueve')
controlPositivo('  una que con reducido sigue el avance se detecta', ((a) => parametrosDeWeb(a, false)) as Curva, quietaConReducido)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · El preset, las firmas de B12a y el costo por cuadro')

const presetComoDice = (p: ReturnType<typeof presetDeWeb>): boolean =>
  p.id === 'web' && p.acento === 'web' && p.noche === 'noche' && p.tramos !== null && p.tramos.intro === `[${ATRIBUTO_DE_LA_INTRO}]` && p.tramos.pie === null && p.pista === 'home' && p.variante === null
afirmar(presetComoDice(presetDeWeb('home', null)), `el preset de web: de noche, con el acento de web, la intro anclada a ${TRAMOS_DE_WEB.intro} y el pie para B13; la pista y el componente entran como argumentos`)
controlPositivo('  un preset de día se detecta', { ...presetDeWeb('home', null), noche: 'dia' as const }, presetComoDice)
const FIRMAS = readFileSync(path.join(ESCENA, 'firmas.ts'), 'utf8')
const NOTA = 'B12a-API: reemplazar por el import'
/** Cada export de `firmas.ts` lleva, en su docblock, la nota de que es una copia de la propuesta: se va con el merge de B12a. */
const conLaNota = (fuente: string): string[] => [...fuente.matchAll(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export (?:type|interface|const) (\w+)/g)].filter((m) => !(m[1] ?? '').includes(NOTA)).map((m) => m[2] ?? '')
const exportsDeLasFirmas = [...FIRMAS.matchAll(/^export (?:type|interface|const) (\w+)/gm)].map((m) => m[1] ?? '')
afirmarIgual({ sinNota: conLaNota(FIRMAS), cuantas: exportsDeLasFirmas.length }, { sinNota: [], cuantas: 5 }, `  las 5 firmas copiadas de la propuesta (${exportsDeLasFirmas.join(', ')}) llevan «${NOTA}»`)
controlPositivo('  una firma sin la nota se detecta', FIRMAS.replace(`${NOTA} (\`esc/ruta/preset.ts\`, SPRINT-B12a §3.1). Lo declara`, 'Lo declara'), (f: string) => conLaNota(f).length === 0)
const cuestaPorCuadro = (f: () => unknown, vueltas: number): number => {
  const t0 = performance.now()
  for (let i = 0; i < vueltas; i += 1) f()
  return (performance.now() - t0) / vueltas
}
const cuadroDeLaVariante = (): unknown => escenaDeWeb(0.37, 'plena', false)
const muyPorDebajo = (f: () => unknown, vueltas: number): boolean => cuestaPorCuadro(f, vueltas) < PRESUPUESTO_DE_LA_VARIANTE.cpuMsPorCuadro / 10
afirmar(muyPorDebajo(cuadroDeLaVariante, 2000), `  y calcular la luz de un cuadro cuesta menos de un décimo del presupuesto de B12a.7 (${String(PRESUPUESTO_DE_LA_VARIANTE.cpuMsPorCuadro)} ms de CPU por cuadro): ${cuestaPorCuadro(cuadroDeLaVariante, 2000).toFixed(4)} ms`)
controlPositivo('  un cálculo de 1 ms por cuadro se detecta', () => {
  const t0 = performance.now()
  while (performance.now() - t0 < 1) cuadroDeLaVariante()
}, (f: () => unknown) => muyPorDebajo(f, 5))

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · Sin montar, y pura: nada de la página la importa, y no trae three, react ni JSX')

interface Fuente { readonly f: string; readonly codigo: string }
const recorrer = (dir: string, saltar: (nombre: string) => boolean): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const f = path.join(dir, e.name)
  return e.isDirectory() ? (saltar(e.name) ? [] : recorrer(f, saltar)) : /\.tsx?$/.test(e.name) ? [f] : []
})
const leer = (f: string): Fuente => ({ f: path.relative(SERVICIOS, f).split(path.sep).join('/'), codigo: readFileSync(f, 'utf8') })
const DE_LA_PAGINA: readonly Fuente[] = [
  ...recorrer(SERVICIOS, (n) => n === '__tests__' || n === 'escena').map(leer),
  ...recorrer(path.join(SERVICIOS, '../[servicio]'), () => false).map(leer),
]
const montan = (lista: readonly Fuente[]): string[] => lista.filter((x) => /from '(?:\.\.?\/)+(?:_servicios\/)?escena\//.test(x.codigo)).map((x) => x.f)
afirmarIgual(montan(DE_LA_PAGINA), [], `sin montar: ninguno de los ${String(DE_LA_PAGINA.length)} fuentes de _servicios (fuera de escena/) ni de [servicio]/ importa nada de escena/`)
controlPositivo('  un bloque que importa la variante se detecta', [{ f: 'bloques/Precio.tsx', codigo: "import { parametrosDeWeb } from '../escena/varianteDeWeb'" }], (l: readonly Fuente[]) => montan(l).length === 0)
controlPositivo('  y la página que importa el preset', [{ f: '../[servicio]/page.tsx', codigo: "import { presetDeWeb } from '../_servicios/escena/presetDeWeb'" }], (l: readonly Fuente[]) => montan(l).length === 0)
const DE_LA_ESCENA: readonly Fuente[] = readdirSync(ESCENA).map((n) => leer(path.join(ESCENA, n)))
const impuras = (lista: readonly Fuente[]): string[] => lista.filter((x) =>
  !x.f.endsWith('.ts') || /^\s*['"]use client['"]/.test(x.codigo) || /^import (?!type )[^\n]*from '(three|react|@react-three\/[^']*)'/m.test(x.codigo)).map((x) => x.f)
afirmarIgual({ archivos: DE_LA_ESCENA.map((x) => x.f).sort(), impuras: impuras(DE_LA_ESCENA) }, { archivos: ['escena/estructura.ts', 'escena/firmas.ts', 'escena/presetDeWeb.ts', 'escena/varianteDeWeb.ts'], impuras: [] }, '  y escena/ son cuatro módulos puros: .ts sin JSX ni «use client», y de three y de react solo tipos (regla 4 de la escena: ningún valor de three en la carga inicial)')
controlPositivo('  un módulo que importa un valor de three se detecta', [{ f: 'escena/estructura.ts', codigo: "import * as THREE from 'three'" }], (l: readonly Fuente[]) => impuras(l).length === 0)

cerrar('escena.invariant')
