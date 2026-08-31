/**
 * LA PASTILLA FLOTANTE — el umbral, derivado de NUESTRA composición.
 *
 * ── Por qué 792 no entra al repo ───────────────────────────────────────────
 *
 * La referencia mide `top: 816` al inicio y `top: 24` al final, con el umbral
 * confirmado por búsqueda binaria en **792 px**: a 791 el `top` es 25 y a 792
 * es 24. La relación es exacta, `top = 816 − scrollY`, y 816 − 792 = 24.
 *
 * Pero **816 es su héroe, no el nuestro**. Ese número es "el alto de su
 * viewport de captura menos lo que su pastilla deja abajo", con SU alto de
 * pastilla y SU margen. Copiarlo sería fijar nuestra navegación a la geometría
 * de una captura ajena a 1440×900. Si mañana medimos en otro alto, el número
 * copiado queda mal y el derivado no.
 *
 * ── De dónde sale el nuestro ───────────────────────────────────────────────
 *
 * De tres tokens del sistema y una regla de simetría:
 *
 *   reposo      = --spacing-6                       =  24px
 *   alto        = 2 × --spacing-3                            (relleno vertical)
 *               + --text-cuerpo × --leading-texto            (la caja de línea)
 *               = 24 + 24                           =  48px
 *   margen-pie  = --spacing-6                       =  24px   ← la simetría
 *   nacimiento  = 100svh − margen-pie − alto        = 100svh − 72px
 *   UMBRAL      = nacimiento − reposo               = 100svh − 96px
 *
 * La simetría es la decisión: la pastilla se separa del borde inferior lo
 * mismo que después se va a separar del superior. No está medida en la
 * referencia —es nuestra— y por eso está escrita acá y no escondida en el CSS.
 *
 * A un viewport de 900px —el de sus capturas, para poder comparar— eso da
 * **804 px**. Su 792 y nuestro 804 se parecen porque los dos son "casi una
 * pantalla", y difieren en 12px porque su pastilla mide 56 y la nuestra 48.
 *
 * ── El mecanismo no toca el scroll ─────────────────────────────────────────
 *
 * Es `position: sticky` con un `top` NEGATIVO igual a −umbral, y la pastilla
 * `absolute` adentro, a `top: nacimiento`. La aritmética se cierra sola:
 *
 *   mientras scrollY < umbral   el envoltorio fluye  → pastilla en
 *                               nacimiento − scrollY
 *   cuando  scrollY ≥ umbral    el envoltorio se pega → pastilla en reposo
 *
 * Que es exactamente `top = nacimiento − scrollY` hasta topar en `reposo`, la
 * misma curva que ellos miden. **Sin un listener, sin JavaScript y sin nada
 * atado al scroll**: es geometría de `sticky`. No depende del sprint de motion.
 *
 * ⚠ `sticky` se apaga en silencio si cualquier ancestro tiene `overflow`
 * distinto de `visible`. La cadena de /v3 ya está verificada limpia por S1
 * (ver `PanelPinneado.tsx`); quien agregue un `overflow-hidden` arriba rompe
 * esto sin un solo error en consola.
 */

/** Los tres tokens que entran en la cuenta, con su valor declarado en S0.
 *  El instrumento los relee de `theme-develop.css`: si alguno cambia, la
 *  cuenta de acá tiene que moverse con él o el invariante falla. */
export const TOKENS_DEL_UMBRAL = {
  reposo: { token: '--spacing-6', px: 24 },
  rellenoVertical: { token: '--spacing-3', px: 12 },
  tamanoDeTexto: { token: '--text-cuerpo', px: 15 },
  interlineado: { token: '--leading-texto', factor: 1.6 },
  margenAlPie: { token: '--spacing-6', px: 24 },
} as const

/** Alto de la pastilla: relleno arriba y abajo más la caja de línea. */
export const ALTO_PASTILLA_PX =
  2 * TOKENS_DEL_UMBRAL.rellenoVertical.px +
  TOKENS_DEL_UMBRAL.tamanoDeTexto.px * TOKENS_DEL_UMBRAL.interlineado.factor

/** Cuánto se descuenta de `100svh` para ubicar el nacimiento. */
export const DESCUENTO_NACIMIENTO_PX = TOKENS_DEL_UMBRAL.margenAlPie.px + ALTO_PASTILLA_PX

/**
 * DÓNDE TERMINA LA PASTILLA EN REPOSO — o sea **cuánto tiene que despejar un
 * ancla para no aterrizar debajo de ella**. Es el `scroll-padding-top` de /v3,
 * y lo declara `_estilos/navegacion.css` con estos mismos cuatro tokens.
 *
 * ⚠ Da el mismo número que `DESCUENTO_NACIMIENTO_PX` y **no es el mismo dato**:
 * aquél es margen-al-pie + alto y éste es reposo + alto. Coinciden porque los
 * dos márgenes son `--spacing-6`, que es la simetría que este archivo declara
 * arriba. Si alguien rompe la simetría, los dos números se separan solos.
 */
export const BORDE_INFERIOR_EN_REPOSO_PX = TOKENS_DEL_UMBRAL.reposo.px + ALTO_PASTILLA_PX

/** Cuánto se descuenta de `100svh` para obtener el umbral. */
export const DESCUENTO_UMBRAL_PX = DESCUENTO_NACIMIENTO_PX + TOKENS_DEL_UMBRAL.reposo.px

/** El umbral evaluado a un alto de viewport dado. */
export function umbralPx(altoDeViewport: number): number {
  return altoDeViewport - DESCUENTO_UMBRAL_PX
}

/** El alto del viewport de SUS capturas. Está acá sólo para poder comparar
 *  nuestro número contra el suyo en el reporte, no porque gobierne nada. */
export const ALTO_DE_VIEWPORT_DE_LA_REFERENCIA = 900

/** Lo que ellos midieron, para el contraste. [medido, COMPONENTS.md §5.2] */
export const UMBRAL_DE_LA_REFERENCIA = { nacimientoPx: 816, reposoPx: 24, umbralPx: 792 } as const

/** El hover de los enlaces. [medido, COMPONENTS.md §3.2] */
export const HOVER_DE_ENLACE_MEDIDO = {
  desplazamientoPx: 8,
  marcadorEscala: 0.8,
  marcadorDesplazamientoPx: -16,
  duracionMs: 500,
  retardoEnReposoMs: 40,
} as const

export interface EnlaceDeNavegacion {
  readonly id: string
  readonly rotulo: string
  readonly destino: string
}

/**
 * Los cinco enlaces, en marcador de posición.
 *
 * ⚠ NO son el menú del sitio: los rótulos y los destinos vienen con el
 * contenido, que este sprint no tiene. Son cinco porque cinco son los `<a>` de
 * navegación de escritorio que la medición encuentra montados arriba de 1025
 * en las seis páginas, con la misma ruta terminal. Sirven para que la pastilla
 * tenga la densidad real y no una de juguete.
 */
export const ENLACES_DE_MUESTRA: readonly EnlaceDeNavegacion[] = [
  { id: 'quienes-somos', rotulo: 'Quiénes somos', destino: '#quienes-somos' },
  { id: 'trabajos', rotulo: 'Trabajos', destino: '#trabajos' },
  { id: 'servicios', rotulo: 'Servicios', destino: '#servicios' },
  { id: 'por-que-develop', rotulo: 'Por qué develOP', destino: '#por-que-develop' },
  { id: 'cierre', rotulo: 'Contacto', destino: '#cierre' },
]
