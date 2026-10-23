'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'

import { Cta } from '../../_componentes/chrome/Cta'
import { taparLaEscena } from '../../_lib/escena/tapa'
import { useDialogo } from '../../_secciones/trabajos/demos/dialogo'
import { useDespliegue } from '../despliegue/useDespliegue'
import { botonDelIngreso, cerrarIngreso, soltarIngreso } from './apertura'
import { ROTULOS_DEL_INGRESO, TITULO_DEL_INGRESO } from './contenido'
import { FlechaDeSalida } from './FlechaDeSalida'

/**
 * [B7] LA HOJA DEL LOGIN — se despliega como una demo: un fondo negro tapa la página y, al mismo tiempo, el formulario aparece en el
 * centro. Una vez desplegada, está todo (nada entra después).
 *
 *   · **La apertura y el cierre** son el despliegue (`_chrome/despliegue/`: el Genie de las demos, su tiempo y su curva, con la
 *     silueta del menú): sale de «Login» y vuelve a él. Sin un botón a la vista o con movimiento reducido, el fundido de las demos.
 *     Los sonidos de abrir y cerrar son los de las demos (respetan el mute: el bus no suena sin motor).
 *   · **Un diálogo de verdad**: `role="dialog"`, `aria-modal`, su título por `aria-labelledby`, el foco atrapado, Esc y la página
 *     quieta (`useDialogo`, el de las demos: `overflow: hidden` en el `<html>` y `data-lenis-prevent`, sin mover el scroll). Al
 *     terminar de cerrarse el foco vuelve a «Login».
 *   · **La escena duerme detrás del negro** (`_lib/escena/tapa.ts`): desde que terminó de cubrir hasta que empieza a irse.
 *   · **En el teléfono, pantalla completa**: la hoja es la pantalla entera en todos los anchos; lo de adentro se desplaza adentro si
 *     no entra (el teclado del teléfono incluido).
 *   · **El contenido**: el título (centrado), el formulario (`children`) y, abajo, «Volver al home» a la izquierda (cierra como la flecha
 *     atrás, `cerrarIngreso`) y «Probá el panel» a la derecha (C1: todavía no hace nada; está y no lleva a ningún lado). Arriba, en el
 *     lugar de «Login», una flecha que cierra igual (`FlechaDeSalida`).
 *
 * La fase queda en `data-fase` de la raíz y el avance del despliegue en `data-avance` del fondo: el banco los lee.
 */

const TAPA = 'ingreso'
/**
 * [C2 · 80] BANDERA (por defecto `true`): en la entrada directa (sin botón de dónde salir: el teléfono, la URL con `?ingresar`) la
 * escena duerme desde que ARRANCA el fundido, no desde que termina. El fundido de 200 ms tardaba ~550 ms por la carga de la
 * página: la placa dibujando la sala por detrás se llevaba los cuadros (la sala, tapada por el negro, no se ve cambiar). Con el Genie
 * (hay botón) sigue igual: la sala se ve a los costados mientras sale. `false` lo devuelve a «recién al terminar de cubrir».
 */
const TAPAR_AL_EMPEZAR_EL_FUNDIDO = true
const SALA = { 'data-seccion': 'invertida' } as const

export function HojaDelIngreso({
  abierto,
  origen,
  children,
  alPedirElCierre = cerrarIngreso,
  alCerrarse = soltarIngreso,
}: {
  /** Desplegada (o desplegándose); en `false`, vuelve al botón y avisa con `alCerrarse`. */
  readonly abierto: boolean
  /** El botón del que sale y al que vuelve; `null`: el fundido. */
  readonly origen: HTMLElement | null
  readonly children: ReactNode
  readonly alPedirElCierre?: () => void
  readonly alCerrarse?: () => void
}): React.JSX.Element {
  const raiz = useRef<HTMLDivElement>(null)
  const hoja = useRef<HTMLDivElement>(null)
  const contenido = useRef<HTMLDivElement>(null)
  const capas = useMemo(() => ({ hoja, contenido }), [])
  const despliegue = useDespliegue(capas)
  useDialogo(contenido, alPedirElCierre)

  // Lo último de cada render, para el efecto que sólo sigue a `abierto` (abrir y cerrar no se rearman por otra cosa).
  const ultimos = useRef({ origen, despliegue, alCerrarse })
  useLayoutEffect(() => {
    ultimos.current = { origen, despliegue, alCerrarse }
  })

  // De layout: la primera pose se pinta antes del primer cuadro (nunca se ve la pantalla negra entera de golpe).
  useLayoutEffect(() => {
    const { origen: desde, despliegue: control, alCerrarse: alTerminar } = ultimos.current
    const fase = (f: 'abriendo' | 'abierta' | 'cerrando'): void => raiz.current?.setAttribute('data-fase', f)
    if (abierto) {
      fase('abriendo')
      if (TAPAR_AL_EMPEZAR_EL_FUNDIDO && desde === null) taparLaEscena(TAPA, true)
      control.abrir(desde, () => {
        fase('abierta')
        taparLaEscena(TAPA, true)
        // Con mouse, el foco al primer campo; en un táctil no (abriría el teclado encima de todo).
        if (window.matchMedia('(pointer: fine)').matches) contenido.current?.querySelector<HTMLElement>('form input')?.focus({ preventScroll: true })
      })
    } else {
      fase('cerrando')
      taparLaEscena(TAPA, false)
      control.cerrar(desde, () => {
        alTerminar()
        // Un cuadro después: con el diálogo montado, su trampa devolvería el foco adentro.
        const boton = desde ?? botonDelIngreso()
        requestAnimationFrame(() => boton?.focus({ preventScroll: true }))
      })
    }
    return () => control.cancelar()
  }, [abierto])
  useEffect(() => () => taparLaEscena(TAPA, false), [])

  return (
    <div ref={raiz} data-pieza="ingreso" data-lenis-prevent="" className="fixed inset-0 z-[var(--z-overlay)]">
      <div ref={hoja} {...SALA} data-parte="fondo" aria-hidden="true" className="bg-fondo absolute inset-0" style={{ opacity: 0 }} />
      <div
        ref={contenido}
        {...SALA}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ingreso-titulo"
        data-parte="contenido"
        className="text-tinta absolute inset-0 overflow-y-auto overscroll-contain"
        style={{ opacity: 0 }}
      >
        <FlechaDeSalida origen={origen} alTocar={alPedirElCierre} />
        <div className="mx-auto flex min-h-full w-full max-w-[calc(var(--spacing-20)*6)] flex-col justify-center gap-[var(--spacing-8)] px-[var(--spacing-5)] py-[var(--spacing-12)]">
          <h2 id="ingreso-titulo" className="font-titulo text-fluido-titulo-m leading-titulo tracking-titulo text-center text-balance">
            {TITULO_DEL_INGRESO}
          </h2>
          {children}
          <div className="border-borde flex flex-wrap items-center justify-between gap-[var(--spacing-3)] border-t pt-[var(--spacing-6)]">
            <button
              type="button"
              data-parte="volver"
              onClick={alPedirElCierre}
              className="text-caption text-tinta-media hover:text-tinta min-h-[var(--spacing-12)] pr-[var(--spacing-3)] underline decoration-1 underline-offset-4 transition-colors hover:decoration-2 focus-visible:decoration-2"
            >
              {ROTULOS_DEL_INGRESO.volver}
            </button>
            {/* [C1] La prueba del panel se desarrolla más adelante (se va a desplegar igual que este login): hoy no hace nada. */}
            <span data-parte="probar-el-panel">
              <Cta rotulo={ROTULOS_DEL_INGRESO.probar} variante="linea" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
