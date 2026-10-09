/**
 * PULIDO 6 — el invariante: npm run test:s57-pulido-6
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   E1 · el entremedio del CTA tan limpio como el final: ningún contorno se cruza a sí mismo en ningún cuadro (el camino
 *        canónico por flujo), el cartel del giro y la frase que se arma no se pisan, el cambio a la malla exacta es un fundido
 *        complementario, el foco del teclado llega a «HABLANOS» transformado; `?meta=fusion` y `?ancho=expandido`, borrados.
 *   E2 · el filo con poder: por AFUERA del logo (el negro entero), sin el círculo liso (la energía llega hasta el logo, los
 *        bloques pegados al ras, las ondas nacen en el filo), tres maneras de hacer luz (`?filo=corriente|pulso|descarga`) y el
 *        filo que se enciende de golpe con el golpe; el anillo, el disco y el filo de adentro, borrados. [PULIDO 7] F1 · ganó la
 *        descarga (la corriente, el pulso y `?filo=`, borrados: la sección 3 fija lo que queda; lo nuevo, `s58`).
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-6.md`. [PULIDO 8] G1 · `contorno` se borró con su código: E1 · 1 a 3 (los cruces
 * de los contornos, la frase que se arma y el fundido) se fueron; que ya no existe lo fija `s59` G1 y el cartel contra las placas
 * del volteo, `s58` F2 · 4.
 */
import { existsSync, readFileSync } from 'node:fs'

import * as THREE from 'three'

import { ENTORNO, PRUEBAS_SUELTAS, entornoPedido } from '../escena/entorno'
import { CALMA_EN_EL_PISO, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { HUECO, distanciaAfuera } from '../escena/final/hueco'
import { ENERGIA_EN_LA_SIMULACION_GLSL, LUZ_DE_ABAJO, radioDeLaExpansion } from '../escena/final/luzDeAbajo'
import { FILO, bandaDelFilo, contornosDelLogo, creceDelFilo, enElNegro, luzDelFilo } from '../escena/final/filoConPoder'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { conOndaDirigida } from '../escena/piso/ondaDirigida'
import { FINAL_DEL_PIE, RELOJ_DEL_FINAL } from '../escena/final/recorridoDelFinal'
import { PROBE_EXTRUDE, PROBE_SVG_SCALE } from '../escena/probeScene'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('E1 · El entremedio del CTA, tan limpio como el final')

// 1 a 3 · [PULIDO 8] G1 · `contorno` se borró: ningún contorno que se cruce, el cartel y la frase que se arma, y el fundido a la
// malla exacta se fueron con ella (que ya no existe lo fija `s59` G1; el cartel contra las placas del volteo, `s58` F2 · 4).
const escena = sinComentarios(leer('_lib/escena/ctaDelFinal/EscenaDelCta.tsx'))

// 4 · EL FOCO DEL TECLADO: «HABLANOS» es un enlace enfocable (sin `tabIndex` negativo) que abre Contacto con Enter (es un clic: lo
// atrapa la apertura del Contacto), y la homografía va en el ENLACE: su anillo de foco rodea el 3D. Medido en el banco
// (`e1-foco.ts`): Tab desde lo anterior llega a «HABLANOS» con :focus-visible, el anillo en su caja proyectada, Enter abre el diálogo.
const dom = sinComentarios(leer('_componentes/ctaDelFinal/CtaDelFinal.tsx'))
const focoBien = (d: string, e: string): boolean => d.includes('<motion.a') && d.includes('href={destino}') && d.includes('data-abre-contacto="panel"') && !/tabIndex=\{-1\}|tabIndex="-1"/.test(d) &&
  e.includes("const enlaceDelCta = (): HTMLElement | null => CTA_EN_VIVO.destino?.closest('a') ?? null")
afirmar(focoBien(dom, escena), '4 · el foco del teclado llega a «HABLANOS» transformado (un enlace, con el anillo en su plano) y Enter abre Contacto')
controlPositivo('4 · el detector VE el enlace fuera del Tab', [dom.replace('<motion.a', '<motion.a tabIndex={-1}'), escena] as const, ([a, b]: readonly [string, string]) => focoBien(a, b))

// 5 · LAS DECISIONES: `contorno` y el ancho normal son el producto; `fusion` (su código) y `?meta=`, `?ancho=expandido` (sus fuentes),
// borrados. [PULIDO 7] F2 · vuelve `?meta=contorno` (sólo ese valor, pedido así: el producto es el volteo); `fusion` sigue sin pedir nada.
// [PULIDO 8] G1 · `?meta=` se borró otra vez, entera (con `contorno`): vuelve la de antes de PULIDO 7.
const decisionesBien = (pruebas: readonly string[], f: typeof entornoPedido): boolean => !existsSync(`${V3}/_lib/escena/ctaDelFinal/fusion.ts`) && !existsSync(`${V3}/_fuentes/archivo-expandido-cta.json`) && !existsSync(`${V3}/_fuentes/archivo-expandido-cta-fuerte.json`) &&
  !pruebas.includes('meta') && !pruebas.includes('ancho') && !('meta' in f('producto,meta=fusion').pruebas) && !('ancho' in f('producto,ancho=expandido').pruebas) && !('meta' in ENTORNO.pruebas) &&
  !/fusion/.test(escena) && !/expandido/.test(sinComentarios(leer('_lib/escena/ctaDelFinal/fuentesDelCta.ts')))
afirmar(decisionesBien(PRUEBAS_SUELTAS, entornoPedido), '5 · `fusion` (su código) y `?meta=`, `?ancho=expandido` (y sus fuentes), borrados: `contorno` y el ancho normal, el producto')
controlPositivo('5 · el detector VE la bandera `meta` todavía pedible', [...PRUEBAS_SUELTAS, 'meta'], (x: readonly string[]) => decisionesBien(x, entornoPedido))

// ═══════════════════════════════════════════════════════════════════════════
titulo('E2 · El filo con poder')

// UNA FORMA DE PRUEBA con la topología del logo (en Node no hay SVG): un contorno con una muesca (esquinas cóncavas, donde el
// inglete se cruza si está mal) y dos agujeros redondos. Y la misma con el contorno al revés: de qué lado queda el negro se prueba.
const circulo = (cx: number, cy: number, r: number, horario: boolean): THREE.Vector2[] => Array.from({ length: 48 }, (_, k) => {
  const a = ((horario ? -1 : 1) * k * 2 * Math.PI) / 48
  return new THREE.Vector2(cx + r * Math.cos(a), cy + r * Math.sin(a))
})
const AFUERA = [[-3.4, -1.2], [3.4, -1.2], [3.4, 2.4], [0.6, 2.4], [0.6, 1.0], [-0.6, 1.0], [-0.6, 2.4], [-3.4, 2.4]].map(([x, y]) => new THREE.Vector2(x, y))
const formaDePrueba = (alReves: boolean): THREE.Shape[] => {
  const f = new THREE.Shape(alReves ? [...AFUERA].reverse() : AFUERA)
  f.holes = [new THREE.Path(circulo(-2, 0.6, 0.6, !alReves)), new THREE.Path(circulo(2, 0.6, 0.6, !alReves))]
  return [f]
}

// 1 · POR AFUERA: «el área negra del logo con filo es igual a la del logo sin filo». En una grilla de 0,01 u, ningún punto del
// negro queda debajo de la banda del filo (el negro con filo = el negro sin filo), y la banda está (su área es la del contorno por
// su ancho). La banda nace en la silueta del logo (el contorno más lo que sale su bisel) y el logo ya no pinta su borde de blanco.
type Banda = (contornos: readonly (readonly THREE.Vector2[])[]) => THREE.BufferGeometry
const ANCHO_ENTERO = FILO.ancho * (1 + FILO.crece)
const tapadoYArea = (formas: readonly THREE.Shape[], banda: Banda): { readonly negroTapado: number; readonly area: number; readonly esperada: number } => {
  const contornos = contornosDelLogo(formas)
  const g = banda(contornos)
  const pos = g.getAttribute('position')
  const idx = g.getIndex()
  const paso = 0.01
  const tapadas = new Set<string>()
  for (let t = 0; idx !== null && t < idx.count; t += 3) {
    const [a, b, c2] = [0, 1, 2].map((k) => new THREE.Vector2(pos.getX(idx.getX(t + k)), pos.getY(idx.getX(t + k))))
    const [x0, x1] = [Math.min(a.x, b.x, c2.x), Math.max(a.x, b.x, c2.x)]
    const [y0, y1] = [Math.min(a.y, b.y, c2.y), Math.max(a.y, b.y, c2.y)]
    const lado = (p: THREE.Vector2, q: THREE.Vector2, r: THREE.Vector2): number => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)
    for (let i = Math.ceil(x0 / paso); i * paso <= x1; i += 1) {
      for (let j = Math.ceil(y0 / paso); j * paso <= y1; j += 1) {
        const q = new THREE.Vector2(i * paso, j * paso)
        const [d1, d2, d3] = [lado(a, b, q), lado(b, c2, q), lado(c2, a, q)]
        if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) tapadas.add(`${String(i)},${String(j)}`)
      }
    }
  }
  let negroTapado = 0
  for (const k of tapadas) {
    const [i, j] = k.split(',').map(Number)
    if (enElNegro(contornos, i * paso, j * paso)) negroTapado += 1
  }
  const perimetro = contornos.reduce((s2, c3) => s2 + c3.reduce((a2, p2, i) => a2 + p2.distanceTo(c3[(i + 1) % c3.length]), 0), 0)
  return { negroTapado, area: tapadas.size * paso * paso, esperada: perimetro * ANCHO_ENTERO }
}
const filoFuente = sinComentarios(leer('_lib/escena/final/filoConPoder.ts'))
const logoDelFinal = sinComentarios(leer('_lib/escena/final/logoDelFinal.ts'))
const porAfueraBien = (banda: Banda): boolean => [false, true].every((alReves) => {
  const m = tapadoYArea(formaDePrueba(alReves), banda)
  return m.negroTapado === 0 && Math.abs(m.area - m.esperada) / m.esperada < 0.15
}) && FILO.desde === PROBE_EXTRUDE.bevelSize * PROBE_SVG_SCALE && FILO.desde > 0 && filoFuente.includes('bandaDelFilo(contornosDelLogo(formas), FILO.desde, FILO.desde + ANCHO_ENTERO)') &&
  !logoDelFinal.includes('uFiloDelFinal') && !logoDelFinal.includes('anchoDelFilo')
const medidaDelFilo = tapadoYArea(formaDePrueba(false), (c2) => bandaDelFilo(c2, FILO.desde, FILO.desde + ANCHO_ENTERO))
afirmar(porAfueraBien((c2) => bandaDelFilo(c2, FILO.desde, FILO.desde + ANCHO_ENTERO)), '1 · el filo va por AFUERA: el área negra con filo es igual a la de sin filo (ningún punto del negro bajo la banda, con el contorno en los dos sentidos); nace en la silueta (el bisel) y el logo ya no pinta su borde', `negro tapado ${String(medidaDelFilo.negroTapado)} de 0 · banda ${medidaDelFilo.area.toFixed(2)} u² (esperada ${medidaDelFilo.esperada.toFixed(2)})`)
controlPositivo('1 · el detector VE un filo por adentro (el de antes: le come el negro)', ((c2) => bandaDelFilo(c2, -FILO.desde, -FILO.desde - ANCHO_ENTERO)) as Banda, porAfueraBien)

// 2 · SIN EL CÍRCULO LISO: la calma es un margen pegado al hueco, medido con la distancia al logo (un campo exacto, la transformada
// de Felzenszwalb; más allá, la caja con un fundido): al ras quedan los bloques que tocan el filo entero; la luz no se calma
// (llega hasta el borde); la energía, el golpe y las ondas se miden desde el filo (la expansión, desde 0).
const transformadaBien = (d: (dentro: Uint8Array, lado: number) => Float32Array): boolean => {
  const n = 64
  const dentro = Uint8Array.from({ length: n * n }, (_, i) => (Math.hypot((i % n) - 31.5, Math.floor(i / n) - 31.5) <= 10 ? 1 : 0))
  const dist = d(dentro, n)
  let peor = 0
  for (let i = 0; i < n * n; i += 1) {
    const r = Math.hypot((i % n) - 31.5, Math.floor(i / n) - 31.5)
    peor = Math.max(peor, dentro[i] === 1 ? dist[i] : Math.abs(dist[i] - (r - 10)))
  }
  return peor <= 1
}
const manhattan = (dentro: Uint8Array, lado: number): Float32Array => Float32Array.from(dentro, (_, i) => {
  let m = Infinity
  for (let k = 0; k < dentro.length; k += 1) if (dentro[k] === 1) m = Math.min(m, Math.abs((k % lado) - (i % lado)) + Math.abs(Math.floor(k / lado) - Math.floor(i / lado)))
  return m
})
const simE2 = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const cuadroE2 = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const sinCirculoBien = (sim: string, energia: string): boolean => !('radio' in CALMA_EN_EL_PISO) && CALMA_EN_EL_PISO.margen >= FILO.desde + ANCHO_ENTERO &&
  sim.includes('distanciaAlLogo( xz ) ) );') && !/length\( xz \) \) \);/.test(sim.slice(sim.indexOf('float calmaDelFinal('))) &&
  sim.includes('float desde = uCalmaDelFinal > 0.0 ? distanciaAlLogo( xz ) + 1.5 : length( xz - uGolpe.yz );') &&
  sim.includes('azarDeLaLuz( celda + 0.37 ) ) * ( 1.0 - calmaDelFinal( xz ) );') &&
  energia.includes('float r = distanciaAlLogo( xz );') && energia.includes('return min( 1.8, e ) * uEnergiaDeLaLuz;') && energia.includes('float d = ( r - 58.0 * ( 1.0 - pow( 1.0 - t, 2.2 ) ) )') &&
  LUZ_DE_ABAJO.ondas.desde === 0 && cuadroE2.includes('radioDeLaExpansion(expansion, 0)') && radioDeLaExpansion(0, 0) === 0 && HUECO.campo.margen >= 8
afirmar(transformadaBien(distanciaAfuera) && sinCirculoBien(simE2, ENERGIA_EN_LA_SIMULACION_GLSL), '2 · sin el círculo liso: la calma es un margen pegado al hueco (con la distancia al logo, exacta), los bloques que tocan el filo al ras; la luz llega hasta el borde; la energía, el golpe y las ondas nacen en el filo', `al ras hasta ${(0.7072 * 0.8 + CALMA_EN_EL_PISO.margen).toFixed(2)} u del logo · campo de ${String(HUECO.campo.margen)} u alrededor`)
controlPositivo('2 · el detector VE una distancia de a cuadras (no la exacta)', manhattan, transformadaBien)
controlPositivo('2 · y el círculo de antes (la calma medida con el radio)', simE2.replace('distanciaAlLogo( xz ) ) );', 'length( xz ) ) );'), (sim: string) => sinCirculoBien(sim, ENERGIA_EN_LA_SIMULACION_GLSL))
controlPositivo('2 · y la luz que se apaga contra la calma', ENERGIA_EN_LA_SIMULACION_GLSL.replace('return min( 1.8, e ) * uEnergiaDeLaLuz;', 'return min( 1.8, e ) * uEnergiaDeLaLuz * ( 1.0 - calmaDelFinal( xz ) );'), (e: string) => sinCirculoBien(simE2, e))

// 3 · LAS TRES MANERAS (`?filo=`; sin bandera, `corriente`) y EL GOLPE. [PULIDO 7] F1 · ganó la descarga: la corriente, el pulso y
// `?filo=` se borraron con su código (lo nuevo de la descarga lo fija `s58` F1). Lo que queda fijo acá: el filo se enciende entero
// en el cuadro en que `fin` pasa el golpe (el mismo que suena), con un destello que lo ensancha; la descarga corre hacia afuera
// desde el filo por las juntas (en el dibujo y en el plano de abajo), en el producto. Sin partículas. El anillo, el disco y
// `?anillo=`, borrados.
const golpe = FINAL_DEL_PIE.presion.hastaS / RELOJ_DEL_FINAL.duracionS
const pisoE2 = sinComentarios(leer('_lib/escena/final/enElPiso.ts'))
const planoE2 = sinComentarios(leer('_lib/escena/final/planoDeLaLuz.ts'))
type Luz = typeof luzDelFilo
const manerasBien = (luz: Luz, c: string): boolean => {
  const sinVariantes = !('filo' in ENTORNO.pruebas) && !/corriente|latido|FiloDelLogo/i.test(filoFuente.replace(/corrientes del piso/g, '')) &&
    !('anillo' in ENTORNO.pruebas) && !existsSync(`${V3}/_lib/escena/final/anilloDeLuz.ts`) && !pisoE2.includes('conElAnillo')
  const deGolpe = luz(golpe - 1e-6, golpe) === 0 && luz(golpe, golpe) === 1 && luz(1, golpe) === 1 && c.includes('const luz = luzDelFilo(fin, golpe)') &&
    /if \(!s\.estatico && s\.antes < golpe && fin >= golpe\) \{[\s\S]*?sonar\('golpe'\)/.test(c) && creceDelFilo(0) === FILO.golpe.crece && creceDelFilo(Infinity) === 0
  const descarga = filoFuente.includes('float detras = cabeza - r;') && pisoE2.includes('float descarga = descargaDelFilo( vPiso.xz, uLado );') && planoE2.includes('descargaDelFilo( vXZ, uGrillaDelPiso.y )') &&
    c.includes('F.uDescargaDelFilo.value = s.estatico ? 0 : luz') && !/THREE\.Points|PointsMaterial/.test(filoFuente)
  return sinVariantes && deGolpe && descarga && FILO.blanco >= 0.9 && filoFuente.includes('toneMapped: false')
}
afirmar(manerasBien(luzDelFilo, cuadroE2), '3 · [PULIDO 7] la descarga (la corriente, el pulso y `?filo=`, borrados) corre por las juntas; en el golpe el filo se enciende entero, en el cuadro que suena; `?anillo=` borrado', `descarga hasta ${String(FILO.descarga.alcance)} u`)
controlPositivo('3 · el detector VE un filo que se prende de a poco (no de golpe)', ((fin: number, g: number) => Math.min(1, Math.max(0, (fin - g + 0.05) / 0.05))) as Luz, (l: Luz) => manerasBien(l, cuadroE2))
controlPositivo('3 · y una descarga apagada en el producto', cuadroE2.replace('F.uDescargaDelFilo.value = s.estatico ? 0 : luz', 'F.uDescargaDelFilo.value = 0'), (c2: string) => manerasBien(luzDelFilo, c2))

// 4 · EN EL TELÉFONO Y LA TABLET: el mismo filo (sin rama por ancho) y el campo de distancia a la mitad de resolución (se arma una
// vez); la energía se expande más allá de la pantalla (36 u: la vista del teléfono no pasa de ~20). Medido en las capturas a 390
// y a 820: el logo con su filo entero en el cuadro y la energía hasta los bordes.
const finalDelPie = sinComentarios(leer('_lib/escena/final/FinalDelPie.tsx'))
const angostoBien = (f: string, filo: string): boolean => f.includes('const distancia = distanciaDelLogo(logo.formas, logo.caja, angosto ? HUECO.campo.lado / 2 : HUECO.campo.lado)') &&
  f.includes('g.add(estado.pozo.grupo, estado.filo.malla, plano)') && !/angosto|compacta/.test(filo) && radioDeLaExpansion(1, 0) >= 30
afirmar(angostoBien(finalDelPie, filoFuente), '4 · en el teléfono y la tablet, el mismo filo y la distancia a media resolución; la energía pasa los bordes de la pantalla')
controlPositivo('4 · el detector VE un filo con rama por ancho', `${filoFuente}\nconst angosto = true`, (x: string) => angostoBien(finalDelPie, x))


cerrar('s57-pulido-6')
