/**
 * LA GEOMETRÍA DE TU PANEL — [B6] el título, tres módulos alternados y el CTA, en números.
 *
 * Todo lo que mide va acá como DATO y entra a las clases por variables (`variablesDeLaSeccion`): las clases leen
 * `var(--…)` y ninguna lleva un valor a mano. [C2 60b] La sección mide su CONTENIDO en todo ancho (los espacios se achicaron:
 * ítem 15; ya no hay un respiro que crece hasta los 700svh de la tabla) y se anota a la escena como un tramo (`tramo.ts`,
 * REGLA DE ALTURAS: la tabla de secciones no se toca y la escena sigue viendo los 700svh de antes).
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
 *
 * [C2 60b] Abajo de 1024, más grande y en tres renglones: lo manda el más ancho, «EL PANEL DONDE» (5,58 em en la 700), con el
 * mismo 2,8 % de margen; con tope de 10svh (en la tablet, los tres renglones no pasan del 27 % del alto).
 */
export const TIPO = {
  divisorDelTitulo: 10.1,
  topeDelTitulo: 15,
  divisorDelTituloAngosto: 5.74,
  topeDelTituloAngosto: 10,
  interlineado: 0.9,
  /** La palabra fundida de los módulos desde 1024: el ancho de su columna sobre esto («RESULTADOS», la más larga, mide 4,4 em). */
  divisorDeLaPalabra: 4.8,
  /** [C2 60b] La palabra pálida del título: desde 1024 «LO QUE NOS DISTINGUE» en un renglón (7,67 em) de lado a lado. */
  divisorDeLaPalabraDelTitulo: 7.9,
  /** [C2 60b] Abajo de 1024, en dos renglones: lo manda «LO QUE NOS» (3,94 em). */
  divisorDeLaPalabraDelTituloAngosta: 4.06,
  /** El grosor del subrayado de «TODO», en em. */
  grosorDelSubrayado: 0.055,
} as const

/** El tamaño del título (px). */
export const tamanoDelTitulo = (anchoUtil: number, altoVentana: number): number => Math.min(anchoUtil / TIPO.divisorDelTitulo, (TIPO.topeDelTitulo / 100) * altoVentana)

/**
 * [C2 60b] El tamaño del título abajo de 1024 (px): el angosto, nunca menos que el de antes (en un teléfono acostado el tope de
 * 10svh lo achicaría; ahí manda el de escritorio, que ya entra de lado a lado en un renglón más largo).
 */
export const tamanoDelTituloAngosto = (anchoUtil: number, altoVentana: number): number => Math.max(tamanoDelTitulo(anchoUtil, altoVentana), Math.min(anchoUtil / TIPO.divisorDelTituloAngosto, (TIPO.topeDelTituloAngosto / 100) * altoVentana))

/**
 * [C2 60b] ABAJO DE 1024 CADA PALABRA FUNDIDA OCUPA EL ANCHO DE LA SECCIÓN (`?palabra-movil=debajo`, ahora el producto): su
 * ancho en em en la 700 (medido contra el binario por `s6-tu-panel`) por un 3 % de margen es el divisor de su tamaño.
 */
export const EM_DE_LA_PALABRA: Readonly<Record<string, number>> = { Clientes: 3.24, Resultados: 4.46, Chatbot: 3.23 }
export const MARGEN_DE_LA_PALABRA = 1.03
export const divisorDeLaPalabraAngosta = (palabra: string): number => Number(((EM_DE_LA_PALABRA[palabra] ?? EM_DE_LA_PALABRA.Resultados) * MARGEN_DE_LA_PALABRA).toFixed(3))

/** El alfa de la palabra fundida: la tinta sobre el papel al 1,0595:1 de las palabras del fondo de antes (el «What's new» de nk). */
export const ALFA_DE_LA_PALABRA = 0.0285

/** [C2 60b] Abajo de 1024, más notoria («en el móvil no se ve mucho»): al 1,13:1, sin dejar de ser pálida. */
export const ALFA_DE_LA_PALABRA_ANGOSTA = 0.06

// ── El ritmo ───────────────────────────────────────────────────────────────

/**
 * Los tramos del escritorio, en svh. [C2 60b] Ítem 15: menos aire entre el título y el primer módulo (era un respiro que
 * crecía hasta llenar la tabla: 61svh a 1440 × 900), mucho menos entre módulos (era una pantalla entera) y menos antes del
 * CTA (era otra pantalla). Ya no crece nada: la sección mide lo que suma.
 */
export const RITMO = { aireArriba: 30, respiro: 16, entreFilas: 18, antesDelCta: 6 } as const

/** Abajo de 1024, en svh: la sección mide lo que suma. */
export const RITMO_ANGOSTO = { respiro: 16, entreFilas: 14 } as const

/**
 * [C2 60b] LO QUE MIDE LA SECCIÓN EN ESCRITORIO (px), sumada: el aire de arriba, los dos renglones del título, el respiro, los
 * tres módulos (cada fila mide su módulo: el grupo es más bajo) con sus dos uniones, la unión con el CTA y el CTA (una
 * pantalla, salvo que se diga otra cosa). Es el modelo del reporte; la escena usa lo MEDIDO (`tramo.ts`).
 */
export function altoEnEscritorio(anchoUtil: number, altoVentana: number, altoDelCta: number = altoVentana): number {
  const svh = altoVentana / 100
  const titulo = 2 * TIPO.interlineado * tamanoDelTitulo(anchoUtil, altoVentana)
  const aire = (RITMO.aireArriba + RITMO.respiro + 2 * RITMO.entreFilas + RITMO.antesDelCta) * svh
  return aire + titulo + 3 * altoDelModulo(anchoUtil, altoVentana) + altoDelCta
}

/**
 * [C2 60b] EL ALTO DEL `<section>` EN EL DOCUMENTO: su contenido. `Panel` le pone de piso el alto de la tabla; la tabla no se
 * toca (la escena lo sigue leyendo), así que la sección se monta con ese piso en `auto` y el tramo descuenta la diferencia.
 */
export const ALTO_EN_EL_DOCUMENTO = 'auto'

/** Las variables que leen las clases de la sección, todas del dato. */
export function variablesDeLaSeccion(): CSSProperties {
  const { ancho, alto: altoDeLaPantalla } = PANTALLA_DEL_MODULO
  const tope = `calc(${MODULO.altoMaximo}svh * ${ancho} / ${altoDeLaPantalla})`
  return {
    '--aire-arriba': `${RITMO.aireArriba}svh`,
    '--respiro': `${RITMO.respiro}svh`,
    '--entre-filas': `${RITMO.entreFilas}svh`,
    '--antes-del-cta': `${RITMO.antesDelCta}svh`,
    '--respiro-angosto': `${RITMO_ANGOSTO.respiro}svh`,
    '--entre-filas-angosto': `${RITMO_ANGOSTO.entreFilas}svh`,
    '--modulo-ancho': `min(${MODULO.ancho}%, ${tope})`,
    '--modulo-angosto': `min(${MODULO.anchoAngosto}%, ${tope})`,
    '--modulo-maximo-angosto': `calc(${ALTO_MAXIMO_ANGOSTO}svh * 4 / 5)`,
    '--proporcion': `${ancho} / ${altoDeLaPantalla}`,
    '--divisor-del-titulo': String(TIPO.divisorDelTitulo),
    '--tope-del-titulo': `${TIPO.topeDelTitulo}svh`,
    '--divisor-del-titulo-angosto': String(TIPO.divisorDelTituloAngosto),
    '--tope-del-titulo-angosto': `${TIPO.topeDelTituloAngosto}svh`,
    '--divisor-de-la-palabra': String(TIPO.divisorDeLaPalabra),
    '--divisor-de-la-palabra-del-titulo': String(TIPO.divisorDeLaPalabraDelTitulo),
    '--divisor-de-la-palabra-del-titulo-angosta': String(TIPO.divisorDeLaPalabraDelTituloAngosta),
    '--alfa-de-la-palabra': String(ALFA_DE_LA_PALABRA),
    '--alfa-de-la-palabra-angosta': String(ALFA_DE_LA_PALABRA_ANGOSTA),
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

/**
 * Dónde va el grupo (palabra, título y descripción): del lado opuesto, y a la altura del FINAL de su módulo (su pie, al del
 * módulo). [C2 60b] Era `?grupo=final|union`: Valentino eligió `final` y `union` se borró (con la bandera).
 */
export const CLASE_DEL_GRUPO: Readonly<Record<Lado, string>> = {
  derecha: 'escritorio:col-start-1 escritorio:row-start-1 escritorio:self-end',
  izquierda: 'escritorio:col-start-2 escritorio:row-start-1 escritorio:self-end',
}

/**
 * LA PALABRA FUNDIDA. Desde 1024, arriba del título, en el flujo, al ancho de su columna sobre `divisorDeLaPalabra`. [C2 60b]
 * Abajo de 1024 DEBAJO del título (detrás, era `?palabra-movil=debajo`: ahora el producto, `union` se borró con la bandera),
 * del ancho de la sección (su divisor, `--divisor-de-esta-palabra`, lo pone la fila) y más notoria; subida un cuarto de su
 * alto para quedar centrada en el título y no en la descripción.
 */
export const CLASE_DE_LA_PALABRA =
  'max-escritorio:absolute max-escritorio:inset-x-0 max-escritorio:top-0 max-escritorio:-z-10 max-escritorio:-translate-y-1/4 text-[length:calc(100cqw/var(--divisor-de-esta-palabra))] escritorio:text-[length:calc(100cqw/var(--divisor-de-la-palabra))] opacity-[var(--alfa-de-la-palabra-angosta)] escritorio:opacity-[var(--alfa-de-la-palabra)]'

/**
 * [C2 60b] LA PALABRA PÁLIDA DEL TÍTULO: detrás de él, centrada en su caja, de lado a lado (un renglón desde 1024, dos abajo),
 * con el alfa de las palabras fundidas.
 */
export const CLASE_DE_LA_PALABRA_DEL_TITULO =
  'pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none whitespace-nowrap text-center font-display font-fuerte uppercase leading-cartel tracking-display text-tinta text-[length:calc(100cqw/var(--divisor-de-la-palabra-del-titulo-angosta))] escritorio:text-[length:calc(100cqw/var(--divisor-de-la-palabra-del-titulo))] opacity-[var(--alfa-de-la-palabra-angosta)] escritorio:opacity-[var(--alfa-de-la-palabra)]'

/** [C2 60b] El título abajo de 1024: más grande (su divisor y su tope, nunca menos que el de antes), en sus tres renglones. */
export const CLASE_DEL_TITULO_ANGOSTO =
  'max-escritorio:text-[length:max(min(calc(100cqw/var(--divisor-del-titulo)),var(--tope-del-titulo)),min(calc(100cqw/var(--divisor-del-titulo-angosto)),var(--tope-del-titulo-angosto)))]'

/**
 * [C2 60b] Los títulos de los módulos abajo de 1024: distintos del cuerpo (que es Chivo, 15 px, en tinta media) y del título
 * general (Archivo en mayúsculas, a 700): la cara de display del sitio en minúsculas, a 600 y más grandes (`titulo-l` fluido).
 */
export const CLASE_DEL_TITULO_DEL_MODULO = 'max-escritorio:font-display max-escritorio:font-semi max-escritorio:text-fluido-titulo-l max-escritorio:leading-titulo max-escritorio:tracking-display'

/** El anclaje horizontal de cada captura de respaldo (el marco le recorta los costados). Clases enteras. */
export const CLASE_DE_ENCUADRE: Readonly<Record<EncuadreDeCaptura, string>> = {
  izquierda: 'object-left-top',
  centro: 'object-top',
  derecha: 'object-right-top',
}

// ── El alto de antes (REGLA DE ALTURAS) ────────────────────────────────────

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

/**
 * [C2 60b] EL ALTO DE ANTES QUE LA ESCENA SIGUE VIENDO (px), en todo ancho: desde 1024 (`escritorio`) la sección medía exacto
 * la tabla (`pantallasDeLaTabla` pantallas: el banco de B6 midió 7,00); abajo, el modelo calibrado de la sección de antes de B6.
 */
export function altoViejo(escritorio: boolean, anchoUtil: number, altoDeLaVentana: number, pantallasDeLaTabla: number): number {
  return escritorio ? pantallasDeLaTabla * altoDeLaVentana : altoViejoAngosto(anchoUtil)
}
