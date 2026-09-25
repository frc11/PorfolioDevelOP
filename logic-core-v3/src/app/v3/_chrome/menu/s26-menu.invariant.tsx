/**
 * s26 · EL MENÚ MÓVIL — el contraste del botón, el diálogo y el modo del chrome. **[CONTACTO]**
 *
 * Se afirma sobre las funciones puras (tono, modo, panel bajo el botón), sobre el marcado
 * real del menú (render de servidor) y sobre el fuente donde la propiedad vive en un efecto.
 * Cada afirmación lleva su control positivo.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from '../../_lib/__tests__/afirmar'
import { RAIZ } from '../../_lib/__tests__/s3-archivos'
import { quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { ENLACES_DE_MUESTRA } from '../../_lib/navegacion'
import { SECCIONES } from '../../_lib/secciones'
import type { ModoSuperficie } from '../../_lib/superficies'
import { fijarModoDelChrome } from '../contacto/apertura'
import { modoDelChrome } from '../NavegacionDelHome'
import { Menu, MenuMovil, ROTULO_DEL_MENU } from './MenuMovil'
import { panelEn, tonoDebajo, vaInvertido, type Tono } from './tono'

const leer = (r: string): string => quitarComentarios(readFileSync(path.join(RAIZ, r), 'utf8'))
const FUENTE = leer('src/app/v3/_chrome/menu/MenuMovil.tsx')
const HOOK = leer('src/app/v3/_chrome/menu/useTonoDebajo.ts')

// Los colores de `theme-develop.css`: el papel y la tinta, y los mismos dados vuelta.
const PAPEL = '#F7F7F5'
const TINTA = '#111111'
const FONDO_INVERTIDO = '#0E0E0E'
const ZONA: Record<Tono, string> = { claro: PAPEL, oscuro: FONDO_INVERTIDO }
/** El botón: `bg-fondo` con el logo en `text-tinta`; dado vuelta, los dos del tema invertido. */
const botonPara = (invertido: boolean): { circulo: string; logo: string } => (invertido ? { circulo: FONDO_INVERTIDO, logo: PAPEL } : { circulo: PAPEL, logo: TINTA })

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El contraste del botón sobre zonas claras y oscuras')

type FuncionDeTono = typeof tonoDebajo
const casos = (f: FuncionDeTono): { superficie: ModoSuperficie; noche: number; circuloZona: number; logoCirculo: number }[] =>
  (['papel-opaco', 'papel-transparente', 'oscuro-opaco', 'oscuro-transparente'] as const).flatMap((superficie) =>
    [0, 1].map((noche) => {
      // La zona real: invertida siempre oscura; transparente, oscura con la noche; opaca de papel, clara.
      const real = tonoDebajo(superficie, noche)
      const b = botonPara(vaInvertido(f(superficie, noche)))
      return { superficie, noche, circuloZona: razonDeContraste(b.circulo, ZONA[real]), logoCirculo: razonDeContraste(b.logo, b.circulo) }
    }),
  )
const peor = (f: FuncionDeTono): number => Math.min(...casos(f).map((c) => c.circuloZona))
afirmar(peor(tonoDebajo) >= 3, 'el círculo se separa de lo que tiene abajo en las cuatro superficies, de día y de noche (≥ 3:1, contraste de componente)', `peor ${peor(tonoDebajo).toFixed(2)}:1`)
afirmar(Math.min(...casos(tonoDebajo).map((c) => c.logoCirculo)) >= 4.5, '  y el logo se lee sobre el círculo (≥ 4,5:1)')
afirmarIgual(tonoDebajo('papel-transparente', 1), 'oscuro', '  con la noche prendida, una sección transparente se lee oscura: el botón va claro')
afirmarIgual(tonoDebajo('papel-transparente', 0), 'claro', '  y de día, clara: el botón va oscuro')
afirmarIgual(tonoDebajo('papel-opaco', 1), 'claro', '  una sección opaca de papel no ve la noche: sigue clara')
controlPositivo('  el chequeo vería un tono que ignora la noche', ((s: ModoSuperficie) => tonoDebajo(s, 0)) as FuncionDeTono, (f: FuncionDeTono) => peor(f) >= 3)
controlPositivo('  y uno que no se da vuelta nunca', (() => 'oscuro') as FuncionDeTono, (f: FuncionDeTono) => peor(f) >= 3)
const secciones = SECCIONES.map((s) => `${s.id}: ${tonoDebajo(s.superficie, 0)}`).join(' · ')
afirmar(/useTonoDebajo\(boton, enMenu\)/.test(FUENTE) && /nocheEfectiva\(\)/.test(HOOK) && /s\.superficie/.test(HOOK), 'el tono sale de la superficie declarada en `secciones.ts` y de `nocheEfectiva()`, no de un corte de scroll', secciones)
afirmar(!/scrollY|pageYOffset/.test(HOOK), '  sin leer el scroll: lee qué panel está bajo el botón')
afirmarIgual(panelEn([{ id: 'numeros', tope: -900, pie: 400 }, { id: 'trabajos', tope: 0, pie: 3000 }], 40), 'trabajos', '  y si dos paneles se pisan (el solape de Trabajos) gana el de encima, el que va después')
controlPositivo('  el chequeo vería uno que se queda con el primero', (y: number) => [{ id: 'numeros', tope: -900, pie: 400 }].find((p) => p.tope <= y && y < p.pie)?.id ?? null, (f: (y: number) => string | null) => f(40) === 'trabajos')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El menú es un diálogo accesible: foco atrapado y devuelto, Esc, tocar afuera')

const nada = (): void => undefined
const MENU = renderToStaticMarkup(<Menu invertido alCerrar={nada} alContacto={nada} alDesmontar={nada} />)
const esDialogo = (h: string): boolean => /role="dialog"/.test(h) && /aria-modal="true"/.test(h) && /aria-label="Menú"/.test(h) && /id="menu-movil"/.test(h)
afirmar(esDialogo(MENU), 'el menú es un diálogo modal con nombre')
controlPositivo('  el chequeo vería un menú sin rol de diálogo', MENU.replace('role="dialog"', ''), esDialogo)
afirmar(/useDialogo\(caja, alCerrar\)/.test(FUENTE), '  Esc cierra y el Tab queda atrapado: el mismo `useDialogo` de las demos y del contacto')
afirmar(/data-parte="velo-del-menu"/.test(MENU) && /onClick=\{alCerrar\}\s*className="fixed inset-0/.test(FUENTE), '  tocar afuera (el velo) cierra')
const ordenDeLaDevolucion = (f: string): boolean => f.indexOf('useDialogo(caja, alCerrar)') >= 0 && f.indexOf('useDialogo(caja, alCerrar)') < f.indexOf('useEffect(() => alDesmontar, [alDesmontar])')
afirmar(ordenDeLaDevolucion(FUENTE), '  el foco vuelve al botón en la limpieza del desmontaje, DESPUÉS de la de la trampa (antes, la trampa lo retenía)')
controlPositivo('  el chequeo vería la devolución antes de la trampa', FUENTE.replace('useEffect(() => alDesmontar, [alDesmontar])', '').replace('useDialogo(caja, alCerrar)', 'useEffect(() => alDesmontar, [alDesmontar])\nuseDialogo(caja, alCerrar)'), ordenDeLaDevolucion)
afirmar(/boton\.current\?\.focus\(/.test(FUENTE), '  y el que recibe el foco es el botón')
fijarModoDelChrome('menu')
const BOTON = renderToStaticMarkup(<MenuMovil />)
fijarModoDelChrome('barra')
afirmar(/aria-expanded="false"/.test(BOTON) && /aria-controls="menu-movil"/.test(BOTON) && BOTON.includes(`aria-label="${ROTULO_DEL_MENU.abrir}"`), 'el botón dice lo que hace, si está abierto y qué controla; el mismo botón cierra')
afirmar(/<svg[^>]*data-pieza="isotipo"/.test(BOTON), '  y lleva el logo de develOP')
afirmarIgual(renderToStaticMarkup(<MenuMovil />), '', '  con la barra de escritorio entera, el menú no existe')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los ítems, y Contacto abre el formulario')

const items = [...MENU.matchAll(/data-parte="item-del-menu"[^>]*>([^<]+)</g)].map((m) => m[1])
afirmarIgual(items, ['Quiénes somos', 'Trabajos', 'Servicios', 'Por qué develOP', 'Contacto'], 'los cinco, en el orden de la barra')
afirmarIgual(items, ENLACES_DE_MUESTRA.map((e) => e.rotulo), '  y son los mismos de la barra: una sola lista')
afirmar(/<button type="button" data-parte="item-del-menu"[^>]*>Contacto</.test(MENU) && /abrirContacto\(\[\], boton\.current\)/.test(FUENTE), 'Contacto es un botón: cierra el menú y abre el formulario, con el foco de vuelta al botón del menú')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El modo del chrome sale del ancho real')

afirmarIgual(modoDelChrome(562, 600), 'barra', 'si la lista entra en la pastilla, la barra de escritorio')
afirmarIgual(modoDelChrome(562, 561), 'menu', '  y si se pasa un píxel, el menú móvil')
controlPositivo('  el chequeo vería un modo que siempre es barra', (() => 'barra') as typeof modoDelChrome, (f: typeof modoDelChrome) => f(562, 561) === 'menu')
const NAV = leer('src/app/v3/_chrome/NavegacionDelHome.tsx')
afirmar(/modoDelChrome\(pastilla\.scrollWidth, pastilla\.clientWidth\)/.test(NAV) && /new ResizeObserver\(medir\)/.test(NAV) && /fijarModoDelChrome\(modo\)/.test(NAV), '  una medición en el chrome, al cambiar el ancho o la lista; las secciones no preguntan el ancho')

cerrar('s26-menu.invariant')
