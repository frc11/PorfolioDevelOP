'use client'

import { useEffect, useRef, useState } from 'react'

import { SONIDOS } from '../../_lib/sonido/catalogo'
import type { MotorDelSonido } from '../../_lib/sonido/motor'
import { guardarVolumenes, leerVolumenes, type Volumenes } from '../../_lib/sonido/preferencia'
import type { Sonido } from '../../_lib/sonido/sprite'
import { pedirElMotor, soltarElMotor } from './motorCompartido'

/**
 * [3D Y SONIDO] T2 · LA PÁGINA DE PRUEBA DE LOS SONIDOS — `/v3?sonidos=1`: un panel sobre el sitio con un botón y un
 * volumen por sonido, para juzgarlos de oído. Nada suena hasta «Cargar»: es la acción que habilita el audio. Los
 * volúmenes se guardan en este navegador y los usa el sitio con `?pruebas=sonido=si`; abajo quedan escritos, para pasarlos.
 */
type Ambiente = 'apagado' | 'dia' | 'noche'

const NOMBRES = Object.keys(SONIDOS) as Sonido[]

export default function PruebaDeSonidos(): React.JSX.Element {
  const motor = useRef<MotorDelSonido | null>(null)
  const [estado, setEstado] = useState<'sin-cargar' | 'cargando' | 'listo'>('sin-cargar')
  const [volumenes, setVolumenes] = useState<Volumenes>(() => leerVolumenes())
  const [ambiente, setAmbiente] = useState<Ambiente>('apagado')
  const [abierto, setAbierto] = useState(true)

  useEffect(() => () => {
    if (motor.current !== null) {
      motor.current.ambiente(null)
      soltarElMotor()
    }
  }, [])

  const cargar = (): void => {
    setEstado('cargando')
    void pedirElMotor().then((m) => {
      motor.current = m
      const listo = (): void => (m.cargado() ? setEstado('listo') : void window.setTimeout(listo, 100))
      listo()
    })
  }

  const mover = (s: Sonido | 'general', v: number): void => {
    const nuevos = { ...volumenes, [s]: v }
    setVolumenes(nuevos)
    guardarVolumenes(nuevos)
    motor.current?.volumen(s, v)
  }

  const ponerAmbiente = (a: Ambiente): void => {
    setAmbiente(a)
    motor.current?.ambiente(a === 'apagado' ? null : a === 'noche' ? 1 : 0)
  }

  const restablecer = (): void => {
    guardarVolumenes(null)
    const base = leerVolumenes()
    setVolumenes(base)
    for (const [s, v] of Object.entries(base)) motor.current?.volumen(s as Sonido | 'general', v)
  }

  const listo = estado === 'listo'
  const fila = 'flex flex-wrap items-center justify-between gap-x-[var(--spacing-3)] gap-y-[var(--spacing-1)] border-t border-tinta/20 py-[var(--spacing-2)]'
  const boton = 'rounded-[var(--radius-pastilla-s)] border border-tinta px-[var(--spacing-3)] py-[var(--spacing-1)] disabled:opacity-40'

  if (!abierto)
    return (
      <button type="button" onClick={() => setAbierto(true)} className={`bg-fondo text-tinta font-codigo text-caption fixed top-[var(--spacing-4)] left-[var(--spacing-4)] z-[var(--z-overlay)] ${boton}`}>
        Sonidos
      </button>
    )

  return (
    <section aria-label="Prueba de los sonidos" data-pieza="prueba-de-sonidos" className="bg-fondo text-tinta font-codigo text-caption fixed top-[var(--spacing-4)] left-[var(--spacing-4)] z-[var(--z-overlay)] max-h-[calc(100svh-var(--spacing-8))] w-[min(calc(var(--spacing-20)*5),calc(100vw-var(--spacing-8)))] overflow-auto rounded-[var(--radius-medio)] border border-tinta/30 p-[var(--spacing-4)]">
      <div className="flex items-center justify-between gap-[var(--spacing-3)]">
        <h2 className="text-cuerpo font-semi">Sonidos · prueba</h2>
        <button type="button" onClick={() => setAbierto(false)} className={boton}>
          Cerrar
        </button>
      </div>
      <p className="py-[var(--spacing-2)]">Generados (síntesis propia, CC0). Nada suena hasta cargar. Los volúmenes quedan guardados acá y los usa el sitio con ?pruebas=sonido=si.</p>
      {estado !== 'listo' && (
        <button type="button" onClick={cargar} disabled={estado === 'cargando'} className={boton}>
          {estado === 'cargando' ? 'Cargando…' : 'Cargar los sonidos'}
        </button>
      )}
      <p className="pt-[var(--spacing-3)]">Volumen general</p>
      <Volumen etiqueta="Volumen general" valor={volumenes.general} alMover={(v) => mover('general', v)} />
      {NOMBRES.map((s) => (
        <div key={s} className={fila}>
          <span className="flex-1">
            <strong>{s}</strong> — {SONIDOS[s].que}
          </span>
          {SONIDOS[s].ambiente ? (
            <button type="button" disabled={!listo} aria-pressed={ambiente === s} onClick={() => ponerAmbiente(ambiente === s ? 'apagado' : s === 'noche' ? 'noche' : 'dia')} className={boton}>
              {ambiente === s ? 'Parar' : 'Bucle'}
            </button>
          ) : (
            <button type="button" disabled={!listo} onClick={() => motor.current?.sonar(s)} className={boton}>
              Sonar
            </button>
          )}
          <Volumen etiqueta={`Volumen de ${s}`} valor={volumenes[s]} alMover={(v) => mover(s, v)} />
        </div>
      ))}
      <div className="flex flex-wrap gap-[var(--spacing-2)] border-t border-tinta/20 pt-[var(--spacing-3)]">
        <button type="button" onClick={restablecer} className={boton}>
          Volver a los de fábrica
        </button>
      </div>
      <pre className="overflow-x-auto pt-[var(--spacing-3)] whitespace-pre-wrap">{JSON.stringify(volumenes)}</pre>
    </section>
  )
}

function Volumen({ etiqueta, valor, alMover }: { readonly etiqueta: string; readonly valor: number; readonly alMover: (v: number) => void }): React.JSX.Element {
  return (
    <label className="flex basis-full items-center gap-[var(--spacing-2)]">
      <span className="sr-only">{etiqueta}</span>
      <input type="range" min={0} max={1} step={0.01} value={valor} onChange={(e) => alMover(Number(e.target.value))} className="w-full" />
      <span className="w-[calc(var(--spacing-8)+var(--spacing-2))] text-right tabular-nums">{valor.toFixed(2)}</span>
    </label>
  )
}
