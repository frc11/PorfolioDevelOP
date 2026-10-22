'use client'

import { LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState, type RefObject } from 'react'

import { Micro } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { escenaPreparada, hayPrimerCuadro } from '../../_lib/carga'
import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import { laEscenaCayo } from '../../_lib/escena/caida'
import { sonar } from '../../_lib/sonido/bus'
import { guardarPrendido } from '../../_lib/sonido/preferencia'
import { TITULOS_DE_VOLUMEN, TITULOS_EN_CAMINO, tituloListo } from '../../_lib/titulos3d/registro'
import { IDS_DEL_TITULAR_DEL_HERO } from '../../_lib/titulos3d/titular'
import { defectoDelPreloader, type EnLaVentana, type VentanaConElPreloader } from './decision'
import { FlechaDelSonido, type ManijaDeLaFlecha } from './FlechaDelSonido'
import { entradaLista, lineaNueva, pasoDeLaLinea, vistaDeLaLinea, type Etapa, type EstadoDeLaLinea } from './linea'

/**
 * [B12c] LA CAPA DEL PRELOADER — la secuencia (`linea.ts`) sobre la cubierta del layout (`PreloaderDelSitio`): el negro con la
 * bienvenida, el blanco con la frase del sonido, la flecha hasta el botón del sonido y la salida. Un rAF la mueve: escribe opacidades y la
 * flecha por referencia (ningún render por cuadro); React sólo se entera de los cambios de etapa (para montar la frase y la flecha).
 *
 *   · **Lo que espera** (`entradaLista`): las fuentes, el primer cuadro de la escena, la escena preparada (compilada y calentada) y los
 *     títulos urgentes armados (el titular del hero, el título de una página). Mientras, la escena trabaja detrás.
 *   · **La frase del sonido**, opcional: tocarla prende el sonido (la preferencia de siempre, `preferencia.ts`; el toque es la acción que
 *     el navegador pide para que suene) y la página entra con el sonido prendido y la llegada suave (la del velo al destapar). Sin
 *     subrayado: un botón con el texto; tocado, «Sonido activado» arriba (sin correr la frase, de donde sale la flecha).
 *   · **No se saltea:** nada más recibe el clic, Esc no hace nada, y el Tab no sale de la capa (la frase es lo único que se toca).
 *   · Con un banco (`__preloaderDelBanco`), cada cuadro queda en `window.__preloaderMedido` (el reloj, la etapa, el trazo, el pulso, si
 *     estaba listo) y, al final, la punta de la flecha contra el botón.
 */
interface MuestraDelPreloader {
  readonly t: number
  readonly ahora: number
  readonly etapa: Etapa
  readonly trazo: number
  readonly pulsa: boolean
  readonly listo: boolean
}
type VentanaDelBanco = VentanaConElPreloader & {
  __preloaderMedido?: { muestras: MuestraDelPreloader[]; final: unknown }
}

const ORDEN: readonly Etapa[] = ['bienvenida', 'blanco', 'frase', 'flecha', 'salida', 'fuera']
const desde = (etapa: Etapa, minima: Etapa): boolean => ORDEN.indexOf(etapa) >= ORDEN.indexOf(minima)

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
  const blanco = useRef<HTMLDivElement>(null)
  const bienvenida = useRef<HTMLDivElement>(null)
  const frase = useRef<HTMLButtonElement>(null)
  const flecha = useRef<ManijaDeLaFlecha>(null)
  const activadoAhora = useRef(false)

  // El reloj: cada cuadro, un paso de la línea y lo que se pinta. Al terminar, la entrada se abre (`alTerminar`).
  useEffect(() => {
    const ventana = window as VentanaDelBanco
    const banco = ventana.__preloaderDelBanco !== undefined
    if (banco) ventana.__preloaderMedido = { muestras: [], final: null }
    const sinFreno = defectoDelPreloader() === 'sin-freno'
    const escritorio = window.matchMedia(CONSULTA_ESCENARIO).matches
    let fuentes = false
    void document.fonts.ready.then(() => {
      fuentes = true
    })
    const e: EstadoDeLaLinea = lineaNueva()
    let antes: number | null = null
    let etapaAntes: Etapa = e.etapa
    let iconoAntes = false
    let rafId = 0
    const cuadro = (ahora: number): void => {
      if (antes === null) alArrancar()
      const listo = todoListo(fuentes, escritorio)
      pasoDeLaLinea(e, antes === null ? 0 : ahora - antes, listo, decision.reducido, sinFreno)
      antes = ahora
      const v = vistaDeLaLinea(e, decision.reducido)
      if (cubierta.current !== null) {
        cubierta.current.style.opacity = String(v.capa)
        cubierta.current.style.pointerEvents = e.etapa === 'salida' ? 'none' : ''
      }
      if (blanco.current !== null) blanco.current.style.opacity = String(v.blanco)
      if (bienvenida.current !== null) bienvenida.current.style.opacity = String(v.bienvenida)
      if (frase.current !== null) frase.current.style.opacity = String(v.frase)
      flecha.current?.pintar(v.trazo, v.pulso)
      if (banco) ventana.__preloaderMedido?.muestras.push({ t: Math.round(e.t), ahora: Math.round(ahora), etapa: e.etapa, trazo: Number(e.trazo.toFixed(4)), pulsa: e.pulsa, listo })
      if (e.etapa !== etapaAntes) {
        // La llegada suave, con la página apareciendo (suena sólo con el sonido prendido y su motor listo).
        if (e.etapa === 'salida') sonar('cierra')
        etapaAntes = e.etapa
        setEtapa(e.etapa)
      }
      if (v.icono !== iconoAntes) {
        iconoAntes = v.icono
        setIcono(v.icono)
      }
      if (e.etapa === 'fuera') {
        if (banco && ventana.__preloaderMedido !== undefined) ventana.__preloaderMedido.final = { ...flecha.current?.medida(), activado: activadoAhora.current, t: e.t }
        alTerminar()
        return
      }
      rafId = requestAnimationFrame(cuadro)
    }
    rafId = requestAnimationFrame(cuadro)
    return () => cancelAnimationFrame(rafId)
  }, [decision, cubierta, alArrancar, alTerminar])

  // No se saltea: el Tab queda en la capa (la frase, si está); nada más se toca.
  useEffect(() => {
    const alTeclear = (ev: KeyboardEvent): void => {
      if (ev.key !== 'Tab') return
      ev.preventDefault()
      frase.current?.focus({ preventScroll: true })
    }
    document.addEventListener('keydown', alTeclear, true)
    return () => document.removeEventListener('keydown', alTeclear, true)
  }, [])

  const activar = (): void => {
    if (activadoAhora.current) return
    activadoAhora.current = true
    guardarPrendido(true)
    setActivado(true)
  }

  return (
    <>
      <div ref={blanco} className="bg-fondo absolute inset-0 opacity-0" />
      <div className="absolute inset-0 flex items-center justify-center px-[var(--spacing-4)]">
        <div ref={bienvenida} className="opacity-0">
          <Titular nivel="titulo-l" como="p" className="text-fondo text-center text-balance">
            Bienvenido a una nueva experiencia.
          </Titular>
        </div>
      </div>
      {desde(etapa, 'blanco') && (
        <div className="absolute inset-0 flex items-center justify-center px-[var(--spacing-4)]">
          <div className="relative">
            <button ref={frase} type="button" aria-pressed={activado} onClick={activar} className="text-tinta hover:text-tinta-tenue cursor-pointer text-center opacity-0">
              <Titular nivel="titulo-m" como="span" className="text-balance">
                Recomendamos activar el sonido.
              </Titular>
            </button>
            {/* Arriba (la flecha pasa por debajo), sin correr la frase, de cuya caja sale la flecha: la confirmación del toque y, sólo si la espera se hizo muy larga, el ícono. */}
            <div aria-hidden="true" className="absolute bottom-full left-0 flex w-full flex-col-reverse items-center gap-[var(--spacing-2)] pb-[var(--spacing-3)]">
              {activado && (
                <Micro como="span" className="text-tinta-tenue">
                  Sonido activado
                </Micro>
              )}
              {icono && <LoaderCircle size={16} strokeWidth={1.5} className="text-tinta-tenue motion-safe:animate-spin" />}
            </div>
          </div>
        </div>
      )}
      {desde(etapa, 'flecha') && <FlechaDelSonido ref={flecha} frase={frase} />}
      <span role="status" className="sr-only">
        {activado ? 'Sonido activado' : icono ? 'Cargando' : ''}
      </span>
    </>
  )
}
