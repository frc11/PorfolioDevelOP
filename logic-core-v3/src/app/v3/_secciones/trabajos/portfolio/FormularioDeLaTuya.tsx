'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { CAMPOS, DESPUES_DEL_ENVIO, ROTULO_DEL_ENVIO, ROTULO_ENVIANDO, avisoDeErrores } from '../../../_chrome/contacto/contenido'
import { WHATSAPP } from '../../../_chrome/enlaces'
import { enviarContacto, validarContacto, type DatosDeContacto, type ErroresDeContacto } from '../../../_chrome/contacto/enviarContacto'
import { RESULTADO } from '../../../_lib/formularios/gracias'
import { MAXIMOS } from '../../../_lib/formularios/validar'

import { CONTENIDO } from '../contenido'

import { enLaSecuencia } from './secuencia'

/** Lo que el formulario corto no pregunta: va vacío al mismo envío del contacto (el servidor lo acepta igual). */
const SIN_PREGUNTAR: Pick<DatosDeContacto, 'intereses' | 'presupuesto' | 'empresa'> = { intereses: [], presupuesto: '', empresa: '' }

type Fase = 'formulario' | 'enviando' | 'exito' | 'error'

/** Los campos del formulario corto, en orden: el nombre (el del contacto), «WhatsApp o email» y «¿Qué necesitás?», de una línea. */
export const CAMPOS_DE_LA_TUYA = [
  { campo: 'nombre', rotulo: CAMPOS.nombre.rotulo, ejemplo: CAMPOS.nombre.ejemplo, maximo: MAXIMOS.nombre, autocompletar: 'name' },
  { campo: 'medio', rotulo: CONTENIDO.laTuya.medio, ejemplo: CAMPOS.medio.ejemplo, maximo: MAXIMOS.contacto, autocompletar: 'email' },
  { campo: 'mensaje', rotulo: CONTENIDO.laTuya.necesitas, ejemplo: CAMPOS.mensaje.ejemplo, maximo: MAXIMOS.mensaje, autocompletar: 'off' },
] as const

type CampoDeLaTuya = (typeof CAMPOS_DE_LA_TUYA)[number]['campo']

/** Lo que viaja: los tres campos y lo que no se pregunta, vacío (el mismo envío del contacto: s76 lo afirma). */
export const datosDelFormulario = (d: Pick<DatosDeContacto, CampoDeLaTuya>): DatosDeContacto => ({ ...SIN_PREGUNTAR, ...d })

const idDelError = (campo: string): string => `la-tuya-error-${campo}`
/** Cada campo con su `<label for>` (el nombre accesible que leen los instrumentos de s10, como en el formulario del pie). */
const idDelCampo = (campo: string): string => `la-tuya-${campo}`

/**
 * [B1.2c] EL FORMULARIO CORTO DE «LA TUYA» (plan §13, punto 6) — en lugar del botón, en la misma tira: el nombre, «WhatsApp o email» y
 * «¿Qué necesitás?» (una línea), el botón de enviar y, debajo, «o escribinos por WhatsApp» (el enlace `wa.me` del pie, con su mensaje
 * precargado: el número sale de `_secciones/cierre/contacto.ts`, por la puerta del contacto).
 *
 * NO es un formulario nuevo: la validación (`validarContacto`: el único obligatorio es el email o el teléfono), el envío
 * (`enviarContacto`, a `/api/contacto` con lo que no pregunta vacío) y los textos (el aviso de errores, «Enviar» / «Enviando…», el
 * gracias y el error de `RESULTADO`) se importan del contacto. El gracias y el error quedan adentro de la tira; el error deja todo
 * lo escrito y «Reintentar» vuelve al formulario. Los tests nunca envían de verdad (`/api/` bloqueado).
 */
export function FormularioDeLaTuya({ visible, reducido, desde }: { readonly visible: boolean; readonly reducido: boolean; readonly desde: number }): React.JSX.Element {
  const [datos, setDatos] = useState<Pick<DatosDeContacto, CampoDeLaTuya>>({ nombre: '', medio: '', mensaje: '' })
  const [errores, setErrores] = useState<ErroresDeContacto>({})
  const [intento, setIntento] = useState(false)
  const [fase, setFase] = useState<Fase>('formulario')
  const [mensajeDelError, setMensajeDelError] = useState('')
  const [aviso, setAviso] = useState('')
  const completos = datosDelFormulario

  const escribir = (campo: CampoDeLaTuya, valor: string): void => {
    const siguiente = { ...datos, [campo]: valor }
    setDatos(siguiente)
    if (intento) setErrores(validarContacto(completos(siguiente)))
  }

  const alEnviar = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (fase === 'enviando') return
    setIntento(true)
    const form = e.currentTarget
    // Un formulario inválido responde al toque (sin «Enviando…»); uno válido viaja con el botón ocupado.
    if (Object.keys(validarContacto(completos(datos))).length === 0) setFase('enviando')
    const r = await enviarContacto(completos(datos))
    if (r.estado === 'invalido') {
      setFase('formulario')
      setErrores(r.errores)
      setAviso('')
      requestAnimationFrame(() => setAviso(avisoDeErrores(Object.keys(r.errores).length)))
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    setErrores({})
    if (r.estado === 'error') {
      setMensajeDelError(r.mensaje)
      setFase('error')
      requestAnimationFrame(() => setAviso(r.mensaje))
      return
    }
    setFase('exito')
    setIntento(false)
    setDatos({ nombre: '', medio: '', mensaje: '' })
  }

  const enviando = fase === 'enviando'
  return (
    <motion.div data-pieza="formulario-de-la-tuya" className="flex flex-col gap-4" {...enLaSecuencia(visible, desde, reducido)}>
      {fase === 'exito' || fase === 'error' ? (
        <div data-parte="resultado" className="flex flex-col items-start gap-2">
          <p className="font-titulo text-[length:var(--text-titulo-s)]">{fase === 'exito' ? RESULTADO.exito.titulo : RESULTADO.error.titulo}</p>
          <p className="text-cuerpo leading-texto text-tinta/80">{fase === 'exito' ? RESULTADO.exito.bajada : mensajeDelError}</p>
          <button type="button" onClick={() => setFase('formulario')} className="text-cuerpo underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">
            {fase === 'exito' ? RESULTADO.otro : RESULTADO.reintentar}
          </button>
        </div>
      ) : (
        <form noValidate onSubmit={(e) => void alEnviar(e)} className="flex flex-col gap-3">
          {CAMPOS_DE_LA_TUYA.map((c) => {
            const error = c.campo === 'mensaje' ? undefined : errores[c.campo]
            return (
              <div key={c.campo} className="flex flex-col gap-1">
                <label data-foco="pastilla" htmlFor={idDelCampo(c.campo)} className={cn('flex items-center gap-3 rounded-sutil border border-tinta/30 px-4 py-2', error !== undefined && 'border-dashed border-tinta')}>
                  <span className="shrink-0 text-caption font-medio">{c.rotulo}</span>
                  <input
                    id={idDelCampo(c.campo)}
                    name={c.campo}
                    type="text"
                    inputMode={c.campo === 'medio' ? 'email' : undefined}
                    autoComplete={c.autocompletar}
                    required={c.campo === 'medio'}
                    maxLength={c.maximo}
                    value={datos[c.campo]}
                    onChange={(e) => escribir(c.campo, e.target.value)}
                    placeholder={c.ejemplo}
                    aria-invalid={error !== undefined || undefined}
                    aria-describedby={error === undefined ? undefined : idDelError(c.campo)}
                    className="min-w-0 flex-1 bg-transparent text-caption placeholder:text-tinta/50"
                  />
                </label>
                {error === undefined ? null : (
                  <p id={idDelError(c.campo)} className="text-micro leading-texto">
                    {error}
                  </p>
                )}
              </div>
            )
          })}
          <button
            type="submit"
            disabled={enviando}
            aria-busy={enviando || undefined}
            className="mt-1 self-start rounded-sutil bg-tinta px-6 py-3 font-titulo text-[length:var(--text-titulo-s)] text-fondo transition-colors hover:bg-tinta/85 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-70"
          >
            {enviando ? ROTULO_ENVIANDO : ROTULO_DEL_ENVIO}
          </button>
        </form>
      )}
      <a
        href={WHATSAPP.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${CONTENIDO.laTuya.whatsapp}, ${CONTENIDO.ficha.abreAparte}`}
        className="self-start text-cuerpo underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {CONTENIDO.laTuya.whatsapp}
      </a>
      {/* Las dos regiones vivas existen desde el principio (como en el contacto): el aviso de los errores o el del servidor, y el gracias. */}
      <p role="alert" className="sr-only">
        {aviso}
      </p>
      <p role="status" className="sr-only">
        {fase === 'exito' ? DESPUES_DEL_ENVIO : ''}
      </p>
    </motion.div>
  )
}
