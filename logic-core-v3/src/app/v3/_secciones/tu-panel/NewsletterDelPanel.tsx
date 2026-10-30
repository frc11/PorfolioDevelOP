'use client'

import { useState } from 'react'

import { CAMPOS } from '../../_chrome/contacto/contenido'
import { Cta } from '../../_componentes/chrome/Cta'
import { CampoDePildora, ErrorDelCampo } from '../../_componentes/formularios/Campos'
import { EstadoDeEnvio } from '../../_componentes/formularios/EstadoDeEnvio'
import { enviarAlServidor } from '../../_lib/formularios/enviar'
import { MENSAJES_DEL_ENVIO, type EstadoDelEnvio, type ResultadoDelEnvio } from '../../_lib/formularios/estadoDeEnvio'
import { MAXIMOS, validarElMail } from '../../_lib/formularios/validar'
import { NEWSLETTER } from './contenido'

/**
 * [RONDA 2] F1 · EL NEWSLETTER DE TU PANEL, QUE ENVÍA. [L4] Más grande: las píldoras y la carga en su tamaño normal (ya no `compacto`). [C2 · 60c] Rehecho al estándar de los formularios del sitio: un form chico con
 * «Nombre» y «Mail» (las píldoras del contacto, `Campos.tsx`, no una copia) y «Suscribirme» (el botón simple del sitio, `Cta`). El
 * envío es `EstadoDeEnvio` (la carga de develOP, el encastre con «¡Listo!» o el error, y a los 3 s vuelve el form: vacío después del
 * éxito, con lo escrito después del error), con sus textos de la newsletter. El error de un campo, en el formato de siempre (el
 * borde punteado y el texto debajo); el autocompletado del navegador toma el arreglo global de /v3 (`piezas.css`).
 *
 * ⚠ `/api/newsletter` es del sitio vivo y no se toca: su esquema recibe SÓLO el mail. El nombre no viaja (`cuerpoDelNewsletter`) y el
 * campo queda en el form: anotado para Franco. Lo único obligatorio es el mail. Las pruebas nunca llaman a la ruta.
 */
type Campo = 'nombre' | 'mail'
type Datos = Readonly<Record<Campo, string>>

const VACIO: Datos = { nombre: '', mail: '' }

/** Lo que viaja a `/api/newsletter`: el mail solo (la ruta no acepta el nombre). */
export const cuerpoDelNewsletter = (d: Datos): { readonly mail: string } => ({ mail: d.mail.trim() })

const idDe = (campo: Campo): string => `${NEWSLETTER.id}-${campo}`
const ID_DEL_ERROR = `${NEWSLETTER.id}-error`

export function NewsletterDelPanel(): React.JSX.Element {
  const [datos, setDatos] = useState<Datos>(VACIO)
  const [intento, setIntento] = useState(false)
  const [estado, setEstado] = useState<EstadoDelEnvio>('reposo')
  const [aviso, setAviso] = useState('')
  const errorDelMail = intento ? validarElMail(datos.mail) : null

  const alEnviar = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (estado !== 'reposo') return
    setIntento(true)
    const error = validarElMail(datos.mail)
    if (error !== null) {
      // Inválido responde al toque (sin la carga): el aviso se anuncia una vez y el foco va al mail.
      const campo = e.currentTarget.querySelector<HTMLInputElement>(`#${idDe('mail')}`)
      setAviso('')
      requestAnimationFrame(() => {
        setAviso(error)
        campo?.focus()
      })
      return
    }
    setAviso('')
    setEstado('enviando')
    const r = await enviarAlServidor('/api/newsletter', cuerpoDelNewsletter(datos))
    setEstado(r.ok ? 'exito' : 'error')
  }

  // El mensaje terminó: vuelve el form (vacío después del éxito; todavía no se ve).
  const alVolver = (despuesDe: ResultadoDelEnvio): void => {
    if (despuesDe === 'exito') {
      setDatos(VACIO)
      setIntento(false)
    }
    setEstado('reposo')
  }

  const escribir = (campo: Campo) => (valor: string): void => setDatos((d) => ({ ...d, [campo]: valor }))
  const enviando = estado === 'enviando'
  return (
    <div data-pieza="newsletter-del-panel" className="w-full">
      <EstadoDeEnvio estado={estado} alVolver={alVolver} mensajes={MENSAJES_DEL_ENVIO.newsletter}>
        <form data-pieza="form-de-novedades" noValidate onSubmit={(e) => void alEnviar(e)} className="flex flex-col gap-[var(--spacing-3)] text-left">
          <CampoDePildora
            rotulo={NEWSLETTER.rotuloDelNombre} nombre="nombre" id={idDe('nombre')} valor={datos.nombre} alEscribir={escribir('nombre')}
            ejemplo={CAMPOS.nombre.ejemplo} maximo={MAXIMOS.nombre} idDelError={null} conError={false} autocompletar="name"
          />
          <div className="flex flex-col gap-[var(--spacing-1)]">
            <CampoDePildora
              rotulo={NEWSLETTER.rotulo} nombre="mail" id={idDe('mail')} valor={datos.mail} alEscribir={escribir('mail')}
              ejemplo={CAMPOS.medio.ejemplo} maximo={MAXIMOS.contacto} idDelError={ID_DEL_ERROR} conError={errorDelMail !== null}
              autocompletar="email" modoDeEntrada="email" requerido
            />
            <ErrorDelCampo id={ID_DEL_ERROR} texto={errorDelMail ?? undefined} />
          </div>
          <Cta type="submit" rotulo={NEWSLETTER.rotuloDeEnvio} deshabilitado={enviando} className="self-end" />
        </form>
      </EstadoDeEnvio>
      {/* El aviso del error del campo al enviar (el resultado del envío lo anuncia `EstadoDeEnvio`). */}
      <p role="alert" className="sr-only">
        {aviso}
      </p>
    </div>
  )
}
