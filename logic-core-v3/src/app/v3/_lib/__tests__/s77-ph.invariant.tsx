/**
 * s77 · EL SPRINT P-H — las piezas comunes que pidieron las páginas de servicios, con su control cada una.
 *
 *   §1 · P-H21 · la pausa de un video en bucle (`_componentes/medios/BotonPausa.tsx`): sólo el componente, sin integrar.
 *   §2 · P-H23 · el punto de registro de la llave (`registrarInventos`): lo registrado pasa por la misma puerta y el escáner lo conoce.
 *   §3 · P-H18 + P-H25 · el gatillo común (`_contrato/disparo.ts`, `reposo.ts`, `Gatillo.tsx`) con la guarda en reposo, y Tu panel
 *        (la sección que lo usa) idéntica antes y después.
 *
 * El log es `docs/rediseno/SPRINT-PH.md`.
 */
import { createHash } from 'node:crypto'
import { readdirSync } from 'node:fs'
import path from 'node:path'

import React from 'react'

import { BotonPausa, nombreDeLaPausa } from '../../_componentes/medios/BotonPausa'
import { ENTRADAS_AL_TRAMO } from '../../_secciones/_contrato/cruce'
import { ESTADOS_DEL_GATILLO, LINEA_DEL_DISPARO, aLaVistaEn, margenDelDisparo, siguienteEstado, type EstadoDelGatillo, type EventoDelGatillo } from '../../_secciones/_contrato/disparo'
import { escanearContenido, escanearLoReal } from '../../_secciones/_contrato/escaneo'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { Gatillo } from '../../_secciones/_contrato/Gatillo'
import { LISTA_DE_INVENTOS, conLlave, registrarInventos, todosLosInventos } from '../../_secciones/_contrato/inventado'
import { vigilarElReposo } from '../../_secciones/_contrato/reposo'
import { sinLoInventado } from '../../_secciones/_contrato/restauracion'
import { marcar } from '../../_secciones/_invariantes/render'
import { CONTENIDO_PROHIBIDO_DE_CONTROL } from '../../_secciones/_invariantes/soporte'
import { DISPARO_DEL_REMATE, margenDelDisparo as margenDelRemate } from '../../_secciones/tu-panel/entrada'
import { Remate } from '../../_secciones/tu-panel/Remate'
import { TuPanel } from '../../_secciones/tu-panel/TuPanel'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { RAIZ, leer } from './s3-archivos'

;(globalThis as unknown as { React: typeof React }).React = React

const V3 = 'src/app/v3'
const sinComentarios = (f: string): string => f.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const recorrer = (dir: string): string[] =>
  readdirSync(path.join(RAIZ, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? recorrer(`${dir}/${e.name}`) : [`${dir}/${e.name}`]))
const PRODUCTO = recorrer(V3).filter((a) => /\.tsx?$/.test(a) && !a.includes('/__tests__/') && !/\.invariant\.tsx?$/.test(a))

// ═══════════════════════════════════════════════════════════════════════════
titulo('§1 · P-H21 · la pausa de un video en bucle')

const DE = 'el video de muestra'
const corriendo = marcar(<BotonPausa pausado={false} alCambiar={() => undefined} de={DE} />, { anima: true })
const pausado = marcar(<BotonPausa pausado alCambiar={() => undefined} de={DE} />, { anima: true })
const nombreDe = (m: string): string | undefined => /aria-label="([^"]*)"/.exec(m)?.[1]
const pausaBien = ([a, b]: readonly [string, string]): boolean =>
  /^<button type="button" data-pieza="boton-pausa"/.test(a) &&
  nombreDe(a) === nombreDe(b) &&
  a.includes('aria-pressed="false"') &&
  b.includes('aria-pressed="true"') &&
  [a, b].every((m) => /<svg[^>]*stroke-width="1\.5"[^>]*aria-hidden="true"/.test(m))
afirmar(pausaBien([corriendo, pausado]) && nombreDe(corriendo) === nombreDeLaPausa(DE), `un <button> con nombre fijo («${nombreDeLaPausa(DE)}») y el estado en aria-pressed; el ícono de lucide con trazo 1,5 y aria-hidden`)
controlPositivo('  el detector VE un botón que cambia de nombre con el estado (el lector no anunciaría el mismo control)', [corriendo, pausado.replace(nombreDeLaPausa(DE), `Reanudar ${DE}`)] as const, pausaBien)

const pedidos: boolean[] = []
const elemento = BotonPausa({ pausado: false, alCambiar: (p) => pedidos.push(p), de: DE })
;(elemento.props as { onClick: () => void }).onClick()
const elementoPausado = BotonPausa({ pausado: true, alCambiar: (p) => pedidos.push(p), de: DE })
;(elementoPausado.props as { onClick: () => void }).onClick()
afirmarIgual(pedidos, [true, false], '  el clic pide el estado contrario (corriendo → pausa, en pausa → sigue)')

const usanLaPausa = (archivos: readonly string[], fuente: (a: string) => string): string[] => archivos.filter((a) => /from '[^']*medios\/BotonPausa'/.test(fuente(a)))
// [B1.2d B] P-H21 · integrada en el video en bucle del panel de escritorio (en las historias la pausa es mantener apretado); el de cada
// servicio (`VideoDeServicio`) va cuando se toque esa pieza.
const DONDE_VA = [`${V3}/_secciones/trabajos/portfolio/MedioDeLaTira.tsx`]
afirmarIgual(usanLaPausa(PRODUCTO, leer), DONDE_VA, '  y está integrada donde corre un video en bucle del home: el del panel del Portfolio (s76 §34 lo afirma sobre el marcado)')
controlPositivo('  el detector VE una integración de más', [...DONDE_VA, 'x.tsx'], (l: readonly string[]) => JSON.stringify(usanLaPausa(l, (a) => (a === 'x.tsx' ? "import { BotonPausa } from '../../_componentes/medios/BotonPausa'" : leer(a)))) === JSON.stringify(DONDE_VA))

// ═══════════════════════════════════════════════════════════════════════════
titulo('§2 · P-H23 · el punto de registro de la llave')

const MENTIRA = CONTENIDO_PROHIBIDO_DE_CONTROL.slice(CONTENIDO_PROHIBIDO_DE_CONTROL.indexOf('planes'), CONTENIDO_PROHIBIDO_DE_CONTROL.indexOf(' y '))
const CASILLAS = { precio: { marcador: '[PRECIO]', pedido: 'planes desde [PRECIO]', mentira: MENTIRA } } as const
const REGISTRADO = registrarInventos('s77-prueba', CASILLAS)
afirmar(REGISTRADO === CASILLAS && todosLosInventos().includes(REGISTRADO.precio) && !LISTA_DE_INVENTOS.includes(REGISTRADO.precio), 'se registra desde otra carpeta sin editar inventado.ts ni llave.ts; la lista del home (la que s21 cuenta) no cambia')
const bloqueado = conLlave(REGISTRADO.precio, false)
afirmar(bloqueado === CASILLAS.precio.pedido && !bloqueado.includes(MENTIRA) && conLlave(REGISTRADO.precio, true) === MENTIRA, `  pasa por la misma puerta: con la llave apagada (producción) se lee «${bloqueado}», nunca la mentira`)
afirmar(escanearContenido(MENTIRA).length > 0, '  los detectores no le dan excepción: la mentira registrada, escrita suelta, los dispara', `${String(escanearContenido(MENTIRA).length)} hallazgos`)
afirmar(sinLoInventado(`Hay ${MENTIRA}.`) === 'Hay planes desde [PRECIO].' && escanearLoReal(`Hay ${MENTIRA}.`).length === 0, '  y el escáner del contenido real la conoce: la devuelve a su marcador (lo que queda con la llave apagada)')
const SUELTA = CONTENIDO_PROHIBIDO_DE_CONTROL.slice(0, CONTENIDO_PROHIBIDO_DE_CONTROL.indexOf(', con'))
controlPositivo('  el escáner sigue bloqueando lo que NO se registró (una cifra escrita a mano)', SUELTA, (t: string) => escanearLoReal(t).length === 0)
controlPositivo('  y el registro rechaza una casilla cuyo pedido no lleva su marcador', { mala: { marcador: '[PRECIO]', pedido: 'planes desde', mentira: MENTIRA } } as const, (c) => registrarInventos('s77-mala', c) === c)

// ═══════════════════════════════════════════════════════════════════════════
titulo('§3 · P-H18 + P-H25 · el gatillo común y su guarda en reposo')

// La máquina: las reglas del remate, entrada por entrada.
const CARGA: Readonly<Record<string, EstadoDelGatillo>> = { 'arriba-bajando': 'quieto', 'arriba-subiendo': 'espera', 'abajo-bajando': 'quieto', 'abajo-subiendo': 'quieto' }
afirmar(ENTRADAS_AL_TRAMO.every((e) => siguienteEstado('quieto', { tipo: 'carga', entrada: e }) === CARGA[e]), 'la carga se posa donde toca, sin gesto: escondido sólo si quedó debajo de la línea')
afirmar(siguienteEstado('espera', { tipo: 'cruce', entrada: 'arriba-bajando' }) === 'puesto' && siguienteEstado('puesto', { tipo: 'cruce', entrada: 'arriba-subiendo' }) === 'ido', '  bajando por la línea entra; subiendo por encima se va en espejo')
afirmar(siguienteEstado('espera', { tipo: 'cruce', entrada: 'abajo-subiendo' }) === 'quieto' && siguienteEstado('puesto', { tipo: 'sin-movimiento' }) === 'quieto', '  un salto por encima se posa sin gesto (A13), y sin movimiento está quieto')

type Maquina = (estado: EstadoDelGatillo, evento: EventoDelGatillo) => EstadoDelGatillo
const guardaBien = (m: Maquina): boolean =>
  ESTADOS_DEL_GATILLO.every((e) => m(e, { tipo: 'reposo', aLaVista: true }) === (e === 'espera' || e === 'ido' ? 'puesto' : e)) &&
  ESTADOS_DEL_GATILLO.every((e) => m(e, { tipo: 'reposo', aLaVista: false }) === e)
afirmar(guardaBien(siguienteEstado), 'P-H25 · en reposo, lo que asoma y no se disparó (o se fue) entra; lejos de la vista no toca nada (la salida al subir sigue)')
controlPositivo('  el detector VE la máquina sin la guarda (una pieza queda a la vista con opacidad 0)', (e, ev) => (ev.tipo === 'reposo' ? e : siguienteEstado(e, ev)), guardaBien)
controlPositivo('  y una guarda que también apaga lo que salió de la vista', (e, ev) => (ev.tipo === 'reposo' && !ev.aLaVista ? 'espera' : siguienteEstado(e, ev)), guardaBien)

type Asoma = (b: { readonly top: number; readonly bottom: number }, alto: number) => boolean
const asomaBien = (f: Asoma): boolean => f({ top: 880, bottom: 1200 }, 900) && !f({ top: 900, bottom: 1200 }, 900) && !f({ top: -400, bottom: 0 }, 900) && !f({ top: -10, bottom: 5 }, 0)
afirmar(asomaBien(aLaVistaEn), '  «a la vista» es que la caja asome en el cuadro; con la pestaña oculta (alto 0) no asoma nada')
controlPositivo('  el detector VE la medida sin el alto (dispararía a ciegas en una pestaña oculta)', (b, alto) => b.bottom > 0 && b.top < alto, asomaBien)

// Una sola implementación: la línea y el margen del remate son los del contrato.
afirmar(DISPARO_DEL_REMATE === LINEA_DEL_DISPARO && margenDelRemate === margenDelDisparo && margenDelDisparo(LINEA_DEL_DISPARO) === `0% 0% -${String(LINEA_DEL_DISPARO)}% 0%`, `  una sola implementación: la línea del remate (${String(DISPARO_DEL_REMATE)} %) y su margen son los del gatillo común`)
const definiciones = (archivos: readonly string[], fuente: (a: string) => string): string[] => archivos.filter((a) => /export function (margenDelDisparo|siguienteEstado)\(/.test(fuente(a)))
afirmarIgual(definiciones(PRODUCTO.filter((a) => a.startsWith(`${V3}/_secciones/`)), leer), [`${V3}/_secciones/_contrato/disparo.ts`], '  (en las secciones, la máquina y el margen se definen una vez: en el contrato)')
controlPositivo('  el detector VE la copia de antes en tu-panel/entrada.ts', [`${V3}/_secciones/_contrato/disparo.ts`, `${V3}/_secciones/tu-panel/entrada.ts`], (l: readonly string[]) => definiciones(l, (a) => (a.endsWith('entrada.ts') ? 'export function margenDelDisparo(desdeAbajo: number): string {' : leer(a))).length === 1)

// El remate (la sección del home que lo usa) trae la guarda.
const REMATE = sinComentarios(leer(`${V3}/_secciones/tu-panel/Remate.tsx`))
const remateConGuarda = (f: string): boolean =>
  f.includes("import { vigilarElReposo } from '../_contrato/reposo'") &&
  f.includes('soltarElReposo ??= vigilarElReposo(raiz, enReposo)') &&
  f.includes("siguienteEstado(antes, { tipo: 'reposo', aLaVista })") &&
  f.includes('soltarElReposo?.()')
afirmar(remateConGuarda(REMATE), '  el remate de Tu panel arma la guarda con el primer aviso de su observador y la suelta al desmontarse')
controlPositivo('  el detector VE el remate de antes (sin guarda)', REMATE.replace('soltarElReposo ??= vigilarElReposo(raiz, enReposo)', ''), remateConGuarda)
const sinRebobinar = (f: string): boolean => /if \(a\.playbackRate === sentido && a\.playState === 'finished'\) continue/.test(f)
afirmar(sinRebobinar(REMATE), '  y reproducir para un lado que ya llegó no la rebobina (no repite el gesto después de la guarda)')
controlPositivo('  el detector VE el reproducir de antes', REMATE.replace("if (a.playbackRate === sentido && a.playState === 'finished') continue", ''), sinRebobinar)

const GATILLO = sinComentarios(leer(`${V3}/_secciones/_contrato/Gatillo.tsx`))
afirmar(GATILLO.includes('soltarElReposo ??= vigilarElReposo(el,') && GATILLO.includes('rootMargin: margenDelDisparo(LINEA_DEL_DISPARO)') && GATILLO.includes('soltarElReposo?.()'), '  el componente común observa la línea del contrato y trae la misma guarda')
const servido = (m: string): boolean => m.includes('data-gatillo="quieto"') && !m.includes('opacity-0')
afirmar([false, true].every((anima) => servido(marcar(<Gatillo>contenido</Gatillo>, { anima }))), '  el HTML servido del gatillo está quieto y a la vista, con y sin coreografía')
controlPositivo('  el detector VE un gatillo servido escondido', marcar(<Gatillo>contenido</Gatillo>, { anima: true }).replace('data-gatillo="quieto"', 'data-gatillo="espera"').replace('<div class="">', '<div class="translate-x-8 opacity-0">'), servido)

// Tu panel, idéntica antes y después: las huellas del marcado servido, tomadas en f1cd4b4e (antes de P-H18). Si Tu panel cambia a
// propósito, la huella se vuelve a tomar con su motivo en el commit.
const huella = (m: string): string => createHash('sha256').update(m).digest('hex')
const ANTES = {
  quieta: '20407e7c3c8f947b3db36cb7c0987698295fb92ccb15c14337dd7cd0b0361d13',
  animada: 'b89894e312aa33c89616d5e8c654740ec67edf2c4408ddd35433e5c93b24c143',
  remate: 'f46d2a21e4cc447bb4ec6ccae793290305cf2906ce89f770159f4332f0173d4d',
}
const panel = <TuPanel seccion={seccionDe('tu-panel')} />
const ahora = { quieta: marcar(panel, { anima: false }), animada: marcar(panel, { anima: true }), remate: marcar(<Remate />, { anima: true }) }
afirmar(huella(ahora.quieta) === ANTES.quieta && huella(ahora.animada) === ANTES.animada && huella(ahora.remate) === ANTES.remate, '  Tu panel renderiza idéntico antes y después: el marcado quieto, el animado y el del remate solo')
controlPositivo('  el detector VE un remate con un atributo de más', ahora.remate.replace('data-estado="quieto"', 'data-estado="quieto" data-guarda=""'), (m: string) => huella(m) === ANTES.remate)

// La guarda en el tiempo, con una ventana de mentira: el primer reposo llega sin mover la página; después, uno por cada pausa.
async function guardaEnElTiempo(): Promise<void> {
  const escuchas = new Set<() => void>()
  const ventana = {
    innerHeight: 900,
    addEventListener: (_: string, f: () => void): void => void escuchas.add(f),
    removeEventListener: (_: string, f: () => void): void => void escuchas.delete(f),
    setTimeout: (f: () => void, ms: number): number => Number(setTimeout(f, ms)),
    clearTimeout: (id: number): void => clearTimeout(id),
  }
  ;(globalThis as unknown as { window?: typeof ventana }).window = ventana
  const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
  const cajaEn = (top: number): Element => ({ getBoundingClientRect: () => ({ top, bottom: top + 300 }) }) as unknown as Element
  const avisos = async (top: number, alto: number): Promise<boolean[]> => {
    ventana.innerHeight = alto
    const dados: boolean[] = []
    const soltar = vigilarElReposo(cajaEn(top), (v) => dados.push(v))
    await dormir(400)
    for (const f of escuchas) f()
    await dormir(400)
    soltar()
    for (const f of escuchas) f()
    await dormir(400)
    return dados
  }
  const enLaFranja = await avisos(880, 900)
  afirmarIgual(enLaFranja, [true, true], '  en el tiempo: con la caja en la franja de abajo, un aviso «a la vista» al quedar quieta y otro tras la siguiente pausa; soltada, ninguno')
  afirmarIgual(escuchas.size, 0, '  (y soltarla saca el escucha del scroll)')
  const lejos = await avisos(2400, 900)
  controlPositivo('  el detector VE una caja lejos del cuadro', lejos, (d: readonly boolean[]) => d.length === 2 && d.every(Boolean))
  const oculta = await avisos(880, 0)
  controlPositivo('  y la pestaña oculta (alto 0)', oculta, (d: readonly boolean[]) => d.length === 2 && d.every(Boolean))
  delete (globalThis as unknown as { window?: typeof ventana }).window
}

void guardaEnElTiempo().then(() => cerrar('s77-ph'))
