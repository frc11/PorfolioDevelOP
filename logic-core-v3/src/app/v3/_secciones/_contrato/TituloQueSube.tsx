'use client'

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import type { NivelDeTitular } from '../../_componentes/tipografia/Titular'

import { CanalDeTexto, CanalDeTitular } from './canales'
import { Bloque } from './coreografia'

/**
 * [B6] LOS TÍTULOS QUE VIENEN DESDE ABAJO — el título y la bajada de los módulos del Panel: cada renglón sube desde atrás
 * de su línea (P1 con la máscara, la ventana visible: arranca al asomar y llega antes de salir), el título primero y la
 * bajada después. Es el gesto del encabezado del Panel, subido al contrato para que lo reuse otra sección sin importar de
 * la carpeta del Panel (B4: «Nuestros servicios» y su subtítulo).
 *
 * Sin coreografía (abajo de 1024, con movimiento reducido, el HTML servido) se renderizan quietos y a la vista: las dos
 * ramas anuncian lo mismo. El `id`, si va, lo lleva el envoltorio del título (`CanalDeTitular` no acepta `id`).
 */
export interface TituloQueSubeProps {
  readonly titulo: string
  /** El elemento del título. Sin defecto: elegirlo es una decisión. */
  readonly como: 'h2' | 'h3'
  readonly nivel?: NivelDeTitular
  readonly bajada?: string
  readonly id?: string
  /** Clases del envoltorio (el grupo). */
  readonly className?: string
  readonly claseDelTitulo?: string
  readonly claseDeLaBajada?: string
}

export function TituloQueSube({ titulo, como, nivel = 'titulo-m', bajada, id, className, claseDelTitulo, claseDeLaBajada }: TituloQueSubeProps): React.JSX.Element {
  return (
    <div data-pieza="titulo-que-sube" className={className}>
      <Bloque patron="P1" rango="ventana-visible">
        {(progreso) => (
          <div id={id}>
            <CanalDeTitular progreso={progreso} patron="P1" texto={titulo} nivel={nivel} como={como} className={claseDelTitulo} />
          </div>
        )}
      </Bloque>
      {bajada === undefined ? null : (
        <Bloque patron="P1" rango="ventana-visible">
          {(progreso) => (
            <CanalDeTexto progreso={progreso} tipo="parrafo" texto={bajada}>
              {(contenido) => <Cuerpo className={claseDeLaBajada}>{contenido}</Cuerpo>}
            </CanalDeTexto>
          )}
        </Bloque>
      )}
    </div>
  )
}
