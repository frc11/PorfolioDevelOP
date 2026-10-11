/**
 * PULIDO 15 — el invariante: npm run test:s66-pulido-15
 *
 * Cada cosa con su control positivo (el detector ve el estado de antes). Los recibos medidos, en `docs/rediseno/entregas/pulido-15/`;
 * el log, `docs/rediseno/SPRINT-PULIDO-15.md`.
 *   M1 · Quiénes somos, definitivo: el cuerpo a la IZQUIERDA (la columna de siempre; la de la derecha y `?cuerpo=` se borraron),
 *        siempre delante del logo y entero, SIN el velo elíptico; la legibilidad, un halo corto y denso pegado al trazo de las
 *        letras (la sombra corta apilada, sin colas), del color contrario a la letra (de día la tinta con el halo del papel; de
 *        noche el papel con el halo de la tinta). AA medido donde el texto cruza el logo, de día y de noche, de 1024 a 2560.
 */
import { readFileSync } from 'node:fs'

import { PRUEBAS_SUELTAS, entornoPedido } from '../escena/entorno'
import { afirmar, cerrar, controlPositivo, deudaDeclarada, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const recibo = <T,>(nombre: string): T => JSON.parse(readFileSync(`docs/rediseno/entregas/pulido-15/${nombre}`, 'utf8')) as T

// ═══════════════════════════════════════════════════════════════════════════
titulo('M1 · Quiénes somos: el cuerpo a la izquierda, delante del logo, con su halo (sin velo)')
const GEOMETRIA_QS = leer('_secciones/quienes-somos/geometria.ts')
const QUIENES = leer('_secciones/quienes-somos/QuienesSomos.tsx')
const BANDA = leer('_estilos/banda.css')
// La composición: desde 1024, la columna de siempre (la izquierda, con su medida de antes); `?cuerpo=` se borró con su regla.
const aLaIzquierda = (g: string, css: string, q: string): boolean =>
  g.includes("bajada: 'escritorio:col-start-1 escritorio:col-span-6 escritorio:row-start-4',") && g.includes("'--agencia-medida': 'min(30rem, 42vw)',") &&
  !g.includes('escritorio:col-start-7') && !css.includes('data-columna') && !q.includes('pruebas.cuerpo') &&
  !(PRUEBAS_SUELTAS as readonly string[]).includes('cuerpo') && !('cuerpo' in entornoPedido('producto,cuerpo=izquierda').pruebas)
afirmar(aLaIzquierda(GEOMETRIA_QS, BANDA, QUIENES), 'M1 · desde 1024 el cuerpo va a la izquierda (la columna de siempre); la derecha de PULIDO 14 y `?cuerpo=` se borraron')
controlPositivo('M1 · el detector VE el cuerpo a la derecha de PULIDO 14', GEOMETRIA_QS.replace("bajada: 'escritorio:col-start-1 escritorio:col-span-6 escritorio:row-start-4',", "bajada: 'escritorio:col-start-7 escritorio:col-span-6 escritorio:row-start-4 escritorio:justify-self-end',"), (g: string) => aLaIzquierda(g, BANDA, QUIENES))
// Sin velo: ni el pseudo-elemento detrás del cuerpo, ni su degradé, ni sus tokens; el cuerpo pide su halo.
const BLOQUE_M1 = (css: string): string => {
  const i = css.indexOf('/* ── [PULIDO 15] M1 · QUIÉNES SOMOS')
  return i < 0 ? '' : css.slice(i, css.indexOf('/* ── EL ≠ A LA IZQUIERDA', i))
}
const sinVelo = (css: string, q: string): boolean =>
  BLOQUE_M1(css) !== '' && !/velo-del-cuerpo|degrade-del-cuerpo|alcance-del-cuerpo|\[data-halo-del-cuerpo\]::before|radial-gradient/.test(BLOQUE_M1(css)) &&
  !css.includes('--velo-del-cuerpo') && q.includes('<div ref={enElPlano} data-halo-del-cuerpo="">') && !q.includes('data-velo-del-cuerpo')
afirmar(sinVelo(BANDA, QUIENES), '  sin el velo elíptico blanco (ni su pseudo-elemento, ni su degradé, ni sus tokens): el cuerpo pide su halo')
const VELO_DE_PULIDO_14 = BANDA.replace("  [data-v3] [data-panel='quienes-somos'] [data-halo-del-cuerpo] p {", "  [data-v3] [data-panel='quienes-somos'] [data-halo-del-cuerpo]::before {\n    background: radial-gradient(closest-side, var(--velo-del-cuerpo) 70%, transparent);\n  }\n\n  [data-v3] [data-panel='quienes-somos'] [data-halo-del-cuerpo] p {")
controlPositivo('  el detector VE el velo de PULIDO 14 vuelto a poner', VELO_DE_PULIDO_14, (css: string) => sinVelo(css, QUIENES))
// El halo: corto y denso (al menos tres sombras de 0,1 em apiladas y ninguna de más de 0,2 em: las colas largas de D2, en un
// párrafo, se juntan en una mancha), todas del color del borde; el borde, el contrario de la letra (papel de día, tinta de noche),
// con un escalón a la mitad de la noche; la regla, en el párrafo del cuerpo desde 1024.
const haloBien = (css: string): boolean => {
  const b = BLOQUE_M1(css)
  const m = /--halo-del-cuerpo: ([^;]+);/.exec(b)
  if (m === null) return false
  const sombras = m[1].split(/,(?![^(]*\))/).map((s) => s.trim())
  const radios = sombras.map((s) => /^0 0 ([\d.]+)em var\(--borde-del-cuerpo\)$/.exec(s))
  if (radios.some((r) => r === null)) return false
  const em = radios.map((r) => Number(r?.[1]))
  return em.filter((x) => x === 0.1).length >= 3 && em.every((x) => x <= 0.2) &&
    b.includes('--de-noche-del-cuerpo: clamp(0, (var(--noche-del-arco, 0) - 0.5) * 1000, 1);') &&
    b.includes('--letra-del-cuerpo: color-mix(in srgb, var(--color-fondo) calc(var(--de-noche-del-cuerpo) * 100%), var(--color-tinta));') &&
    b.includes('--borde-del-cuerpo: color-mix(in srgb, var(--color-tinta) calc(var(--de-noche-del-cuerpo) * 100%), var(--color-fondo));') &&
    /@media \(width >= 1024px\) \{[\s\S]*\[data-v3\] \[data-panel='quienes-somos'\] \[data-halo-del-cuerpo\] p \{\s*color: var\(--letra-del-cuerpo\);\s*text-shadow: var\(--halo-del-cuerpo\);/.test(b)
}
afirmar(haloBien(BANDA), '  el halo: corto y denso (tres sombras de 0,1 em y tres de 0,2 em, sin colas), del color contrario a la letra (el papel de día, la tinta de noche)')
controlPositivo('  el detector VE el halo de D2 con sus colas (la mancha)', BANDA.replace('0 0 0.2em var(--borde-del-cuerpo);', '0 0 0.2em var(--borde-del-cuerpo), 0 0 0.45em var(--borde-del-cuerpo), 0 0 0.9em var(--borde-del-cuerpo);'), haloBien)
controlPositivo('  y un halo del mismo color que la letra (no separa nada)', BANDA.replace('--borde-del-cuerpo: color-mix(in srgb, var(--color-tinta) calc(var(--de-noche-del-cuerpo) * 100%), var(--color-fondo));', '--borde-del-cuerpo: var(--letra-del-cuerpo);'), haloBien)

// Medido (`m1-halo.ts`, el banco de producción en la NVIDIA): en los seis anchos, en el reposo del viaje, en la entrada y en la
// salida (de a 48 px, la parada con más cruce), cuánto del cuerpo cruza la silueta del logo y el contraste (como WCAG: la letra
// contra el fondo típico del tramo, el peor de 40 px), del cuerpo entero y de los renglones sobre el logo; de día y con la noche
// puesta (la gota en 1: el papel con el halo de la tinta). La entrada no cruza en ningún ancho (el cuerpo llega con el logo a un
// costado): las paradas son el reposo y la salida.
interface Parada { readonly por: number; readonly cuerpo: number | null; readonly sobreElLogo: number | null; readonly delArco: string; readonly textoClaro: boolean }
interface Ancho { readonly maximo: { readonly reposo: number; readonly entrada: number; readonly salida: number }; readonly dia: Record<string, Parada>; readonly noche: Record<string, Parada> }
const M1 = recibo<{ anchos: Record<string, Ancho>; nocheReal: (Parada & { ms: number })[] }>('m1-cuerpo.json')
const ANCHOS_M1 = ['1024x768', '1280x800', '1366x768', '1440x900', '1920x1080', '2560x1440']
const AA = 4.5
/** Lo que se afirma: el logo cruza al salir; de día todo en AA; de noche, la letra clara, el cuerpo en AA en el reposo y, sobre el logo, por encima del piso. */
const legible = (anchos: Record<string, Ancho>, piso: number): boolean =>
  ANCHOS_M1.every((w) => {
    const a = anchos[w]
    if (a === undefined || a.maximo.salida <= 0 || a.maximo.entrada !== 0) return false
    const dia = Object.values(a.dia)
    const noche = Object.values(a.noche)
    return dia.length >= 2 && noche.length >= 2 &&
      dia.every((p) => !p.textoClaro && (p.cuerpo ?? 0) >= AA && (p.por === 0 || (p.sobreElLogo ?? 0) >= AA)) &&
      noche.every((p) => p.textoClaro && (p.por > 0 || (p.cuerpo ?? 0) >= AA) && (p.por === 0 || ((p.sobreElLogo ?? 0) >= piso && (p.cuerpo ?? 0) >= piso)))
  })
const sobreElLogo = (luz: 'dia' | 'noche'): number[] => ANCHOS_M1.flatMap((w) => Object.values(M1.anchos[w][luz]).filter((p) => p.por > 0).map((p) => p.sobreElLogo ?? 0))
const rango = (v: number[]): string => `${Math.min(...v).toFixed(2)}–${Math.max(...v).toFixed(2)}`
afirmar(legible(M1.anchos, 4), `  medido: en los seis anchos el logo cruza el cuerpo al salir (hasta ${String(Math.max(...ANCHOS_M1.map((w) => M1.anchos[w].maximo.salida)))} % de las letras); de día, todo en AA (sobre el logo ${rango(sobreElLogo('dia'))}:1); de noche, la letra clara y el reposo en AA`)
const SIN_HALO = Object.fromEntries(ANCHOS_M1.map((w) => [w, { ...M1.anchos[w], dia: Object.fromEntries(Object.entries(M1.anchos[w].dia).map(([k, p]) => [k, { ...p, sobreElLogo: p.por > 0 ? 1.1 : null }])) }]))
controlPositivo('  el detector VE el cuerpo sobre la tinta del logo sin halo (~1:1)', SIN_HALO, (a: Record<string, Ancho>) => legible(a, 4))
const DE_NOCHE_CON_TINTA = Object.fromEntries(ANCHOS_M1.map((w) => [w, { ...M1.anchos[w], noche: Object.fromEntries(Object.entries(M1.anchos[w].noche).map(([k, p]) => [k, { ...p, textoClaro: false }])) }]))
controlPositivo('  y la letra de tinta de noche (no cambia con la sala)', DE_NOCHE_CON_TINTA, (a: Record<string, Ancho>) => legible(a, 4))
// De noche sobre el logo: la tapa del logo de noche es gris (#808080 en la captura) y el instrumento mide la letra contra el fondo
// típico del tramo (la tapa), no contra su halo: 4,3–4,8. El pedido: sin una forma visible, el número anotado y sin volver al velo.
deudaDeclarada(sobreElLogo('noche').every((x) => x >= AA), 'M1 · de noche, los renglones sobre la tapa gris del logo en AA', `medido ${rango(sobreElLogo('noche'))}:1 (el halo corto no alcanza contra la tapa; agrandarlo sería la mancha que se pidió no poner)`, 'la decisión del humano (sin velo)')
// La noche que se retira de verdad (de Portfolio a la salida con la rueda rápida, a 1440): la letra cambia con la noche que se VE
// (la del arco): no queda papel sobre la sala ya de día (la variable de la gota, en un salto, sigue alta con la sala de día).
const retiraBien = (t: readonly (Parada & { ms: number })[]): boolean =>
  t.length >= 4 && t.every((x) => x.textoClaro === Number(x.delArco) > 0.5 && (x.cuerpo ?? 0) >= 4) && t.some((x) => x.textoClaro) && t.some((x) => !x.textoClaro)
afirmar(retiraBien(M1.nocheReal), `  la noche que se retira: la letra sigue a la luz que se ve (${M1.nocheReal.map((x) => `${String(x.ms)} ms ${x.textoClaro ? 'papel' : 'tinta'}`).join(', ')})`)
controlPositivo('  el detector VE el papel sobre la sala ya de día (la letra atada a la gota)', M1.nocheReal.map((x, k) => (k === 1 ? { ...x, textoClaro: true } : x)), retiraBien)

cerrar('s66-pulido-15')
