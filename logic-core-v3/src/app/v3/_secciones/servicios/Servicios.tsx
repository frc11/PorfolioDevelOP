'use client'

import { useRef } from 'react'

import { HuecoDelViaje } from '../../_componentes/navegacion/HuecoDelViaje'
import { seccionDe, type PropsDeSeccion } from '../_contrato/forma'
import { useCoreografiaActiva, useMovimientoEnTodoAncho } from '../_contrato/coreografia'
import { Seccion } from '../_contrato/Seccion'
import { useModoEnElTelefono } from './escenario/banderas'
import { EscenarioDeServicios } from './escenario/EscenarioDeServicios'
import { ServiciosDeslizar } from './movil/ServiciosDeslizar'
import { Recomendador } from './recomendador/Recomendador'
import { useTramoDeServicios } from './tramoDeServicios'

/**
 * [B4] SERVICIOS (craneada el 2026-10-21; plan y log en `docs/rediseno/SPRINT-B4-NOCTURNO.md`) — más corta que la de antes, y
 * reemplaza al hub. Sobre el papel, con los nanobots grises en el medio:
 *
 *   1. **La entrada**: «Nuestros servicios» y su bajada llegan desde abajo (el efecto de los módulos del Panel), delante de los nanobots.
 *   2. **Los gatillos**: la sección se ancla y cada gesto avanza UN servicio, obligado y sin saltear (la máquina del Portfolio, común:
 *      `_componentes/gatillos/`): Desarrollo web desde la izquierda, Software desde la derecha, IA desde arriba; al subir, cada uno sale
 *      por donde entró y los nanobots vuelven. El truco de profundidad: los nanobots pasan de detrás del título a delante del panel en
 *      un cuadro sin ninguno sobre los dos (`escenario/`).
 *   3. **El recomendador**, sin gatillo y con scroll normal. Después, el Panel.
 *
 * Las ramas: con coreografía (desde el umbral, con movimiento), el escenario; abajo de 1024 con movimiento, `?servicios-movil=`
 * (`deslizar`, el defecto: cada servicio una pantalla; `gatillo`: de a uno, como en escritorio); sin coreografía (el servidor, o menos
 * movimiento), las pantallas quietas. El alto: `tramoDeServicios.ts` (REGLA DE ALTURAS).
 *
 * La sección de antes (el rodillo, la tira, la torta y el CTA que rota) quedó en esta carpeta SIN MONTAR: varios invariantes la leen
 * por ruta. Se borra con ellos en un sprint de limpieza.
 */

/** El alto declarado de la sección: desde 1024 la sección lo llena exacto (k = 1). */
const ALTO_DECLARADO = seccionDe('servicios').alto

function RamaDeServicios(): React.JSX.Element {
  const conCoreografia = useCoreografiaActiva()
  const conMovimiento = useMovimientoEnTodoAncho()
  const modo = useModoEnElTelefono()
  if (conCoreografia) return <EscenarioDeServicios telefono={false} />
  if (conMovimiento && modo === 'gatillo') return <EscenarioDeServicios telefono />
  return <ServiciosDeslizar />
}

export function Servicios({ seccion }: PropsDeSeccion): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  useTramoDeServicios(caja)
  return (
    <Seccion seccion={seccion}>
      <div
        ref={caja}
        data-pieza="servicios"
        // El alto va en estilo inline porque sale del DATO (una clase armada no la ve el escáner de Tailwind). Abajo de 1024, el contenido.
        style={{ minHeight: ALTO_DECLARADO }}
        className="relative flex w-full flex-col max-escritorio:min-h-0!"
      >
        <RamaDeServicios />
        <Recomendador />
        {/* [B12b] Durante el viaje de un CTA a su página: el hueco del logo de la página de destino, medido acá (invisible). */}
        <HuecoDelViaje />
      </div>
    </Seccion>
  )
}
