'use client'

import { X } from 'lucide-react'
import { AnimatePresence, motion, type MotionProps } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { Cta } from '../../_componentes/chrome/Cta'
import { EstadoDeEnvio } from '../../_componentes/formularios/EstadoDeEnvio'
import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import type { EstadoDelEnvio, ResultadoDelEnvio } from '../../_lib/formularios/estadoDeEnvio'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'
import { useDialogo } from '../../_secciones/trabajos/demos/dialogo'
import { cerrarContacto, devolverElFoco, useContacto, type ModoDelChrome } from './apertura'
import { CamposDelContacto } from './CamposDelContacto'
import { BAJADA, PIE, ROTULO_DE_CERRAR, ROTULO_DEL_ENVIO, ROTULO_ENVIANDO, TITULO, avisoDeErrores, type Interes } from './contenido'
import { enviarContacto, validarContacto, type DatosDeContacto, type ErroresDeContacto } from './enviarContacto'
import { EscenarioDelPanel } from './EscenarioDelPanel'
import { animacionDelPanel, CLASES_DEL_PANEL, esElPanel } from './panel'
import { DESENFOQUE_DEL_FONDO_PX, TRANSICIONES } from './placa'
import { PlacaDelContacto } from './PlacaDelContacto'

/**
 * EL FORMULARIO DE CONTACTO — la hoja y su velo. **[CONTACTO]**
 *
 * Con la barra de escritorio la hoja es una PLACA con espesor que llega desde un punto del fondo y gira con el puntero
 * (`PlacaDelContacto.tsx`); [C2 · 22] abajo de escritorio (el teléfono y la tablet, y siempre con el menú del teléfono) es el PANEL:
 * el mismo formulario en una hoja centrada de ~70 % de la pantalla que llega del fondo con una escala y un fundido, sin 3D
 * (`panel.ts`). Con movimiento reducido, el panel es sólo un fundido y la de escritorio es la hoja de arriba, sin viaje. El velo
 * oscurece y desenfoca el sitio (24 px, primero; al cerrar, después). Es un diálogo: foco atrapado, Esc, overflow en `<html>` y
 * `data-lenis-prevent` —el mismo `useDialogo` de las demos—, y al cerrar el foco vuelve a quien lo abrió.
 *
 * [C2 · 22] El ENVÍO es el estándar del sitio (`EstadoDeEnvio`): el formulario se desvanece en la carga de develOP, después el encastre
 * con «¡Recibido!» o el error; con el éxito, a los 3 s el panel se cierra solo; con el error vuelve el formulario con todo lo escrito.
 * Un formulario inválido responde al toque (sin carga). Esc y la X siguen cerrando en cualquier momento.
 */

const CURVA = [0.77, 0, 0.175, 1] as const
export const MS_DE_LA_HOJA = 700
export const MS_DEL_VELO = 400

const VACIO: Omit<DatosDeContacto, 'intereses'> = { presupuesto: '', nombre: '', medio: '', empresa: '', mensaje: '' }

/** Lo que anima la hoja: la de arriba (movimiento reducido en escritorio), la placa (la anima su escenario) o el panel (`panel.ts`). */
type Movimiento = Pick<MotionProps, 'initial' | 'animate' | 'exit' | 'transition'>

export function FormularioDeContacto(): React.JSX.Element {
  const { abierto, precarga, modo } = useContacto()
  return <AnimatePresence onExitComplete={devolverElFoco}>{abierto && <Hoja key="contacto" precarga={precarga} modo={modo} />}</AnimatePresence>
}

/** La hoja sola, sin el estado del chrome: para el invariante, que la renderiza en el servidor (`escritorio`: el ancho que se supone; sin decir, el de escritorio). */
export function HojaParaElInvariante({ precarga = [], escritorio = true }: { readonly precarga?: readonly Interes[]; readonly escritorio?: boolean }): React.JSX.Element {
  return <Hoja precarga={precarga} modo="barra" escritorio={escritorio} />
}

/**
 * [PASADA FINAL] B3 · con el formulario montado (también durante su salida), la raíz de /v3 lleva esta marca: la barra y
 * el navbar se esconden con ella (`barra.css`, `navegacion.css`). Era `[data-v3]:has([data-pieza="contacto"]) …`, y un
 * `:has()` en la raíz con un descendiente hace que Chrome recalcule el estilo de la página ENTERA ante cualquier nodo
 * que entra o sale (medido: cada cambio del número del infinito, 5437 elementos, 28 ms con las demos de Tu panel).
 */
export const MARCA_DEL_CONTACTO_ABIERTO = 'data-contacto-abierto'

function Hoja({ precarga, modo, escritorio: supuesto }: { readonly precarga: readonly Interes[]; readonly modo: ModoDelChrome; readonly escritorio?: boolean }): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  const raiz = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const v3 = raiz.current?.closest('[data-v3]') ?? null
    v3?.setAttribute(MARCA_DEL_CONTACTO_ABIERTO, '')
    return () => v3?.removeAttribute(MARCA_DEL_CONTACTO_ABIERTO)
  }, [])
  const reducido = useMovimientoReducido()
  // [C2 · 22] el ancho de escritorio (1024, el del escenario): la hoja se monta al abrir, ya en el cliente, así que el primer render es el real.
  const escritorioMedido = useAnchoMinimo(CONSULTA_ESCENARIO)
  const escritorio = supuesto ?? escritorioMedido
  useDialogo(caja, cerrarContacto)
  const [datos, setDatos] = useState<DatosDeContacto>({ intereses: precarga, ...VACIO })
  const [errores, setErrores] = useState<ErroresDeContacto>({})
  const [intento, setIntento] = useState(false)
  // [C2 · 22] el estado del envío lo muestra `EstadoDeEnvio` (la carga, el encastre y su mensaje, y los anuncios para el lector).
  const [estado, setEstado] = useState<EstadoDelEnvio>('reposo')
  // La región de alerta de los errores de los campos (el resultado del envío lo anuncia `EstadoDeEnvio`).
  const [aviso, setAviso] = useState('')

  const actualizar = useCallback(
    (siguiente: DatosDeContacto) => {
      setDatos(siguiente)
      // Después del primer intento, los errores se corrigen mientras se escribe.
      if (intento) setErrores(validarContacto(siguiente))
    },
    [intento],
  )
  const alternarInteres = (id: Interes): void =>
    actualizar({ ...datos, intereses: datos.intereses.includes(id) ? datos.intereses.filter((i) => i !== id) : [...datos.intereses, id] })
  const escribir = (campo: keyof typeof VACIO, valor: string): void => actualizar({ ...datos, [campo]: valor })

  const alEnviar = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (estado !== 'reposo') return
    setIntento(true)
    const form = e.currentTarget
    // Un formulario inválido responde al toque (sin la carga); uno válido se desvanece en la carga mientras viaja.
    if (Object.keys(validarContacto(datos)).length === 0) setEstado('enviando')
    const r = await enviarContacto(datos)
    if (r.estado === 'invalido') {
      setEstado('reposo')
      setErrores(r.errores)
      // [INTERFAZ 1] T3: un aviso, vaciado y vuelto a escribir para que un segundo intento también se anuncie.
      setAviso('')
      const n = Object.keys(r.errores).length
      requestAnimationFrame(() => setAviso(avisoDeErrores(n)))
      // El foco va al primer campo con error, después de que el render lo marque.
      const primero = r.errores.intereses !== undefined ? '[data-pieza="chip-de-contacto"] input' : '[aria-invalid="true"]'
      requestAnimationFrame(() => form.querySelector<HTMLElement>(primero)?.focus())
      return
    }
    setErrores({})
    setAviso('')
    if (r.estado === 'error') {
      // El error: el encastre que no entra y su mensaje; después vuelve el formulario con todo lo escrito.
      setEstado('error')
      return
    }
    // El éxito vacía lo escrito (el formulario todavía no se ve): al terminar el mensaje el panel se cierra.
    setEstado('exito')
    setIntento(false)
    setDatos({ intereses: [], ...VACIO })
  }

  // El mensaje terminó: con el éxito el panel se cierra (con su salida de siempre; el mensaje se queda hasta que se va); con el error vuelve el formulario con lo escrito.
  const alVolver = (despuesDe: ResultadoDelEnvio): void => {
    if (despuesDe === 'exito') cerrarContacto()
    else setEstado('reposo')
  }
  const rotuloDelEnvio = estado === 'enviando' ? ROTULO_ENVIANDO : ROTULO_DEL_ENVIO

  // [C2 · 22] la hoja es el panel abajo de escritorio (o con el menú del teléfono); la placa y la hoja de arriba, sólo en escritorio.
  const panel = esElPanel(modo, escritorio)
  const desdeArriba = !panel
  /**
   * [NAVBAR] T4 · EL PANEL, COMPACTO. Menos aire, las preguntas y la bajada en `caption`, los chips más bajos, el mensaje en dos
   * renglones y el pie al lado del botón (debajo, si no entra). La de arriba y la placa (escritorio) no cambian.
   */
  const compacto = !desdeArriba
  const hoja = reducido ? { duration: 0 } : { duration: MS_DE_LA_HOJA / 1000, ease: CURVA }
  const velo = reducido ? { duration: 0 } : { duration: MS_DEL_VELO / 1000, ease: CURVA }
  // [CIERRE] 2B · desde la barra y con movimiento: la hoja llega como una placa con espesor (`placa.ts`).
  const placa = desdeArriba && !reducido
  // El fondo se desenfoca primero y se va después de la hoja: con movimiento, para la placa y para el panel.
  const viaja = !reducido
  const movimiento: Movimiento = panel ? animacionDelPanel(reducido) : placa ? { initial: false } : { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' }, transition: hoja }

  return (
    <div ref={raiz} data-pieza="contacto" data-modo={modo} data-forma={panel ? 'panel' : placa ? 'placa' : 'hoja'} data-placa={placa ? '' : undefined} className="fixed inset-0 z-[var(--z-overlay)]">
      {/* El velo: oscurece y desenfoca. Un click afuera cierra. */}
      <motion.div
        data-parte="velo"
        aria-hidden="true"
        onClick={cerrarContacto}
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-tinta)_35%,transparent)] backdrop-blur-[var(--blur-panel)]"
        initial={viaja ? { opacity: 0, backdropFilter: 'blur(0px)' } : { opacity: 0 }}
        animate={viaja ? { opacity: 1, backdropFilter: `blur(${String(DESENFOQUE_DEL_FONDO_PX)}px)` } : { opacity: 1 }}
        exit={viaja ? { opacity: 0, backdropFilter: 'blur(0px)', transition: TRANSICIONES.fondoAlCerrar } : { opacity: 0 }}
        transition={viaja ? TRANSICIONES.fondo : velo}
      />
      {/* [CIERRE] 2B · desde la barra la hoja es el frente de una PLACA con espesor (`PlacaDelContacto.tsx`); [C2 · 22] abajo de escritorio, el PANEL. */}
      <PlacaDelContacto activa={placa}>
      <EscenarioDelPanel activo={panel}>
      <motion.div
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contacto-titulo"
        data-parte="hoja"
        data-lenis-prevent=""
        className={cn(
          'bg-fondo text-tinta overflow-y-auto overscroll-contain will-change-transform',
          panel
            ? CLASES_DEL_PANEL
            : placa
              ? 'relative max-h-[86svh] w-full rounded-[var(--radius-medio)]'
              : 'absolute inset-x-0 top-0 max-h-[90svh] rounded-b-[calc(var(--radius-fuerte)*2)] shadow-[var(--shadow-flotante)]',
        )}
        {...movimiento}
      >
        <div
          className={cn(
            // [C2 · 22] `my-auto`: en la hoja del panel (una columna) el contenido queda centrado en el alto y, si no entra, se scrollea como siempre.
            'mx-auto my-auto flex w-full max-w-[min(100%,calc(var(--spacing-20)*14))] flex-col',
            // [PULIDO 10] J9 · en el panel, el contenido centrado en el alto (si no entra, se scrollea como siempre).
            compacto ? 'min-h-full justify-center gap-[var(--spacing-4)] px-[var(--spacing-5)] py-[var(--spacing-5)]' : 'gap-[var(--spacing-8)] px-[var(--pad-lateral-compacto)] py-[var(--spacing-12)]',
          )}
        >
          <div className={cn('flex items-start justify-between', compacto ? 'gap-[var(--spacing-4)]' : 'gap-[var(--spacing-6)]')}>
            <div className={cn('flex flex-col', compacto ? 'gap-[var(--spacing-1)]' : 'gap-[var(--spacing-2)]')}>
              <h2 id="contacto-titulo" className={cn(compacto ? 'text-fluido-titulo-m' : 'text-fluido-titulo-l', 'font-titulo leading-titulo tracking-titulo')}>
                {TITULO}
              </h2>
              <p className={cn(compacto ? 'text-caption' : 'text-cuerpo', 'leading-texto max-w-[60ch]')}>
                {BAJADA.antes}
                <a href={BAJADA.mail.href} className="underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:decoration-2">
                  {BAJADA.mail.rotulo}
                </a>
                {BAJADA.despues}
              </p>
            </div>
            <button
              type="button"
              onClick={cerrarContacto}
              aria-label={ROTULO_DE_CERRAR}
              className="border-borde-fuerte hover:border-tinta flex size-[var(--spacing-12)] shrink-0 items-center justify-center rounded-[var(--radius-medio)] border transition-colors"
            >
              <X aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-5)]" />
            </button>
          </div>

          {/* [C2 · 22] el estándar de envío del sitio: el formulario se desvanece en la carga, luego el encastre con su mensaje (y sus anuncios). */}
          <EstadoDeEnvio estado={estado} alVolver={alVolver}>
            <form noValidate onSubmit={(e) => void alEnviar(e)} className={cn('flex flex-col', compacto ? 'gap-[var(--spacing-4)]' : 'gap-[var(--spacing-8)]')}>
              <CamposDelContacto datos={datos} errores={errores} alternarInteres={alternarInteres} escribir={escribir} compacto={compacto} />
              <div
                className={cn(
                  'border-borde flex border-t perspective-midrange',
                  compacto ? 'flex-row flex-wrap items-center justify-between gap-[var(--spacing-3)] pt-[var(--spacing-3)]' : 'flex-col gap-[var(--spacing-4)] pt-[var(--spacing-6)] tablet:flex-row tablet:items-center tablet:justify-between',
                )}
              >
                <p className="text-caption leading-texto">{PIE}</p>
                <Cta type="submit" rotulo={rotuloDelEnvio} deshabilitado={estado === 'enviando'} className={compacto ? 'shrink-0' : undefined} />
              </div>
            </form>
          </EstadoDeEnvio>
          {/* [INTERFAZ 1] T3: la región viva existe desde el principio (una región que nace con su texto no siempre se anuncia). */}
          <p role="alert" className="sr-only">
            {aviso}
          </p>
        </div>
      </motion.div>
      </EscenarioDelPanel>
      </PlacaDelContacto>
    </div>
  )
}
