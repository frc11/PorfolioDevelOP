'use client'

import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

import { Carga, conDuracionMinima } from '../../_componentes/carga/Carga'
import { Cta } from '../../_componentes/chrome/Cta'
import { TarjetaDeGracias } from '../../_componentes/formularios/TarjetaDeGracias'
import { TEXTOS_DE_ENVIO } from '../../_lib/formularios/enviar'
import { transicionDeGracias, varianteDeLaPagina } from '../../_lib/formularios/gracias'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { useDialogo } from '../../_secciones/trabajos/demos/dialogo'
import { cerrarContacto, devolverElFoco, useContacto, type ModoDelChrome } from './apertura'
import { CamposDelContacto } from './CamposDelContacto'
import { BAJADA, DESPUES_DEL_ENVIO, PIE, ROTULO_DE_CERRAR, ROTULO_DEL_ENVIO, ROTULO_ENVIANDO, TITULO, avisoDeErrores, type Interes } from './contenido'
import { enviarContacto, validarContacto, type DatosDeContacto, type ErroresDeContacto } from './enviarContacto'
import { DESENFOQUE_DEL_FONDO_PX, TRANSICIONES } from './placa'
import { PlacaDelContacto } from './PlacaDelContacto'

/**
 * EL FORMULARIO DE CONTACTO — la hoja y su velo. **[CONTACTO]**
 *
 * Con la barra de escritorio la hoja BAJA desde arriba, a todo el ancho con el contenido
 * centrado y los bordes de abajo redondeados; con el menú móvil SUBE desde abajo y ocupa la
 * pantalla (en `dvh`, para que el teclado no la tape). El velo oscurece y desenfoca el sitio.
 * Es un diálogo: foco atrapado, Esc, overflow en `<html>` y `data-lenis-prevent` —el mismo
 * `useDialogo` de las demos—, y al cerrar el foco vuelve a quien lo abrió.
 *
 * La curva es la medida en nk: `cubic-bezier(.77,0,.175,1)`, 0,7 s la hoja y 0,4 s el velo.
 *
 * [CIERRE] 2B · desde la barra y con movimiento el contacto es una TRANSICIÓN (era la prueba B2 de AJUSTES FINALES): el
 * fondo se desenfoca primero (0,5 s) y la hoja llega como una PLACA con espesor desde un punto del fondo, y gira con el
 * puntero hasta mostrar sus costados (`PlacaDelContacto.tsx`); al cerrar se acuesta y recién después se va el desenfoque.
 * En el teléfono (el modo del menú) y con movimiento reducido, la hoja de siempre. Los números y el porqué, en `placa.ts`.
 */

const CURVA = [0.77, 0, 0.175, 1] as const
export const MS_DE_LA_HOJA = 700
export const MS_DEL_VELO = 400

/**
 * [PULIDO 9] H3 · ENVIANDO Y GRACIAS. Al enviar, el formulario se transforma en la carga ([PULIDO 10] J3 · la de develOP,
 * `Carga`: el trazo del logo en SVG, sin lienzo; era un anillo 3D en su propio lienzo) y, al llegar, la carga en la tarjeta de gracias (la
 * del pie, con la misma familia de transformación: `transicionDeGracias`). A los `CIERRE_MS` el panel se cierra solo, con
 * su salida de siempre; mientras, una línea fina se consume. Esc y la X siguen cerrando; al cerrarse, el foco vuelve a quien
 * lo abrió. Con error, el formulario vuelve con todo lo escrito y el error a la vista. Lo escrito vive en la hoja: la carga
 * y la tarjeta no lo tocan.
 */
export const CIERRE_MS = 3000
const sinSuscripcion = (): (() => void) => () => undefined

const VACIO: Omit<DatosDeContacto, 'intereses'> = { presupuesto: '', nombre: '', medio: '', empresa: '', mensaje: '' }

export function FormularioDeContacto(): React.JSX.Element {
  const { abierto, precarga, modo } = useContacto()
  return <AnimatePresence onExitComplete={devolverElFoco}>{abierto && <Hoja key="contacto" precarga={precarga} modo={modo} />}</AnimatePresence>
}

/** La hoja sola, sin el estado del chrome: para el invariante, que la renderiza en el servidor. */
export function HojaParaElInvariante({ precarga = [] }: { readonly precarga?: readonly Interes[] }): React.JSX.Element {
  return <Hoja precarga={precarga} modo="barra" />
}

/**
 * [PASADA FINAL] B3 · con el formulario montado (también durante su salida), la raíz de /v3 lleva esta marca: la barra y
 * el navbar se esconden con ella (`barra.css`, `navegacion.css`). Era `[data-v3]:has([data-pieza="contacto"]) …`, y un
 * `:has()` en la raíz con un descendiente hace que Chrome recalcule el estilo de la página ENTERA ante cualquier nodo
 * que entra o sale (medido: cada cambio del número del infinito, 5437 elementos, 28 ms con las demos de Tu panel).
 */
export const MARCA_DEL_CONTACTO_ABIERTO = 'data-contacto-abierto'

function Hoja({ precarga, modo }: { readonly precarga: readonly Interes[]; readonly modo: ModoDelChrome }): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  const raiz = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const v3 = raiz.current?.closest('[data-v3]') ?? null
    v3?.setAttribute(MARCA_DEL_CONTACTO_ABIERTO, '')
    return () => v3?.removeAttribute(MARCA_DEL_CONTACTO_ABIERTO)
  }, [])
  const reducido = useMovimientoReducido()
  useDialogo(caja, cerrarContacto)
  const [datos, setDatos] = useState<DatosDeContacto>({ intereses: precarga, ...VACIO })
  const [errores, setErrores] = useState<ErroresDeContacto>({})
  const [intento, setIntento] = useState(false)
  // [RONDA 2] F1: mientras viaja, y si llegó. [PULIDO 9] H3 · cada una con su contenido en la placa.
  const [fase, setFase] = useState<'formulario' | 'enviando' | 'gracias'>('formulario')
  const enviando = fase === 'enviando'
  const enviado = fase === 'gracias'
  const variante = useSyncExternalStore(sinSuscripcion, varianteDeLaPagina, () => 'volteo' as const)
  // El alto del formulario al enviar: la carga y la tarjeta lo guardan (la placa no se achica de golpe).
  const [alto, setAlto] = useState<number | undefined>(undefined)
  const pedirFoco = useRef<'carga' | 'tarjeta' | 'enviar' | null>(null)
  // UNA región de alerta: el resumen de los datos (sólo para el lector) o el error del servidor (a la vista).
  const [aviso, setAviso] = useState('')
  const [avisoALaVista, setAvisoALaVista] = useState(false)

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
    if (enviando) return
    setIntento(true)
    setAvisoALaVista(false)
    const form = e.currentTarget
    const errores = validarContacto(datos)
    const valido = Object.keys(errores).length === 0
    if (valido) {
      setAlto(form.offsetHeight)
      pedirFoco.current = 'carga'
      setFase('enviando')
    }
    // [PULIDO 10] J3 · lo que viaja, con la espera mínima de la carga (no parpadea); un formulario inválido responde al toque.
    const r = valido ? await conDuracionMinima(enviarContacto(datos)) : await enviarContacto(datos)
    setFase('formulario')
    if (r.estado === 'invalido') {
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
      // El error normal del formulario, a la vista (en la misma región viva); el foco, en Enviar al volver.
      pedirFoco.current = 'enviar'
      setAvisoALaVista(true)
      requestAnimationFrame(() => setAviso(r.mensaje))
      return
    }
    pedirFoco.current = 'tarjeta'
    setFase('gracias')
    setIntento(false)
    setDatos({ intereses: [], ...VACIO })
  }

  // [PULIDO 9] H3 · con la tarjeta a la vista, se cierra solo (si antes no lo cerró Esc o la X).
  useEffect(() => {
    if (!enviado) return undefined
    const reloj = window.setTimeout(cerrarContacto, CIERRE_MS)
    return () => window.clearTimeout(reloj)
  }, [enviado])
  const alLlegar = (el: HTMLElement | null): void => {
    if (el === null || pedirFoco.current === null) return
    const destino = pedirFoco.current === 'enviar' ? el.querySelector<HTMLElement>('button[type="submit"]') : el
    pedirFoco.current = null
    destino?.focus({ preventScroll: true })
  }
  const cambio = transicionDeGracias(variante, reducido)

  const desdeArriba = modo === 'barra'
  /**
   * [NAVBAR] T4 · EN EL TELÉFONO, ENTERO EN UNA PANTALLA. La hoja de abajo (el modo del menú) entra en `100svh` a 390 × 844
   * y a 375 × 667 con el botón de enviar a la vista, sin sacar un campo: menos aire, las preguntas y la bajada en
   * `caption`, los chips más bajos, el mensaje en dos renglones y el pie al lado del botón. La de arriba (escritorio)
   * no cambia. Medido en `navbar/t4-contacto/`.
   */
  const compacto = !desdeArriba
  const fuera = desdeArriba ? '-100%' : '100%'
  const hoja = reducido ? { duration: 0 } : { duration: MS_DE_LA_HOJA / 1000, ease: CURVA }
  const velo = reducido ? { duration: 0 } : { duration: MS_DEL_VELO / 1000, ease: CURVA }
  // [CIERRE] 2B · desde la barra y con movimiento: el fondo se desenfoca en 0,5 s y la hoja llega como una placa (`placa.ts`).
  const placa = desdeArriba && !reducido

  return (
    <div ref={raiz} data-pieza="contacto" data-modo={modo} data-placa={placa ? '' : undefined} className="fixed inset-0 z-[var(--z-overlay)]">
      {/* El velo: oscurece y desenfoca. Un click afuera cierra. */}
      <motion.div
        data-parte="velo"
        aria-hidden="true"
        onClick={cerrarContacto}
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-tinta)_35%,transparent)] backdrop-blur-[var(--blur-panel)]"
        initial={placa ? { opacity: 0, backdropFilter: 'blur(0px)' } : { opacity: 0 }}
        animate={placa ? { opacity: 1, backdropFilter: `blur(${String(DESENFOQUE_DEL_FONDO_PX)}px)` } : { opacity: 1 }}
        exit={placa ? { opacity: 0, backdropFilter: 'blur(0px)', transition: TRANSICIONES.fondoAlCerrar } : { opacity: 0 }}
        transition={placa ? TRANSICIONES.fondo : velo}
      />
      {/* [CIERRE] 2B · desde la barra la hoja es el frente de una PLACA con espesor (`PlacaDelContacto.tsx`). */}
      <PlacaDelContacto activa={placa}>
      <motion.div
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contacto-titulo"
        data-parte="hoja"
        data-lenis-prevent=""
        className={cn(
          'bg-fondo text-tinta overflow-y-auto overscroll-contain will-change-transform',
          placa
            ? 'relative max-h-[86svh] w-full rounded-[var(--radius-medio)]'
            : cn('absolute inset-x-0 shadow-[var(--shadow-flotante)]', desdeArriba ? 'top-0 max-h-[90svh] rounded-b-[calc(var(--radius-fuerte)*2)]' : 'bottom-0 h-[100dvh]'),
        )}
        initial={placa ? false : { y: fuera }}
        animate={placa ? undefined : { y: 0 }}
        exit={placa ? undefined : { y: fuera }}
        transition={placa ? undefined : hoja}
      >
        <div
          className={cn(
            'mx-auto flex w-full max-w-[min(100%,calc(var(--spacing-20)*14))] flex-col',
            compacto ? 'gap-[var(--spacing-4)] px-[var(--spacing-5)] py-[var(--spacing-5)]' : 'gap-[var(--spacing-8)] px-[var(--pad-lateral-compacto)] py-[var(--spacing-12)]',
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

          <div className="perspective-midrange">
          <AnimatePresence mode="wait" initial={false}>
          {enviando ? (
            // [PULIDO 10] J3 · la carga de develOP (el trazo del logo, o el giro con `?carga=giro`) y su estado; reemplaza al anillo.
            <motion.div key="carga" ref={alLlegar} tabIndex={-1} {...cambio} data-parte="carga" className="flex flex-col items-center justify-center outline-none" style={{ minHeight: alto }}>
              <Carga tamano="grande" textos={TEXTOS_DE_ENVIO} etiqueta={ROTULO_ENVIANDO} />
            </motion.div>
          ) : enviado ? (
            <motion.div key="gracias" {...cambio} data-parte="gracias" className="flex flex-col justify-center gap-[var(--spacing-6)]" style={{ minHeight: alto }}>
              <TarjetaDeGracias foco={alLlegar} />
              {/* La cuenta del cierre: una línea fina que se consume (en ancho: con movimiento reducido también corre). */}
              <div aria-hidden="true" className="bg-borde h-px w-full">
                <motion.div className="bg-tinta h-px" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: CIERRE_MS / 1000, ease: 'linear' }} />
              </div>
            </motion.div>
          ) : (
          <motion.form key="formulario" ref={alLlegar} {...cambio} noValidate onSubmit={(e) => void alEnviar(e)} className={cn('flex flex-col', compacto ? 'gap-[var(--spacing-4)]' : 'gap-[var(--spacing-8)]')}>
            <CamposDelContacto datos={datos} errores={errores} alternarInteres={alternarInteres} escribir={escribir} compacto={compacto} />
            <div
              className={cn(
                'border-borde flex border-t',
                compacto ? 'flex-row items-center justify-between gap-[var(--spacing-3)] pt-[var(--spacing-3)]' : 'flex-col gap-[var(--spacing-4)] pt-[var(--spacing-6)] tablet:flex-row tablet:items-center tablet:justify-between',
              )}
            >
              <p className="text-caption leading-texto">{PIE}</p>
              <Cta type="submit" rotulo={enviando ? ROTULO_ENVIANDO : ROTULO_DEL_ENVIO} deshabilitado={enviando} className={compacto ? 'shrink-0' : undefined} />
            </div>
          </motion.form>
          )}
          </AnimatePresence>
          </div>
          {/* [INTERFAZ 1] T3: las dos regiones vivas existen desde el principio (una región que nace con su texto no
              siempre se anuncia); lo que cambia es lo de adentro. [PULIDO 9] H3 · fuera de lo que se transforma. */}
          <p role="alert" className={avisoALaVista && !enviado ? 'text-caption leading-texto' : 'sr-only'}>
            {aviso}
          </p>
          <p role="status" className="sr-only">
            {enviado ? DESPUES_DEL_ENVIO : ''}
          </p>
        </div>
      </motion.div>
      </PlacaDelContacto>
    </div>
  )
}
