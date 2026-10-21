/**
 * INVARIANTE — La variante de Páginas web, MONTADA en la ranura del home, y la salida de la página. **[SERVICIOS V0 · V1]**
 *
 * Corre a mano: `npx tsx src/app/v3/_servicios/__tests__/escena.invariant.ts`. Planes: `docs/servicios/SPRINT-V0.md` y `SPRINT-V1.md`.
 *
 * Prueba lo puro de `_servicios/escena/` (la luz en cada avance de la intro, de la composición del home al estado encendido, quieto desde la
 * mitad; la salida que vuelve a la composición; el cuadro de la variante), lo que la variante escribe (sólo la luz, por las dos funciones
 * que le presta la ranura), su registro y los presets, y la salida de la página: todo enlace que se va pide la salida antes de navegar.
 * Cada comprobación lleva su control positivo: el MISMO detector contra una entrada armada para fallar.
 *
 * [V1] REEMPLAZADAS POR LA API (`docs/rediseno/B12a-API.md`), no aflojadas (SPRINT-V1 §1.3 y §4):
 *   · la noche dejó de ser un canal de la variante (la pone el preset) y la composición y la salida son las del home
 *     (`COMPOSICION_DE_LA_LUZ`, `SALIDA_DE_LA_VARIANTE_MS`);
 *   · «en la compacta la variante cuesta un cuarto» (el campo de la luz a la mitad) → la variante no tiene costo propio por calidad: la
 *     compacta es la del home, y la luz es la misma en las dos;
 *   · «las 5 firmas llevan la nota B12a-API» → las firmas se importan del home (`firmas.ts` se fue);
 *   · «sin montar: nada de la página importa escena/» → montada: la intro importa los presets, y la variante entra SOLO por el registro.
 */

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SELECTOR_DE_LA_INTRO } from '../../_componentes/pagina/IntroDeLaPagina'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { PISTA_DE_LA_INTRO } from '../../_lib/escena/ruta/pistaDeLaIntro'
import type { PresetDeLaEscena } from '../../_lib/escena/ruta/preset'
import { COMPOSICION_DE_LA_LUZ, PRESUPUESTO_DE_LA_VARIANTE, SALIDA_DE_LA_VARIANTE_MS } from '../../_lib/escena/ruta/variante'
import { IDS_DE_SERVICIO } from '../../_secciones/_contrato/acento'
import { REGISTRO_DE_VARIANTES, esIdDeVariante } from '../../_variantes/registro'
import {
  CANALES, COMPOSICION_COMPARTIDA, DESTINO_DE_CADA_CANAL, ENCENDIDO_HASTA, cuadroDeLaVariante, parametrosDeLaSalida, type Canal,
  type ParametrosDeLaEscena, type SalidaDeLaVariante,
} from '../escena/estructura'
import { TOKEN_DE_LA_LUZ, WEB_ENCENDIDA, parametrosDeWeb } from '../escena/luzDeWeb'
import { PRESETS_DE_LAS_PAGINAS, VARIANTE_DE_CADA_PAGINA } from '../escena/presets'
import { manejadorDeLaSalida, esUnaSalida, type Clic, type ClicEnUnEnlace, type DondeEsta, type Enlace } from '../movimiento/salidaDeLaPagina'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const SERVICIOS = path.join(AQUI, '..')
const ESCENA = path.join(SERVICIOS, 'escena')
const V3 = path.join(SERVICIOS, '..')
const RAIZ = path.join(SERVICIOS, '../../../..')

const igual = (a: ParametrosDeLaEscena, b: ParametrosDeLaEscena): boolean => CANALES.every((c) => a[c] === b[c])
const armar = (f: (c: Canal) => number): ParametrosDeLaEscena => ({ brilloDelPiso: f('brilloDelPiso'), tinteDelPiso: f('tinteDelPiso'), tinteDeLaEnergia: f('tinteDeLaEnergia') })
const AVANCES = Array.from({ length: 101 }, (_, i) => i / 100)
type Curva = (avance: number, reducido: boolean) => ParametrosDeLaEscena
const enTexto = (p: ParametrosDeLaEscena): string => CANALES.map((c) => `${c} ${String(Number(p[c].toFixed(3)))}`).join(', ')
const sinComentarios = (codigo: string): string => codigo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · En el avance 0, la composición compartida: la del home, de noche, con el piso apenas encendido y sin teñir')

const arrancaEnLaComposicion = (curva: Curva): boolean => igual(curva(0, false), COMPOSICION_COMPARTIDA)
afirmar(arrancaEnLaComposicion(parametrosDeWeb), `en el avance 0 la luz es exactamente la de la composición compartida (${enTexto(COMPOSICION_COMPARTIDA)})`)
controlPositivo('  una curva que arranca encendida se detecta', ((a, r) => parametrosDeWeb(Math.max(a, 0.2), r)) as Curva, arrancaEnLaComposicion)
// [V1] P-H29f · la composición la define el home: el brillo del piso es el suyo (no una copia), sin teñir; la noche, la del preset.
const composicionDelHome = (p: ParametrosDeLaEscena): boolean => p.brilloDelPiso === COMPOSICION_DE_LA_LUZ.brilloDelPiso && p.tinteDelPiso === 0 && p.tinteDeLaEnergia === 0
afirmar(composicionDelHome(COMPOSICION_COMPARTIDA) && COMPOSICION_DE_LA_LUZ.noche === 1, `  y es la del home (COMPOSICION_DE_LA_LUZ, P-H29f): el piso en ${String(COMPOSICION_DE_LA_LUZ.brilloDelPiso)}, la luz blanca, de noche entera`)
controlPositivo('  una composición propia (el piso en 0,2) se detecta', { ...COMPOSICION_COMPARTIDA, brilloDelPiso: 0.2 }, composicionDelHome)
controlPositivo('  y una ya teñida', { ...COMPOSICION_COMPARTIDA, tinteDelPiso: 0.1 }, composicionDelHome)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · En la mitad, brillo y color completos; de ahí a 1, quietos')

const completaALaMitadYQuieta = (curva: Curva): boolean => AVANCES.filter((a) => a >= ENCENDIDO_HASTA).every((a) => igual(curva(a, false), WEB_ENCENDIDA))
afirmar(ENCENDIDO_HASTA === 0.5 && completaALaMitadYQuieta(parametrosDeWeb), `a la mitad de la intro (0,5) la variante está completa (${enTexto(WEB_ENCENDIDA)}), y de 0,5 a 1 (51 avances) no se mueve`)
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
const encendidaComoDice = (p: ParametrosDeLaEscena): boolean => p.brilloDelPiso === 1 && p.tinteDelPiso === 1 && p.tinteDeLaEnergia === 1
afirmar(encendidaComoDice(WEB_ENCENDIDA), '  la encendida de web (lo que decidió Valentino): la luz de abajo del piso con todo su poder, y el celeste en ella y en la energía (brasas, arcos y red)')
controlPositivo('  una encendida sin el celeste en la energía se detecta', { ...WEB_ENCENDIDA, tinteDeLaEnergia: 0 }, encendidaComoDice)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Al irse, la luz vuelve a la composición en el tiempo del home, rápida y calma; con reducido, de una')

type Salida = (desde: ParametrosDeLaEscena, transcurridoMs: number, reducido: boolean) => ParametrosDeLaEscena
const DESDES: readonly ParametrosDeLaEscena[] = [WEB_ENCENDIDA, parametrosDeWeb(0.25, false)]
const TIEMPOS = Array.from({ length: 43 }, (_, i) => i * 10)
const vuelve = (salida: Salida): boolean =>
  DESDES.every((d) => igual(salida(d, 0, false), d) && igual(salida(d, SALIDA_DE_LA_VARIANTE_MS, false), COMPOSICION_COMPARTIDA) && igual(salida(d, 5000, false), COMPOSICION_COMPARTIDA))
afirmar(vuelve(parametrosDeLaSalida), `al irse, desde la encendida o desde la mitad del encendido, la luz arranca donde estaba y a los ${String(SALIDA_DE_LA_VARIANTE_MS)} ms (SALIDA_DE_LA_VARIANTE_MS, del home) está exacta en la composición, y ahí se queda`)
controlPositivo('  una salida que se queda a mitad de camino se detecta', ((d, ms, r) => parametrosDeLaSalida(d, Math.min(ms, 200), r)) as Salida, vuelve)
/** Rápida: a la mitad del tiempo ya hizo el 80 % del camino. Calma: avanza siempre hacia la composición, sin pasarse ni volver. */
const rapidaYCalma = (salida: Salida): boolean => DESDES.every((d) => CANALES.every((c) => {
  const camino = COMPOSICION_COMPARTIDA[c] - d[c]
  if (camino === 0) return TIEMPOS.every((ms) => salida(d, ms, false)[c] === d[c])
  const hecho = (ms: number): number => (salida(d, ms, false)[c] - d[c]) / camino
  return hecho(SALIDA_DE_LA_VARIANTE_MS / 2) >= 0.8 && TIEMPOS.every((ms, i) => hecho(ms) >= 0 && hecho(ms) <= 1 && (i === 0 || hecho(ms) >= hecho(TIEMPOS[i - 1] ?? 0)))
}))
afirmar(rapidaYCalma(parametrosDeLaSalida), `  rápida y calma: a la mitad del tiempo (${String(SALIDA_DE_LA_VARIANTE_MS / 2)} ms) ya hizo el 80 % del camino o más, y en todo el camino avanza sin pasarse ni volver`)
const conLaCurva = (curva: (t: number) => number): Salida => (d, ms) => {
  const t = curva(Math.min(1, ms / SALIDA_DE_LA_VARIANTE_MS))
  return armar((c) => d[c] * (1 - t) + COMPOSICION_COMPARTIDA[c] * t)
}
controlPositivo('  una salida lineal (lenta al principio) se detecta', conLaCurva((t) => t), rapidaYCalma)
controlPositivo('  y una que se pasa y vuelve (un rebote)', conLaCurva((t) => 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2), rapidaYCalma)
const inmediataConReducido = (salida: Salida): boolean => DESDES.every((d) => igual(salida(d, 0, true), COMPOSICION_COMPARTIDA))
afirmar(inmediataConReducido(parametrosDeLaSalida), '  y con movimiento reducido la salida es inmediata: en 0 ms ya está en la composición')
controlPositivo('  una salida animada con reducido se detecta', ((d, ms) => parametrosDeLaSalida(d, ms, false)) as Salida, inmediataConReducido)
// [V1] El cuadro de la variante, en el tiempo: con la página quieta sigue el avance; desde el primer cuadro con `saliendo`, la salida
// arranca de la luz de ESE cuadro (sin salto) y llega a la composición; si `saliendo` vuelve a false, manda otra vez el avance.
type Cuadro = typeof cuadroDeLaVariante
const recorrido = (cuadro: Cuadro): ParametrosDeLaEscena[] => {
  let s: SalidaDeLaVariante | null = null
  const momentos = [
    { avance: 0.5, saliendo: false, ahora: 1000 },
    { avance: 0.5, saliendo: true, ahora: 1016 },
    { avance: 0.5, saliendo: true, ahora: 1016 + SALIDA_DE_LA_VARIANTE_MS / 2 },
    { avance: 0.5, saliendo: true, ahora: 1016 + SALIDA_DE_LA_VARIANTE_MS },
    { avance: 0.25, saliendo: false, ahora: 2000 },
  ]
  return momentos.map((m) => {
    const r = cuadro(WEB_ENCENDIDA, { ...m, reducido: false }, s)
    s = r.salida
    return r.parametros
  })
}
const cuadrosComoDicen = (cuadro: Cuadro): boolean => {
  const [antes, primero, medio, fin, vuelta] = recorrido(cuadro)
  return antes !== undefined && primero !== undefined && medio !== undefined && fin !== undefined && vuelta !== undefined &&
    igual(antes, WEB_ENCENDIDA) && igual(primero, WEB_ENCENDIDA) && medio.brilloDelPiso < WEB_ENCENDIDA.brilloDelPiso && medio.brilloDelPiso > COMPOSICION_COMPARTIDA.brilloDelPiso &&
    igual(fin, COMPOSICION_COMPARTIDA) && igual(vuelta, parametrosDeWeb(0.25, false))
}
afirmar(cuadrosComoDicen(cuadroDeLaVariante), '  el cuadro de la variante: encendida a 0,5; el primer cuadro saliendo arranca de ahí (sin salto), a mitad del tiempo va bajando, al final está en la composición; y si la página se queda, vuelve al avance')
controlPositivo('  un cuadro que al salir salta de golpe a la composición se detecta', ((e, m, s) => (m.saliendo ? { parametros: COMPOSICION_COMPARTIDA, salida: s } : cuadroDeLaVariante(e, m, s))) as Cuadro, cuadrosComoDicen)
controlPositivo('  y uno que rearranca la salida en cada cuadro (nunca llega)', ((e, m) => cuadroDeLaVariante(e, m, null)) as Cuadro, cuadrosComoDicen)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El color va solo en la luz: los canales, y lo que la variante escribe y crea')

const SUPERFICIE = /color|superficie|material|albedo|difus|base|fondo|pintura|papel|bloque/i
const soloLuz = (destinos: Readonly<Record<string, { readonly luz: string; readonly tipo: string }>>): boolean =>
  Object.entries(destinos).every(([canal, d]) => d.tipo === 'luz' && !SUPERFICIE.test(canal))
afirmar(soloLuz(DESTINO_DE_CADA_CANAL) && JSON.stringify(Object.keys(DESTINO_DE_CADA_CANAL)) === JSON.stringify([...CANALES]), `los ${String(CANALES.length)} canales (${CANALES.join(', ')}) son de luz, y ninguno es el color de una superficie`)
controlPositivo('  un canal de color de superficie se detecta', { ...DESTINO_DE_CADA_CANAL, colorDelPiso: { luz: 'el material de los bloques', tipo: 'luz' } }, soloLuz)
controlPositivo('  y uno que apunta a una superficie', { ...DESTINO_DE_CADA_CANAL, tinteDelPiso: { luz: 'el material de los bloques', tipo: 'superficie' } }, soloLuz)
const soloLosCanales = (p: Readonly<Record<string, number>>): boolean => JSON.stringify(Object.keys(p).sort()) === JSON.stringify([...CANALES].sort())
afirmar(soloLosCanales(WEB_ENCENDIDA) && soloLosCanales(COMPOSICION_COMPARTIDA) && soloLosCanales(parametrosDeWeb(0.3, false)), '  y la variante, la composición y la curva no llevan nada más que esos canales (la noche la pone el preset)')
controlPositivo('  una encendida con un color para los bloques se detecta', { ...WEB_ENCENDIDA, colorDeLosBloques: 1 }, soloLosCanales)
// El componente (leído como texto: trae three y R3F): sólo escribe por las dos funciones de la ranura, con el blanco mezclado hacia el
// acento; no agrega objetos (ni mallas, ni materiales, ni geometrías, ni luces), no toca la cámara, el avance ni los almacenes del home.
const VARIANTE = sinComentarios(readFileSync(path.join(ESCENA, 'VarianteDeWeb.tsx'), 'utf8'))
const soloEscribeLaLuz = (fuente: string): boolean =>
  /luzDeAbajo\(cuadro\.parametros\.brilloDelPiso, colorDelPiso\.current\.copy\(BLANCO\)\.lerp\(acento, cuadro\.parametros\.tinteDelPiso\)\)/.test(fuente) &&
  /energia\(colorDeLaEnergia\.current\.copy\(BLANCO\)\.lerp\(acento, cuadro\.parametros\.tinteDeLaEnergia\)\)/.test(fuente) &&
  /return null\s*\}\s*$/.test(fuente) &&
  !/<[a-z]|new THREE\.(?!Color\b)|Material|Geometry|camera|LUZ_DE_ABAJO_EN_VIVO|ENERGIA_DE_LA_RUTA|AVANCE_DE_LA_INTRO|avance\.current\s*=|EffectComposer|_lib\/escena\/(?!ruta\/variante')/.test(fuente)
afirmar(soloEscribeLaLuz(VARIANTE), '  la variante (VarianteDeWeb.tsx) escribe SOLO la luz de abajo y la energía, con el blanco mezclado hacia el acento, y no crea nada: devuelve null (B12a-API §4, lo que puede y lo que no)')
controlPositivo('  una que agrega un anillo de color al piso se detecta', VARIANTE.replace('return null', 'return <mesh><ringGeometry /><meshBasicMaterial color={acento} /></mesh>'), soloEscribeLaLuz)
controlPositivo('  una que escribe el almacén del home directo', VARIANTE.replace('salida.current = cuadro.salida', 'salida.current = cuadro.salida; LUZ_DE_ABAJO_EN_VIVO.uEnergiaDeLaLuz.value = 1'), soloEscribeLaLuz)
controlPositivo('  y una que tiñe el piso con el acento entero desde el principio', VARIANTE.replace('.lerp(acento, cuadro.parametros.tinteDelPiso)', '.lerp(acento, 1)'), soloEscribeLaLuz)
const CSS = readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8')
const esElClaroDeWeb = (token: string): boolean =>
  token === '--color-acento-web-claro' && new RegExp(`^\\s*${token}:\\s*#[0-9A-Fa-f]{6};`, 'm').test(CSS) &&
  /\[data-servicio="web"\]\s*\{[^}]*--color-acento-claro:\s*var\(--color-acento-web-claro\)/.test(CSS)
afirmar(esElClaroDeWeb(TOKEN_DE_LA_LUZ) && PRESETS_DE_LAS_PAGINAS.web.acento === 'web', '  el celeste es el claro de web (--color-acento-web-claro): la ranura lo lee del token por el acento del preset (web); nunca un hex')
controlPositivo('  el oscuro de web (el de las superficies en papel) se detecta', '--color-acento-web', esElClaroDeWeb)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · En el celular, la compacta del home: la variante no tiene nada propio por calidad, y no toca el piso de bloques')

const sinCalidadPropia = (fuente: string): boolean => !/\bcalidad\b/.test(fuente) && CANALES.every((c) => !/bloque/i.test(c))
afirmar(sinCalidadPropia(VARIANTE), '  la variante no lee la calidad: la luz es la misma en plena y en compacta, y el costo lo baja la escena del home abajo de 1024 (dpr, plasma y pie compactos); ningún canal toca los bloques')
controlPositivo('  una que apaga el tinte en compacta se detecta', VARIANTE.replace('{ avance, acento,', "{ avance, acento, calidad,").replace('cuadro.parametros.tinteDeLaEnergia))', "calidad === 'compacta' ? 0 : cuadro.parametros.tinteDeLaEnergia))"), sinCalidadPropia)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Con movimiento reducido, el estado final quieto')

const quietaConReducido = (curva: Curva): boolean => AVANCES.every((a) => igual(curva(a, true), WEB_ENCENDIDA))
afirmar(quietaConReducido(parametrosDeWeb), 'con movimiento reducido, en los 101 avances, la variante está en su estado final y no se mueve')
controlPositivo('  una que con reducido sigue el avance se detecta', ((a) => parametrosDeWeb(a, false)) as Curva, quietaConReducido)
const reducidoQuietoEnElCuadro = (cuadro: Cuadro): boolean => AVANCES.every((a) => igual(cuadro(WEB_ENCENDIDA, { avance: a, reducido: true, saliendo: false, ahora: 0 }, null).parametros, WEB_ENCENDIDA)) &&
  igual(cuadro(WEB_ENCENDIDA, { avance: 0.7, reducido: true, saliendo: true, ahora: 5 }, null).parametros, COMPOSICION_COMPARTIDA)
afirmar(reducidoQuietoEnElCuadro(cuadroDeLaVariante), '  y en el cuadro: quieta en el final en cualquier avance, y al salir, en la composición en el primer cuadro')
controlPositivo('  un cuadro que con reducido anima la salida se detecta', ((e, m, s) => cuadroDeLaVariante(e, { ...m, reducido: m.saliendo ? false : m.reducido }, s)) as Cuadro, reducidoQuietoEnElCuadro)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · La variante registrada con su id, y los presets de las tres páginas')

const REGISTRO = readFileSync(path.join(V3, '_variantes/registro.ts'), 'utf8')
const registrada = (registro: string, esId: (id: string) => boolean): boolean =>
  /^\s+web: \(\) => import\('\.\.\/_servicios\/escena\/VarianteDeWeb'\),\r?$/m.test(registro) && !/^import (?!type)[^\n]*_servicios/m.test(registro) && esId('web')
afirmar(registrada(REGISTRO, esIdDeVariante) && typeof REGISTRO_DE_VARIANTES.web === 'function', '[P-H29e] la variante de web está registrada con su id, «web», con un import dinámico de su módulo (VarianteDeWeb.tsx): queda en su propio pedazo, fuera de la carga de la página y del lienzo')
controlPositivo('  un registro sin la línea de web se detecta', REGISTRO.replace(/^\s+web: [^\n]*\n/m, ''), (r: string) => registrada(r, (id) => id === 'prueba'))
controlPositivo('  y uno que la importa entera (entraría en la carga del lienzo)', `import VarianteDeWeb from '../_servicios/escena/VarianteDeWeb'\n${REGISTRO}`, (r: string) => registrada(r, esIdDeVariante))
const MODULO_DE_LA_VARIANTE = readFileSync(path.join(ESCENA, 'VarianteDeWeb.tsx'), 'utf8')
afirmar(/^'use client'/.test(MODULO_DE_LA_VARIANTE) && /^export default function VarianteDeWeb\(/m.test(MODULO_DE_LA_VARIANTE) && /: PropsDeLaVariante\): null/.test(MODULO_DE_LA_VARIANTE), "  y su módulo es 'use client' y exporta el componente como default, con las props de la ranura (PropsDeLaVariante, del home)")
/** El preset de una página, como dice la API (§1): una constante, de noche, con la intro compartida, el acento y la variante de su servicio. */
const presetComoDice = (id: (typeof IDS_DE_SERVICIO)[number], p: PresetDeLaEscena): boolean =>
  p.id === id && p.acento === id && p.noche === 'noche' && p.tramos?.intro === SELECTOR_DE_LA_INTRO && p.tramos.pie === null && p.pista === PISTA_DE_LA_INTRO &&
  p.variante === VARIANTE_DE_CADA_PAGINA[id] && p === PRESETS_DE_LAS_PAGINAS[id]
afirmar(IDS_DE_SERVICIO.every((id) => presetComoDice(id, PRESETS_DE_LAS_PAGINAS[id])), `los presets de las tres páginas: de noche, con la intro compartida (PISTA_DE_LA_INTRO, la misma), el tramo de la intro (${SELECTOR_DE_LA_INTRO}) y el acento de su servicio; una constante cada uno (el mismo objeto siempre)`)
afirmarIgual(VARIANTE_DE_CADA_PAGINA, { web: 'web', software: null, 'ia-automatizacion': null }, '  la variante: Páginas web la suya; Software e IA, ninguna todavía (la ranura deja la composición)')
controlPositivo('  un preset de web con la variante de prueba se detecta', { ...PRESETS_DE_LAS_PAGINAS.web, variante: 'prueba' as const }, (p: PresetDeLaEscena) => presetComoDice('web', p))
controlPositivo('  uno de día', { ...PRESETS_DE_LAS_PAGINAS.web, noche: 'dia' as const }, (p: PresetDeLaEscena) => presetComoDice('web', p))
controlPositivo('  y uno armado de nuevo en cada render (otro objeto)', { ...PRESETS_DE_LAS_PAGINAS.web }, (p: PresetDeLaEscena) => presetComoDice('web', p))

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · El costo del cálculo de un cuadro, contra el presupuesto de la API')

const cuestaPorCuadro = (f: () => unknown, vueltas: number): number => {
  const t0 = performance.now()
  for (let i = 0; i < vueltas; i += 1) f()
  return (performance.now() - t0) / vueltas
}
const unCuadro = (): unknown => cuadroDeLaVariante(WEB_ENCENDIDA, { avance: 0.37, reducido: false, saliendo: false, ahora: 0 }, null)
const muyPorDebajo = (f: () => unknown, vueltas: number): boolean => cuestaPorCuadro(f, vueltas) < PRESUPUESTO_DE_LA_VARIANTE.cpuMsPorCuadro / 10
afirmar(muyPorDebajo(unCuadro, 2000), `calcular la luz de un cuadro cuesta menos de un décimo del presupuesto (PRESUPUESTO_DE_LA_VARIANTE, ${String(PRESUPUESTO_DE_LA_VARIANTE.cpuMsPorCuadro)} ms de CPU por cuadro): ${cuestaPorCuadro(unCuadro, 2000).toFixed(4)} ms. El costo en el sitio lo mide scripts-servicios/escena.ts`)
controlPositivo('  un cálculo de 1 ms por cuadro se detecta', () => {
  const t0 = performance.now()
  while (performance.now() - t0 < 1) unCuadro()
}, (f: () => unknown) => muyPorDebajo(f, 5))

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · Cómo entra: la intro importa los presets; la variante, sólo el registro; escena/ es pura salvo la variante')

interface Fuente { readonly f: string; readonly codigo: string }
const recorrer = (dir: string, saltar: (nombre: string) => boolean): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const f = path.join(dir, e.name)
  return e.isDirectory() ? (saltar(e.name) ? [] : recorrer(f, saltar)) : /\.tsx?$/.test(e.name) ? [f] : []
})
const leer = (f: string): Fuente => ({ f: path.relative(SERVICIOS, f).split(path.sep).join('/'), codigo: sinComentarios(readFileSync(f, 'utf8')) })
const DE_LA_PAGINA: readonly Fuente[] = [
  ...recorrer(SERVICIOS, (n) => n === '__tests__' || n === 'escena').map(leer),
  ...recorrer(path.join(SERVICIOS, '../[servicio]'), () => false).map(leer),
]
const deEscena = (lista: readonly Fuente[]): string[] => lista.filter((x) => /from '(?:\.\.?\/)+(?:_servicios\/)?escena\//.test(x.codigo)).map((x) => x.f)
const entraComoDice = (lista: readonly Fuente[]): boolean => JSON.stringify(deEscena(lista)) === JSON.stringify(['Intro.tsx']) &&
  lista.every((x) => x.f !== 'Intro.tsx' || /from '\.\/escena\/presets'/.test(x.codigo)) && lista.every((x) => !/escena\/VarianteDeWeb/.test(x.codigo))
afirmar(entraComoDice(DE_LA_PAGINA), `de los ${String(DE_LA_PAGINA.length)} fuentes de _servicios (fuera de escena/) y de [servicio]/, sólo la intro importa algo de escena/: los presets. La variante no la importa nadie (la carga la ranura, por el registro)`)
controlPositivo('  un bloque que importa la variante se detecta', [...DE_LA_PAGINA, { f: 'bloques/Precio.tsx', codigo: "import VarianteDeWeb from '../escena/VarianteDeWeb'" }], entraComoDice)
const DE_LA_ESCENA: readonly Fuente[] = readdirSync(ESCENA).map((n) => leer(path.join(ESCENA, n)))
const conValoresDeCliente = (lista: readonly Fuente[]): string[] => lista.filter((x) =>
  !x.f.endsWith('.ts') || /^\s*['"]use client['"]/.test(x.codigo) || /^import (?!type )[^\n]*from '(three|react|@react-three\/[^']*)'/m.test(x.codigo)).map((x) => x.f)
afirmarIgual({ archivos: DE_LA_ESCENA.map((x) => x.f).sort(), deCliente: conValoresDeCliente(DE_LA_ESCENA) }, { archivos: ['escena/VarianteDeWeb.tsx', 'escena/estructura.ts', 'escena/luzDeWeb.ts', 'escena/presets.ts'], deCliente: ['escena/VarianteDeWeb.tsx'] }, '  escena/ son tres módulos puros (.ts, de three y de react sólo tipos) y la variante, el único de cliente con three: entra en su pedazo, nunca en la carga inicial')
controlPositivo('  un módulo puro que importa un valor de three se detecta', [...DE_LA_ESCENA.filter((x) => x.f !== 'escena/estructura.ts'), { f: 'escena/estructura.ts', codigo: "import * as THREE from 'three'" }], (l: readonly Fuente[]) => JSON.stringify(conValoresDeCliente(l)) === JSON.stringify(['escena/VarianteDeWeb.tsx']))

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · Cada enlace que se va de la página pide la salida de la variante ANTES de navegar (P-H29d)')

const AQUI_EN_WEB: DondeEsta = { origin: 'http://localhost:3001', pathname: '/v3/paginas-web', search: '' }
const clic = (href: string, cambios: Partial<ClicEnUnEnlace> = {}): ClicEnUnEnlace => ({ boton: 0, conTeclas: false, atendido: false, href: new URL(href, AQUI_EN_WEB.origin).href, target: '', descarga: false, abreElContacto: false, ...cambios })
/** Los enlaces de la página que se van: el logo y el cierre al home, el Portfolio (el deep link) y las tres páginas del cierre (también esta). */
const SE_VAN = ['/v3', '/v3#portfolio-el-garage', '/v3/paginas-web', '/v3/software-a-medida', '/v3/ia-y-automatizaciones']
const NO_SE_VAN: readonly (readonly [string, ClicEnUnEnlace])[] = [
  ['un ancla de la misma página', clic('/v3/paginas-web#precio')],
  ['un CTA que abre el contacto', clic('/v3/paginas-web#contacto', { abreElContacto: true })],
  ['un clic con Control (otra pestaña)', clic('/v3', { conTeclas: true })],
  ['el botón del medio', clic('/v3', { boton: 1 })],
  ['un enlace con target', clic('/v3', { target: '_blank' })],
  ['uno de afuera', clic('https://example.com/')],
  ['una descarga', clic('/v3', { descarga: true })],
  ['uno que otro ya atendió', clic('/v3', { atendido: true })],
]
const decideBien = (decide: typeof esUnaSalida): boolean => SE_VAN.every((h) => decide(clic(h), AQUI_EN_WEB)) && NO_SE_VAN.every(([, c]) => !decide(c, AQUI_EN_WEB))
afirmar(decideBien(esUnaSalida), `se van (y piden la salida): ${SE_VAN.join(', ')}; no se van: ${NO_SE_VAN.map(([n]) => n).join(', ')}`)
controlPositivo('  una decisión que deja ir sin salida al deep link del Portfolio se detecta', ((c: ClicEnUnEnlace, a: DondeEsta) => !(c.href ?? '').includes('#') && esUnaSalida(c, a)) as typeof esUnaSalida, decideBien)
controlPositivo('  y una que frena también el clic con Control', ((c: ClicEnUnEnlace, a: DondeEsta) => esUnaSalida({ ...c, conTeclas: false }, a)) as typeof esUnaSalida, decideBien)
/**
 * El manejador, en el tiempo, con un enlace y una señal de mentira: el clic que se va se frena, pide la salida UNA vez y NO navega hasta que
 * la salida se resuelve; resuelta, vuelve a apretar el mismo enlace, y ese segundo clic pasa sin frenarse ni volver a pedir.
 */
async function navegaDespues(manejador: typeof manejadorDeLaSalida): Promise<boolean> {
  const registro: string[] = []
  let resolver: () => void = () => undefined
  const senal = new Promise<void>((r) => {
    resolver = r
  })
  const enlace: Enlace = {
    href: new URL('/v3', AQUI_EN_WEB.origin).href,
    target: '',
    hasAttribute: () => false,
    closest: () => null,
    click: () => {
      registro.push('navega')
      alClic(evento('re-clic'))
    },
  }
  const evento = (nombre: string): Clic => ({ button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false, enlace, preventDefault: () => registro.push(`frena ${nombre}`) })
  const alClic = manejador(() => {
    registro.push('pide')
    return senal
  }, () => AQUI_EN_WEB)
  alClic(evento('clic'))
  await Promise.resolve()
  const antes = [...registro]
  resolver()
  await senal
  await Promise.resolve()
  return JSON.stringify(antes) === JSON.stringify(['frena clic', 'pide']) && JSON.stringify(registro) === JSON.stringify(['frena clic', 'pide', 'navega'])
}
const manejadorSinEspera: typeof manejadorDeLaSalida = (pedir, aqui) => {
  const real = manejadorDeLaSalida(() => Promise.resolve(), aqui)
  return (c) => {
    void pedir()
    real(c)
  }
}
const manejadorQueNoPide: typeof manejadorDeLaSalida = (_pedir, aqui) => manejadorDeLaSalida(() => Promise.resolve(), aqui)

async function laSalidaEnElTiempo(): Promise<void> {
  afirmar(await navegaDespues(manejadorDeLaSalida), '  el manejador frena el clic, pide la salida una vez y navega recién cuando se resuelve: vuelve a apretar el MISMO enlace, que pasa (nunca router.push)')
  controlPositivo('  uno que navega sin esperar la salida se detecta', await navegaDespues(manejadorSinEspera), (b: boolean) => b)
  controlPositivo('  y uno que no la pide', await navegaDespues(manejadorQueNoPide), (b: boolean) => b)
  cerrar('escena.invariant')
}
void laSalidaEnElTiempo()
