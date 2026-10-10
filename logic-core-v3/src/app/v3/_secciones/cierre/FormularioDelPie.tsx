'use client'

import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

import { Carga, conDuracionMinima } from '../../_componentes/carga/Carga'
import { TarjetaDeGracias } from '../../_componentes/formularios/TarjetaDeGracias'
import { BloqueSolido } from '../../_componentes/volumen/BloqueSolido'
import { TEXTOS_DE_ENVIO, enviarAlServidor } from '../../_lib/formularios/enviar'
import { ANUNCIO_DE_GRACIAS, transicionDeGracias, varianteDeLaPagina } from '../../_lib/formularios/gracias'
import { RECHAZO, REINTENTAR, cuadrosDelRechazo } from '../../_lib/formularios/rechazo'
import { sonar } from '../../_lib/sonido/bus'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { MAXIMOS, validarElPie, type CampoDelPie, type DatosDelPie, type ErroresDelPie } from '../../_lib/formularios/validar'
import { useModoDelPie, usePiezaDelPie, usePieListo } from '../../_lib/pie3d/registro'
import { CONTACTO_DEL_FORMULARIO } from './contenido'

/**
 * [RETOQUE 3D] 3I · EL CONTACTO DEL PIE — un formulario simple (nombre, mail y mensaje) con campos de verdad: se
 * enfocan, se escriben y los anuncia el lector. Es el destino de todo lo que lleva a contacto (`#contacto`: el viaje lo
 * resuelve a su sección y le da el foco al llegar). [CIERRE RETOQUE 3D] D5: cada campo y el botón son un bloque sólido.
 *
 * [RONDA 2] F1 · ENVÍA: a `/api/contacto` (validación en el navegador y en el servidor). Al enviar, cada campo con error
 * lo dice a su lado y el foco va al primero; mientras viaja, el botón ocupado; el resultado, en sus regiones vivas (el
 * error del servidor, normal; el «listo», y el formulario vacío). Sin carteles de «todavía no envía».
 *
 * [RONDA 2] F5 · cada campo es una placa con la ranura hundida (`forma="ranura"`) y Enviar, la tecla principal (más
 * grande y más alta); entre los campos, más aire.
 *
 * [RETOQUE DEL PIE] P2 · desde 1025, UNA placa en WebGL (`escena/pie3d/`): el formulario entero se anota como pieza, con
 * su aire alrededor; los campos son pozos en su cara y Enviar, una tecla que sale de ella. Los campos y el botón siguen
 * siendo los del DOM, sobre la placa (la escena les escribe la transformada cada cuadro). Con el 3D listo, la sala se
 * invierte (`data-seccion`: la tinta clara sobre el negro, como el foco) y los rótulos los dibuja la placa en relieve.
 *
 * [EL ENCASTRE] 1E · el único obligatorio es el mail (el nombre y el mensaje, opcionales; el largo lo frena cada campo) y
 * el foco lo dibuja la caja del campo (`data-foco="campo"`, `foco.css`): su borde, más oscuro y más grueso, sin anillo.
 *
 * [NOCTURNO FINAL] C4 · abajo de 1024 va en la tarjeta sólida de su columna y en una grilla de seis: el nombre y el mail
 * lado a lado, el mensaje (de dos renglones) y Enviar (lleno, de tinta) en la fila de abajo. Los campos a 16 px: con menos,
 * Safari del iPhone agranda la página al tocarlos. Desde 1024, como estaba (una columna, sobre la placa 3D).
 *
 * [PULIDO 9] H2 · ENVIANDO, GRACIAS Y ERROR. Mientras viaja, los campos quedan de sólo lectura y nada cambia de lugar (el
 * botón guarda el ancho del rótulo más largo y la ruedita va dentro de su aire). Al llegar, el formulario se TRANSFORMA en
 * la tarjeta de gracias (`TarjetaDeGracias`, la misma del panel de Contacto): desde 1025 lo hace la placa 3D (`data-estado`
 * y `data-gracias` los lee `pie3d/armadas.ts`); abajo, el DOM (`transicionDeGracias`). «Enviar otro mensaje» vuelve al
 * formulario vacío con la transformación inversa. El resultado se anuncia en la región viva y el foco va a la tarjeta (de
 * vuelta, al nombre). Con error, todo lo escrito queda y el error a la vista.
 */
const MAXIMO_DE: Record<CampoDelPie, number> = { nombre: MAXIMOS.nombre, mail: MAXIMOS.contacto, mensaje: MAXIMOS.mensaje }
// [PULIDO 10] J6 · el autocompletado del navegador, con la piel del formulario: Chrome pinta el campo autocompletado con su fondo
// (que una regla no pisa) y en 3D esa caja quedaba a la vista sobre la cara de la placa, despegada de su pozo (que está más
// hondo): el fondo de siempre se queda (su cambio se demora para siempre) y el texto y el cursor, en la tinta del formulario.
const CAMPO ='block w-full rounded-[var(--radius-sutil)] border border-borde-fuerte escritorio:border-transparent bg-transparent px-[var(--spacing-3)] py-[var(--spacing-2)] escritorio:px-[var(--spacing-4)] escritorio:py-[var(--spacing-3)] text-cuerpo max-escritorio:text-base leading-texto tracking-texto placeholder:opacity-60 aria-invalid:border-current autofill:[transition:background-color_100000s_0s,color_100000s_0s] autofill:[-webkit-text-fill-color:currentColor] autofill:[caret-color:currentColor]'
/** [NOCTURNO FINAL] C4 · el lugar de cada campo en la grilla de abajo de 1024 (de seis). */
// [PULIDO 3] A2 · en la tablet, en columna: un campo por renglón y el mensaje con el alto que sobra.
// [PULIDO 10] J9 · en el teléfono también un campo por renglón (el nombre y el mail, cada uno entero), el mensaje entero y
// Enviar abajo, a todo el ancho: sin el hueco que dejaba Enviar al lado del mensaje.
const LUGAR_DEL_CAMPO: Readonly<Record<CampoDelPie, string>> = { nombre: 'col-span-6', mail: 'col-span-6', mensaje: 'col-span-6 tablet:max-escritorio:grid tablet:max-escritorio:flex-1 tablet:max-escritorio:grid-rows-[var(--filas-del-mensaje-del-pie)]' }
const ROTULO = 'text-micro leading-micro tracking-micro font-medio uppercase'
const ERROR = 'text-micro leading-micro tracking-micro'
const VACIO: DatosDelPie = { nombre: '', mail: '', mensaje: '' }

type Estado = { readonly fase: 'quieto' | 'enviando' | 'gracias' } | { readonly fase: 'error'; readonly mensaje: string }

const sinSuscripcion = (): (() => void) => () => undefined

export function FormularioDelPie(): React.JSX.Element {
  const c = CONTACTO_DEL_FORMULARIO
  const [datos, setDatos] = useState<DatosDelPie>(VACIO)
  const [errores, setErrores] = useState<ErroresDelPie>({})
  const [intento, setIntento] = useState(false)
  const [estado, setEstado] = useState<Estado>({ fase: 'quieto' })
  // Hasta el primer cambio de estado, en reposo: sin transformada (el HTML del servidor, y la rama quieta, no escriben ninguna).
  const [huboCambio, setHuboCambio] = useState(false)
  // [PULIDO 10] J5 · cuántas veces rechazó (cada error, un rechazo: la placa 3D lo lee de `data-rechazo`).
  const [rechazos, setRechazos] = useState(0)
  const enviando = estado.fase === 'enviando'
  const volumen = useModoDelPie() === 'volumen'
  const listo = usePieListo()
  const enVolumen = volumen && listo
  const placa = useRef<HTMLFormElement | null>(null)
  usePiezaDelPie(placa, { id: 'formulario-del-pie', forma: 'formulario', activo: volumen })
  const reducido = useMovimientoReducido()
  const variante = useSyncExternalStore(sinSuscripcion, varianteDeLaPagina, () => 'volteo' as const)
  // [PULIDO 10] J5 · el rechazo en el DOM plano (abajo de 1025 o sin volumen): se achica un poco y vuelve con el resorte; en 3D lo
  // hace la placa (`pie3d/armadas.ts`) y el DOM no lleva escala: su transformada la escribe la escena (la homografía de la placa).
  // Con movimiento reducido, nada.
  const escalaDelRechazo = useMotionValue(1)
  useEffect(() => {
    if (rechazos === 0 || reducido || volumen) return undefined
    const resorte = animate(escalaDelRechazo, cuadrosDelRechazo(RECHAZO.escala).map((v) => 1 - v), { duration: RECHAZO.s, ease: 'linear' })
    return () => resorte.stop()
  }, [rechazos, reducido, volumen, escalaDelRechazo])
  // Adónde va el foco cuando lo nuevo aparece (la tarjeta, o el nombre de vuelta): lo toma el elemento al montarse.
  const pedirFoco = useRef<'tarjeta' | 'nombre' | null>(null)
  const tomarElFoco = (quien: 'tarjeta' | 'nombre') => (el: HTMLElement | null): void => {
    if (el === null || pedirFoco.current !== quien) return
    pedirFoco.current = null
    el.focus({ preventScroll: true })
  }

  const escribir = (campo: CampoDelPie, valor: string): void => {
    const siguiente = { ...datos, [campo]: valor }
    setDatos(siguiente)
    // Después del primer intento, los errores se corrigen mientras se escribe.
    if (intento) setErrores(validarElPie(siguiente))
    if (estado.fase === 'error') setEstado({ fase: 'quieto' })
  }

  const alEnviar = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (enviando) return
    setIntento(true)
    const encontrados = validarElPie(datos)
    setErrores(encontrados)
    const primero = (['nombre', 'mail', 'mensaje'] as const).find((k) => encontrados[k] !== undefined)
    if (primero !== undefined) {
      const form = e.currentTarget
      requestAnimationFrame(() => form.querySelector<HTMLElement>(`#contacto-${primero}`)?.focus())
      return
    }
    setEstado({ fase: 'enviando' })
    // [PULIDO 10] J3 · con la espera mínima de la carga: aunque la respuesta llegue antes, se ve trabajar (no parpadea).
    const r = await conDuracionMinima(enviarAlServidor('/api/contacto', { origen: 'pie', nombre: datos.nombre.trim(), mail: datos.mail.trim(), mensaje: datos.mensaje.trim() }))
    if (r.ok) {
      pedirFoco.current = 'tarjeta'
      setEstado({ fase: 'gracias' })
      setDatos(VACIO)
      setIntento(false)
      setHuboCambio(true)
    } else {
      setEstado({ fase: 'error', mensaje: r.error })
      // [PULIDO 10] J5 · el rechazo: la placa se hunde y vuelve, Enviar pasa a Reintentar con un giro chico y suena el pulso.
      setRechazos((n) => n + 1)
      sonar('pulso')
      // El botón vuelve a estar: el foco, ahí, para volver a probar.
      requestAnimationFrame(() => placa.current?.querySelector<HTMLElement>('button[type="submit"]')?.focus({ preventScroll: true }))
    }
  }

  const otroMensaje = (): void => {
    pedirFoco.current = 'nombre'
    setEstado({ fase: 'quieto' })
  }
  const cambio = transicionDeGracias(variante, reducido, enVolumen)
  // [PULIDO 10] J5 · el rótulo del botón (y los otros dos, invisibles: el botón guarda el ancho del más largo); Reintentar entra
  // girando desde canto (en 3D gira la tecla de la placa).
  const rotulo = enviando ? c.enviando : estado.fase === 'error' ? REINTENTAR : c.enviar
  const giraElRotulo = !reducido && !enVolumen && rotulo === REINTENTAR
  const transicion = huboCambio ? cambio : { ...cambio, animate: { opacity: 1 } }

  const campo = (k: CampoDelPie): { readonly id: string; readonly invalido: boolean; readonly describe: string | undefined } => ({
    id: `contacto-${k}`,
    invalido: errores[k] !== undefined,
    describe: errores[k] !== undefined ? `contacto-${k}-error` : undefined,
  })

  return (
    <motion.form id="contacto" ref={placa} tabIndex={-1} noValidate data-pieza="contacto-del-pie" data-seccion={enVolumen ? 'invertida' : undefined} data-estado={estado.fase === 'gracias' ? 'gracias' : 'formulario'} data-gracias={variante} data-rechazo={rechazos} aria-label={c.nombreAccesible} aria-busy={enviando || undefined} onSubmit={(e) => void alEnviar(e)} style={volumen || rechazos === 0 ? undefined : { scale: escalaDelRechazo }} className={cn('flex flex-col gap-[var(--spacing-3)] perspective-midrange tablet:max-escritorio:flex-1', volumen && 'escritorio:p-[var(--spacing-5)]', enVolumen && 'text-tinta')}>
      <AnimatePresence mode="wait" initial={false}>
        {estado.fase === 'gracias' ? (
          <motion.div key="gracias" {...transicion}>
            <TarjetaDeGracias foco={tomarElFoco('tarjeta')} enVolumen={enVolumen} alOtro={otroMensaje} />
          </motion.div>
        ) : (
          <motion.div key="formulario" {...transicion} className={cn('grid grid-cols-6 gap-[var(--spacing-3)] tablet:max-escritorio:flex tablet:max-escritorio:flex-1 tablet:max-escritorio:flex-col escritorio:flex escritorio:flex-col escritorio:gap-[var(--spacing-5)]')}>
      {(['nombre', 'mail', 'mensaje'] as const).map((k) => {
        const f = campo(k)
        return (
          <div key={k} className={cn('flex flex-col gap-[var(--spacing-1)]', LUGAR_DEL_CAMPO[k])}>
            <label htmlFor={f.id} className={cn(ROTULO, enVolumen && 'text-transparent')}>
              {c[k]}
            </label>
            <BloqueSolido forma="ranura" className="block w-full">
              {k === 'mensaje' ? (
                <textarea id={f.id} name={k} rows={3} maxLength={MAXIMO_DE[k]} readOnly={enviando} data-foco="campo" value={datos[k]} onChange={(e) => escribir(k, e.target.value)} aria-invalid={f.invalido || undefined} aria-describedby={f.describe} className={cn(CAMPO, 'resize-none max-escritorio:h-[calc(var(--spacing-12)+var(--spacing-6))] tablet:max-escritorio:min-h-full')} />
              ) : (
                <input
                  id={f.id}
                  ref={k === 'nombre' ? tomarElFoco('nombre') : undefined}
                  name={k}
                  type={k === 'mail' ? 'email' : 'text'}
                  autoComplete={k === 'mail' ? 'email' : 'name'}
                  required={k === 'mail'}
                  maxLength={MAXIMO_DE[k]}
                  readOnly={enviando}
                  data-foco="campo"
                  placeholder={k === 'mail' ? c.ejemploDeMail : undefined}
                  value={datos[k]}
                  onChange={(e) => escribir(k, e.target.value)}
                  aria-invalid={f.invalido || undefined}
                  aria-describedby={f.describe}
                  className={CAMPO}
                />
              )}
            </BloqueSolido>
            {f.invalido && (
              <p id={f.describe} className={ERROR}>
                {errores[k]}
              </p>
            )}
          </div>
        )
      })}
      <BloqueSolido forma="principal" className="z-10 self-start max-escritorio:col-span-6 max-escritorio:self-stretch escritorio:mt-[var(--spacing-2)]">
        <button type="submit" disabled={enviando} aria-busy={enviando || undefined} className="relative flex items-center gap-[var(--spacing-2)] rounded-[var(--radius-pastilla-s)] border border-borde-fuerte escritorio:border-transparent px-[var(--spacing-5)] py-[var(--spacing-2)] escritorio:px-[var(--spacing-8)] escritorio:py-[var(--spacing-3)] text-cuerpo font-semi disabled:cursor-wait max-escritorio:w-full max-escritorio:justify-center max-escritorio:border-transparent max-escritorio:bg-tinta max-escritorio:px-[var(--spacing-3)] max-escritorio:text-fondo [--carga-tinta:var(--color-tinta)] max-escritorio:[--carga-tinta:var(--color-fondo)]">
          {/* [PULIDO 10] J3 · enviando, el botón es la carga chica (el trazo del logo y su estado, vivos en el DOM sobre la tecla); el
              rótulo se queda invisible guardando el ancho del más largo: nada cambia de lugar. */}
          {enviando && <Carga tamano="chico" textos={TEXTOS_DE_ENVIO} enLinea className="absolute inset-0 justify-center" />}
          <span aria-hidden={enviando || undefined} className={cn('grid justify-items-center perspective-midrange', enviando && 'invisible')}>
            {/* Sin transformada mientras no gira: la rama quieta no escribe ninguna. */}
            {giraElRotulo ? (
              <motion.span key={rotulo} className="col-start-1 row-start-1" initial={{ rotateX: -90 }} animate={{ rotateX: 0 }} transition={{ duration: RECHAZO.giroS, ease: [0.25, 0.46, 0.45, 0.94] }}>
                {rotulo}
              </motion.span>
            ) : (
              <span key={rotulo} className="col-start-1 row-start-1">
                {rotulo}
              </span>
            )}
            {[c.enviar, c.enviando, REINTENTAR].filter((r) => r !== rotulo).map((r) => (
              <span key={r} aria-hidden="true" className="invisible col-start-1 row-start-1">
                {r}
              </span>
            ))}
          </span>
        </button>
      </BloqueSolido>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Las dos regiones vivas existen desde el principio (una que nace con su texto no siempre se anuncia). */}
      {/* [PULIDO 10] J5 · el error sale de atrás del botón, en su renglón: el texto sube desde el borde de arriba de su caja (que
          recorta), sin tapar el botón. */}
      <p role="alert" className={cn(ERROR, 'overflow-hidden', estado.fase !== 'error' && 'sr-only')}>
        {estado.fase === 'error' && (
          <motion.span key={rechazos} className="block" initial={reducido ? { opacity: 0 } : { opacity: 0, y: 'calc(-1 * var(--spacing-5))' }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
            {estado.mensaje}
          </motion.span>
        )}
      </p>
      <p role="status" className="sr-only">
        {estado.fase === 'gracias' ? ANUNCIO_DE_GRACIAS : ''}
      </p>
    </motion.form>
  )
}
