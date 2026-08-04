import { MonoLabel } from '@/components/design-system'
import { ATENCION, DATO, DIMENSIONES, METRICAS, type EscenaId } from './data'

/**
 * La lámina de producto (§5.7 de la dirección).
 *
 * El panel se presenta como OBJETO: marco de dispositivo hecho con CSS —borde,
 * canto superior iluminado, sombra corta—, sus controles a la vista, encuadre
 * generoso. Nunca una captura cruda pegada, y sin un solo asset externo.
 *
 * Es el mismo relieve que el control primario del sistema: canto de 1px más
 * claro arriba + `shadow-ds-control`. Radio 0 como cualquier superficie, y sin
 * `backdrop-blur` — el glassmorphism está prohibido.
 *
 * Adentro NO hay una captura: hay wireframe. Las etiquetas son las reales del
 * portal (los nombres salen de `data.ts`, verificados contra el código); las
 * cifras van marcadas. Nada acá es una captura falsa ni un número inventado.
 */

/** Barra de datos del wireframe. Ancho fijo por índice: no hay dato que representar. */
function Barra({ width }: { width: string }) {
  return <span aria-hidden="true" className="block h-2 bg-ds-rule" style={{ width }} />
}

/**
 * Fila de dato: etiqueta a la izquierda, cifra a la derecha, regla abajo.
 *
 * Es filas y no una grilla de tarjetas porque el interior de la lámina mide
 * ~370px a 1440 (570 de lámina menos la barra lateral): tres columnas ahí
 * truncaban las etiquetas —«RESPONDI…», «COMPLETA…»— y partían en dos líneas
 * las del Health Score. Medido en la captura, no leído en el JSX.
 */
function FilaDato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-ds-rule py-2 last:border-b-0">
      <span className="font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted">{etiqueta}</span>
      <span className="flex shrink-0 items-baseline gap-2">{children}</span>
    </li>
  )
}

function EscenaSalud() {
  return (
    <div className="flex flex-col gap-4">
      <MonoLabel>Health Score</MonoLabel>
      {/*
        El score sin anillo cónico: el original lo pintaba con un
        `conic-gradient` al 78% — un gradiente Y un dato inventado. Acá es la
        cifra sola, en la escala de dato del sistema, y las tres dimensiones
        como filas debajo.
      */}
      <div className="flex items-baseline gap-2 border border-ds-rule p-4">
        <span className="font-ds-mono text-ds-data tabular-nums text-ds-fg">{DATO.score}</span>
        <span className="font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted">/100</span>
      </div>

      <ul className="flex flex-col">
        {DIMENSIONES.map((dimension) => (
          <FilaDato key={dimension} etiqueta={dimension}>
            <span className="font-ds-mono text-sm tabular-nums text-ds-fg">{DATO.entero}</span>
          </FilaDato>
        ))}
      </ul>
    </div>
  )
}

function EscenaAtencion() {
  return (
    <div className="flex flex-col gap-4">
      <MonoLabel>Tu atención hoy</MonoLabel>
      <ul className="flex flex-col gap-2">
        {ATENCION.map((item) => (
          <li key={item.prioridad} className="flex flex-col gap-1.5 border border-ds-rule p-3">
            <span className="font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted">
              {item.prioridad}
            </span>
            <span className="text-sm leading-snug text-ds-fg">{item.texto}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EscenaSemana() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <MonoLabel>Resultados de la semana</MonoLabel>
        <span className="font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted">
          vs semana anterior
        </span>
      </div>

      <ul className="flex flex-col">
        {METRICAS.map((metrica) => (
          <FilaDato key={metrica} etiqueta={metrica}>
            <span className="font-ds-mono text-sm tabular-nums text-ds-fg">{DATO.entero}</span>
            <span className="font-ds-mono text-ds-eyebrow tabular-nums text-ds-fg-muted">
              {DATO.porcentaje}
            </span>
          </FilaDato>
        ))}
      </ul>

      {/* El resumen ejecutivo lo escribe la IA — eso sí existe. El texto, no. */}
      <div className="flex flex-col gap-2 border border-ds-rule p-3">
        <span className="font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted">
          Resumen de la IA
        </span>
        <div className="flex flex-col gap-1.5">
          <Barra width="92%" />
          <Barra width="74%" />
        </div>
      </div>
    </div>
  )
}

const ESCENA_RENDER: Record<EscenaId, () => React.ReactElement> = {
  salud: EscenaSalud,
  atencion: EscenaAtencion,
  semana: EscenaSemana,
}

interface PanelPlateProps {
  /** Escena activa. Con reduced-motion el orquestador no la cambia nunca. */
  escena: EscenaId
  hora: string
}

export function PanelPlate({ escena, hora }: PanelPlateProps) {
  const Escena = ESCENA_RENDER[escena]

  return (
    <div
      data-lamina=""
      className="border border-ds-rule border-t-ds-control-edge bg-ds-panel p-2 shadow-ds-control md:p-3"
    >
      {/* Chrome del dispositivo: sus controles a la vista. */}
      <div className="flex items-center justify-between gap-3 border-b border-ds-rule px-3 pb-2">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2 border border-ds-rule" />
          <span className="size-2 border border-ds-rule" />
          <span className="size-2 border border-ds-rule" />
        </div>
        <MonoLabel>Panel del cliente · {hora}</MonoLabel>
      </div>

      {/* Interior. Alto mínimo fijo para que el cambio de escena no salte. */}
      <div className="grid gap-4 bg-ds-canvas p-4 md:grid-cols-[110px_1fr] md:p-6">
        <div className="hidden flex-col gap-2 border-r border-ds-rule pr-4 md:flex" aria-hidden="true">
          {[64, 48, 56, 40, 52].map((width, index) => (
            <Barra key={index} width={`${width}%`} />
          ))}
        </div>

        <div className="min-h-[15.5rem] sm:min-h-[13.5rem]">
          <Escena />
        </div>
      </div>
    </div>
  )
}
