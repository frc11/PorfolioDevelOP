/**
 * [F5] LA CUENTA DE LAS HISTORIAS, PURA — el invariante que corre el arnés (`historias.ts`) sobre lo grabado cuadro a cuadro: en todo
 * momento se ve el Portfolio entero en un estado válido (el título en la aproximación, las historias adentro) o se ve la sección vecina
 * (Demos); nunca un fondo vacío ni un título huérfano. s76 prueba la cuenta con su control. Sin Playwright.
 */

/** Un cuadro de las historias (rAF): lo que se ve, medido en la página (opacidad efectiva por el área visible). */
export interface CuadroDeLasHistorias {
  readonly t: number
  /** −1 antes del pin, 0…3 adentro, 4 en la cola (`data-paso`). */
  readonly paso: number
  /** La sección del Portfolio ocupa el cuadro (más de la mitad de su alto). */
  readonly enCuadro: boolean
  /** Lo que se ve del título «Portfolio» (0…1: la fracción visible por su opacidad). */
  readonly titulo: number
  /** Lo que se ve de las historias (0…1). */
  readonly historias: number
  /** Lo que se ve de Demos, la sección vecina (0…1, sobre el área del cuadro). */
  readonly demos: number
  /** La cámara del Portfolio puesta (`data-camara`): la escena oscurecida, que va detrás de las historias. */
  readonly camara: boolean
}

export type ViolacionDeLasHistorias = 'fondo-vacio' | 'titulo-huerfano' | 'titulo-pegado' | 'oscuro-sin-historias'

/** Lo que cuenta como «se ve»: el umbral de lo visible y el tramo de cuadros vacíos que se tolera (una transición que se cruza). */
export const LO_QUE_SE_VE = { umbral: 0.08, vacioMs: 120, cruceMs: 1300, pegadoMs: 250, oscuroMs: 300 } as const

/**
 * Las violaciones, con el tramo más largo de cada una (ms):
 *   · `fondo-vacio`: con la sección en el cuadro, ni el título, ni las historias, ni Demos, más de `vacioMs` seguidos;
 *   · `titulo-huerfano`: el título a la vista sin las historias, junto con Demos o en la cola, más de `cruceMs` seguidos (lo que dura la
 *     salida a Demos, 1,18 s, con un margen: el título cae a la par de ella y se cruza con Demos mientras llega);
 *   · `titulo-pegado`: al salir hacia Demos, el título entero (sin empezar a caer) más de `pegadoMs` después de que arrancó la salida;
 *   · `oscuro-sin-historias`: la escena oscurecida (la cámara del Portfolio) sin las historias delante más de `oscuroMs` (el fondo negro:
 *     el oscurecido va detrás de las historias, que entran y salen con él).
 */
export function violacionesDeLasHistorias(cuadros: readonly CuadroDeLasHistorias[]): { readonly violaciones: ViolacionDeLasHistorias[]; readonly peores: Readonly<Record<ViolacionDeLasHistorias, number>> } {
  const u = LO_QUE_SE_VE.umbral
  const peores: Record<ViolacionDeLasHistorias, number> = { 'fondo-vacio': 0, 'titulo-huerfano': 0, 'titulo-pegado': 0, 'oscuro-sin-historias': 0 }
  let oscuroDesde: number | null = null
  let vacioDesde: number | null = null
  let huerfanoDesde: number | null = null
  let salida: number | null = null
  let pegadoDesde: number | null = null
  for (let i = 0; i < cuadros.length; i++) {
    const c = cuadros[i]
    const antes = cuadros[i - 1]
    if (c === undefined) continue
    // La salida hacia Demos arranca cuando el paso pasa a la cola desde adentro.
    if (antes !== undefined && antes.paso >= 0 && antes.paso <= 3 && c.paso === 4) salida = c.t
    if (c.paso !== 4) salida = null
    const vacio = c.enCuadro && c.titulo < u && c.historias < u && c.demos < u
    vacioDesde = vacio ? (vacioDesde ?? c.t) : null
    if (vacioDesde !== null) peores['fondo-vacio'] = Math.max(peores['fondo-vacio'], c.t - vacioDesde)
    const huerfano = c.titulo >= u && c.historias < u && (c.demos >= u || c.paso === 4)
    huerfanoDesde = huerfano ? (huerfanoDesde ?? c.t) : null
    if (huerfanoDesde !== null) peores['titulo-huerfano'] = Math.max(peores['titulo-huerfano'], c.t - huerfanoDesde)
    const oscuro = c.camara && c.enCuadro && c.historias < u
    oscuroDesde = oscuro ? (oscuroDesde ?? c.t) : null
    if (oscuroDesde !== null) peores['oscuro-sin-historias'] = Math.max(peores['oscuro-sin-historias'], c.t - oscuroDesde)
    const pegado = salida !== null && c.titulo >= 0.95
    pegadoDesde = pegado ? (pegadoDesde ?? salida) : null
    if (pegadoDesde !== null) peores['titulo-pegado'] = Math.max(peores['titulo-pegado'], c.t - pegadoDesde)
  }
  const violaciones: ViolacionDeLasHistorias[] = []
  if (peores['fondo-vacio'] > LO_QUE_SE_VE.vacioMs) violaciones.push('fondo-vacio')
  if (peores['titulo-huerfano'] > LO_QUE_SE_VE.cruceMs) violaciones.push('titulo-huerfano')
  if (peores['titulo-pegado'] > LO_QUE_SE_VE.pegadoMs) violaciones.push('titulo-pegado')
  if (peores['oscuro-sin-historias'] > LO_QUE_SE_VE.oscuroMs) violaciones.push('oscuro-sin-historias')
  return { violaciones, peores }
}
