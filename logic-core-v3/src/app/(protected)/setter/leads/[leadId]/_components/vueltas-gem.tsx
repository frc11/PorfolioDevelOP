'use client'

import { Field, TextArea } from '@/components/ui'
import {
  BloquesSecuenciales,
  type BloqueSecuencial,
  type EstadoBloque,
} from '@/app/(protected)/setter/_components/bloques-secuenciales'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import {
  CAMPOS_DE_VUELTA,
  VUELTA_IDS,
  vueltaCompleta,
  vueltaSiguiente,
  type CampoVuelta,
  type ExplicacionLectura,
  type ValoresVueltas,
  type VueltaId,
} from '@/lib/leados/brief-vueltas'
import type { LecturaEncabezado } from '@/lib/leados/encabezado-documento'
import { GUIA_BRIEF, GUIA_VUELTAS_GEM } from '@/lib/leados/guidance-content'
import { mensajeDeVuelta } from '@/lib/leados/prompts-gem-diseno'
import { LecturaDocumento } from './lectura-documento'

/**
 * P40 — LAS CUATRO VUELTAS CON EL GEM, en la pantalla del brief.
 *
 * El mismo patrón que la ficha por fuentes (P16): cabeceras siempre visibles, una
 * sola vuelta desplegada, y la siguiente se abre SOLA cuando la abierta quedó
 * completa y el foco sale de ella — sin botón de «siguiente». La mecánica del
 * foco (esperar al `pointerup` para que plegar no se coma el click) vive en
 * `BloquesSecuenciales`; qué es una vuelta completa, en `brief-vueltas.ts`.
 *
 * Cada vuelta tiene lo que el setter copia (el mensaje, que ya trae lo que pegó
 * en la anterior), dónde pega lo que vuelve, y un campo libre para lo que
 * corrigió. El estado es del formulario de afuera: volver a una vuelta no pierde
 * nada, porque plegada no se monta pero lo escrito vive en el padre.
 *
 * No bloquea nada: las cuatro cabeceras abren con un click, y el guardado del
 * brief exige lo mismo que antes. El recorrido llega a la construcción recién con
 * la cuarta — pero es una invitación, no una tranca.
 */
export function VueltasConElGem({
  valores,
  abierta,
  onAbrir,
  onCambiar,
  bloqueFicha,
  lectura,
  explicacion,
  errores,
}: {
  valores: ValoresVueltas
  abierta: VueltaId
  onAbrir: (vuelta: VueltaId) => void
  onCambiar: (campo: CampoVuelta, valor: string) => void
  /** La ficha y la evaluación juntas: viajan en el mensaje de la vuelta 1. */
  bloqueFicha: string | null
  /** Lo que se leyó del encabezado del documento de la vuelta 4. */
  lectura: LecturaEncabezado
  explicacion: ExplicacionLectura | null
  errores: Partial<Record<CampoVuelta, string>>
}) {
  const textos = GUIA_VUELTAS_GEM

  /** La regla del avance: el foco salió de la vuelta abierta y quedó completa. */
  const salirDeLaVuelta = (id: string) => {
    const vuelta = id as VueltaId
    if (vuelta !== abierta || !vueltaCompleta(vuelta, valores)) return
    const siguiente = vueltaSiguiente(vuelta, valores)
    if (siguiente) onAbrir(siguiente)
  }

  const estadoDe = (vuelta: VueltaId): EstadoBloque => {
    if (vuelta === 'huecos') {
      if (!valores.documento.trim()) return { tono: 'pendiente', texto: textos.estado.documentoPendiente }
      if (lectura.estado === 'completo') return { tono: 'completo', texto: textos.estado.documentoLeido }
      if (lectura.estado === 'incompleto') {
        return {
          tono: 'pendiente',
          texto: textos.estado.documentoFaltaPrefijo + lectura.faltanObligatorias.join(', '),
        }
      }
      return { tono: 'pendiente', texto: textos.estado.documentoSinEncabezado }
    }
    if (!vueltaCompleta(vuelta, valores)) return { tono: 'pendiente', texto: textos.estado.pendiente }
    const pegada = Boolean(valores[CAMPOS_DE_VUELTA[vuelta].respuesta].trim())
    return { tono: 'completo', texto: pegada ? textos.estado.pegada : textos.estado.reemplazada }
  }

  const campoDeTexto = (campo: CampoVuelta, filas: number) => {
    const guia = GUIA_BRIEF.campos[campo]
    return (
      <Field label={guia.label} hint={guia.hint} error={errores[campo]}>
        <TextArea
          value={valores[campo]}
          onChange={(event) => onCambiar(campo, event.target.value)}
          invalid={Boolean(errores[campo])}
          rows={filas}
        />
      </Field>
    )
  }

  const bloques: BloqueSecuencial[] = VUELTA_IDS.map((vuelta, indice) => {
    const { respuesta, correccion } = CAMPOS_DE_VUELTA[vuelta]
    const largo = vuelta === 'especificacion' || vuelta === 'huecos'
    return {
      id: vuelta,
      titulo: `${indice + 1} · ${GUIA_BRIEF.grupos[vuelta].titulo}`,
      estado: estadoDe(vuelta),
      contenido: (
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-zinc-400">{GUIA_BRIEF.grupos[vuelta].intro}</p>
          <CopyBlock
            titulo={`${textos.mensajeTitulo}${indice + 1}`}
            instruccion={indice === 0 ? textos.instruccionPrimera : textos.instruccionSiguiente}
            texto={mensajeDeVuelta(vuelta, valores, bloqueFicha)}
          />
          {campoDeTexto(respuesta, largo ? 10 : 6)}
          {vuelta === 'huecos' && explicacion && <LecturaDocumento explicacion={explicacion} />}
          {campoDeTexto(correccion, 2)}
        </div>
      ),
    }
  })

  return (
    <BloquesSecuenciales
      aria-label={textos.recorrido}
      bloques={bloques}
      abierto={abierta}
      onAbrir={(id) => onAbrir(id as VueltaId)}
      onSalirDelBloque={salirDeLaVuelta}
    />
  )
}
