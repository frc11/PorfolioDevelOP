/**
 * [B1.2e] s76 · EL CARRUSEL COMÚN (`_componentes/carrusel/`), sin navegador: la máquina (la rotación cada 10 s, la vuelta infinita en los
 * dos sentidos, el reloj que vuelve a cero en cada cambio, las pausas, las flechas y los deslices), el marcado del componente, que no es
 * una trampa de scroll y que no depende de quien lo usa. Cada afirmación con su control positivo. Lo que se mide en el sitio (el dedo, la
 * vista, los tiempos reales) lo corre `scripts-carga/carrusel.ts`.
 *
 *   npx tsx src/app/v3/_lib/__tests__/s76-carrusel.invariant.tsx   (`test:s76-carrusel`)
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { CarruselDeTarjetas, TRANSICION_DEL_CARRUSEL } from '../../_componentes/carrusel/CarruselDeTarjetas'
import {
  CARRUSEL, avanceDelCarrusel, estadoInicialDelCarrusel, indiceEnLaVuelta, intencionDelDedo, motivoDeLaPausa, siguienteDelCarrusel,
  type EstadoDelCarrusel, type EventoDelCarrusel, type PasoDelCarrusel,
} from '../../_componentes/carrusel/maquinaDelCarrusel'
import { marcar } from '../../_secciones/_invariantes/render'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const veces = (html: string, aguja: string): number => html.split(aguja).length - 1

type Maquina = (e: EstadoDelCarrusel, ev: EventoDelCarrusel, cantidad: number, duracionMs?: number) => PasoDelCarrusel
const TRES = 3
/** El carrusel a la vista y corriendo, en la tarjeta `indice`. */
const corriendo = (indice = 0): EstadoDelCarrusel => ({ ...estadoInicialDelCarrusel(indice, TRES), enVista: true })
/** Una serie de eventos: el último estado, cuántos cambios y cuántos pidió el usuario. */
function correr(m: Maquina, desde: EstadoDelCarrusel, eventos: readonly EventoDelCarrusel[], cantidad = TRES): { readonly e: EstadoDelCarrusel; readonly cambios: number; readonly delUsuario: number } {
  let e = desde
  let cambios = 0
  let delUsuario = 0
  for (const ev of eventos) {
    const p = m(e, ev, cantidad)
    e = p.estado
    if (p.cambio) cambios += 1
    if (p.porElUsuario) delUsuario += 1
  }
  return { e, cambios, delUsuario }
}
/** `ms` de tiempo en cuadros de 16 ms (como el `requestAnimationFrame`). */
const tiempo = (ms: number): EventoDelCarrusel[] => Array.from({ length: Math.ceil(ms / 16) }, () => ({ tipo: 'tiempo', ms: 16 }))

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1.2e · 1 · La rotación: cada 10 s, infinita en los dos sentidos')

const rota = (m: Maquina): boolean => {
  const a = correr(m, corriendo(), tiempo(CARRUSEL.duracionMs - 50))
  const b = correr(m, corriendo(), tiempo(CARRUSEL.duracionMs + 50))
  const vuelta = correr(m, corriendo(2), tiempo(CARRUSEL.duracionMs + 50))
  return a.e.indice === 0 && b.e.indice === 1 && b.cambios === 1 && b.delUsuario === 0 && vuelta.e.indice === 0
}
afirmar(CARRUSEL.duracionMs === 10_000 && rota(siguienteDelCarrusel), 'a los 10 s pasa a la siguiente (sin sonar: no lo pidió nadie); antes, no; y después de la última vuelve a la primera')
controlPositivo('  el detector ve un carrusel que se queda en la última (sin la vuelta)', ((e, ev, n, d) => {
  const p = siguienteDelCarrusel(e, ev, n, d)
  return e.indice === n - 1 && p.estado.indice === 0 ? { ...p, estado: e, cambio: false } : p
}) as Maquina, rota)
const flechas = (m: Maquina): boolean => {
  const adelante = correr(m, corriendo(), [{ tipo: 'siguiente' }, { tipo: 'siguiente' }, { tipo: 'siguiente' }])
  const atras = correr(m, corriendo(), [{ tipo: 'anterior' }])
  const ida = correr(m, corriendo(1), [{ tipo: 'anterior' }, { tipo: 'anterior' }])
  return adelante.e.indice === 0 && adelante.cambios === 3 && adelante.delUsuario === 3 && atras.e.indice === 2 && atras.e.sentido === -1 && ida.e.indice === 2
}
afirmar(flechas(siguienteDelCarrusel), '  las flechas: tres veces la siguiente desde la primera vuelve a la primera; la anterior desde la primera va a la última (hacia atrás); cada una la pidió el usuario')
controlPositivo('  el detector ve una flecha anterior que se frena en la primera', ((e, ev, n, d) => (ev.tipo === 'anterior' && e.indice === 0 ? { estado: e, cambio: false, porElUsuario: false } : siguienteDelCarrusel(e, ev, n, d))) as Maquina, flechas)
afirmarIgual([indiceEnLaVuelta(-1, 3), indiceEnLaVuelta(3, 3), indiceEnLaVuelta(-4, 3), indiceEnLaVuelta(7, 3)], [2, 0, 2, 1], '  la vuelta: −1 es la última, n la primera (y así para cualquier entero)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1.2e · 2 · El reloj vuelve a empezar en cada cambio')

const reinicia = (m: Maquina): boolean => {
  // 6 s, la siguiente a mano, y 9,9 s más: todavía en la misma (el reloj arrancó de cero en el cambio); a los 10 s, la que sigue.
  const medio = correr(m, corriendo(), [...tiempo(6000), { tipo: 'siguiente' }])
  const casi = correr(m, medio.e, tiempo(CARRUSEL.duracionMs - 100))
  const justo = correr(m, casi.e, tiempo(200))
  const salto = correr(m, corriendo(), [...tiempo(4000), { tipo: 'ir', indice: 2 }])
  return medio.e.indice === 1 && medio.e.transcurridoMs === 0 && medio.e.reinicio === 1 && casi.e.indice === 1 && justo.e.indice === 2 && salto.e.transcurridoMs === 0 && salto.delUsuario === 0
}
afirmar(reinicia(siguienteDelCarrusel), 'un cambio a mano a los 6 s deja el reloj en cero: la tarjeta nueva dura sus 10 s enteros (y cambia su `reinicio`: su medio vuelve a cero); un salto desde afuera (el ancla), también, sin contar como del usuario')
controlPositivo('  el detector ve un reloj que sigue de largo después de un cambio', ((e, ev, n, d) => {
  const p = siguienteDelCarrusel(e, ev, n, d)
  return p.cambio && ev.tipo !== 'tiempo' ? { ...p, estado: { ...p.estado, transcurridoMs: e.transcurridoMs } } : p
}) as Maquina, reinicia)
afirmarIgual([avanceDelCarrusel({ ...corriendo(), transcurridoMs: 2500 }), avanceDelCarrusel({ ...corriendo(), transcurridoMs: 12_000 })], [0.25, 1], '  la línea: lo que va de la tarjeta (lineal en 10 s), sin pasarse')
const acotado = correr(siguienteDelCarrusel, corriendo(), [{ tipo: 'tiempo', ms: 60_000 }])
afirmar(acotado.e.indice === 0 && acotado.e.transcurridoMs === CARRUSEL.cuadroMaxMs, `  un cuadro larguísimo (la pestaña que vuelve) cuenta ${String(CARRUSEL.cuadroMaxMs)} ms: no se come la tarjeta`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1.2e · 3 · Las pausas: mantener apretado, fuera de la vista, movimiento reducido y el foco del teclado')

const pausas = (m: Maquina): boolean => {
  const largo = tiempo(CARRUSEL.duracionMs * 2)
  const mantenido = correr(m, corriendo(), [{ tipo: 'mantener' }, ...largo])
  const suelto = correr(m, mantenido.e, [{ tipo: 'soltar' }, ...tiempo(CARRUSEL.duracionMs + 50)])
  const afuera = correr(m, corriendo(), [{ tipo: 'vista', adentro: false }, ...largo])
  const reducido = correr(m, corriendo(), [{ tipo: 'reducido', si: true }, ...largo])
  const enfocado = correr(m, corriendo(), [{ tipo: 'foco', adentro: true }, ...largo])
  // Pausado no se pierde: 4 s, afuera, y al volver faltan 6.
  const sigue = correr(m, corriendo(), [...tiempo(4000), { tipo: 'vista', adentro: false }, ...largo, { tipo: 'vista', adentro: true }, ...tiempo(5900)])
  const termina = correr(m, sigue.e, tiempo(200))
  const recienMontado = correr(m, estadoInicialDelCarrusel(0, TRES), largo)
  return mantenido.e.indice === 0 && suelto.e.indice === 1 && afuera.e.indice === 0 && reducido.e.indice === 0 && enfocado.e.indice === 0 &&
    sigue.e.indice === 0 && termina.e.indice === 1 && recienMontado.e.indice === 0 &&
    motivoDeLaPausa(mantenido.e) === 'mantenido' && motivoDeLaPausa(afuera.e) === 'fuera-de-vista' && motivoDeLaPausa(reducido.e) === 'reducido' && motivoDeLaPausa(enfocado.e) === 'foco' && motivoDeLaPausa(corriendo()) === null
}
afirmar(pausas(siguienteDelCarrusel), 'mantener apretado, fuera de la vista, con movimiento reducido o con el foco del teclado adentro, el reloj no corre (20 s y sigue en la misma); al soltar o al volver sigue desde donde estaba; recién montado (antes de que lo vea) tampoco corre')
controlPositivo('  el detector ve un carrusel que rota fuera de la vista', ((e, ev, n, d) => siguienteDelCarrusel({ ...e, enVista: true }, ev, n, d)) as Maquina, pausas)
controlPositivo('  y uno que no pausa al mantener apretado', ((e, ev, n, d) => siguienteDelCarrusel({ ...e, mantenido: false }, ev, n, d)) as Maquina, pausas)
controlPositivo('  y uno que rota con movimiento reducido', ((e, ev, n, d) => siguienteDelCarrusel({ ...e, reducido: false }, ev, n, d)) as Maquina, pausas)
const conPausa = correr(siguienteDelCarrusel, { ...corriendo(), mantenido: true }, [{ tipo: 'siguiente' }, { tipo: 'deslice', dx: -90, dy: 4 }])
afirmar(conPausa.e.indice === 2, '  en pausa, las flechas y los deslices andan igual (la pausa es del reloj, no del carrusel)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1.2e · 4 · Deslizar de costado cambia; un dedo vertical es de la página')

const deslices = (m: Maquina): boolean => {
  const izq = correr(m, corriendo(), [{ tipo: 'deslice', dx: -80, dy: 10 }])
  const der = correr(m, corriendo(), [{ tipo: 'deslice', dx: 80, dy: -10 }])
  const vertical = correr(m, corriendo(), [{ tipo: 'deslice', dx: 30, dy: -200 }, { tipo: 'deslice', dx: -20, dy: 120 }])
  const corto = correr(m, corriendo(), [{ tipo: 'deslice', dx: -CARRUSEL.desliceMinPx + 1, dy: 0 }])
  return izq.e.indice === 1 && izq.delUsuario === 1 && der.e.indice === 2 && vertical.cambios === 0 && corto.cambios === 0
}
afirmar(deslices(siguienteDelCarrusel), `de costado a la izquierda, la siguiente; a la derecha, la anterior (dando la vuelta); un dedo que va más vertical que de costado no cambia nada (es el scroll de la página), y uno de menos de ${String(CARRUSEL.desliceMinPx)} px tampoco`)
controlPositivo('  el detector ve un carrusel que toma el dedo vertical (las historias: deslizar hacia arriba salía)', ((e, ev, n, d) => (ev.tipo === 'deslice' && Math.abs(ev.dy) > Math.abs(ev.dx) ? siguienteDelCarrusel(e, { tipo: 'siguiente' }, n, d) : siguienteDelCarrusel(e, ev, n, d))) as Maquina, deslices)
afirmarIgual([intencionDelDedo(3, 4), intencionDelDedo(20, 5), intencionDelDedo(5, 20), intencionDelDedo(10, 10)], [null, 'costado', 'vertical', 'vertical'], `  la intención del dedo: hasta ${String(CARRUSEL.intencionPx)} px, nada; después, de costado sólo si va más de costado que vertical (el empate es de la página)`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1.2e · 5 · El componente: una tarjeta a la vez, todas en su lugar, las flechas y una línea por tarjeta')

const ITEMS = [{ id: 'a' }, { id: 'b' }, { id: 'c' }] as const
const montado = marcar(<CarruselDeTarjetas items={ITEMS} etiqueta="Las demos" nombreDe={(i) => `Demo ${i.id}`} rotulos={{ anterior: 'Anterior', siguiente: 'Siguiente' }} renderItem={(i, e) => <p data-item={i.id} data-activa={e.activa ? 'si' : 'no'} data-corre={e.corre ? 'si' : 'no'}>{i.id}</p>} />, { anima: true })
const marcado = (m: string): boolean =>
  /<div role="region" aria-roledescription="carrusel" aria-label="Las demos" data-pieza="carrusel-de-tarjetas" data-indice="0" data-pausa="fuera-de-vista"/.test(m) &&
  veces(m, 'data-parte="ranura"') === 3 && veces(m, 'data-activa="si"') === 2 && veces(m, 'inert=""') === 2 && veces(m, 'aria-hidden="true" inert=""') === 2 &&
  /aria-roledescription="tarjeta" aria-label="Demo a"/.test(m) && /data-item="a" data-activa="si" data-corre="no"/.test(m) && /data-item="b" data-activa="no"/.test(m) &&
  /<button type="button" data-flecha="anterior" aria-label="Anterior"/.test(m) && /<button type="button" data-flecha="siguiente" aria-label="Siguiente"/.test(m) &&
  veces(m, 'data-parte="linea"') === 3 && /data-linea="activa"/.test(m) && /stroke-width="1.5"/.test(m)
afirmar(marcado(montado), 'un grupo con nombre (`aria-roledescription` carrusel); las tres tarjetas montadas en su lugar (el alto es el de la más alta: no salta), sólo la primera activa y las otras escondidas e inertes; dos flechas con nombre (lucide, trazo 1,5) y una línea por tarjeta; en el servidor, quieto (fuera de la vista hasta que se ve)')
controlPositivo('  el detector ve un carrusel con las tarjetas de afuera a la vista (sin `inert`)', montado.replaceAll(' inert=""', ''), marcado)
afirmar(TRANSICION_DEL_CARRUSEL.saleS + TRANSICION_DEL_CARRUSEL.entraS <= 0.6 && TRANSICION_DEL_CARRUSEL.corridaPx <= 24, `  la transición es corta y tranquila: la que se va en ${String(TRANSICION_DEL_CARRUSEL.saleS * 1000)} ms, y después la nueva en ${String(TRANSICION_DEL_CARRUSEL.entraS * 1000)} ms desde ${String(TRANSICION_DEL_CARRUSEL.corridaPx)} px de su lado`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1.2e · 6 · No es una trampa de scroll, y no depende de quien lo usa')

const fuente = sinComentarios(leer('_componentes/carrusel/CarruselDeTarjetas.tsx'))
const maquina = sinComentarios(leer('_componentes/carrusel/maquinaDelCarrusel.ts'))
const libre = (c: string): boolean =>
  /className="relative grid touch-pan-y select-none overflow-clip"/.test(c) && !/touch-none|preventDefault|stopPropagation|'wheel'|onWheel|touchmove|onTouchMove|h-svh|min-h-svh|h-screen/.test(c)
afirmar(libre(fuente), 'la vista es `touch-action: pan-y` (el dedo vertical lo hace el navegador), no cancela ni frena ningún evento, no escucha la rueda ni el `touchmove`, y no tiene el alto de la pantalla: mide lo que su tarjeta')
controlPositivo('  el detector ve la trampa de las historias (`touch-none` y el freno del arrastre)', sinComentarios(leer('_componentes/historias/Historias.tsx')), libre)
controlPositivo('  y un carrusel que cancela el dedo', fuente.replace('const alMoverse = (e: React.PointerEvent<HTMLDivElement>): void => {', 'const alMoverse = (e: React.PointerEvent<HTMLDivElement>): void => {\n    e.preventDefault()'), libre)
const independiente = (c: string): boolean => !/_secciones|PortfolioVivo|PROYECTOS|data-panel/.test(c)
afirmar(independiente(`${fuente}\n${maquina}`), '  y no sabe del Portfolio: ni sus secciones, ni sus proyectos, ni el panel (lo propio entra por `items` y `renderItem`; B5 lo usa con las demos)')
controlPositivo('  el detector ve un carrusel que lee el Portfolio', `${fuente}\nimport { PROYECTOS } from '../../_secciones/trabajos/proyectos'`, independiente)
const elReloj = (c: string): boolean => /if \(!rota\) return undefined/.test(c) && /requestAnimationFrame\(cuadro\)/.test(c) && /new IntersectionObserver/.test(c) && /visibilitychange/.test(c)
afirmar(elReloj(fuente), '  el reloj corre con `requestAnimationFrame` sólo mientras rota (fuera de la vista, sin cuadros), y la vista la dicen el observador y la pestaña')
controlPositivo('  el detector ve un reloj que corre siempre', fuente.replace('if (!rota) return undefined', ''), elReloj)
const unTic = (c: string): boolean => /if \(deCostado && aplicar\.current\(\{ tipo: 'deslice', dx, dy \}\)\.porElUsuario\) sonar\('tic'\)/.test(c) && (c.match(/sonar\(/g) ?? []).length === 1
afirmar(unTic(fuente), '  un tic por deslice que cambia de tarjeta (las flechas son botones: suenan solas; el tiempo no suena)')
controlPositivo('  el detector ve un tic de más (con las flechas)', fuente.replace("onClick={() => aplicar.current({ tipo: 'anterior' })}", "onClick={() => { aplicar.current({ tipo: 'anterior' }); sonar('tic') }}"), unTic)

cerrar('s76-carrusel.invariant')
