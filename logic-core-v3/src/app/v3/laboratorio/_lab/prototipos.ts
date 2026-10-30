/**
 * [L7e] El padrón del laboratorio: cada prototipo con su ruta, la página para la que se pensó, qué mirar y de qué mecánica del home sale.
 * Lo leen el índice (`/v3/laboratorio`) y la leyenda de cada prototipo. El detalle de cada idea: `docs/ideas/MOMENTOS.md`.
 */

export interface Prototipo {
  readonly slug: string
  /** El código del momento en `MOMENTOS.md` (E1, N1…). */
  readonly codigo: string
  readonly titulo: string
  /** La página real a la que iría. */
  readonly pagina: string
  /** Qué mirar, en una línea. */
  readonly mirar: string
  /** De qué pieza o mecánica del home sale. */
  readonly sale: string
}

export const PROTOTIPOS: readonly Prototipo[] = [
  {
    slug: 'no-encaja',
    codigo: 'E1',
    titulo: 'El logo que no encaja',
    pagina: '404',
    mirar: 'El logo cae a su hueco, choca, rebota y queda torcido. Tocalo para que vuelva a intentar.',
    sale: 'EncajeDelLogo con el resultado de error (el de EstadoDeEnvio).',
  },
]

export const prototipo = (slug: string): Prototipo | undefined => PROTOTIPOS.find((p) => p.slug === slug)
