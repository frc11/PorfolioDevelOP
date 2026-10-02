'use client'

import { useEffect, useRef, useState } from 'react'

import { AMBIENTES, CANDIDATOS, SONIDOS, type Candidato, type GrupoConCandidatos } from '../../_lib/sonido/catalogo'
import type { MotorDelSonido } from '../../_lib/sonido/motor'
import { ELEGIDOS_DE_FABRICA, guardarElegidos, guardarVolumenes, leerElegidos, leerVolumenes, type Elegidos, type Volumenes } from '../../_lib/sonido/preferencia'
import type { Ambiente, Sonido } from '../../_lib/sonido/sprite'
import { pedirElMotor, soltarElMotor } from './motorCompartido'

/**
 * [3D Y SONIDO] T2 · LA PÁGINA DE PRUEBA — `/v3?sonidos=1`: un panel sobre el sitio para escuchar cada sonido y moverle el
 * volumen (se guarda en el navegador y lo usa el sitio). Nada suena hasta «Cargar los sonidos» (la acción que habilita el
 * audio). [RETOQUE 3D] Y para ELEGIR de oído: el clic de la barra (cuatro candidatos), el clic de los CTA (cuatro) y el
 * ambiente (tres bucles, uno a la vez); lo elegido es lo que suena en el sitio. Abajo, los valores escritos para pasarlos.
 */
const SUELTOS = (Object.keys(SONIDOS) as Sonido[]).filter((s) => !s.startsWith('barra-') && !s.startsWith('cta-'))
const GRUPOS: readonly { readonly grupo: GrupoConCandidatos; readonly titulo: string }[] = [
  { grupo: 'barra', titulo: 'El clic de la barra — elegí uno' },
  { grupo: 'cta', titulo: 'El clic de los CTA — elegí uno' },
]
const candidatoDe = (s: Sonido): Candidato => s.slice(-1) as Candidato

export default function PruebaDeSonidos(): React.JSX.Element {
  const motor = useRef<MotorDelSonido | null>(null)
  const [estado, setEstado] = useState<'sin-cargar' | 'cargando' | 'listo'>('sin-cargar')
  const [volumenes, setVolumenes] = useState<Volumenes>(() => leerVolumenes())
  const [elegidos, setElegidos] = useState<Elegidos>(() => leerElegidos())
  const [probando, setProbando] = useState<Ambiente | null>(null)
  const [abierto, setAbierto] = useState(true)

  useEffect(() => () => {
    if (motor.current !== null) {
      motor.current.probarAmbiente(null)
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

  const mover = (s: keyof Volumenes, v: number): void => {
    const nuevos = { ...volumenes, [s]: v }
    setVolumenes(nuevos)
    guardarVolumenes(nuevos)
    motor.current?.volumen(s, v)
  }

  /** El volumen de un grupo: el mismo para sus cuatro candidatos (se comparan a la par). */
  const moverElGrupo = (g: GrupoConCandidatos, v: number): void => {
    const nuevos = { ...volumenes }
    for (const s of CANDIDATOS[g]) nuevos[s] = v
    setVolumenes(nuevos)
    guardarVolumenes(nuevos)
    for (const s of CANDIDATOS[g]) motor.current?.volumen(s, v)
  }

  const elegir = (e: Elegidos): void => {
    setElegidos(e)
    guardarElegidos(e)
    motor.current?.elegir(e)
  }

  const probar = (a: Ambiente): void => {
    const siguiente = probando === a ? null : a
    setProbando(siguiente)
    motor.current?.probarAmbiente(siguiente)
  }

  const restablecer = (): void => {
    guardarVolumenes(null)
    guardarElegidos(null)
    const base = leerVolumenes()
    setVolumenes(base)
    setElegidos(ELEGIDOS_DE_FABRICA)
    motor.current?.elegir(ELEGIDOS_DE_FABRICA)
    for (const [s, v] of Object.entries(base)) motor.current?.volumen(s as keyof Volumenes, v)
  }

  const listo = estado === 'listo'
  const fila = 'flex flex-wrap items-center justify-between gap-x-[var(--spacing-3)] gap-y-[var(--spacing-1)] border-t border-tinta/20 py-[var(--spacing-2)]'
  const boton = 'rounded-[var(--radius-pastilla-s)] border border-tinta px-[var(--spacing-3)] py-[var(--spacing-1)] disabled:opacity-40 aria-pressed:bg-tinta aria-pressed:text-fondo'
  const titulo = 'pt-[var(--spacing-4)] text-cuerpo font-semi'

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
      <p className="py-[var(--spacing-2)]">Generados (síntesis propia, CC0). Nada suena hasta cargar. Lo que muevas y elijas queda guardado en este navegador y es lo que suena en el sitio con el parlante prendido.</p>
      {estado !== 'listo' && (
        <button type="button" onClick={cargar} disabled={estado === 'cargando'} className={boton}>
          {estado === 'cargando' ? 'Cargando…' : 'Cargar los sonidos'}
        </button>
      )}
      <p className="pt-[var(--spacing-3)]">Volumen general</p>
      <Volumen etiqueta="Volumen general" valor={volumenes.general} alMover={(v) => mover('general', v)} />

      <h3 className={titulo}>Los de siempre</h3>
      {SUELTOS.map((s) => (
        <div key={s} className={fila}>
          <span className="flex-1">
            <strong>{s}</strong> — {SONIDOS[s].que}
          </span>
          <button type="button" disabled={!listo} onClick={() => motor.current?.sonarCrudo(s)} className={boton}>
            Sonar
          </button>
          <Volumen etiqueta={`Volumen de ${s}`} valor={volumenes[s]} alMover={(v) => mover(s, v)} />
        </div>
      ))}

      {GRUPOS.map(({ grupo, titulo: t }) => (
        <div key={grupo}>
          <h3 className={titulo}>{t}</h3>
          {CANDIDATOS[grupo].map((s) => (
            <div key={s} className={fila}>
              <span className="flex-1">{SONIDOS[s].que}</span>
              <button type="button" disabled={!listo} onClick={() => motor.current?.sonarCrudo(s)} className={boton}>
                Sonar
              </button>
              <button type="button" aria-pressed={elegidos[grupo] === candidatoDe(s)} onClick={() => elegir({ ...elegidos, [grupo]: candidatoDe(s) })} className={boton}>
                {elegidos[grupo] === candidatoDe(s) ? 'Elegido' : 'Elegir'}
              </button>
            </div>
          ))}
          <Volumen etiqueta={`Volumen del clic de ${grupo === 'barra' ? 'la barra' : 'los CTA'}`} valor={volumenes[CANDIDATOS[grupo][0]]} alMover={(v) => moverElGrupo(grupo, v)} />
        </div>
      ))}

      <h3 className={titulo}>El ambiente — elegí uno (un bucle para toda la página)</h3>
      {(Object.keys(AMBIENTES) as Ambiente[]).map((a) => (
        <div key={a} className={fila}>
          <span className="flex-1">
            <strong>{a}</strong> — {AMBIENTES[a]}
          </span>
          <button type="button" disabled={!listo} aria-pressed={probando === a} onClick={() => probar(a)} className={boton}>
            {probando === a ? 'Parar' : 'Bucle'}
          </button>
          <button type="button" aria-pressed={elegidos.ambiente === a} onClick={() => elegir({ ...elegidos, ambiente: a })} className={boton}>
            {elegidos.ambiente === a ? 'Elegido' : 'Elegir'}
          </button>
        </div>
      ))}
      <Volumen etiqueta="Volumen del ambiente" valor={volumenes.ambiente} alMover={(v) => mover('ambiente', v)} />

      <div className="flex flex-wrap gap-[var(--spacing-2)] border-t border-tinta/20 pt-[var(--spacing-3)]">
        <button type="button" onClick={restablecer} className={boton}>
          Volver a los de fábrica
        </button>
      </div>
      <pre className="overflow-x-auto pt-[var(--spacing-3)] whitespace-pre-wrap">{JSON.stringify({ elegidos, volumenes })}</pre>
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
