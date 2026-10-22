/**
 * LA GEOMETRÍA DE TU PANEL — [B6] el título, tres módulos alternados y el CTA, en números.
 *
 * Todo lo que mide va acá como DATO y entra a las clases por variables (`variablesDeLaSeccion`): las clases leen
 * `var(--…)` y ninguna lleva un valor a mano. Las alturas del escritorio van en `svh` y suman MENOS que los 700svh que la
 * tabla de secciones declara (`altoNaturalEnEscritorio`): el respiro después del título es el único tramo que crece, y
 * llena lo que falta. Así la sección mide 700svh en todo escritorio y la escena no se corre (REGLA DE ALTURAS: desde 1024,
 * `k = 1`). Abajo de 1024 la sección mide su contenido (`altoAngosto: 'contenido'`) y se anota su tramo (`tramo.ts`).
 *
 * Clases escritas enteras: el escáner de Tailwind lee este archivo tal cual.
 */

import type { CSSProperties } from 'react'

import type { PantallaDeLaDemo } from '../../_panel-vivo/DemoDelPanel'
import type { EncuadreDeCaptura } from './contenido'

// ── Los módulos ────────────────────────────────────────────────────────────

/** De qué lado va cada módulo, en el orden de `TARJETAS`: el 1 a la derecha, el 2 a la izquierda, el 3 a la derecha. */
export type Lado = 'derecha' | 'izquierda'
export const LADOS: readonly Lado[] = ['derecha', 'izquierda', 'derecha']

/** La pantalla de panel a la que se dibuja cada maqueta (px): con la barra lateral (desde 860 la lleva), a la proporción del marco. */
export const PANTALLA_DEL_MODULO: PantallaDeLaDemo = { ancho: 920, alto: 700 }

/**
 * EL ANCHO DEL MÓDULO, en % del ancho útil: un poco más chico que las demos de antes (del 42 al 56 %). En el escritorio
 * angosto (de 1024 a 72rem de contenido) un poco más ancho, para que la maqueta se siga leyendo (a 1024, a 0,63). Con
 * tope de alto en `svh`: en una pantalla baja el módulo no se come el cuadro.
 */
export const MODULO = { ancho: 52, anchoAngosto: 60, altoMaximo: 64 } as const

/** El contenido desde el que el módulo toma su ancho de escritorio ancho (px): `@6xl`, 72rem. */
export const CONTENIDO_ANCHO = 1152

/** Abajo de 1024 el módulo va a todo el ancho, con tope de alto (la tablet): `--modulo-maximo-angosto`, en svh. */
export const ALTO_MAXIMO_ANGOSTO = 70

/** El ancho del módulo (px) con un ancho útil y un alto de ventana dados (escritorio). */
export function anchoDelModulo(anchoUtil: number, altoVentana: number): number {
  const fraccion = anchoUtil >= CONTENIDO_ANCHO ? MODULO.ancho : MODULO.anchoAngosto
  const porAlto = ((MODULO.altoMaximo / 100) * altoVentana * PANTALLA_DEL_MODULO.ancho) / PANTALLA_DEL_MODULO.alto
  return Math.min((fraccion / 100) * anchoUtil, porAlto)
}

/** El alto del módulo (px): el marco tiene la proporción de su pantalla. */
export const altoDelModulo = (anchoUtil: number, altoVentana: number): number => (anchoDelModulo(anchoUtil, altoVentana) * PANTALLA_DEL_MODULO.alto) / PANTALLA_DEL_MODULO.ancho

/** Con qué escala se ve la maqueta: el ancho del módulo sobre el de su pantalla. */
export const escalaDeLaDemo = (anchoUtil: number, altoVentana: number): number => anchoDelModulo(anchoUtil, altoVentana) / PANTALLA_DEL_MODULO.ancho

// ── La tipografía ──────────────────────────────────────────────────────────

/**
 * EL TÍTULO, de lado a lado: «EL PANEL DONDE CONTROLÁS» mide 9,69 em en la cara de display (el `hmtx` de la instancia por
 * defecto, con el interletrado) y ~9,83 en la 700 que se pinta (la razón medida de «TU NEGOCIO VENDIENDO»: 8,19 contra
 * 8,075). El tamaño es el ancho útil sobre 10,1 —un 2,8 % de margen— con tope en `svh`: dos renglones nunca pasan del
 * 27 % del alto. `s6-tu-panel` rehace la cuenta contra el binario.
 */
export const TIPO = {
  divisorDelTitulo: 10.1,
  topeDelTitulo: 15,
  interlineado: 0.9,
  /** La palabra fundida: el ancho de su columna sobre esto («RESULTADOS», la más larga, mide 4,4 em). */
  divisorDeLaPalabra: 4.8,
  /** En el teléfono, mucho más discreta: el ancho útil sobre esto. */
  divisorDeLaPalabraAngosta: 7,
  /** El grosor del subrayado de «TODO», en em. */
  grosorDelSubrayado: 0.055,
} as const

/** El tamaño del título (px). */
export const tamanoDelTitulo = (anchoUtil: number, altoVentana: number): number => Math.min(anchoUtil / TIPO.divisorDelTitulo, (TIPO.topeDelTitulo / 100) * altoVentana)

/** El alfa de la palabra fundida: la tinta sobre el papel al 1,0595:1 de las palabras del fondo de antes (el «What's new» de nk). */
export const ALFA_DE_LA_PALABRA = 0.0285

// ── El ritmo ───────────────────────────────────────────────────────────────

/** Los tramos del escritorio, en svh. El respiro arranca en `respiroMinimo` y crece hasta llenar los 700svh. */
export const RITMO = { aireArriba: 30, respiroMinimo: 40, entreFilas: 100, cta: 100 } as const

/** Abajo de 1024, en svh: la sección mide lo que suma. */
export const RITMO_ANGOSTO = { respiro: 16, entreFilas: 14 } as const

/**
 * Lo que mide la sección en escritorio SIN el respiro que crece (px): el aire de arriba, los dos renglones del título, el
 * respiro mínimo, los tres módulos con sus dos uniones, la unión con el CTA y el CTA. Tiene que entrar en la tabla.
 */
export function altoNaturalEnEscritorio(anchoUtil: number, altoVentana: number): number {
  const svh = altoVentana / 100
  const titulo = 2 * TIPO.interlineado * tamanoDelTitulo(anchoUtil, altoVentana)
  const modulos = 3 * altoDelModulo(anchoUtil, altoVentana) + 3 * RITMO.entreFilas * svh
  return (RITMO.aireArriba + RITMO.respiroMinimo + RITMO.cta) * svh + titulo + modulos
}

/** Las variables que leen las clases de la sección, todas del dato. `alto` es el de la tabla (`secciones.ts`). */
export function variablesDeLaSeccion(alto: string): CSSProperties {
  const { ancho, alto: altoDeLaPantalla } = PANTALLA_DEL_MODULO
  const tope = `calc(${MODULO.altoMaximo}svh * ${ancho} / ${altoDeLaPantalla})`
  return {
    '--alto-de-la-tabla': alto,
    '--aire-arriba': `${RITMO.aireArriba}svh`,
    '--respiro': `${RITMO.respiroMinimo}svh`,
    '--entre-filas': `${RITMO.entreFilas}svh`,
    '--medio-entre-filas': `${RITMO.entreFilas / 2}svh`,
    '--respiro-angosto': `${RITMO_ANGOSTO.respiro}svh`,
    '--entre-filas-angosto': `${RITMO_ANGOSTO.entreFilas}svh`,
    '--modulo-ancho': `min(${MODULO.ancho}%, ${tope})`,
    '--modulo-angosto': `min(${MODULO.anchoAngosto}%, ${tope})`,
    '--modulo-maximo-angosto': `calc(${ALTO_MAXIMO_ANGOSTO}svh * 4 / 5)`,
    '--proporcion': `${ancho} / ${altoDeLaPantalla}`,
    '--divisor-del-titulo': String(TIPO.divisorDelTitulo),
    '--tope-del-titulo': `${TIPO.topeDelTitulo}svh`,
    '--divisor-de-la-palabra': String(TIPO.divisorDeLaPalabra),
    '--divisor-de-la-palabra-angosta': String(TIPO.divisorDeLaPalabraAngosta),
    '--grosor-del-subrayado': `${TIPO.grosorDelSubrayado}em`,
    '--medida-de-la-bajada': `${40}rem`,
    '--ancho-del-formulario': `${26}rem`,
  } as CSSProperties
}

// ── Las clases ─────────────────────────────────────────────────────────────

/** La fila: abajo de 1024 en columna (el grupo y después el módulo); desde 1024, dos columnas con el módulo de su lado. */
export const CLASE_DE_LA_FILA: Readonly<Record<Lado, string>> = {
  derecha: 'flex flex-col gap-[var(--spacing-8)] escritorio:grid escritorio:grid-cols-[1fr_var(--modulo-angosto)] escritorio:gap-x-[var(--spacing-20)] escritorio:@6xl:grid-cols-[1fr_var(--modulo-ancho)]',
  izquierda: 'flex flex-col gap-[var(--spacing-8)] escritorio:grid escritorio:grid-cols-[var(--modulo-angosto)_1fr] escritorio:gap-x-[var(--spacing-20)] escritorio:@6xl:grid-cols-[var(--modulo-ancho)_1fr]',
}

/** Dónde va el módulo en la fila (desde 1024). */
export const CLASE_DEL_MODULO: Readonly<Record<Lado, string>> = {
  derecha: 'escritorio:col-start-2 escritorio:row-start-1',
  izquierda: 'escritorio:col-start-1 escritorio:row-start-1',
}

/** Dónde va el grupo (palabra, título y descripción): del lado opuesto. */
export const CLASE_DEL_GRUPO: Readonly<Record<Lado, string>> = {
  derecha: 'escritorio:col-start-1 escritorio:row-start-1',
  izquierda: 'escritorio:col-start-2 escritorio:row-start-1',
}

/**
 * [B6] `?grupo=final|union` — la posición vertical del grupo, desde 1024: a la altura del FINAL de su módulo (su pie, al
 * del módulo) o en la UNIÓN con el siguiente (su centro, en la mitad del aire entre los dos). El defecto es `final`.
 */
export type PosicionDelGrupo = 'final' | 'union'
export const CLASE_DE_LA_POSICION: Readonly<Record<PosicionDelGrupo, string>> = {
  final: 'escritorio:self-end',
  union: 'escritorio:self-end escritorio:translate-y-[calc(50%+var(--medio-entre-filas))]',
}

/**
 * [B6] `?palabra-movil=union|debajo` — la palabra fundida abajo de 1024, mucho más discreta: en la UNIÓN (en el aire de
 * arriba de su título, en el flujo) o DEBAJO del título (detrás, centrada en él). El defecto es `union`. Desde 1024, arriba
 * del título, en el flujo, en los dos casos.
 */
export type PalabraEnElTelefono = 'union' | 'debajo'
export const CLASE_DE_LA_PALABRA: Readonly<Record<PalabraEnElTelefono, string>> = {
  union: 'text-[length:calc(100cqw/var(--divisor-de-la-palabra-angosta))] escritorio:text-[length:calc(100cqw/var(--divisor-de-la-palabra))]',
  debajo: 'max-escritorio:absolute max-escritorio:inset-x-0 max-escritorio:top-0 max-escritorio:-z-10 text-[length:calc(100cqw/var(--divisor-de-la-palabra-angosta))] escritorio:text-[length:calc(100cqw/var(--divisor-de-la-palabra))]',
}

/** El anclaje horizontal de cada captura de respaldo (el marco le recorta los costados). Clases enteras. */
export const CLASE_DE_ENCUADRE: Readonly<Record<EncuadreDeCaptura, string>> = {
  izquierda: 'object-left-top',
  centro: 'object-top',
  derecha: 'object-right-top',
}

// ── El alto de antes, abajo de 1024 (REGLA DE ALTURAS) ─────────────────────

/**
 * EL MODELO DEL ALTO VIEJO, abajo de 1024 (px): la sección de antes en su columna, sumada pieza por pieza desde su código
 * (`git show 492bd7d6:…/tu-panel/`): el relleno de arriba y de abajo y el hueco entre la galería y el remate (`--spacing-20`
 * tres veces), el encabezado («Tu Panel» en `titulo-xl` y su descripción), las ocho features en columna (el marco a 4:5 del
 * ancho, su título y su rótulo, con 70 px entre una y otra) y el remate («Y más…» y el newsletter). Es una estimación con
 * las cajas de texto modeladas: sin calibrar daba 5,94 pantallas a 390 × 844; con el ajuste medido (`AJUSTE_MEDIDO`, abajo), 5,80.
 * Lo calibró el orquestador contra la sección vieja medida en el navegador en cuatro anchos.
 */
export function altoViejoAngosto(anchoUtil: number): number {
  const telefono = anchoUtil < 600
  const encabezado = telefono ? 130 : 116
  const tituloDeFeature = telefono ? 74 : 59
  const remate = telefono ? 250 : 242
  const features = 8 * (1.25 * anchoUtil + tituloDeFeature) + 7 * 70
  return 3 * 80 + encabezado + 48 + features + remate + (telefono ? AJUSTE_MEDIDO.telefono : AJUSTE_MEDIDO.tablet)
}

/**
 * [NOCTURNO] El modelo, calibrado contra la sección vieja MEDIDA en el navegador (la integración antes de B6, el dev): 4893 px a
 * 390 × 844 (ancho útil 326), 8584 a 768 × 1024 (704), 9111 a 820 × 1180 (756) y 11169 a 1023 × 768 (959). Sin el ajuste daba
 * de más 117, 64, 57 y 29 px; con él, 0, 14, 7 y −21.
 */
export const ALTOS_VIEJOS_MEDIDOS: readonly (readonly [number, number])[] = [[326, 4893], [704, 8584], [756, 9111], [959, 11169]]
const AJUSTE_MEDIDO = { telefono: -117, tablet: -50 } as const
