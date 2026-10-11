/**
 * PULIDO 15 — el invariante: npm run test:s66-pulido-15
 *
 * Cada cosa con su control positivo (el detector ve el estado de antes). Los recibos medidos, en `docs/rediseno/entregas/pulido-15/`;
 * el log, `docs/rediseno/SPRINT-PULIDO-15.md`.
 *   M1 · Quiénes somos, definitivo: el cuerpo a la IZQUIERDA (la columna de siempre; la de la derecha y `?cuerpo=` se borraron),
 *        siempre delante del logo y entero, SIN el velo elíptico; la legibilidad, un halo corto y denso pegado al trazo de las
 *        letras (la sombra corta apilada, sin colas), del color contrario a la letra (de día la tinta con el halo del papel; de
 *        noche el papel con el halo de la tinta). AA medido donde el texto cruza el logo, de día y de noche, de 1024 a 2560.
 *   M2 · la energía nueva, plasma + cargas (`?energia=plasma`, exploración; sin la bandera, el polvo): cientos de cargas en el
 *        volumen (las opuestas se atraen, las iguales se repelen, con rechazo de corto alcance, amortiguación y agitación; las
 *        fuerzas por una grilla), enlaces que descargan en arcos de plasma cortos y quebrados (punto medio, con ramas, ~0,3 s), el
 *        logo que suelta arcos, el puntero como carga fuerte (los arcos le saltan); como mucho 5 arcos a la vez (4 en el teléfono);
 *        detrás de los textos; monocromo (`?plasma-color=si`, el azul eléctrico). Los destellos de PULIDO 14 se borraron.
 */
import { existsSync, readFileSync } from 'node:fs'

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

// ═══════════════════════════════════════════════════════════════════════════
titulo('M2 · La energía nueva: plasma + cargas (`?energia=plasma`)')
// Los destellos se borraron con su código y sus banderas; entra la energía: el polvo de siempre sin la bandera, el plasma EN LUGAR
// del polvo con `energia=plasma` (con `plasma-y-polvo`, además del polvo), en azul con `plasma-color=si`. [PULIDO 17] O3 · el color
// se borró («sin sonido ni color, descartado»): la bandera ya no existe (s68).
const STAGE = leer('_lib/escena/ProbeStage.tsx')
const banderas = (stage: string): boolean =>
  !existsSync(`${V3}/_lib/escena/destellos`) && !(PRUEBAS_SUELTAS as readonly string[]).some((k) => k.startsWith('destellos')) &&
  !('destellos' in entornoPedido('producto,destellos=chispas').pruebas) && PRUEBAS_SUELTAS.includes('energia') && !(PRUEBAS_SUELTAS as readonly string[]).includes('plasma-color') &&
  entornoPedido('producto').pruebas.energia === 'no' && entornoPedido('producto,energia=plasma').pruebas.energia === 'plasma' &&
  entornoPedido('producto,energia=plasma-y-polvo').pruebas.energia === 'plasma-y-polvo' && !('plasma-color' in entornoPedido('producto,energia=plasma,plasma-color=si').pruebas) &&
  stage.includes("const sinPolvo = energia === 'plasma'") && stage.includes('{!sinPolvo && <DepthParticles store={store} />}') &&
  stage.includes("{energia !== 'no' && <PlasmaYCargas logoGroupRef={logoGroupRef} quieto={reducedMotion}") && !/Destellos/.test(stage)
afirmar(banderas(STAGE), 'M2 · sin `?destellos=` (borrados con su código); `?energia=plasma` en lugar del polvo (o `plasma-y-polvo`; `?plasma-color=si` se borró en PULIDO 17); sin bandera, el polvo')
controlPositivo('M2 · el detector VE los destellos todavía montados', `${STAGE}\n{destellos !== 'no' && <DestellosDeEnergia />}`, banderas)

// [PULIDO 16] N2 · EL PLASMA SE REHIZO a pedido («mejorá TODO»): átomos, iones y electrones, Coulomb suavizado con su repulsión de
// corto alcance, moléculas que vibran, la temperatura, arcos que siguen al campo con sus re-golpes, la ionización y la
// recombinación, el clic, la carga y la descarga (`escena/energia/`, en módulos: especies, física, arcos, interacción, render).
// Lo que acá se afirmaba del modelo de PULIDO 15 (las cargas de dos signos, la grilla, los enlaces, el tope y las clases de arcos,
// ninguno sobre el texto, el camino quebrado, los sombreadores detrás del texto, el movimiento reducido) se borró con ese código
// (`cargas.ts`, `arcos.ts`, `sombreadores.ts`, `armado.ts`); s67 lo afirma sobre el modelo nuevo, con sus controles positivos.
// [PULIDO 17] O3 · el de PULIDO 16 no gustó y se borró; el plasma volvió al espíritu de este (las cargas sueltas y sus arcos), en tres
// direcciones (`?plasma=a|b|c`): s68.

// Medido (`m2-plasma.ts`, el banco de producción): en la NVIDIA, a 1440 (el mouse) y a 390 (el dedo), monocromo y en color: los ms
// por cuadro de día, con el puntero y de noche dentro del cuadro (la pantalla del banco va a 75 Hz: 13,3 ms), como la base del
// polvo; las cantidades (320 y 180 cargas) y el tope de arcos a la vez; los arcos de las tres clases (enlace, logo, puntero o dedo).
interface Cuadros { readonly media: number; readonly p95: number; readonly mayoresDe20: number }
interface EstadoMedido { readonly cargas: number; readonly maximoALaVez: number; readonly contados: Record<string, number> }
interface CorridaMedida { readonly placa: string; readonly dia: Cuadros; readonly noche: Cuadros; readonly conPuntero?: Cuadros; readonly estadoDeDia: EstadoMedido | null; readonly estadoDeNoche: EstadoMedido | null; readonly arcoDelLogo?: EstadoMedido | null; readonly arcoAlPuntero?: EstadoMedido | null }
const M2 = recibo<{ corridas: Record<string, CorridaMedida> }>('m2-plasma.json').corridas
// [PULIDO 16] N2 · las cantidades del plasma de PULIDO 15 (su código se borró: lo medido queda como historia, con sus números).
const DE_PULIDO_15 = { cargas: { escritorio: 320, compacta: 180 }, arcos: { escritorio: 5, compacta: 4 } } as const
const enElCuadro = (c: Cuadros | undefined): boolean => c !== undefined && c.media <= 16.7 && c.mayoresDe20 <= 2
const medidoBien = (r: Record<string, CorridaMedida>): boolean =>
  ['plasma-1440', 'plasma-color-1440', 'plasma-390', 'plasma-color-390', 'polvo-1440', 'polvo-390'].every((k) => r[k] !== undefined && r[k].placa.includes('NVIDIA') && enElCuadro(r[k].dia) && enElCuadro(r[k].noche) && (r[k].conPuntero === undefined || enElCuadro(r[k].conPuntero))) &&
  ['1440', '390'].every((w) => {
    const [c, maximo] = w === '1440' ? [DE_PULIDO_15.cargas.escritorio, DE_PULIDO_15.arcos.escritorio] : [DE_PULIDO_15.cargas.compacta, DE_PULIDO_15.arcos.compacta]
    const plasma = r[`plasma-${w}`]
    const estados = [plasma.estadoDeDia, plasma.estadoDeNoche, plasma.arcoDelLogo ?? null, plasma.arcoAlPuntero ?? null].filter((e): e is EstadoMedido => e !== null)
    const final = plasma.estadoDeNoche
    return estados.length >= 3 && estados.every((e) => e.cargas === c && e.maximoALaVez <= maximo) && final !== null && (final.contados.par ?? 0) > 0 && (final.contados.logo ?? 0) > 0 && (final.contados.cursor ?? 0) > 0 && (plasma.arcoDelLogo ?? null) !== null && (plasma.arcoAlPuntero ?? null) !== null
  })
const ms = (k: string): string => `${M2[k].dia.media.toFixed(2)}/${M2[k].noche.media.toFixed(2)}`
afirmar(medidoBien(M2), `  medido en la NVIDIA (ms por cuadro de día/de noche): a 1440 ${ms('plasma-1440')}, en color ${ms('plasma-color-1440')}; a 390 ${ms('plasma-390')}; el polvo ${ms('polvo-1440')}; ninguno de más de 20 ms; ${String(DE_PULIDO_15.cargas.escritorio)} y ${String(DE_PULIDO_15.cargas.compacta)} cargas, como mucho ${String(M2['plasma-1440'].estadoDeNoche?.maximoALaVez)} arcos a la vez; las tres clases de arco, con el mouse y con el dedo`)
controlPositivo('  el detector VE una corrida fuera del cuadro', { ...M2, 'plasma-390': { ...M2['plasma-390'], noche: { media: 22, p95: 31, mayoresDe20: 90 } } }, medidoBien)
controlPositivo('  y el dedo que no hace saltar arcos', { ...M2, 'plasma-390': { ...M2['plasma-390'], arcoAlPuntero: null } }, medidoBien)

cerrar('s66-pulido-15')
