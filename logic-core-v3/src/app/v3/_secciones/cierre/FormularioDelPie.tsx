'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

import { Carga, conDuracionMinima } from '../../_componentes/carga/Carga'
import { TarjetaDeResultado } from '../../_componentes/formularios/TarjetaDeResultado'
import { BloqueSolido } from '../../_componentes/volumen/BloqueSolido'
import { TEXTOS_DE_ENVIO, enviarAlServidor } from '../../_lib/formularios/enviar'
import { ANUNCIO_DE_EXITO } from '../../_lib/formularios/gracias'
import { VOLTEO_TERMINADO, duracionDelVolteo, transicionDelVolteo, varianteDeLaPagina } from '../../_lib/formularios/volteo'
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
 *
 * [PULIDO 11] B · EL RESULTADO ES UNA TARJETA. Al llegar la respuesta, la placa VOLTEA (`?volteo=centrado|columpio`) y del
 * otro lado está la tarjeta del resultado, del tamaño del formulario (`TarjetaDeResultado`): con el éxito, el logo que encaja;
 * con el error, el que no encaja, el error y «Reintentar», que vuelve al formulario con todo lo escrito. Al terminar el éxito
 * los campos se limpian y se vuelven a montar (sin el estado del autocompletado). Desde 1025 voltea la placa 3D (`data-estado`,
 * `data-volteo`) y el encastre arranca cuando la escena avisa que terminó (`VOLTEO_TERMINADO`); abajo, el DOM. El rótulo del
 * botón y la carga se suceden: nunca los dos a la vez (en 3D, el rótulo en relieve lo apaga el sombreador en el mismo cuadro).
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

type Estado = { readonly fase: 'quieto' | 'enviando' | 'exito' } | { readonly fase: 'error'; readonly mensaje: string }

const sinSuscripcion = (): (() => void) => () => undefined
/** [PULIDO 11] B1 · cuánto más que el volteo espera el respaldo antes de mostrar lo nuevo igual (s: la placa compila y se rearma). */
const RESPALDO_DEL_VOLTEO_S = 2.5

export function FormularioDelPie(): React.JSX.Element {
  const c = CONTACTO_DEL_FORMULARIO
  const [datos, setDatos] = useState<DatosDelPie>(VACIO)
  const [errores, setErrores] = useState<ErroresDelPie>({})
  const [intento, setIntento] = useState(false)
  const [estado, setEstado] = useState<Estado>({ fase: 'quieto' })
  // Hasta el primer cambio de estado, en reposo: sin transformada (el HTML del servidor, y la rama quieta, no escriben ninguna).
  const [huboCambio, setHuboCambio] = useState(false)
  // [PULIDO 11] B6 · cada vuelta al formulario después de un envío bueno, campos nuevos (sin el estado del autocompletado).
  const [vuelta, setVuelta] = useState(0)
  // [PULIDO 11] B1 · el alto de los campos al enviar: la tarjeta lo guarda (la placa no cambia de caja y el volteo comparte el eje).
  const [alto, setAlto] = useState<number | undefined>(undefined)
  // [PULIDO 11] B2 · la tarjeta ya se ve (terminó de entrar, o la escena terminó de voltear): arranca el encastre.
  const [seVe, setSeVe] = useState(false)
  const campos = useRef<HTMLDivElement | null>(null)
  const enviando = estado.fase === 'enviando'
  const resultado = estado.fase === 'exito' || estado.fase === 'error'
  const volumen = useModoDelPie() === 'volumen'
  const listo = usePieListo()
  const enVolumen = volumen && listo
  const placa = useRef<HTMLFormElement | null>(null)
  usePiezaDelPie(placa, { id: 'formulario-del-pie', forma: 'formulario', activo: volumen })
  const reducido = useMovimientoReducido()
  const variante = useSyncExternalStore(sinSuscripcion, varianteDeLaPagina, () => 'centrado' as const)
  // [PULIDO 11] B1 · en 3D la placa voltea en la escena. Al cambiar de estado el DOM se apaga en este mismo cuadro (la placa se
  // rearma un momento después y recién ahí empieza a voltear: sin esto, lo nuevo se veía un instante sobre la placa vieja); la
  // escena lo vuelve a prender al terminar y avisa con el estado que quedó (el encastre arranca sólo con el resultado). Si el
  // aviso no llega (la placa no se rearmó), un respaldo lo muestra igual.
  const estadoALaVista = resultado ? 'resultado' : 'formulario'
  useLayoutEffect(() => {
    const el = placa.current
    if (el === null || !enVolumen || !huboCambio) return undefined
    el.style.opacity = '0'
    const respaldo = window.setTimeout(
      () => {
        el.style.opacity = ''
        setSeVe(true)
      },
      (duracionDelVolteo(variante, reducido) + RESPALDO_DEL_VOLTEO_S) * 1000,
    )
    const termino = (e: Event): void => {
      if (!(e instanceof CustomEvent) || e.detail !== estadoALaVista) return
      window.clearTimeout(respaldo)
      if (estadoALaVista === 'resultado') setSeVe(true)
    }
    el.addEventListener(VOLTEO_TERMINADO, termino)
    return () => {
      window.clearTimeout(respaldo)
      el.removeEventListener(VOLTEO_TERMINADO, termino)
    }
  }, [estadoALaVista, enVolumen, huboCambio, variante, reducido])
  // Adónde va el foco cuando lo nuevo aparece (la tarjeta, el nombre o el botón de vuelta): lo toma el elemento al montarse.
  const pedirFoco = useRef<'tarjeta' | 'nombre' | 'enviar' | null>(null)
  const tomarElFoco = (quien: 'tarjeta' | 'nombre' | 'enviar') => (el: HTMLElement | null): void => {
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
    setAlto(campos.current?.offsetHeight)
    setEstado({ fase: 'enviando' })
    // [PULIDO 10] J3 · con la espera mínima de la carga: aunque la respuesta llegue antes, se ve trabajar (no parpadea).
    const r = await conDuracionMinima(enviarAlServidor('/api/contacto', { origen: 'pie', nombre: datos.nombre.trim(), mail: datos.mail.trim(), mensaje: datos.mensaje.trim() }))
    pedirFoco.current = 'tarjeta'
    setSeVe(false)
    setHuboCambio(true)
    if (r.ok) {
      // [PULIDO 11] B6 · el éxito: lo escrito se va (y los campos se vuelven a montar al volver: sin autocompletado viejo).
      setEstado({ fase: 'exito' })
      setDatos(VACIO)
      setIntento(false)
      setVuelta((n) => n + 1)
    } else {
      // [PULIDO 11] B3 · el error: la tarjeta que no encaja; lo escrito se queda para Reintentar.
      setEstado({ fase: 'error', mensaje: r.error })
    }
  }

  const otroMensaje = (): void => {
    pedirFoco.current = 'nombre'
    setEstado({ fase: 'quieto' })
  }
  // [PULIDO 11] B3 · Reintentar: de vuelta al formulario, con todo lo escrito; el foco, en Enviar.
  const reintentar = (): void => {
    pedirFoco.current = 'enviar'
    setEstado({ fase: 'quieto' })
  }
  const cambio = transicionDelVolteo(variante, reducido, enVolumen)
  // [PULIDO 11] B4 · el rótulo del botón: Enviar, siempre (el error vive en su tarjeta); mientras viaja, la carga en su lugar.
  const rotulo = c.enviar
  const transicion = huboCambio ? cambio : { ...cambio, animate: { opacity: 1 } }

  const campo = (k: CampoDelPie): { readonly id: string; readonly invalido: boolean; readonly describe: string | undefined } => ({
    id: `contacto-${k}`,
    invalido: errores[k] !== undefined,
    describe: errores[k] !== undefined ? `contacto-${k}-error` : undefined,
  })

  return (
    <motion.form id="contacto" ref={placa} tabIndex={-1} noValidate data-pieza="contacto-del-pie" data-seccion={enVolumen ? 'invertida' : undefined} data-estado={resultado ? 'resultado' : 'formulario'} data-volteo={variante} aria-label={c.nombreAccesible} aria-busy={enviando || undefined} onSubmit={(e) => void alEnviar(e)} className={cn('flex flex-col gap-[var(--spacing-3)] perspective-midrange tablet:max-escritorio:flex-1', volumen && 'escritorio:p-[var(--spacing-5)]', enVolumen && 'text-tinta')}>
      <AnimatePresence mode="wait" initial={false}>
        {resultado ? (
          <motion.div key="resultado" {...transicion} onAnimationComplete={() => !enVolumen && setSeVe(true)}>
            <TarjetaDeResultado
              tipo={estado.fase === 'exito' ? 'exito' : 'error'}
              mensaje={estado.fase === 'error' ? estado.mensaje : undefined}
              alto={alto}
              empieza={seVe}
              enVolumen={enVolumen}
              compacto={!enVolumen}
              foco={tomarElFoco('tarjeta')}
              alReintentar={reintentar}
              alOtro={otroMensaje}
            />
          </motion.div>
        ) : (
          <motion.div key={`formulario-${String(vuelta)}`} ref={campos} {...transicion} className={cn('grid grid-cols-6 gap-[var(--spacing-3)] tablet:max-escritorio:flex tablet:max-escritorio:flex-1 tablet:max-escritorio:flex-col escritorio:flex escritorio:flex-col escritorio:gap-[var(--spacing-5)]')}>
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
        <button type="submit" ref={tomarElFoco('enviar')} disabled={enviando} aria-busy={enviando || undefined} className="relative flex items-center gap-[var(--spacing-2)] rounded-[var(--radius-pastilla-s)] border border-borde-fuerte escritorio:border-transparent px-[var(--spacing-5)] py-[var(--spacing-2)] escritorio:px-[var(--spacing-8)] escritorio:py-[var(--spacing-3)] text-cuerpo font-semi disabled:cursor-wait max-escritorio:w-full max-escritorio:justify-center max-escritorio:border-transparent max-escritorio:bg-tinta max-escritorio:px-[var(--spacing-3)] max-escritorio:text-fondo [--carga-tinta:var(--color-tinta)] max-escritorio:[--carga-tinta:var(--color-fondo)]">
          {/* [PULIDO 10] J3 · enviando, el botón es la carga chica (el trazo del logo y su estado, vivos en el DOM sobre la tecla); el
              rótulo se queda invisible guardando el ancho del más largo: nada cambia de lugar. */}
          {/* [PULIDO 11] B4 · se suceden: con el botón ocupado, la carga y el rótulo invisible (guarda el ancho; en 3D su relieve lo
              apaga el sombreador en el mismo cuadro: `data-rotulo-de-la-tecla`, que se mide aunque esté mudo); si no, sólo el rótulo. */}
          {enviando && <Carga tamano="chico" textos={TEXTOS_DE_ENVIO} enLinea className="absolute inset-0 justify-center" />}
          <span data-rotulo-de-la-tecla="" aria-hidden={enviando || undefined} className={cn('grid justify-items-center', enviando && 'invisible')}>
            <span className="col-start-1 row-start-1">{rotulo}</span>
          </span>
        </button>
      </BloqueSolido>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Las dos regiones vivas existen desde el principio (una que nace con su texto no siempre se anuncia). [PULIDO 11] B3 · el
          error se ve en su tarjeta; acá, para el lector. */}
      <p role="alert" className="sr-only">
        {estado.fase === 'error' ? estado.mensaje : ''}
      </p>
      <p role="status" className="sr-only">
        {estado.fase === 'exito' ? ANUNCIO_DE_EXITO : ''}
      </p>
    </motion.form>
  )
}
