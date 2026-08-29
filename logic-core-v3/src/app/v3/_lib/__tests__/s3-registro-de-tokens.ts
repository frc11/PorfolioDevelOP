/**
 * EL REGISTRO DE PROPIEDADES DE COMPONENTE.
 *
 * ── Qué problema resuelve ─────────────────────────────────────────────────
 *
 * La regla del sprint es cero color, tamaño, radio, duración o curva fuera de
 * los tokens. Pero la coreografía del CTA tiene ángulos de 6° y traslaciones
 * de −33,75px que **no son tokens del sistema y no pueden serlo**: son la
 * forma de un movimiento medido, no una escala. Y `theme-develop.css` no se
 * toca: un token nuevo ahí es una decisión, no un detalle de implementación.
 *
 * La salida es la que el propio sistema ya usa: esos valores viven en
 * propiedades personalizadas de ALCANCE DE COMPONENTE, declaradas en un solo
 * bloque por pieza, y **en el punto de uso no aparece ni un literal**. Todo lo
 * que una declaración normal escribe es `var()` o `calc()` sobre `var()`.
 *
 * Este archivo es el padrón de esas propiedades. `s3-tokens.invariant.ts`
 * afirma que el conjunto declarado en las hojas es EXACTAMENTE éste, con estos
 * valores. Agregar una propiedad de componente sin registrarla acá falla; y
 * registrarla obliga a escribir de dónde sale.
 *
 * ── Las tres etiquetas ────────────────────────────────────────────────────
 *
 * Son las del proyecto, no unas nuevas. `[medido]` sale de un volcado.
 * `[derivado]` es aritmética sobre valores medidos o sobre tokens del sistema,
 * con la cuenta a la vista. `[decidido]` es nuestro, y por eso lleva razón.
 */

export type Evidencia = 'medido' | 'derivado' | 'decidido'

export interface PropiedadDeComponente {
  readonly nombre: string
  /** El valor literal, tal cual está escrito en la hoja. */
  readonly valor: string
  readonly evidencia: Evidencia
  /** De dónde sale. Una línea, obligatoria. */
  readonly procedencia: string
}

export const REGISTRO: readonly PropiedadDeComponente[] = [
  // ── CTA ────────────────────────────────────────────────────────────────
  { nombre: '--cta-giro-salida', valor: '6deg', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.3 — matrix(0.994522, 0.104528, …) es exactamente sen 6°' },
  { nombre: '--cta-salida-x', valor: '20px', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — copia A, traslación en x' },
  { nombre: '--cta-salida-y', valor: '-33.75px', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — copia A, traslación en y' },
  { nombre: '--cta-giro-entrada', valor: '10deg', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.3 — matrix(0.984808, 0.173648, …) es sen 10°' },
  { nombre: '--cta-entrada-x', valor: '-30px', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — copia B, traslación en x' },
  { nombre: '--cta-entrada-y', valor: '24.75px', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — copia B, traslación en y' },
  { nombre: '--cta-recorte-inicial', valor: 'inset(80% 0 0)', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — clip-path de reposo de la copia B' },
  { nombre: '--cta-recorte-final', valor: 'inset(0)', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — clip-path de hover de la copia B' },
  {
    nombre: '--cta-intercambio',
    valor: 'calc(var(--duracion-muy-lenta) + 2 * var(--duracion-rapida))',
    evidencia: 'derivado',
    procedencia: '1,3s medidos = 700 + 2×300, las dos duraciones del sistema. El invariante resuelve la cuenta.',
  },
  {
    nombre: '--cta-subrayado-duracion',
    valor: 'calc(2 * var(--duracion-rapida))',
    evidencia: 'derivado',
    procedencia: '0,6s medidos = 2×300',
  },
  {
    nombre: '--cta-subrayado-retardo',
    valor: 'var(--duracion-media)',
    evidencia: 'derivado',
    procedencia: '0,4s medidos = --duracion-media exacto',
  },
  {
    nombre: '--cta-ventana-reposo',
    valor: 'calc(var(--text-cuerpo) * var(--leading-texto))',
    evidencia: 'derivado',
    procedencia: 'la caja de línea del rollover: 15px × 1,6. Los 24,5 medidos son de SU familia.',
  },
  {
    nombre: '--cta-ventana-hover',
    valor: 'calc(var(--text-cuerpo) * var(--leading-texto) + var(--spacing-1))',
    evidencia: 'derivado',
    procedencia: 'lo que transfiere es la resta: 28,5 − 24,5 = 4,0px exactos = --spacing-1',
  },
  {
    nombre: '--cta-subrayado-alto',
    valor: 'calc(var(--border-hairline) * 3)',
    evidencia: 'derivado',
    procedencia: '3px medidos = tres filetes de --border-hairline',
  },

  // ── Navegación ─────────────────────────────────────────────────────────
  { nombre: '--nav-reposo', valor: 'var(--spacing-6)', evidencia: 'derivado', procedencia: '24px, igual que el reposo medido de la referencia, y token exacto del sistema' },
  {
    nombre: '--nav-alto',
    valor: 'calc(var(--spacing-3) * 2 + var(--text-cuerpo) * var(--leading-texto))',
    evidencia: 'derivado',
    procedencia: 'relleno vertical más caja de línea: 12×2 + 15×1,6 = 48px. La suya mide 56.',
  },
  {
    nombre: '--nav-margen-al-pie',
    valor: 'var(--spacing-6)',
    evidencia: 'decidido',
    procedencia: 'LA SIMETRÍA: se separa del borde inferior lo mismo que después se separa del superior. No está medida.',
  },
  {
    nombre: '--nav-nacimiento',
    valor: 'calc(100svh - var(--nav-margen-al-pie) - var(--nav-alto))',
    evidencia: 'derivado',
    procedencia: 'nuestro equivalente de su top: 816, que es de SU héroe a 1440×900',
  },
  {
    nombre: '--nav-umbral',
    valor: 'calc(var(--nav-nacimiento) - var(--nav-reposo))',
    evidencia: 'derivado',
    procedencia: 'nuestro equivalente de su 792. A 900px de viewport da 804.',
  },
  { nombre: '--nav-retardo-reposo', valor: '40ms', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — transition-delay 0,04s en reposo, 0s en hover' },
  { nombre: '--nav-marcador-escala', valor: '0.8', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — el marcador entra desde scale(0.8)' },
  {
    nombre: '--nav-marcador-desplazamiento',
    valor: 'calc(var(--spacing-4) * -1)',
    evidencia: 'medido',
    procedencia: '−16px medidos, que es --spacing-4 en negativo',
  },

  // ── Cursor ─────────────────────────────────────────────────────────────
  { nombre: '--cursor-nucleo-lado', valor: 'var(--spacing-1)', evidencia: 'medido', procedencia: 'COMPONENTS.md §4.1 — núcleo de 4×4, que es --spacing-1 exacto' },
  {
    nombre: '--cursor-halo-lado',
    valor: 'calc(var(--spacing-8) + var(--spacing-1))',
    evidencia: 'medido',
    procedencia: 'COMPONENTS.md §4.1 — halo de 36×36 = 32 + 4',
  },
  {
    nombre: '--cursor-halo-desenfoque',
    valor: 'calc(var(--blur-panel) / 3)',
    evidencia: 'medido',
    procedencia: 'COMPONENTS.md §4.1 — blur(4px), que es un tercio de la única escala de desenfoque del sistema',
  },
]

/** Índice por nombre, para que el invariante compare sin recorrer. */
export const REGISTRO_POR_NOMBRE = new Map(REGISTRO.map((p) => [p.nombre, p]))
