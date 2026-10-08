/**
 * PULIDO 3 — el invariante: npm run test:s54-pulido-3
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   A1 · la energía bajo el piso en TODA la escena: la mancha negra (ninguna tapa baja hasta el plano), el campo continuo
 *        (cobertura, fluye, nunca se apaga, sin ciclos), la expansión desde el hueco (función de `fin`: el rebobinado sin
 *        cortes), las ondas del logo y la sala gradual.
 *   A2 · el contacto del pie a 768: vidrio (el claro, más liviano) y en columna hasta las redes; sólo en la tablet.
 *   B0 · [PULIDO 3B] la energía, versión final: una sola (sin `red` ni `inestable`; `?energia=intensa` para comparar), más
 *        movimiento y más brillo, las corrientes sin patrón, los pistones sin vibración, el logo que brilla (fuera del
 *        oscurecimiento, su filo y el pulso de cada onda), el frente desde el golpe y la cobertura nunca bajo el 65 %.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-3.md`. Lo que se mira en vivo: `docs/rediseno/entregas/pulido-3/mirar.txt`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'

import { ENTORNO, PRUEBAS_SUELTAS, entornoPedido } from '../escena/entorno'
import { conElFinalEnElPiso, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import {
  ALTO_DEL_PLANO,
  CORRIENTES,
  CORRIENTES_DE_LA_LUZ_GLSL,
  ENERGIA_EN_LA_SIMULACION_GLSL,
  INTENSA,
  LUZ_DE_ABAJO,
  PISTONES,
  campoDeLaLuz,
  corrienteEnLaJunta,
  desdeLaUltimaOnda,
  energiaDeFondo,
  energiaDelCampo,
  fondoDeLaLuz,
  naceLaOnda,
  radioDeLaExpansion,
} from '../escena/final/luzDeAbajo'
import { BRILLO_DEL_LOGO, BRILLO_DEL_LOGO_GLSL, pulsoDelLogo } from '../escena/final/rimDeLaLuz'
import { FINAL_DEL_PIE, RELOJ_DEL_FINAL, duracionDelRebobinado, expansionDeLaLuz, quedaDelRebobinado } from '../escena/final/recorridoDelFinal'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { conOndaDirigida } from '../escena/piso/ondaDirigida'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

import * as THREE from 'three'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A1 · La energía bajo el piso: de un sector a TODA la escena («sobrecarga»), sin la mancha negra')

const L = LUZ_DE_ABAJO
const sim = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const cuadro = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))

// LA MANCHA NEGRA: en el golpe la súper onda dibujaba valles más hondos que el plano de abajo (y que el pie de los bloques):
// el plano quedaba por encima de esas tapas y se veía de frente, oscuro en su borde. Con energía, ninguna tapa baja hasta el
// plano: un piso blando (igual arriba de `desde`, nunca bajo `hasta`), por encima del plano; en la simulación, después de las
// alturas de la luz, con la energía.
type Fondo = (alto: number) => number
const manchaBien = (fondo: Fondo, s: string, plano: number): boolean => {
  const altos = Array.from({ length: 400 }, (_, i) => -3 + i * 0.01)
  const nuncaBajo = altos.every((a) => fondo(a) > plano + 0.02)
  const igualArriba = altos.filter((a) => a >= L.fondo.desde).every((a) => Math.abs(fondo(a) - a) < 1e-12)
  const continuo = altos.every((a, i) => i === 0 || Math.abs(fondo(a) - fondo(altos[i - 1])) <= 0.0100001)
  return nuncaBajo && igualArriba && continuo && s.includes('dibujo += alturaDeLaLuz( xz, energiaAqui ) + pistonAqui;\n\tdibujo = mix( dibujo, fondoDeLaLuz( dibujo ), clamp( uEnergiaDeLaLuz * 4.0, 0.0, 1.0 ) );')
}
afirmar(manchaBien(fondoDeLaLuz, sim, ALTO_DEL_PLANO), 'la mancha negra: con energía ninguna tapa baja hasta el plano de abajo (un piso blando por encima de él, continuo, igual en el resto)', `piso blando ${String(L.fondo.desde)} → ${String(L.fondo.hasta)} u · plano a ${ALTO_DEL_PLANO.toFixed(2)} u`)
controlPositivo('el detector VE las tapas que bajan hasta el plano (la súper onda de antes)', ((a: number) => a) as Fondo, (f: Fondo) => manchaBien(f, sim, ALTO_DEL_PLANO))
controlPositivo('  y el piso blando sin aplicar en la simulación', sim.replace('\n\tdibujo = mix( dibujo, fondoDeLaLuz( dibujo ), clamp( uEnergiaDeLaLuz * 4.0, 0.0, 1.0 ) );', ''), (s: string) => manchaBien(fondoDeLaLuz, s, ALTO_DEL_PLANO))

// EL CAMPO: la gran mayoría del piso visible con algo de luz, con intensidad variable, en cualquier momento (nunca se apaga),
// en lo que se ve a 1440 (56 × 24 u) y a 390 (18 × 36 u), fuera del mar calmo. [PULIDO 3B] B0 · cambió por pedido: con la
// capa fina, nunca menos del 65 % (antes: media de 70 a 85 % y nunca menos del 40 %; a 390 bajaba al 50 %).
type Energia = (x: number, z: number, t: number) => number
const coberturas = (energia: Energia, X: number, Z: number): number[] => {
  const salida: number[] = []
  for (let t = 0; t < 900; t += 7) {
    let [n, con] = [0, 0]
    for (let x = -X; x <= X; x += 0.8) {
      for (let z = -Z; z <= Z; z += 0.8) {
        if (Math.hypot(x, z) < 7) continue
        n += 1
        if (energia(x, z, t) > 0.02) con += 1
      }
    }
    salida.push(con / n)
  }
  return salida
}
const coberturaBien = (energia: Energia): boolean => [[28, 12], [9, 18]].every(([X, Z]) => {
  const c = coberturas(energia, X, Z)
  const media = c.reduce((a, b) => a + b, 0) / c.length
  return media >= 0.75 && media <= 0.95 && Math.min(...c) >= 0.65
})
const c1440 = coberturas(energiaDeFondo, 28, 12)
const c390 = coberturas(energiaDeFondo, 9, 18)
afirmar(coberturaBien(energiaDeFondo), '  la gran mayoría del piso con algo de luz, y nunca menos del 65 % en ningún momento ni ancho', `a 1440: media ${(100 * c1440.reduce((a, b) => a + b, 0) / c1440.length).toFixed(0)} %, mínimo ${(100 * Math.min(...c1440)).toFixed(0)} % · a 390: mínimo ${(100 * Math.min(...c390)).toFixed(0)} %`)
controlPositivo('  el detector VE el campo sin la capa fina (bajaba al 40 %)', ((x: number, z: number, t: number) => energiaDelCampo(campoDeLaLuz(x, z, t))) as Energia, coberturaBien)

type Campo = (x: number, z: number, t: number) => number
// FLUYE: un ruido con domain warping que se mueve en el tiempo: de un cuadro al otro casi igual (continuo) y, a los 20 s, otro
// (las zonas calientes viajan por todo el entorno sin parar).
const correlacion = (campo: Campo, dt: number): number => {
  const [a, b]: [number[], number[]] = [[], []]
  for (let x = -20; x <= 20; x += 1.6) for (let z = -12; z <= 12; z += 1.6) for (const t of [5, 50, 170]) {
    a.push(energiaDelCampo(campo(x, z, t)))
    b.push(energiaDelCampo(campo(x, z, t + dt)))
  }
  const m = (v: number[]): number => v.reduce((p, q) => p + q, 0) / v.length
  const [ma, mb] = [m(a), m(b)]
  const cov = a.reduce((p, v, i) => p + (v - ma) * (b[i] - mb), 0)
  const va = a.reduce((p, v) => p + (v - ma) ** 2, 0)
  const vb = b.reduce((p, v) => p + (v - mb) ** 2, 0)
  return cov / Math.sqrt(Math.max(1e-12, va * vb))
}
const fluyeBien = (campo: Campo, glsl: string): boolean => correlacion(campo, 1 / 60) > 0.98 && correlacion(campo, 20) < 0.5 && /return fbmDeLaLuz\( p \+ [0-9.]+ \* \( q - 0\.5 \) \);/.test(glsl) && glsl.includes('campoDeLaLuz( xz, t )') && glsl.includes('float e = fondoDeLaEnergia( xz, uRelojDeLaLuz );')
afirmar(fluyeBien(campoDeLaLuz, ENERGIA_EN_LA_SIMULACION_GLSL), '  el campo fluye (domain warping que se mueve): continuo de un cuadro al otro y otro a los 20 s', `correlación: un cuadro ${correlacion(campoDeLaLuz, 1 / 60).toFixed(3)} · 20 s ${correlacion(campoDeLaLuz, 20).toFixed(2)}`)
controlPositivo('  el detector VE un campo quieto (las zonas no viajan)', ((x: number, z: number) => campoDeLaLuz(x, z, 0)) as Campo, (c: Campo) => fluyeBien(c, ENERGIA_EN_LA_SIMULACION_GLSL))

// SIN CICLOS: no hay zonas que nacen, viven y mueren (ni su reloj, ni sus uniformes).
const luzTs = sinComentarios(leer('_lib/escena/final/luzDeAbajo.ts'))
const sinCiclos = (fuente: string): boolean => !/zonasDeLaLuz|uZonasDeLaLuz|prendidoDeLaLuz|\bnace: \[|\bmuere: \[/.test(fuente)
afirmar(sinCiclos(luzTs) && sinCiclos(cuadro), '  nada de ciclos de nacer y morir: sin zonas (ni su reloj, ni sus uniformes)')
controlPositivo('  el detector VE las zonas de PULIDO 2', `${luzTs}\nexport function zonasDeLaLuz() {}`, sinCiclos)

// LA EXPANSIÓN: en el golpe la energía sale del hueco y cubre la escena en ~1,5 s (y llega más allá de lo que se ve); es
// función de `fin`, así que al rebobinar se retira hacia el hueco con la curva de P2, sin cortes de un cuadro al otro.
type Expansion = (fin: number) => number
const golpe = FINAL_DEL_PIE.presion.hastaS / RELOJ_DEL_FINAL.duracionS
const enS = (s: number): number => s / RELOJ_DEL_FINAL.duracionS
const expansionBien = (e: Expansion, c: string): boolean => {
  const finDelRebobinado = (s: number, dura: number): number => 0.35 + 0.65 * quedaDelRebobinado(s, dura)
  const dura = duracionDelRebobinado(1)
  let [salto, radio] = [0, 0]
  for (let s = 1 / 60; s <= dura; s += 1 / 60) {
    salto = Math.max(salto, Math.abs(e(finDelRebobinado(s, dura)) - e(finDelRebobinado(s - 1 / 60, dura))))
    radio = Math.max(radio, Math.abs(radioDeLaExpansion(e(finDelRebobinado(s, dura)), 6.2) - radioDeLaExpansion(e(finDelRebobinado(s - 1 / 60, dura)), 6.2)))
  }
  return e(golpe) === 0 && e(golpe - 0.01) === 0 && Math.abs(e(golpe + enS(0.75)) - 0.5) < 0.05 && e(golpe + enS(1.5)) === 1 && e(1) === 1 &&
    radioDeLaExpansion(1, 6.2) >= 30 && salto < 0.2 && radio < 6 && c.includes('const expansion = expansionDeLaLuz(fin)') &&
    ENERGIA_EN_LA_SIMULACION_GLSL.includes('float llego = 1.0 - smoothstep( uExpansionDeLaLuz.x - ')
}
afirmar(expansionBien(expansionDeLaLuz, cuadro), '  arranca con el encastre: se expande desde el hueco en ~1,5 s hasta cubrir la escena; al rebobinar se retira con la curva de P2, sin cortes', `hasta ${String(L.expansion.hasta)} u`)
controlPositivo('  el detector VE una energía que se prende entera en el golpe (de un cuadro al otro)', ((fin: number) => (fin >= golpe ? 1 : 0)) as Expansion, (e: Expansion) => expansionBien(e, cuadro))
controlPositivo('  y una expansión por el reloj de la escena (no vuelve con el rebobinado)', cuadro.replace('const expansion = expansionDeLaLuz(fin)', 'const expansion = 1'), (c: string) => expansionBien(expansionDeLaLuz, c))

// LAS ONDAS DEL LOGO: cada una pasa como un frente que sube la energía (y abre más las juntas: la separación es de la energía).
// Durante el final el logo no larga los anillos del pulso (NOCTURNO FINAL B3), así que larga los suyos en la energía.
const ondasBien = (g: string): boolean => /e \+= [0-9.]+ \* ondaDeLaLuz\( r \) \* llego \* \( 0\.35 \+ e \);/.test(g) && g.includes('float s = ondaDelLogo( r, ') && g.includes('vec4 a = uAnillos[ i ];') && g.includes('if ( uGolpe.w > 0.0 ) {') &&
  L.ondas.cadaS >= 2 && L.ondas.cadaS <= 6 && L.ondas.sube >= 0.5
afirmar(ondasBien(ENERGIA_EN_LA_SIMULACION_GLSL), '  cada onda del logo (las suyas cada pocos segundos, el golpe y los anillos si los hubiera) pasa como un frente que sube la energía', `una cada ${String(L.ondas.cadaS)} s a ${String(L.ondas.velocidad)} u/s`)
controlPositivo('  el detector VE una energía que no reacciona a las ondas', ENERGIA_EN_LA_SIMULACION_GLSL.replace(/e \+= [0-9.]+ \* ondaDeLaLuz\( r \) \* llego \* \( 0\.35 \+ e \);/, ''), ondasBien)

// LA SALA SE OSCURECE GRADUAL, acompañando la expansión: a 60 cuadros por segundo, lo más que cambia en uno.
type Oscuro = (fin: number) => number
const oscuroDe = (e: Expansion): Oscuro => (fin) => L.oscurece * (1 - (1 - e(fin)) ** 2)
const salaBien = (o: Oscuro, c: string): boolean => {
  let salto = 0
  for (let s = 4.5; s < 6.4; s += 1 / 60) salto = Math.max(salto, Math.abs(o(enS(s)) - o(enS(s - 1 / 60))))
  return salto <= 0.02 && o(1) >= 0.3 && o(golpe) === 0 && c.includes('const extendida = (1 - (1 - expansion) * (1 - expansion)) * LUZ_DE_ABAJO_EN_VIVO.uEnergiaDeLaLuz.value') && c.includes('piso.uOscuroDelBrillo.value = LUZ_DE_ABAJO.oscurece * extendida')
}
afirmar(salaBien(oscuroDe(expansionDeLaLuz), cuadro), '  la escena se oscurece gradualmente, acompañando la expansión')
controlPositivo('  el detector VE una sala que se oscurece de golpe', ((fin: number) => (fin >= golpe ? L.oscurece : 0)) as Oscuro, (o: Oscuro) => salaBien(o, cuadro))

// [PULIDO 3B] B0 · cambió por pedido: las variantes `?energia=red|inestable` se fundieron en el producto (las fija B0, abajo).

// ═══════════════════════════════════════════════════════════════════════════
titulo('A2 · El contacto del pie a 768: vidrio y en columna, hasta las redes (390 y escritorio no cambian)')

// A 768 caía «opaca» con el mismo material que a 390 (el tinte del papel al 66 %, el desenfoque, los campos al 72 %): detrás
// sólo quedaba el piso claro y parejo (a 390 la caja pisa el logo negro). En la tablet (y sólo ahí: la franja de 768 a 1023,
// con `tablet:max-escritorio:` en las clases y en la hoja) el vidrio claro lleva un tinte y un relleno más livianos (el oscuro,
// sobre la noche, queda como estaba: con el especular de PULIDO 2 · 6 en AA); el formulario va en columna (un campo por
// renglón, el mensaje con el alto que sobra, Enviar abajo) y la primera fila del pie toma lo que sobra: llega hasta las redes.
const vidrioA2 = leer('_estilos/vidrio.css')
const cierreA2 = sinComentarios(leer('_secciones/cierre/Cierre.tsx'))
const columnasA2 = sinComentarios(leer('_secciones/cierre/ColumnasDelPie.tsx'))
const formularioA2 = sinComentarios(leer('_secciones/cierre/FormularioDelPie.tsx'))
const FRANJA = '@media (width >= 768px) and (width < 1024px) {'
const enLaFranja = (css: string): string => {
  const i = css.indexOf(FRANJA)
  return i < 0 ? '' : css.slice(i, css.indexOf('\n}\n', i))
}
type PieA2 = readonly [string, string, string, string]
const contactoBien = ([css, cierre, columnas, formulario]: PieA2): boolean => {
  const franja = enLaFranja(css)
  const tinte = /--vidrio-tinte-de-la-tablet: ([0-9]+)%;/.exec(css)
  const campo = /--campo-del-vidrio-en-la-tablet: ([0-9]+)%;/.exec(css)
  return tinte !== null && campo !== null && Number(tinte[1]) < 66 && Number(campo[1]) < 72 &&
    franja.includes('[data-v3] [data-material="vidrio"]:not([data-seccion="invertida"]) {\n    background-color: color-mix(in srgb, var(--color-fondo) var(--vidrio-tinte-de-la-tablet), transparent);') &&
    franja.includes('[data-v3] [data-material="vidrio"]:not([data-seccion="invertida"]) [data-foco="campo"] {\n    background-color: color-mix(in srgb, var(--color-fondo) var(--campo-del-vidrio-en-la-tablet), transparent);') &&
    cierre.includes('tablet:max-escritorio:grid-rows-[1fr_auto]') && columnas.includes('tablet:max-escritorio:h-full tablet:max-escritorio:grid-rows-[auto_1fr]') &&
    /const CAJA_DEL_CONTACTO = '[^']*tablet:max-escritorio:flex-1'/.test(columnas) &&
    formulario.includes("'grid grid-cols-6 gap-[var(--spacing-3)] tablet:max-escritorio:flex tablet:max-escritorio:flex-1 tablet:max-escritorio:flex-col escritorio:flex") &&
    formulario.includes("mensaje: 'col-span-4 tablet:max-escritorio:grid tablet:max-escritorio:flex-1 tablet:max-escritorio:grid-rows-[auto_1fr_auto]'") && formulario.includes('tablet:max-escritorio:min-h-full') &&
    !/(^|\s)tablet:(flex-1|grid-rows|h-full|min-h-full)/m.test(`${cierre}\n${columnas}\n${formulario}`)
}
afirmar(contactoBien([vidrioA2, cierreA2, columnasA2, formularioA2]), 'a 768 el contacto es de vidrio (el claro, más liviano; el oscuro, igual) y va en columna hasta las redes; sólo en la tablet', 'medido: de día los rótulos 16,8–17,3:1; con el oscuro forzado, «CONTACTO» 4,83:1 y los rótulos 5,2–6,2:1')
controlPositivo('el detector VE el vidrio más liviano también en el oscuro (con el 46 %, los rótulos a ~3:1)', [vidrioA2.replace(/:not\(\[data-seccion="invertida"\]\)/g, ''), cierreA2, columnasA2, formularioA2] as PieA2, contactoBien)
controlPositivo('  y la columna también en escritorio (la placa 3D se movería)', [vidrioA2, cierreA2, columnasA2, formularioA2.replace('tablet:max-escritorio:min-h-full', 'tablet:min-h-full')] as PieA2, contactoBien)
// La franja escrita en la hoja (`s3-tokens` la enumera con motivo) es la de las variantes: `--breakpoint-tablet` y
// `--breakpoint-escritorio` del tema.
const temaA2 = readFileSync('src/app/theme-develop.css', 'utf8')
const franjaBien = (css: string, tema: string): boolean => {
  const tablet = /--breakpoint-tablet: ([0-9]+)px;/.exec(tema)
  const escritorio = /--breakpoint-escritorio: ([0-9]+)px;/.exec(tema)
  const escrita = /@media \(width >= ([0-9]+)px\) and \(width < ([0-9]+)px\) \{\n  \[data-v3\] \[data-material="vidrio"\]/.exec(css)
  return tablet !== null && escritorio !== null && escrita !== null && escrita[1] === tablet[1] && escrita[2] === escritorio[1]
}
afirmar(franjaBien(vidrioA2, temaA2), '  la franja escrita en `vidrio.css` es la de las variantes (de `--breakpoint-tablet` a `--breakpoint-escritorio`)')
controlPositivo('  el detector VE una franja corrida (hasta 1025)', vidrioA2.replace('(width < 1024px) {\n  [data-v3] [data-material="vidrio"]', '(width < 1025px) {\n  [data-v3] [data-material="vidrio"]'), (c: string) => franjaBien(c, temaA2))

// ═══════════════════════════════════════════════════════════════════════════
titulo('B0 · La energía, versión final: una sola, viva, con corrientes y pistones, y el logo que brilla')

// UNA VERSIÓN: sin las variantes del 3A (ni sus defines, ni su código, ni las chispas); una bandera, `?energia=intensa` (más
// brillo y más velocidad), para comparar con el producto.
const finalDir = `${V3}/_lib/escena/final`
const delFinal = readdirSync(finalDir).filter((a) => /\.tsx?$/.test(a)).map((a) => sinComentarios(readFileSync(`${finalDir}/${a}`, 'utf8'))).join('\n')
const unaBien = (fuentes: string, c: string): boolean => !/ENERGIA_RED|ENERGIA_INESTABLE|redDeLaLuz|RED_DE_LA_LUZ|INESTABLE\b|crearLasChispas|VarianteDeLaEnergia/.test(fuentes) && !existsSync(`${finalDir}/chispasDeLaLuz.ts`) &&
  ENTORNO.pruebas.energia === 'no' && entornoPedido('producto,energia=intensa').pruebas.energia === 'intensa' && entornoPedido('producto,energia=red').pruebas.energia === 'no' && entornoPedido('producto,energia=inestable').pruebas.energia === 'no' &&
  PRUEBAS_SUELTAS.some((k: string) => k === 'energia') && INTENSA.brillo > 1 && INTENSA.ritmo > 1 &&
  c.includes('LUZ_DE_ABAJO_EN_VIVO.uRelojDeLaLuz.value = s.estatico ? CAMPO_QUIETO_EN : t * (intensa ? INTENSA.ritmo : 1)') && c.includes('LUZ_DE_ABAJO_EN_VIVO.uBrilloDeLaLuz.value = intensa ? INTENSA.brillo : 1')
afirmar(unaBien(delFinal, cuadro), 'una sola versión (las variantes del 3A y las chispas se borraron); `?energia=intensa`, más brillo y más velocidad', `intensa: brillo ×${String(INTENSA.brillo)}, ritmo ×${String(INTENSA.ritmo)}`)
controlPositivo('el detector VE la variante `red` de vuelta', `${delFinal}\n#define ENERGIA_RED`, (f: string) => unaBien(f, cuadro))

// MÁS MOVIMIENTO Y MÁS BRILLO: el fondo de la energía cambia de un cuadro al otro casi nada (continuo) pero en medio segundo ya
// es otro (no un mapa que cambia lento: en el 3A, medio segundo daba casi lo mismo); la luz, más fuerte que la del 3A (plano
// 1,6, costado 1,15, canto 0,32) en las tres.
const correlacionDe = (energia: Energia, dt: number): number => {
  const [a, b]: [number[], number[]] = [[], []]
  for (let x = -20; x <= 20; x += 0.8) for (let z = -12; z <= 12; z += 0.8) for (const t of [5, 50, 170]) {
    a.push(energia(x, z, t))
    b.push(energia(x, z, t + dt))
  }
  const m = (v: number[]): number => v.reduce((p, q) => p + q, 0) / v.length
  const [ma, mb] = [m(a), m(b)]
  const cov = a.reduce((p, v, i) => p + (v - ma) * (b[i] - mb), 0)
  return cov / Math.sqrt(Math.max(1e-12, a.reduce((p, v) => p + (v - ma) ** 2, 0) * b.reduce((p, v) => p + (v - mb) ** 2, 0)))
}
const vivaBien = (energia: Energia): boolean => correlacionDe(energia, 1 / 60) > 0.97 && correlacionDe(energia, 0.5) < 0.85 && L.plano >= 2 && L.costado >= 1.4 && L.canto >= 0.6
const del3A: Energia = (x, z, t) => energiaDeFondo(x, z, t * 0.3)
afirmar(vivaBien(energiaDeFondo), '  más movimiento (en medio segundo el piso ya es otro, sin saltos de un cuadro al otro) y más brillo', `correlación: un cuadro ${correlacionDe(energiaDeFondo, 1 / 60).toFixed(3)} · medio segundo ${correlacionDe(energiaDeFondo, 0.5).toFixed(2)} (el ritmo del 3A: ${correlacionDe(del3A, 0.5).toFixed(2)}) · plano ${String(L.plano)}, costado ${String(L.costado)}, canto ${String(L.canto)}`)
controlPositivo('  el detector VE el ritmo del 3A (un mapa que cambia lento)', del3A, vivaBien)

// LAS CORRIENTES, SIN PATRÓN: por cada junta, corrientes que nacen en un punto al azar, en un sentido al azar, con su
// velocidad y su largo, y se apagan; cada una con su propio período. Se mide con la misma cuenta del sombreador en una junta:
// los puntos donde nacen cubren la escena, van para los dos lados, y lo que se ve en la junta no se repite (ninguna
// correlación de lo que se ve consigo mismo corrido de 2 a 8 s, más que lo que dura una corriente, pasa de 0,5; una que se
// repite cada 2 s da 1). Sin fuentes fijas ni anillos.
type Corriente = (junta: number, s: number, eje: number, t: number) => number
const serieDe = (c: Corriente, junta: number): number[] => {
  const serie: number[] = []
  for (let t = 0; t < 60; t += 1 / 30) {
    let suma = 0
    for (let s = -40; s <= 40; s += 0.5) suma += c(junta, s, 0, t)
    serie.push(suma)
  }
  return serie
}
const autocorrelacion = (v: readonly number[], lag: number): number => {
  const a = v.slice(0, v.length - lag)
  const b = v.slice(lag)
  const m = (x: readonly number[]): number => x.reduce((p, q) => p + q, 0) / x.length
  const [ma, mb] = [m(a), m(b)]
  const cov = a.reduce((p, x, i) => p + (x - ma) * (b[i] - mb), 0)
  return cov / Math.sqrt(Math.max(1e-12, a.reduce((p, x) => p + (x - ma) ** 2, 0) * b.reduce((p, x) => p + (x - mb) ** 2, 0)))
}
const sinPatron = (c: Corriente, glsl: string): boolean => {
  const repite = [3, 11, 27, 40, 55].map((junta) => {
    const serie = serieDe(c, junta)
    let maximo = 0
    for (let lag = 60; lag <= 240; lag += 3) maximo = Math.max(maximo, autocorrelacion(serie, lag))
    return maximo
  })
  return Math.max(...repite) < 0.5 && glsl.includes('float cabeza = ( azarDeLaLuz( sn + 0.31 ) - 0.5 ) * ') && glsl.includes('float sentido = azarDeLaLuz( sn + 0.77 ) < 0.5 ? -1.0 : 1.0;') &&
    !/fuente|anillo|uAnillos|uGolpe/.test(glsl) && CORRIENTES.periodoS[1] - CORRIENTES.periodoS[0] >= 1.5
}
const periodica: Corriente = (junta, s, eje, t) => corrienteEnLaJunta(junta, s, eje, (t % 2) + 0.5)
afirmar(sinPatron(corrienteEnLaJunta, CORRIENTES_DE_LA_LUZ_GLSL), '  las corrientes por las juntas nacen al azar (lugar, sentido, velocidad, largo y período) y no se repiten: ningún cuadro se adivina del anterior', `${String(CORRIENTES.porJunta)} por junta, de ${String(CORRIENTES.largo[0])} a ${String(CORRIENTES.largo[1])} bloques, a ${String(CORRIENTES.velocidad[0])}–${String(CORRIENTES.velocidad[1])} bloques/s`)
controlPositivo('  el detector VE corrientes que se repiten cada 2 s', periodica, (c: Corriente) => sinPatron(c, CORRIENTES_DE_LA_LUZ_GLSL))

// LOS PISTONES, SIN VIBRACIÓN: racimos que suben y bajan una vez por ciclo (de 1,4 s o más), sólo algunos en cada ciclo, y al
// subir abren las rendijas (más energía); el temblor del 3A se borró.
const pistonesBien = (g: string, s2: string): boolean => g.includes('float sube = sin( 3.14159 * ( ciclo - n ) );') && g.includes(`e += ${String(PISTONES.abre)} * piston;`) &&
  s2.includes('dibujo += alturaDeLaLuz( xz, energiaAqui ) + pistonAqui;') && !/sin\( uTiempo \* [0-9.]+/.test(g + s2) && PISTONES.periodoS[0] >= 1.2 && PISTONES.cuantos >= 0.15 && PISTONES.cuantos <= 0.5
afirmar(pistonesBien(ENERGIA_EN_LA_SIMULACION_GLSL, sim), '  los pistones: racimos que suben y bajan a su ritmo, al azar, y al subir dejan escapar más luz; sin vibración', `ciclos de ${String(PISTONES.periodoS[0])} a ${String(PISTONES.periodoS[1])} s, ${String(100 * PISTONES.cuantos)} % de los racimos por ciclo, de ${String(PISTONES.alto[0])} a ${String(PISTONES.alto[1])} u`)
controlPositivo('  el detector VE el temblor del 3A', [ENERGIA_EN_LA_SIMULACION_GLSL, `${sim}\nh += 0.035 * sin( uTiempo * 43.0 );`] as const, ([g, s2]: readonly [string, string]) => pistonesBien(g, s2))

// EL LOGO BRILLA: fuera del oscurecimiento (que es del piso; la luz del logo se suma en su salida y el filo, en el piso,
// después de oscurecerlo), su filo encendido en blanco con la energía y un pulso con cada onda que larga (que nacen corridas
// al azar en su intervalo: sin periodicidad), sin volver a encender los anillos del pulso en el final.
const dibujoB0 = (() => {
  const material = conElFinalEnElPiso(new THREE.MeshStandardMaterial())
  const sombreador = { fragmentShader: ['float cuantoDelPulso( float r ) {', '#include <clipping_planes_fragment>', 'vec2 m = manchaDelContacto( vPiso.xz );', '#include <fog_fragment>'].join('\n'), vertexShader: '#include <common>\nvAlto = transformed.y;', uniforms: {} as Record<string, THREE.IUniform> }
  material.onBeforeCompile(sombreador as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer)
  material.dispose()
  return sombreador.fragmentShader
})()
const luzDelLogo = sinComentarios(leer('_lib/escena/LuzDelLogo.tsx'))
const entornoDelPulso = sinComentarios(leer('_lib/escena/entorno/Entorno.tsx'))
const logoBien = (g: string, logo: string, c: string): boolean => {
  const oscurece = g.indexOf('gl_FragColor.rgb *= 1.0 - uOscuroDelBrillo;')
  const filo = g.indexOf('gl_FragColor.rgb += vec3( filoDelLogo( vPiso.xz ) );')
  const nacimientos = Array.from({ length: 40 }, (_, n) => naceLaOnda(n))
  const intervalos = nacimientos.slice(1).map((v, i) => v - nacimientos[i])
  const media = intervalos.reduce((a, b) => a + b, 0) / intervalos.length
  const desvio = Math.sqrt(intervalos.reduce((a, b) => a + (b - media) ** 2, 0) / intervalos.length)
  const pulsa = nacimientos.slice(1, 30).every((t0) => pulsoDelLogo(desdeLaUltimaOnda(t0 + 0.01)) > 0.9 && pulsoDelLogo(desdeLaUltimaOnda(t0 + 1)) < 0.1)
  return oscurece > 0 && filo > oscurece && logo.includes('<RimDelLogo logoMaterialRef={props.logoMaterialRef} />') && !/energia === 'inestable'/.test(logo) &&
    BRILLO_DEL_LOGO_GLSL.startsWith('gl_FragColor.rgb += vec3( ( uRimDeLaLuz + ') && BRILLO_DEL_LOGO.filo >= 1 && pulsa && desvio > 0.2 && Math.abs(media - L.ondas.cadaS) < 0.3 &&
    ENERGIA_EN_LA_SIMULACION_GLSL.includes(`float tau = uRelojDeLaLuz - ( m + ${String(L.ondas.corre)} * azarDeLaLuz( vec2( m, 4.7 ) ) ) * ${String(L.ondas.cadaS)};`) &&
    c.includes('RIM_DE_LA_LUZ.uPulsoDelLogo.value = s.estatico ? 0 : Math.max(pulsoDelLogo(desdeLaUltimaOnda(LUZ_DE_ABAJO_EN_VIVO.uRelojDeLaLuz.value)) * extendida, pulsoDelLogo(desdeElGolpe) * LUZ_DE_ABAJO_EN_VIVO.uEnergiaDeLaLuz.value)') &&
    entornoDelPulso.includes('entradas.reducido = quieto || EN_VIVO.fin > 0')
}
afirmar(logoBien(dibujoB0, luzDelLogo, cuadro), '  el logo brilla: fuera del oscurecimiento, su filo en blanco con la energía y un pulso con cada onda que larga (corridas al azar); los anillos del pulso siguen apagados en el final', `filo ${String(BRILLO_DEL_LOGO.filo)}, pulso ${String(BRILLO_DEL_LOGO.pulsoS)} s`)
controlPositivo('  el detector VE el filo oscurecido con la sala', dibujoB0.replace('gl_FragColor.rgb *= 1.0 - uOscuroDelBrillo;\n\tgl_FragColor.rgb = conLasJuntas( gl_FragColor.rgb, vPiso.xz );\n\tgl_FragColor.rgb += vec3( filoDelLogo( vPiso.xz ) );', 'gl_FragColor.rgb += vec3( filoDelLogo( vPiso.xz ) );\n\tgl_FragColor.rgb *= 1.0 - uOscuroDelBrillo;\n\tgl_FragColor.rgb = conLasJuntas( gl_FragColor.rgb, vPiso.xz );'), (g: string) => logoBien(g, luzDelLogo, cuadro))
controlPositivo('  y un logo sin pulso', cuadro.replace('RIM_DE_LA_LUZ.uPulsoDelLogo.value = s.estatico ? 0 :', 'RIM_DE_LA_LUZ.uPulsoDelLogo.value = 0 && '), (c: string) => logoBien(dibujoB0, luzDelLogo, c))

// EL FRENTE DESDE EL GOLPE: la meseta de la súper onda tapaba las rendijas el primer segundo o dos; los cantos de las tapas (que
// se ven desde arriba aunque la rendija sea honda) y el frente de la expansión brillan más: el frente se lee desde el golpe.
const frenteBien = (canto: number, frente: number): boolean => canto >= 0.6 && frente >= 1.2
afirmar(frenteBien(L.canto, L.expansion.brillo), '  el frente de luz se ve desde el golpe (cantos y frente más brillantes que la meseta)', `canto ${String(L.canto)} · frente ${String(L.expansion.brillo)}`)
controlPositivo('  el detector VE los del 3A (canto 0,32, frente 0,7)', [0.32, 0.7] as const, ([c, f]: readonly [number, number]) => frenteBien(c, f))

cerrar('s54-pulido-3')
