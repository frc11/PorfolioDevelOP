import { IDS_DE_SERVICIO, type IdDeServicio } from '../../_contrato/acento'
import { INVENTOS, conLlave } from '../../_contrato/inventado'

/**
 * [B4] LAS PREGUNTAS DEL RECOMENDADOR — a redactar. Hasta que estén, van con la llave del contenido inventado (las casillas
 * `serviciosPregunta*` de `INVENTOS`): con la llave apagada se lee el marcador `[TEXTO]` con qué va en cada casilla; prendida, un relleno
 * que se lee como relleno. Lo que NO es relleno es a qué servicio apunta cada opción: eso es la lógica del recomendador.
 */

export interface OpcionDelRecomendador {
  readonly texto: string
  readonly servicio: IdDeServicio
}

export interface PreguntaDelRecomendador {
  readonly texto: string
  readonly opciones: readonly OpcionDelRecomendador[]
}

export const PREGUNTAS_DEL_RECOMENDADOR: readonly PreguntaDelRecomendador[] = [
  {
    texto: conLlave(INVENTOS.serviciosPregunta1),
    opciones: [
      { texto: conLlave(INVENTOS.serviciosPregunta1Web), servicio: 'web' },
      { texto: conLlave(INVENTOS.serviciosPregunta1Software), servicio: 'software' },
      { texto: conLlave(INVENTOS.serviciosPregunta1Ia), servicio: 'ia-automatizacion' },
    ],
  },
  {
    texto: conLlave(INVENTOS.serviciosPregunta2),
    opciones: [
      { texto: conLlave(INVENTOS.serviciosPregunta2Web), servicio: 'web' },
      { texto: conLlave(INVENTOS.serviciosPregunta2Software), servicio: 'software' },
      { texto: conLlave(INVENTOS.serviciosPregunta2Ia), servicio: 'ia-automatizacion' },
    ],
  },
  {
    texto: conLlave(INVENTOS.serviciosPregunta3),
    opciones: [
      { texto: conLlave(INVENTOS.serviciosPregunta3Web), servicio: 'web' },
      { texto: conLlave(INVENTOS.serviciosPregunta3Software), servicio: 'software' },
      { texto: conLlave(INVENTOS.serviciosPregunta3Ia), servicio: 'ia-automatizacion' },
    ],
  },
]

/**
 * El servicio recomendado: el más elegido; si empatan, el de la última respuesta entre los empatados (lo último que contestó es lo
 * que más tiene presente). `null` mientras falte alguna respuesta.
 */
export function servicioRecomendado(respuestas: readonly (IdDeServicio | null)[]): IdDeServicio | null {
  if (respuestas.length === 0 || respuestas.some((r) => r === null)) return null
  const votos = new Map<IdDeServicio, number>(IDS_DE_SERVICIO.map((id) => [id, 0]))
  for (const r of respuestas) if (r !== null) votos.set(r, (votos.get(r) ?? 0) + 1)
  const maximo = Math.max(...votos.values())
  const empatados = IDS_DE_SERVICIO.filter((id) => votos.get(id) === maximo)
  for (let i = respuestas.length - 1; i >= 0; i -= 1) {
    const r = respuestas[i]
    if (r !== null && empatados.includes(r)) return r
  }
  return empatados[0] ?? null
}
