/**
 * EL SISTEMA DE MARCA — logotipo, separador y prefijo, como DATO.
 *
 * ⚠ **Por qué existe (B3, Parte 2).** El diagnóstico de Franco: «lo que lo haría
 * funcionar es el SISTEMA, no el objeto — logotipo, separador, prefijo y objeto
 * operando como conjunto». develOP hoy tiene **el logotipo** (la palabra
 * «develOP») **y el objeto 3D** (el infinito de la escena), y por eso la marca se
 * lee como un símbolo suelto. Faltan los otros dos registros: el **separador** y
 * el **prefijo de servicio**. Este bloque los construye.
 *
 * ── LO QUE SE MIDIÓ EN LA REFERENCIA, Y NO SE COPIÓ ────────────────────────
 *
 * Una navegación a nk, censo de dónde aparece su marca y en qué registro:
 * su logotipo es **`/nk ®`**, y el **`/`** reaparece como pieza que estructura lo
 * que sigue —`/Home`, `/Branding`, `/nk.news`—. O sea: un logotipo, un glifo que
 * marca la relación (el `/`), y el mismo glifo como prefijo de sección. Ésa es la
 * FORMA del sistema —logotipo + separador + prefijo— y es lo único que se toma.
 * **El glifo `/` es de nk y no se copia**: develOP tiene su propio vocabulario
 * —el punto medio `·` que ya usa el pie, y la regla de 1px del sistema (`DESIGN.md`,
 * «reglas de 1px que dividen»)—, y de ahí salen sus dos registros.
 *
 * ── LOS TRES REGISTROS, CON SUS TOKENS ─────────────────────────────────────
 *
 * - **Logotipo** — la palabra «develOP», en Chivo. Ya existía como texto suelto;
 *   acá es una pieza con nombre para que sea el MISMO logotipo en todos lados.
 * - **Separador** — una regla de 1px (`--color-borde`), el divisor del sistema,
 *   que marca la relación entre el logotipo y lo que lo sigue. No inventa un
 *   glifo nuevo: usa el trazo que el sistema ya declara.
 * - **Prefijo de servicio** — una marca de RELLENO en `--color-acento` (el
 *   ALIAS, que se retiñe por `data-servicio`), que convierte el código de color
 *   en estructura. Es «el logo tomando el acento del servicio» de §5.2 de
 *   `DIRECCION-ESCENA.md`, aceptado: en la home vale el acento por defecto (web),
 *   y en una subpágina de servicio se retiñe solo. **Va como relleno y nunca como
 *   texto**, porque sobre la sección invertida los tres acentos dan 2,71 · 2,99 ·
 *   2,46 —ni AA ni el 3:1 de un componente— (`theme-develop.css`).
 *
 * ── INSTRUMENT SERIF — LA PROPUESTA, CON SU RAZÓN (no se carga acá) ─────────
 *
 * El sistema reserva **una sola aparición** de Instrument Serif y todavía no se
 * decidió dónde (`S1-esqueleto`, `SITIO-S3-chrome`, `V3-C`). **Propongo que su
 * lugar sea el separador**, y la razón es exactamente la del diagnóstico: el
 * separador es la pieza que declara que hay un SISTEMA y no un símbolo suelto, así
 * que un único toque editorial —una familia distinta, en una sola pieza que
 * aparece junto al logotipo— es lo que más «sistema» comunica por el menor gasto.
 * Es además el registro que la referencia resuelve con un glifo propio (`/`), y
 * darle a develOP su glifo en una serif de lujo es la traducción, no la copia.
 *
 * **NO se carga en este bloque**, por dos reglas del sprint: «sin dependencias
 * nuevas» —el `.woff2` no está en el repo— y «la tipografía cerrada, Chivo y Chivo
 * Mono». El separador se entrega en la regla de 1px del sistema, con el HUECO
 * declarado abajo para que la decisión de cargar Instrument Serif se tome con su
 * costo a la vista (un `.woff2` latino subsetteado + un `next/font/local` en
 * `layout.tsx`, del orden de 15–25 KiB, una sola familia, una sola aparición). No
 * se usa en dos lados: si el separador la toma, es su ÚNICA aparición.
 */

/** El atributo con el que los instrumentos agarran una pieza de marca. */
export const ATRIBUTO_DE_MARCA = 'data-pieza'

/** El logotipo, como texto. Es la palabra de la marca, sin transformar. */
export const LOGOTIPO = 'develOP'

/**
 * El token que el prefijo consume: el ALIAS del acento, nunca un color concreto.
 * Escribir `--color-acento-web` funcionaría en la home y rompería el retiñido por
 * contexto — la misma regla que `_secciones/_contrato/acento.ts` custodia.
 */
export const ALIAS_DE_ACENTO = '--color-acento'

/** Las clases del prefijo. RELLENO, la forma que vale en los dos temas. */
export const CLASE_PREFIJO = 'bg-acento'

/** La clase del separador: la regla de 1px del sistema. */
export const CLASE_SEPARADOR = 'bg-borde'

/**
 * LA PROPUESTA DE INSTRUMENT SERIF, escrita como dato para que la decisión sea de
 * una línea y con su costo. No se carga: es una propuesta, no una dependencia.
 */
export const INSTRUMENT_SERIF_PROPUESTA = {
  registro: 'separador',
  razon:
    'el separador es la pieza que declara el sistema; una sola aparición editorial junto al logotipo ' +
    'es lo que mas "sistema" comunica por el menor gasto, y es el registro que la referencia resuelve ' +
    'con un glifo propio.',
  cargadaHoy: false,
  costoSiSeCarga: 'un .woff2 latino subsetteado (~15-25 KiB) + un next/font/local en layout.tsx',
  usoMaximo: 'UNA sola aparicion en todo el sitio (regla del sistema)',
} as const
