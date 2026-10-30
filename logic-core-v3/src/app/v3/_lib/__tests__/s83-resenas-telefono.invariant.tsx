/**
 * INVARIANTE — [C2-70t] EL CARRUSEL DE LAS RESEÑAS EN EL TELÉFONO Y LA TABLET (cola 2 del 2026-10-23, tarea 70 §4; la línea ~130 de la
 * revisión: «sin flechas, continuo, con una indicación de que puede scrollearlo deslizándolo, mejor botón de ver trabajo»). Sin
 * navegador: lo puro de la deriva (la velocidad sin escalón, el bucle sin costura, quién movió la pista, el aviso), el marcado de la pista
 * (sin flechas, lo que se ve fuera del lector y sus botones fuera del teclado, las tarjetas opacas con su retrato, «Ver trabajo» como
 * enlace sólo si hay trabajo; la parada del teclado de cada reseña sigue en el lector), el texto del aviso contra `05-TEXTOS.md` y el hook (en pantalla, pestaña visible, el scroll nativo). Cada afirmación con
 * su control positivo. Lo que se ve y se mueve (la deriva por cuadro, el dedo, el aviso que se va) lo mide `scripts-carga/resenas-telefono.ts`.
 *
 * Corre con `npm run test:s83-resenas-telefono`.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import React, { createElement } from 'react'

import { AvisoDeScroll } from '../../_componentes/avisos/AvisoDeScroll'
import { marcar } from '../../_secciones/_invariantes/render'
import { RESENAS, TEXTO_DE_LAS_RESENAS, enlaceDelTrabajo, type Resena } from '../../_secciones/por-que-develop/resenas/contenido'
import { DERIVA, estadoDelAviso, laMovioElUsuario, pasoDeLaDeriva, velocidadDeLaDeriva, type EstadoDelAviso } from '../../_secciones/por-que-develop/resenas/deriva'
import { PistaDeLasResenas, ResenasEnLista } from '../../_secciones/por-que-develop/resenas/ResenasEnLista'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

;(globalThis as unknown as { React: typeof React }).React = React

const RAIZ = process.cwd()
const leer = (r: string): string => readFileSync(path.join(RAIZ, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (f: string): string => f.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const DIR = 'src/app/v3/_secciones/por-que-develop/resenas'

const LISTA = marcar(createElement(ResenasEnLista), { anima: false })
const QUIETA = marcar(createElement(PistaDeLasResenas, { quieto: true }), { anima: false })
const VIVA = marcar(createElement(PistaDeLasResenas, { quieto: false }), { anima: true })

interface Tarjeta {
  readonly abre: string
  readonly cuerpo: string
}
const tarjetasDe = (html: string): Tarjeta[] => [...html.matchAll(/(<li data-pieza="resena-en-lista"[^>]*>)([\s\S]*?)<\/li>/g)].map((m) => ({ abre: m[1], cuerpo: m[2] }))
const esCopia = (t: Tarjeta): boolean => t.abre.includes('data-copia=""')
const enlacesDe = (html: string): string[] => [...html.matchAll(/<a [^>]*>/g)].map((m) => m[0])

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Sin flechas: ni botones en el bloque ni el código que corría de a una tarjeta')

const FUENTE = sinComentarios(leer(`${DIR}/ResenasEnLista.tsx`))
const sinFlechasEnElMarcado = (html: string): boolean => !/<button/.test(html) && !/lucide-chevron|aria-label="Reseña (anterior|siguiente)"/.test(html)
afirmar(sinFlechasEnElMarcado(LISTA) && sinFlechasEnElMarcado(VIVA), 'el bloque y la pista que deriva no tienen ningún botón ni chevrón de flecha')
controlPositivo('el detector ve una flecha inyectada', LISTA.replace('</ul>', '<button aria-label="Reseña siguiente"><svg class="lucide lucide-chevron-right"></svg></button></ul>'), sinFlechasEnElMarcado)
const sinFlechasEnLaFuente = (f: string): boolean => !/ChevronLeft|ChevronRight|scrollBy\(|const correr\b/.test(f)
afirmar(sinFlechasEnLaFuente(FUENTE), 'la fuente no importa los chevrones ni corre de a una tarjeta (`scrollBy`)')
controlPositivo('el detector ve la fuente de antes (las flechas)', `import { ChevronLeft, ChevronRight } from 'lucide-react'\n${FUENTE}`, sinFlechasEnLaFuente)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La deriva: despacio, sin escalón al arrancar ni al retomar, en bucle sin costura; quieta con movimiento reducido')

afirmar(DERIVA.velocidad >= 10 && DERIVA.velocidad <= 60, `despacio: ${String(DERIVA.velocidad)} px/s (una tarjeta de ~340 px cruza en ~${String(Math.round(340 / DERIVA.velocidad))} s)`)
const CUADRO = 1 / 60
const serie = (v: (t: number, q: boolean) => number): number[] => Array.from({ length: 300 }, (_, i) => v(i * CUADRO, false))
const sinEscalon = (v: (t: number, q: boolean) => number): boolean => {
  const s = serie(v)
  const saltoMaximo = Math.max(...s.slice(1).map((x, i) => Math.abs(x - s[i])))
  return s[0] === 0 && Math.abs(s[s.length - 1] - DERIVA.velocidad) < 1e-9 && saltoMaximo <= DERIVA.velocidad * 0.03
}
afirmar(sinEscalon(velocidadDeLaDeriva), `desde un gesto: quieta ${String(DERIVA.espera)} s y sube a ${String(DERIVA.velocidad)} px/s en ${String(DERIVA.retoma)} s; ningún cuadro (60 fps) cambia más del 3 % de la de crucero`)
controlPositivo('el detector ve una deriva que arranca de golpe', (t: number, q: boolean) => (q || t <= DERIVA.espera ? 0 : DERIVA.velocidad), sinEscalon)
const quietaConReducido = (v: (t: number, q: boolean) => number): boolean => [0, 1, DERIVA.espera + DERIVA.retoma, 10, 1000].every((t) => v(t, true) === 0)
afirmar(quietaConReducido(velocidadDeLaDeriva), 'con movimiento reducido la velocidad es 0 siempre (quieta, deslizable a mano)')
controlPositivo('el detector ve una deriva que ignora el movimiento reducido', (t: number) => velocidadDeLaDeriva(t, false), quietaConReducido)

// Un ancho que no es múltiplo del paso: un bucle que vuelve a 0 pierde lo que se pasó (y salta).
const ANCHO_DE_LA_COPIA = 3671.3
const sinCostura = (paso: typeof pasoDeLaDeriva): boolean => {
  let x = 0
  for (let i = 0; i < 60 * 300; i++) {
    const siguiente = paso(x, DERIVA.velocidad, CUADRO, ANCHO_DE_LA_COPIA)
    const corrido = (((siguiente - x) % ANCHO_DE_LA_COPIA) + ANCHO_DE_LA_COPIA) % ANCHO_DE_LA_COPIA
    if (siguiente < 0 || siguiente >= ANCHO_DE_LA_COPIA || Math.abs(corrido - DERIVA.velocidad * CUADRO) > 1e-6) return false
    x = siguiente
  }
  return true
}
afirmar(sinCostura(pasoDeLaDeriva), '300 s de deriva (más de una vuelta): la posición queda en una copia y cada cuadro corre lo mismo, también al dar la vuelta')
controlPositivo('el detector ve un bucle que vuelve al principio (salta)', (x: number, v: number, dt: number, w: number) => (x + v * dt >= w ? 0 : x + v * dt), sinCostura)
afirmar(pasoDeLaDeriva(-5, 0, 0, ANCHO_DE_LA_COPIA) === ANCHO_DE_LA_COPIA - 5 && pasoDeLaDeriva(10, 24, 0.5, 0) === 22, '  y lo que el dedo deja antes del principio vuelve a la copia; sin el ancho medido, no envuelve')

const distingue = (f: (leida: number, escrita: number) => boolean): boolean => !f(10.4, 10) && !f(9, 10) && f(40, 10) && f(0, 120)
afirmar(distingue(laMovioElUsuario), `quién movió la pista: el redondeo del navegador (≤ ${String(DERIVA.tolerancia)} px) no es un gesto; un deslizamiento sí`)
controlPositivo('el detector ve el redondeo como un gesto', (a: number, b: number) => a !== b, distingue)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La pista: quieta, una sola copia con encaje; viva, con la copia del bucle; toda fuera del lector, sus botones fuera del teclado')

const TQ = tarjetasDe(QUIETA)
const TV = tarjetasDe(VIVA)
afirmar(/data-deriva="quieta"/.test(QUIETA) && TQ.length === RESENAS.length && !TQ.some(esCopia) && /snap-mandatory/.test(QUIETA), `quieta: ${String(TQ.length)} tarjetas, sin copia, con encaje`)
afirmar(/data-deriva="viva"/.test(VIVA) && TV.length === 2 * RESENAS.length && TV.filter(esCopia).length === RESENAS.length && !/snap-mandatory/.test(VIVA), `viva: ${String(TV.length)} tarjetas (la copia del bucle), sin encaje (pelearía con la deriva)`)
const fueraDelLector = (html: string): boolean => /^<div aria-hidden="true" class="w-full @container[^"]*"><ul /.test(html) && enlacesDe(html).length > 0 && enlacesDe(html).every((a) => a.includes('tabindex="-1"'))
afirmar(fueraDelLector(VIVA) && fueraDelLector(QUIETA), 'la pista entera va `aria-hidden` (el lector tiene las reseñas en `ResenasParaElLector`) y cada botón, también los de la copia, fuera del teclado')
controlPositivo('el detector ve un botón de la pista en el teclado', VIVA.replace(' tabindex="-1"', ''), fueraDelLector)
controlPositivo('el detector ve una pista que el lector lee (la copia, dos veces)', VIVA.replace('<div aria-hidden="true" class="w-full', '<div class="w-full'), fueraDelLector)
afirmar(/overflow-x-auto/.test(QUIETA) && /overflow-x-auto/.test(VIVA) && !/overflow-x-hidden/.test(QUIETA + VIVA), 'se desliza a mano en todos los anchos (también desde 1024 con movimiento reducido: sin flechas, sin `overflow` escondido)')
const sinTransformar = (html: string): boolean => !/translate|transform|will-change/.test(html)
afirmar(sinTransformar(VIVA), 'la pista no se transforma (la deriva es su scroll nativo: la mezcla de los textos no se corta)')
controlPositivo('el detector ve una pista transformada', VIVA.replace('data-parte="pista"', 'data-parte="pista" style="transform:translateX(-10px)"'), sinTransformar)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Las tarjetas: sólidas, con su retrato')

const solidas = (html: string): boolean => tarjetasDe(html).every((t) => /bg-fondo/.test(t.cuerpo) && !/\bopacity-(?!100)/.test(t.abre + t.cuerpo)) && !/opacity:\s*0\./.test(html)
afirmar(solidas(VIVA) && solidas(QUIETA), 'cada cara es papel opaco (`bg-fondo`) y ninguna tarjeta lleva opacidad')
controlPositivo('el detector ve una tarjeta transparentada', VIVA.replace('data-pieza="resena-en-lista"', 'data-pieza="resena-en-lista" class="opacity-60"'), solidas)
const conSuRetrato = (html: string, copias: number): boolean => RESENAS.every((r) => html.split(`url(${r.foto})`).length - 1 === copias)
afirmar(conSuRetrato(VIVA, 2) && conSuRetrato(QUIETA, 1), `las ${String(RESENAS.length)} fotos de public/v3/resenas, una por reseña (en las dos copias de la pista viva)`)
controlPositivo('el detector ve una tarjeta sin su retrato', VIVA.replace(`url(${RESENAS[0].foto})`, 'none'), (h: string) => conSuRetrato(h, 2))

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · «Ver trabajo →»: el botón de línea del sitio, un enlace real al Portfolio, sólo si la reseña tiene trabajo')

const botonBien = (html: string, resenas: readonly Resena[]): boolean => {
  const ts = tarjetasDe(html).filter((t) => !esCopia(t))
  return (
    ts.length === resenas.length &&
    ts.every((t, i) => {
      const r = resenas[i]
      const a = enlacesDe(t.cuerpo)
      const destino = enlaceDelTrabajo(r)
      if (destino === undefined) return a.length === 0
      return (
        a.length === 1 &&
        a[0].includes(`href="${destino}"`) &&
        /^#portfolio-[a-z-]+$/.test(destino) &&
        a[0].includes('data-pieza="cta"') &&
        a[0].includes('data-variante="linea"') &&
        a[0].includes(`aria-label="${TEXTO_DE_LAS_RESENAS.enlaceDelLector(r.nombre, r.negocio)}"`) &&
        t.cuerpo.includes(`<span data-parte="copia-a">${TEXTO_DE_LAS_RESENAS.verTrabajo}</span>`)
      )
    })
  )
}
afirmar(botonBien(VIVA, RESENAS) && botonBien(QUIETA, RESENAS), 'cada tarjeta con trabajo lleva su `CtaEnlace` de línea a `#portfolio-…`, con su nombre accesible (de quién es la reseña)')
const { proyecto: _sinUso, ...base } = RESENAS[0]
void _sinUso
const SIN_TRABAJO: Resena = base
const CON_UNA_SIN: readonly Resena[] = [SIN_TRABAJO, ...RESENAS.slice(1)]
const PISTA_CON_UNA_SIN = marcar(createElement(PistaDeLasResenas, { quieto: false, resenas: CON_UNA_SIN }), { anima: true })
afirmar(enlaceDelTrabajo(SIN_TRABAJO) === undefined && botonBien(PISTA_CON_UNA_SIN, CON_UNA_SIN), '  una reseña sin trabajo no muestra el botón (y las demás sí)')
controlPositivo('el detector ve un botón en una reseña sin trabajo', VIVA, (h: string) => botonBien(h, CON_UNA_SIN))
afirmar(TEXTO_DE_LAS_RESENAS.verTrabajo.startsWith('Ver trabajo') && TEXTO_DE_LAS_RESENAS.verTrabajo.endsWith('→'), '  el rótulo es «Ver trabajo» con su flecha (05-TEXTOS)')

// El censo del teclado (s10): una parada por reseña con trabajo, la del lector (con el foco, la pastilla). El botón a la vista no la duplica.
const paradas = (html: string): number => enlacesDe(html).filter((a) => /href="/.test(a) && !a.includes('tabindex="-1"')).length
const unaParadaPorResena = (html: string): boolean => {
  const lector = /<div data-pieza="resenas-para-el-lector">[\s\S]*?<\/ul><\/div>/.exec(html)?.[0] ?? ''
  const conTrabajo = RESENAS.filter((r) => enlaceDelTrabajo(r) !== undefined).length
  return enlacesDe(lector).length === conTrabajo && paradas(html) === conTrabajo
}
afirmar(unaParadaPorResena(LISTA), `la lista tiene ${String(paradas(LISTA))} paradas del teclado: una por reseña con trabajo, la del lector (el censo de s10 no cambia)`)
controlPositivo('el detector ve dos paradas para una reseña (el botón a la vista en el teclado)', LISTA.replaceAll(' tabindex="-1"', ''), unaParadaPorResena)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El aviso «Deslizá para ver más»: el de scroll de costado, con su texto de 05-TEXTOS; aparece en pantalla y se va con el primer deslizamiento')

const TEXTOS = leer('docs/cola/2026-10-23/05-TEXTOS.md')
const delAviso = /aviso del carrusel: \*\*«([^»]+)»\*\*/.exec(TEXTOS)?.[1] ?? null
const textoBien = (t: string): boolean => delAviso !== null && t === delAviso
afirmar(textoBien(TEXTO_DE_LAS_RESENAS.deslizar), `el texto, tal cual 05-TEXTOS: «${String(delAviso)}»`)
controlPositivo('el detector ve un texto que no es el de 05-TEXTOS', 'Deslizá para ver mas', textoBien)
const avisoEnLaLista = (html: string): boolean =>
  /<div data-parte="aviso-del-carrusel" data-estado="esperando" class="[^"]*opacity-0[^"]*"><div aria-hidden="true" data-pieza="aviso-de-scroll" data-tono="escena" data-direccion="costado"/.test(html) &&
  html.includes(`>${TEXTO_DE_LAS_RESENAS.deslizar}</span>`) &&
  (html.match(/<path d="M2 3 L10 12 L2 21"/g) ?? []).length === 2
afirmar(avisoEnLaLista(LISTA), 'debajo del carrusel, el `AvisoDeScroll` de costado (decorativo, sobre la escena, dos chevrones hacia la derecha), esperando hasta entrar en pantalla')
controlPositivo('el detector ve el aviso de siempre (hacia abajo)', LISTA.replace(' data-direccion="costado"', ''), avisoEnLaLista)
const ABAJO = marcar(createElement(AvisoDeScroll, { texto: 'Scrolleá para explorarlo' }), { anima: true })
afirmar(!ABAJO.includes('data-direccion') && (ABAJO.match(/<path d="M3 2 L12 10 L21 2"/g) ?? []).length === 2, '  el aviso de siempre no cambia (sin dirección, chevrones hacia abajo)')
const avisoSeVa = (f: (enPantalla: boolean, deslizado: boolean) => EstadoDelAviso): boolean => f(false, false) === 'esperando' && f(true, false) === 'visible' && f(true, true) === 'ido' && f(false, true) === 'ido'
afirmar(avisoSeVa(estadoDelAviso), 'esperando fuera de pantalla, visible en pantalla, ido después del primer deslizamiento (para siempre)')
controlPositivo('el detector ve un aviso que vuelve después de deslizar', (e: boolean) => (e ? 'visible' : 'esperando'), avisoSeVa)
afirmar(!/hidden/.test(/<div data-parte="aviso-del-carrusel"[^>]*>/.exec(LISTA)?.[0] ?? 'hidden'), '  el aviso guarda su lugar al irse (sólo se desvanece: el alto del bloque no cambia)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · El hook: sólo en pantalla y con la pestaña visible; el dedo, el mouse y el foco la frenan; el scroll nativo')

const HOOK = sinComentarios(leer(`${DIR}/useDerivaDelCarrusel.ts`))
const hookBien = (f: string): boolean =>
  /new IntersectionObserver\(/.test(f) &&
  /document\.visibilityState === 'visible'/.test(f) &&
  /addEventListener\('visibilitychange'/.test(f) &&
  /addEventListener\('touchstart'/.test(f) &&
  /addEventListener\('touchend'/.test(f) &&
  /addEventListener\('focusin'/.test(f) &&
  /cancelAnimationFrame\(cuadro\)/.test(f) &&
  /el\.scrollTo\(\{ left: posicion, behavior: 'instant' \}\)/.test(f) &&
  /velocidadDeLaDeriva\(t - ultimoGesto, quieto\)/.test(f) &&
  /const corre = \(\): boolean => !quieto && visto && document\.visibilityState === 'visible'/.test(f) &&
  !/style\.transform/.test(f)
afirmar(hookBien(HOOK), 'corre con la pista en pantalla (IntersectionObserver) y la pestaña visible, se frena con el dedo y el foco, escribe el scroll nativo y nunca con movimiento reducido')
controlPositivo('el detector ve una deriva que corre fuera de pantalla', HOOK.replace(' && visto', ''), hookBien)
afirmarIgual(/useDerivaDelCarrusel\(pista, quieto\)/.test(FUENTE) && /<PistaDeLasResenas pista=\{pista\} quieto=\{quieto\} \/>/.test(FUENTE), true, 'la lista monta la pista con la deriva y el movimiento reducido del lector (`usePrefiereMenosMovimiento`)')

cerrar('s83-resenas-telefono')
