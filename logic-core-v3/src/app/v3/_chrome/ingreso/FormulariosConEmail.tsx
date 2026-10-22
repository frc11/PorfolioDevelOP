'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { Cta } from '../../_componentes/chrome/Cta'
import { Carga, conDuracionMinima } from '../../_componentes/carga/Carga'
import { CampoDePildora, ErrorDelCampo } from '../../_componentes/formularios/Campos'
import { avisoDeErrores } from '../contacto/contenido'
import { CampoDeClave } from './CamposDelIngreso'
import { ERROR_INESPERADO, EXPLICACION_DEL_LINK, LINK_GENERADO, ROTULOS_DEL_INGRESO, RUTA_DEL_OLVIDO } from './contenido'
import {
  LARGOS_DEL_INGRESO,
  REPOSO,
  errorDelEmail,
  resolverElIngreso,
  validarIngreso,
  type AccionesDelIngreso,
  type CampoDelIngreso,
  type DatosDelIngreso,
  type ErroresDelIngreso,
  type Resultado,
} from './envio'
import { TELON } from './telon'

/**
 * [B7] LAS DOS MANERAS CON EMAIL — la contraseña y el Magic Link, con la arquitectura de los formularios del sitio
 * (`FormularioDeContacto`): campos controlados (lo escrito se queda si el servidor contesta un error), `noValidate` y la validación
 * propia al enviar y después mientras se escribe, el foco al primer campo con error y UN aviso para el lector; mientras viaja, la
 * carga de develOP en el lugar del formulario (que no se achica) con la espera mínima de la carga (no parpadea).
 *
 * El envío NO es la `action` del `<form>` (React vaciaría el formulario al terminar): `onSubmit` valida y despacha la acción de
 * `useActionState` en una transición, con el `FormData` del formulario (los nombres de siempre: `email`, `password`,
 * `magic-email`).
 */

const ENLACE = 'underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:decoration-2'
const sinEntrar = (): void => undefined

/** El error del servidor, a la vista y anunciado (la región existe desde el principio). */
function ErrorDelServidor({ texto }: { readonly texto: string }): React.JSX.Element {
  return (
    <p role="alert" data-parte="error-del-ingreso" className={cn('text-caption text-error-texto leading-texto', texto === '' && 'sr-only')}>
      {texto}
    </p>
  )
}

/** Mientras viaja: la carga de develOP, encima del formulario escondido (del mismo alto). */
function CargaDelIngreso({ refDeLaCarga }: { readonly refDeLaCarga: React.Ref<HTMLDivElement> }): React.JSX.Element {
  return (
    <div ref={refDeLaCarga} tabIndex={-1} data-parte="carga" className="absolute inset-0 flex items-center justify-center outline-none">
      <Carga tamano="medio" etiqueta={ROTULOS_DEL_INGRESO.ingresando} />
    </div>
  )
}

export function ConClave({ acciones, alEntrar }: { readonly acciones: AccionesDelIngreso; readonly alEntrar: () => void }): React.JSX.Element {
  const [datos, setDatos] = useState<DatosDelIngreso>({ email: '', clave: '' })
  const [errores, setErrores] = useState<ErroresDelIngreso>({})
  const [intento, setIntento] = useState(false)
  const [aviso, setAviso] = useState('')
  // Si la redirección no llega (la ruta no cambia), el formulario vuelve con el error genérico.
  const [vencido, setVencido] = useState(false)
  const formulario = useRef<HTMLFormElement>(null)
  const carga = useRef<HTMLDivElement>(null)
  const [resultado, enviar, enviando] = useActionState(
    async (_previo: Resultado, envio: FormData): Promise<Resultado> => resolverElIngreso(() => conDuracionMinima(acciones.conClave(null, envio)), alEntrar),
    REPOSO,
  )
  const ocupado = enviando || (resultado.estado === 'entrando' && !vencido)
  const errorDelServidor = vencido ? ERROR_INESPERADO : resultado.estado === 'error' ? resultado.mensaje : ''

  useEffect(() => {
    // Con el error del servidor, el foco vuelve al email (lo escrito sigue ahí) y el error se anuncia.
    if (resultado.estado === 'error') formulario.current?.querySelector<HTMLElement>('input[name="email"]')?.focus({ preventScroll: true })
    if (resultado.estado !== 'entrando') return undefined
    const reloj = window.setTimeout(() => setVencido(true), TELON.esperaMaximaMs + 1000)
    return () => window.clearTimeout(reloj)
  }, [resultado])

  const escribir = (campo: CampoDelIngreso, valor: string): void => {
    const siguiente = { ...datos, [campo]: valor }
    setDatos(siguiente)
    // Después del primer intento, los errores se corrigen mientras se escribe.
    if (intento) setErrores(validarIngreso(siguiente))
  }

  const alEnviar = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (ocupado) return
    const form = e.currentTarget
    const nuevos = validarIngreso(datos)
    setIntento(true)
    setVencido(false)
    setErrores(nuevos)
    setAviso('')
    const cuantos = Object.keys(nuevos).length
    if (cuantos > 0) {
      // Vaciado y vuelto a escribir: un segundo intento también se anuncia. El foco, al primer campo con error.
      requestAnimationFrame(() => {
        setAviso(avisoDeErrores(cuantos))
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      })
      return
    }
    const envio = new FormData(form)
    startTransition(() => enviar(envio))
    requestAnimationFrame(() => carga.current?.focus({ preventScroll: true }))
  }

  return (
    <div className="relative">
      <form
        ref={formulario}
        noValidate
        onSubmit={alEnviar}
        inert={ocupado}
        data-pieza="ingreso-con-clave"
        className={cn('flex flex-col gap-[var(--spacing-3)]', ocupado && 'invisible')}
      >
        <div className="flex flex-col gap-[var(--spacing-1)]">
          <CampoDePildora
            rotulo={ROTULOS_DEL_INGRESO.email}
            nombre="email"
            id="ingreso-email"
            valor={datos.email}
            alEscribir={(v) => escribir('email', v)}
            ejemplo=""
            maximo={LARGOS_DEL_INGRESO.email}
            idDelError="ingreso-error-email"
            conError={errores.email !== undefined}
            requerido
            autocompletar="email"
            modoDeEntrada="email"
          />
          <ErrorDelCampo id="ingreso-error-email" texto={errores.email} />
        </div>
        <div className="flex flex-col gap-[var(--spacing-1)]">
          <CampoDeClave id="ingreso-clave" valor={datos.clave} alEscribir={(v) => escribir('clave', v)} idDelError="ingreso-error-clave" conError={errores.clave !== undefined} />
          <ErrorDelCampo id="ingreso-error-clave" texto={errores.clave} />
        </div>
        <ErrorDelServidor texto={errorDelServidor} />
        <div className="flex flex-wrap items-center justify-between gap-[var(--spacing-3)] pt-[var(--spacing-2)]">
          <a href={RUTA_DEL_OLVIDO} className={cn('text-caption text-tinta-media inline-block py-[var(--spacing-2)]', ENLACE)}>
            {ROTULOS_DEL_INGRESO.olvido}
          </a>
          <Cta type="submit" variante="bloque" rotulo={enviando ? ROTULOS_DEL_INGRESO.ingresando : ROTULOS_DEL_INGRESO.ingresar} deshabilitado={ocupado} />
        </div>
      </form>
      {ocupado && <CargaDelIngreso refDeLaCarga={carga} />}
      <p role="alert" className="sr-only">
        {aviso}
      </p>
    </div>
  )
}

export function ConLink({ acciones }: { readonly acciones: AccionesDelIngreso }): React.JSX.Element {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [intento, setIntento] = useState(false)
  const carga = useRef<HTMLDivElement>(null)
  const [resultado, enviar, enviando] = useActionState(
    async (_previo: Resultado, envio: FormData): Promise<Resultado> => resolverElIngreso(() => conDuracionMinima(acciones.conLink(null, envio)), sinEntrar),
    REPOSO,
  )

  if (resultado.estado === 'link-enviado') {
    return (
      <div
        ref={(el) => el?.focus({ preventScroll: true })}
        tabIndex={-1}
        role="status"
        data-parte="link-generado"
        className="border-borde-fuerte flex flex-col gap-[var(--spacing-2)] rounded-[var(--radius-fuerte)] border p-[var(--spacing-5)] outline-none"
      >
        <p className="text-cuerpo font-medio leading-texto">{LINK_GENERADO.titulo}</p>
        <p className="text-caption text-tinta-media leading-texto">{LINK_GENERADO.texto}</p>
      </div>
    )
  }

  const alEnviar = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (enviando) return
    const form = e.currentTarget
    const nuevo = errorDelEmail(email)
    setIntento(true)
    setError(nuevo)
    if (nuevo !== undefined) {
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    const envio = new FormData(form)
    startTransition(() => enviar(envio))
    requestAnimationFrame(() => carga.current?.focus({ preventScroll: true }))
  }

  return (
    <div className="relative">
      <form noValidate onSubmit={alEnviar} inert={enviando} data-pieza="ingreso-con-link" className={cn('flex flex-col gap-[var(--spacing-3)]', enviando && 'invisible')}>
        <p className="text-caption text-tinta-media leading-texto">{EXPLICACION_DEL_LINK}</p>
        <div className="flex flex-col gap-[var(--spacing-1)]">
          <CampoDePildora
            rotulo={ROTULOS_DEL_INGRESO.emailDelLink}
            nombre="magic-email"
            id="ingreso-link-email"
            valor={email}
            alEscribir={(v) => {
              setEmail(v)
              if (intento) setError(errorDelEmail(v))
            }}
            ejemplo=""
            maximo={LARGOS_DEL_INGRESO.email}
            idDelError="ingreso-error-link"
            conError={error !== undefined}
            requerido
            autocompletar="email"
            modoDeEntrada="email"
          />
          <ErrorDelCampo id="ingreso-error-link" texto={error} />
        </div>
        <ErrorDelServidor texto={resultado.estado === 'error' ? resultado.mensaje : ''} />
        <div className="flex justify-end pt-[var(--spacing-2)]">
          <Cta type="submit" variante="bloque" rotulo={enviando ? ROTULOS_DEL_INGRESO.generandoLink : ROTULOS_DEL_INGRESO.enviarLink} deshabilitado={enviando} />
        </div>
      </form>
      {enviando && <CargaDelIngreso refDeLaCarga={carga} />}
    </div>
  )
}
