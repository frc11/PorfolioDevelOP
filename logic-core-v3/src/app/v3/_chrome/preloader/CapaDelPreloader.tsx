'use client'

import { LoaderCircle } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'

import { Micro } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { escenaPreparada, hayPrimerCuadro } from '../../_lib/carga'
import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import { permitirLaPreparacion } from '../../_lib/entrada'
import { laEscenaCayo } from '../../_lib/escena/caida'
import { estadoDelGiroscopio, suscribirAlGiroscopio } from '../../_lib/escena/giroscopio'
import { activarElMovimiento, hayMovimiento } from '../../_lib/escena/movimiento'
import { sonar } from '../../_lib/sonido/bus'
import { guardarPrendido } from '../../_lib/sonido/preferencia'
import { TITULOS_DE_VOLUMEN, TITULOS_EN_CAMINO, tituloListo } from '../../_lib/titulos3d/registro'
import { IDS_DEL_TITULAR_DEL_HERO } from '../../_lib/titulos3d/titular'
import { fundidosDelTexto, salidaDeLaCapa } from './animaciones'
import { defectoDelPreloader, type EnLaVentana, type VentanaConElPreloader } from './decision'
import { BotonQueVibra, type ManijaDelBoton, type Objetivo } from './BotonQueVibra'
import { entradaLista, latidosEn, lineaNueva, pasoDeLaLinea, ratoQuieto, type Etapa, type EstadoDeLaLinea } from './linea'
import { animar, crearElReloj, pausarConLaPestana, tiempoDelReloj } from './reloj'

/**
 * [B12c] LA CAPA DEL PRELOADER — la secuencia (`linea.ts`) sobre la cubierta del layout (`PreloaderDelSitio`): el negro con la
 * bienvenida, el blanco con la frase del sonido, el botón del sonido que aparece y vibra (`BotonQueVibra`) y la salida.
 *
 * [C2-81] **Continua (ítem 18):** lo que se ve son animaciones nativas en el compositor, sólo `opacity` y `transform` (`animaciones.ts`),
 * alineadas con un reloj maestro (`reloj.ts`); el texto ya no se traba aunque el hilo principal esté ocupado. El rAF sólo DECIDE (la etapa,
 * la salida) leyendo ese reloj, y suelta la preparación de la escena cuando la bienvenida terminó de aparecer
 * (`permitirLaPreparacion`). La frase y el botón se montan desde el principio (invisibles e inertes hasta su momento), así sus animaciones
 * ya están en el compositor cuando les toca. **El teléfono con movimiento** (`hayMovimiento`): la frase dice «… el sonido y el movimiento.»,
 * vibran los dos botones (sin flechas) y tocarla prende los dos. [L6 · ítem 81] La flecha se fue: el botón aparece en su lugar y manda una
 * onda fina que cruza el fondo, con el ritmo de un corazón; si la carga tarda, el latido se repite.
 *
 *   · **Lo que espera** (`entradaLista`): las fuentes, el primer cuadro de la escena, la escena preparada (compilada y calentada) y los
 *     títulos urgentes armados (el titular del hero, el título de una página). Mientras, la escena trabaja detrás.
 *   · **La frase**, opcional: tocarla prende el sonido (la preferencia de siempre; el toque es la acción que el navegador pide para que
 *     suene) y, en el teléfono, el movimiento (el permiso de iOS se pide en ese toque). Sin subrayado: un botón con el texto; tocado, la
 *     confirmación arriba (sin correr la frase).
 *   · **No se saltea:** nada más recibe el clic, Esc no hace nada, y el Tab no sale de la capa (la frase es lo único que se toca).
 *   · Con un banco (`__preloaderDelBanco`), cada cuadro queda en `window.__preloaderMedido` (el reloj, la etapa, los latidos que empezaron, si
 *     estaba listo y la opacidad de la bienvenida que ve el hilo principal) y, al final, el estado del toque.
 */
interface MuestraDelPreloader {
  readonly t: number
  readonly ahora: number
  readonly etapa: Etapa
  readonly latidos: number
  readonly listo: boolean
  readonly bienvenida: number
}
type VentanaDelBanco = VentanaConElPreloader & {
  __preloaderMedido?: { muestras: MuestraDelPreloader[]; final: unknown }
}

const ORDEN: readonly Etapa[] = ['bienvenida', 'blanco', 'frase', 'boton', 'salida', 'fuera']
const desde = (etapa: Etapa, minima: Etapa): boolean => ORDEN.indexOf(etapa) >= ORDEN.indexOf(minima)

/** La frase (05-TEXTOS): la de escritorio y la del teléfono con movimiento. */
export const FRASE = { escritorio: 'Recomendamos activar el sonido.', conMovimiento: 'Recomendamos activar el sonido y el movimiento.' } as const

/** Los botones que vibran: en escritorio el del sonido; en el teléfono con movimiento, también el del movimiento. */
export const BOTONES: Readonly<Record<'escritorio' | 'conMovimiento', readonly Objetivo[]>> = { escritorio: ['sonido'], conMovimiento: ['sonido', 'movimiento'] }

/** ¿Está todo para entrar? Se pregunta en cada cuadro. */
function todoListo(fuentes: boolean, escritorio: boolean): boolean {
  return entradaLista({
    fuentes,
    primerCuadro: hayPrimerCuadro(),
    caida: laEscenaCayo(),
    escritorio,
    conTitular: TITULOS_DE_VOLUMEN.has(IDS_DEL_TITULAR_DEL_HERO[0]),
    titularListo: tituloListo(IDS_DEL_TITULAR_DEL_HERO[0]) && tituloListo(IDS_DEL_TITULAR_DEL_HERO[1]),
    preparada: escenaPreparada(),
    urgentes: TITULOS_EN_CAMINO.urgentes,
  })
}

export default function CapaDelPreloader({ decision, cubierta, alArrancar, alTerminar }: { readonly decision: EnLaVentana; readonly cubierta: RefObject<HTMLDivElement | null>; readonly alArrancar: () => void; readonly alTerminar: () => void }): React.JSX.Element {
  const [etapa, setEtapa] = useState<Etapa>('bienvenida')
  const [icono, setIcono] = useState(false)
  const [activado, setActivado] = useState(false)
  const [conMovimiento] = useState(hayMovimiento)
  const giroscopio = useSyncExternalStore(suscribirAlGiroscopio, estadoDelGiroscopio, () => 'apagado' as const)
  const blanco = useRef<HTMLDivElement>(null)
  const bienvenida = useRef<HTMLDivElement>(null)
  const frase = useRef<HTMLButtonElement>(null)
  const reloj = useRef<Animation | null>(null)
  const manijas = useRef<(ManijaDelBoton | null)[]>([])
  const etapaAhora = useRef<Etapa>('bienvenida')
  const activadoAhora = useRef(false)
  const botones = BOTONES[conMovimiento ? 'conMovimiento' : 'escritorio']
  const defecto = defectoDelPreloader()

  // El reloj y lo que se ve (en el compositor), y cada cuadro un paso de la línea (lo que se decide). Al terminar, la entrada se abre.
  // [C2-81] En el efecto de layout: las animaciones se crean antes del primer pintado de la capa y arrancan con él (en uno pasivo esperaban
  // al cuadro siguiente, detrás de lo que el hilo tuviera en cola: medido en el teléfono, 258 a 299 ms).
  useLayoutEffect(() => {
    const ventana = window as VentanaDelBanco
    const banco = ventana.__preloaderDelBanco !== undefined
    if (banco) ventana.__preloaderMedido = { muestras: [], final: null }
    // El control `en-el-hilo`: las animaciones del texto en pausa, empujadas desde el hilo principal (cada tarea larga las congela).
    const enElHilo = defecto === 'en-el-hilo'
    const escritorio = window.matchMedia(CONSULTA_ESCENARIO).matches
    let fuentes = false
    void document.fonts.ready.then(() => {
      fuentes = true
    })
    const r = crearElReloj()
    reloj.current = r
    const f = fundidosDelTexto(decision.reducido)
    const pares = [
      [bienvenida.current, f.bienvenida],
      [blanco.current, f.blanco],
      [frase.current, f.frase],
    ] as const
    const textos = pares.flatMap(([el, a]) => (el === null ? [] : [animar(el, a, r, 0)]))
    if (enElHilo) for (const a of textos) a.pause()
    const soltarLaPestana = pausarConLaPestana(() => cubierta.current, () => reloj.current)
    const e: EstadoDeLaLinea = lineaNueva()
    let antes: number | null = null
    let etapaAntes: Etapa = e.etapa
    let iconoAntes = false
    let salida: Animation | null = null
    let rafId = 0
    const cuadro = (marca: number): void => {
      if (antes === null) alArrancar()
      const ahora = tiempoDelReloj(r)
      const listo = todoListo(fuentes, escritorio)
      pasoDeLaLinea(e, antes === null ? 0 : ahora - antes, listo, decision.reducido)
      antes = ahora
      // La escena se prepara sólo en los ratos quietos (la bienvenida aparecida y quieta; desde el botón): ningún fundido se traba.
      permitirLaPreparacion(ratoQuieto(e.t, decision.reducido))
      if (enElHilo) for (const a of textos) a.currentTime = e.t
      for (const m of manijas.current) m?.medir()
      const capa = cubierta.current
      if (e.salidaDesde !== null && salida === null && capa !== null) {
        salida = animar(capa, salidaDeLaCapa(decision.reducido), r, e.salidaDesde)
        capa.style.pointerEvents = 'none'
      }
      if (banco) {
        const b = bienvenida.current === null ? Number.NaN : Number(getComputedStyle(bienvenida.current).opacity)
        ventana.__preloaderMedido?.muestras.push({ t: Math.round(e.t), ahora: Math.round(marca), etapa: e.etapa, latidos: latidosEn(e.t, decision.reducido), listo, bienvenida: Number(b.toFixed(4)) })
      }
      if (e.etapa !== etapaAntes) {
        // La llegada suave, con la página apareciendo (suena sólo con el sonido prendido y su motor listo).
        if (e.etapa === 'salida') sonar('cierra')
        etapaAntes = e.etapa
        etapaAhora.current = e.etapa
        setEtapa(e.etapa)
      }
      if (e.icono !== iconoAntes) {
        iconoAntes = e.icono
        setIcono(e.icono)
      }
      if (e.etapa === 'fuera') {
        if (banco && ventana.__preloaderMedido !== undefined) {
          ventana.__preloaderMedido.final = { activado: activadoAhora.current, conMovimiento, t: e.t }
        }
        alTerminar()
        return
      }
      rafId = requestAnimationFrame(cuadro)
    }
    rafId = requestAnimationFrame(cuadro)
    return () => {
      cancelAnimationFrame(rafId)
      soltarLaPestana()
      for (const a of textos) a.cancel()
      salida?.cancel()
      r.cancel()
      reloj.current = null
    }
  }, [decision, cubierta, alArrancar, alTerminar, conMovimiento, defecto])

  // No se saltea: el Tab queda en la capa (la frase, si está); nada más se toca.
  useEffect(() => {
    const alTeclear = (ev: KeyboardEvent): void => {
      if (ev.key !== 'Tab') return
      ev.preventDefault()
      if (desde(etapaAhora.current, 'frase')) frase.current?.focus({ preventScroll: true })
    }
    document.addEventListener('keydown', alTeclear, true)
    return () => document.removeEventListener('keydown', alTeclear, true)
  }, [])

  const activar = (): void => {
    if (activadoAhora.current) return
    activadoAhora.current = true
    guardarPrendido(true)
    // En el teléfono, el movimiento también: dentro de este toque (iOS pide el permiso desde un gesto).
    if (conMovimiento) activarElMovimiento()
    setActivado(true)
  }
  const confirmacion = conMovimiento && giroscopio === 'prendido' ? 'Sonido y movimiento activados' : 'Sonido activado'

  return (
    <>
      <div ref={blanco} data-parte="blanco" className="bg-fondo absolute inset-0 opacity-0" />
      <div className="absolute inset-0 flex items-center justify-center px-[var(--spacing-4)]">
        <div ref={bienvenida} data-parte="bienvenida" className="opacity-0">
          <Titular nivel="titulo-l" como="p" className="text-fondo text-center text-balance">
            Bienvenido a una nueva experiencia.
          </Titular>
        </div>
      </div>
      {/* Montada desde el principio (sus animaciones ya están en el compositor), inerte hasta que aparece. */}
      <div className="absolute inset-0 flex items-center justify-center px-[var(--spacing-4)]" inert={!desde(etapa, 'frase')}>
        <div className="relative">
          <button ref={frase} type="button" data-parte="frase" aria-pressed={activado} onClick={activar} className="text-tinta hover:text-tinta-tenue cursor-pointer text-center opacity-0">
            <Titular nivel="titulo-m" como="span" className="text-balance">
              {conMovimiento ? FRASE.conMovimiento : FRASE.escritorio}
            </Titular>
          </button>
          {/* Arriba, sin correr la frase: la confirmación del toque y, sólo si la espera se hizo muy larga, el ícono. */}
          <div aria-hidden="true" className="absolute bottom-full left-0 flex w-full flex-col-reverse items-center gap-[var(--spacing-2)] pb-[var(--spacing-3)]">
            {activado && (
              <Micro como="span" className="text-tinta-tenue">
                {confirmacion}
              </Micro>
            )}
            {icono && <LoaderCircle size={16} strokeWidth={1.5} className="text-tinta-tenue motion-safe:animate-spin" />}
          </div>
        </div>
      </div>
      {/* Desde el blanco (no desde el primer cuadro): lo que hidrata al arrancar no compite con el fundido de la bienvenida. */}
      {desde(etapa, 'blanco') &&
        botones.map((objetivo, i) => (
          <BotonQueVibra
            key={objetivo}
            ref={(m) => {
              manijas.current[i] = m
            }}
            objetivo={objetivo}
            reloj={reloj}
            reducido={decision.reducido}
            defecto={defecto === 'sin-onda' || defecto === 'onda-corrida' ? defecto : null}
          />
        ))}
      <span role="status" className="sr-only">
        {activado ? confirmacion : icono ? 'Cargando' : ''}
      </span>
    </>
  )
}
