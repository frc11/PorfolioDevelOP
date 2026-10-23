'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

import { Cta, CtaEnlace } from '../../../_componentes/chrome/Cta'
import { CampoDePildora, CampoDeTextoLargo, ErrorDelCampo } from '../../../_componentes/formularios/Campos'
import { EstadoDeEnvio } from '../../../_componentes/formularios/EstadoDeEnvio'

import { CAMPOS, ROTULO_DEL_ENVIO, ROTULO_ENVIANDO, avisoDeErrores } from '../../../_chrome/contacto/contenido'
import { WHATSAPP } from '../../../_chrome/enlaces'
import { enviarContacto, validarContacto, type DatosDeContacto, type ErroresDeContacto } from '../../../_chrome/contacto/enviarContacto'
import type { EstadoDelEnvio, ResultadoDelEnvio } from '../../../_lib/formularios/estadoDeEnvio'
import { MAXIMOS } from '../../../_lib/formularios/validar'

import { CONTENIDO } from '../contenido'

import { enLaSecuencia } from './secuencia'
import { CLASE_DEL_TEXTO_DEL_FORMULARIO } from './tipografia'

/** Lo que el formulario corto no pregunta: va vacío al mismo envío del contacto (el servidor lo acepta igual). */
const SIN_PREGUNTAR: Pick<DatosDeContacto, 'intereses' | 'presupuesto' | 'empresa'> = { intereses: [], presupuesto: '', empresa: '' }

/** Los campos del formulario corto, en orden: el nombre (el del contacto), «WhatsApp o email» y [B1.2d B] «¿Qué necesitás?», un texto largo. */
export const CAMPOS_DE_LA_TUYA = [
  { campo: 'nombre', rotulo: CAMPOS.nombre.rotulo, ejemplo: CAMPOS.nombre.ejemplo, maximo: MAXIMOS.nombre, autocompletar: 'name' },
  { campo: 'medio', rotulo: CONTENIDO.laTuya.medio, ejemplo: CAMPOS.medio.ejemplo, maximo: MAXIMOS.contacto, autocompletar: 'email' },
  { campo: 'mensaje', rotulo: CONTENIDO.laTuya.necesitas, ejemplo: CAMPOS.mensaje.ejemplo, maximo: MAXIMOS.mensaje, autocompletar: 'off' },
] as const

type CampoDeLaTuya = (typeof CAMPOS_DE_LA_TUYA)[number]['campo']

const VACIO: Pick<DatosDeContacto, CampoDeLaTuya> = { nombre: '', medio: '', mensaje: '' }

/** Lo que viaja: los tres campos y lo que no se pregunta, vacío (el mismo envío del contacto: s76 lo afirma). */
export const datosDelFormulario = (d: Pick<DatosDeContacto, CampoDeLaTuya>): DatosDeContacto => ({ ...SIN_PREGUNTAR, ...d })

const idDelError = (campo: string): string => `la-tuya-error-${campo}`
/** Cada campo con su `<label for>` (el nombre accesible que leen los instrumentos de s10, como en el formulario del pie). */
const idDelCampo = (campo: string): string => `la-tuya-${campo}`

/**
 * «O escribinos por WhatsApp»: el enlace `wa.me` del pie, con su mensaje precargado (se abre aparte). [C2 · 40] Con el efecto de los botones
 * del sitio: es el botón simple (`CtaEnlace`, el rollover de dos copias y su subrayado), importado, no una copia.
 */
function EnlaceDeWhatsApp(): React.JSX.Element {
  return <CtaEnlace href={WHATSAPP.href} rotulo={CONTENIDO.laTuya.whatsapp} etiqueta={`${CONTENIDO.laTuya.whatsapp}, ${CONTENIDO.ficha.abreAparte}`} externo className="shrink-0" />
}

/**
 * [B1.2c] EL FORMULARIO CORTO DE «LA TUYA» — el nombre, «WhatsApp o email» y «¿Qué necesitás?», el botón de enviar y, en su fila, «O escribinos
 * por WhatsApp» (el número sale de `_secciones/cierre/contacto.ts`, por la puerta del contacto).
 *
 * NO es un formulario nuevo: la validación (`validarContacto`: el único obligatorio es el email o el teléfono), el envío (`enviarContacto`, a
 * `/api/contacto` con lo que no pregunta vacío) y el aviso de errores se importan del contacto. [C2 · 40] El envío es el estándar del sitio
 * (`EstadoDeEnvio`): el formulario se desvanece en la carga de develOP, el encastre con «¡Recibido!» o el error, y a los 3 s vuelve el formulario
 * (vacío después del éxito, con lo escrito después del error). Los campos, del tamaño de la bajada del Portfolio. El autocompletado del
 * navegador toma el arreglo global de `/v3` (`piezas.css`). Los tests nunca envían de verdad (`/api/` interceptado).
 */
export function FormularioDeLaTuya({ visible, reducido, desde }: { readonly visible: boolean; readonly reducido: boolean; readonly desde: number }): React.JSX.Element {
  const [datos, setDatos] = useState<Pick<DatosDeContacto, CampoDeLaTuya>>(VACIO)
  const [errores, setErrores] = useState<ErroresDeContacto>({})
  const [intento, setIntento] = useState(false)
  const [estado, setEstado] = useState<EstadoDelEnvio>('reposo')
  const [aviso, setAviso] = useState('')
  const completos = datosDelFormulario

  const escribir = (campo: CampoDeLaTuya, valor: string): void => {
    const siguiente = { ...datos, [campo]: valor }
    setDatos(siguiente)
    if (intento) setErrores(validarContacto(completos(siguiente)))
  }

  const alEnviar = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (estado !== 'reposo') return
    setIntento(true)
    const form = e.currentTarget
    // Un formulario inválido responde al toque (sin la carga); uno válido se desvanece en la carga mientras viaja.
    if (Object.keys(validarContacto(completos(datos))).length === 0) setEstado('enviando')
    const r = await enviarContacto(completos(datos))
    if (r.estado === 'invalido') {
      setEstado('reposo')
      setErrores(r.errores)
      setAviso('')
      requestAnimationFrame(() => setAviso(avisoDeErrores(Object.keys(r.errores).length)))
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    setErrores({})
    setEstado(r.estado === 'error' ? 'error' : 'exito')
  }

  // El mensaje terminó: vuelve el formulario (vacío después del éxito; todavía no se ve).
  const alVolver = (despuesDe: ResultadoDelEnvio): void => {
    if (despuesDe === 'exito') {
      setDatos(VACIO)
      setIntento(false)
    }
    setEstado('reposo')
  }

  const enviando = estado === 'enviando'
  return (
    <motion.div data-pieza="formulario-de-la-tuya" className="flex flex-col gap-4" {...enLaSecuencia(visible, desde, reducido)}>
      <EstadoDeEnvio estado={estado} alVolver={alVolver}>
        <form noValidate onSubmit={(e) => void alEnviar(e)} className="flex flex-col gap-3">
          {CAMPOS_DE_LA_TUYA.map((c) => {
            const error = c.campo === 'mensaje' ? undefined : errores[c.campo]
            // [B1.2d B] B4/B5 · los campos del modal de contacto (`_componentes/formularios/Campos.tsx`), no una copia; [C2 · 40] con la letra
            // de la bajada del Portfolio. Con `id`, el rótulo nombra al campo (`for`).
            const comun = {
              rotulo: c.rotulo, nombre: c.campo, id: idDelCampo(c.campo), valor: datos[c.campo], alEscribir: (v: string) => escribir(c.campo, v),
              ejemplo: c.ejemplo, maximo: c.maximo, idDelError: idDelError(c.campo), conError: error !== undefined, claseDelTexto: CLASE_DEL_TEXTO_DEL_FORMULARIO,
            }
            return (
              <div key={c.campo} className="flex flex-col gap-[var(--spacing-1)]">
                {c.campo === 'mensaje' ? (
                  <CampoDeTextoLargo {...comun} renglones={4} />
                ) : (
                  <CampoDePildora {...comun} autocompletar={c.autocompletar} requerido={c.campo === 'medio'} modoDeEntrada={c.campo === 'medio' ? 'email' : undefined} />
                )}
                <ErrorDelCampo id={idDelError(c.campo)} texto={error} />
              </div>
            )
          })}
          {/* [B1.2d B] «Enviar» es el botón simple del sitio (el del contacto), y WhatsApp va a su derecha, en la misma fila. */}
          <div data-parte="fila-del-envio" className="mt-1 flex flex-wrap items-center justify-between gap-4">
            <Cta type="submit" rotulo={enviando ? ROTULO_ENVIANDO : ROTULO_DEL_ENVIO} deshabilitado={enviando} className="shrink-0" />
            <EnlaceDeWhatsApp />
          </div>
        </form>
      </EstadoDeEnvio>
      {/* El aviso de los errores de los campos (el resultado del envío lo anuncia `EstadoDeEnvio`). */}
      <p role="alert" className="sr-only">
        {aviso}
      </p>
    </motion.div>
  )
}
